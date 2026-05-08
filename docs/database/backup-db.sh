#!/bin/bash
# =============================================================================
# Tume ya Utumishi Serikalini — Database Backup Script
# =============================================================================
# Backs up the tume_cms PostgreSQL database to a timestamped SQL file.
# Usage:  ./backup-db.sh
# Output: /home/yusuf/tume_web/docs/database/tume_cms_YYYYMMDD_HHMMSS.sql.gz
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_NAME="tume_cms"
DB_USER="postgres"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_PASSWORD="${PGPASSWORD:-postgres}"
BACKUP_DIR="${SCRIPT_DIR}"

export PGPASSWORD="$DB_PASSWORD"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "============================================"
echo " Database Backup — $(date)"
echo "============================================"
echo " Database:  ${DB_NAME}"
echo " Host:      ${DB_HOST}:${DB_PORT}"
echo " Output:    ${BACKUP_FILE}"
echo "============================================"

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &>/dev/null; then
    echo "[ERROR] PostgreSQL is not running on ${DB_HOST}:${DB_PORT}"
    echo "        Start it with: sudo systemctl start postgresql"
    exit 1
fi

# Check if the database exists
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "[ERROR] Database '${DB_NAME}' does not exist"
    exit 1
fi

# Run the backup
echo "[INFO] Backing up database..."
if pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    --no-owner \
    --no-privileges \
    "$DB_NAME" | gzip > "$BACKUP_FILE"; then

    FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[OK] Backup successful!"
    echo "     File:  ${BACKUP_FILE}"
    echo "     Size:  ${FILESIZE}"

    # Create a 'latest' symlink/copy for easy reference
    LATEST="${BACKUP_DIR}/${DB_NAME}_latest.sql.gz"
    cp -f "$BACKUP_FILE" "$LATEST"
    echo "     Latest: ${LATEST}"
else
    echo "[ERROR] Backup failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo ""
echo "To restore this backup on a new server, run:"
echo "  ./restore-db.sh ${DB_NAME}_${TIMESTAMP}.sql.gz"
echo ""
echo "============================================"
echo " Backup complete — $(date)"
echo "============================================"