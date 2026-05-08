#!/bin/bash
# ===========================================================
# PostgreSQL Backup Script — Tume ya Utumishi Serikalini
# ===========================================================
# Runs daily at 02:00 via cron on VM 2
#
# Usage: ./backup-db.sh
# Cron: 0 2 * * * /opt/tume-web/infra/backup-db.sh
# ===========================================================

set -euo pipefail

# Configuration
DB_NAME="tume_cms"
DB_USER="tume_app"
BACKUP_DIR="/opt/tume-web/backups/db"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/tume_cms_${DATE}.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting PostgreSQL backup..."

# Run pg_dump
pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup completed: $BACKUP_FILE ($SIZE)"
else
    echo "[$(date)] ERROR: Backup failed!" >&2
    exit 1
fi

# Remove old backups
find "$BACKUP_DIR" -name "tume_cms_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Removed backups older than $RETENTION_DAYS days"

echo "[$(date)] Backup process complete"