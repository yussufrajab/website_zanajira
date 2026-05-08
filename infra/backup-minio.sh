#!/bin/bash
# ===========================================================
# MinIO Backup Script — Tume ya Utumishi Serikalini
# ===========================================================
# Runs daily at 03:00 via cron on VM 3
#
# Usage: ./backup-minio.sh
# Cron: 0 3 * * * /opt/tume-web/infra/backup-minio.sh
# ===========================================================

set -euo pipefail

# Configuration
MINIO_ALIAS="local"
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ACCESS_KEY="minio_access_key"
MINIO_SECRET_KEY="minio_secret_key"
BUCKET="tume-web-assets"
BACKUP_DIR="/opt/tume-web/backups/minio"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d)

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting MinIO backup..."

# Configure mc alias
mc alias set "$MINIO_ALIAS" "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api s3v4 > /dev/null 2>&1

# Mirror bucket to local backup directory
mc mirror "$MINIO_ALIAS/$BUCKET" "$BACKUP_DIR/$DATE/" --remove --overwrite

# Verify backup
if [ -d "$BACKUP_DIR/$DATE" ]; then
    FILE_COUNT=$(find "$BACKUP_DIR/$DATE" -type f | wc -l)
    echo "[$(date)] Backup completed: $FILE_COUNT files backed up"
else
    echo "[$(date)] ERROR: MinIO backup failed!" >&2
    exit 1
fi

# Remove old backups
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "[$(date)] Backup process complete"