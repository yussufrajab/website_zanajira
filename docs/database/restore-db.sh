#!/bin/bash
# =============================================================================
# Tume ya Utumishi Serikalini — Database Restore Script
# =============================================================================
# Restores the tume_cms PostgreSQL database from a .sql.gz backup file.
# Usage:  ./restore-db.sh <backup_file.sql.gz>
# Example: ./restore-db.sh tume_cms_20260508_120000.sql.gz
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_NAME="tume_cms"
DB_USER="postgres"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_PASSWORD="${PGPASSWORD:-postgres}"

export PGPASSWORD="$DB_PASSWORD"

# -------------------------------------------------------------------------
# Validate input
# -------------------------------------------------------------------------
if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -1 "${SCRIPT_DIR}"/*.sql.gz 2>/dev/null | xargs -n1 basename || echo "  (none found)"
    exit 1
fi

BACKUP_FILE="$1"

# If only a filename is given, look in the script directory
if [ ! -f "$BACKUP_FILE" ]; then
    BACKUP_FILE="${SCRIPT_DIR}/${BACKUP_FILE}"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "[ERROR] Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "============================================"
echo " Database Restore — $(date)"
echo "============================================"
echo " Database:    ${DB_NAME}"
echo " Host:        ${DB_HOST}:${DB_PORT}"
echo " Backup file: ${BACKUP_FILE}"
echo "============================================"

# -------------------------------------------------------------------------
# Check if PostgreSQL is running
# -------------------------------------------------------------------------
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &>/dev/null; then
    echo "[ERROR] PostgreSQL is not running on ${DB_HOST}:${DB_PORT}"
    echo "        Start it with: sudo systemctl start postgresql"
    exit 1
fi

# -------------------------------------------------------------------------
# Confirm before overwriting
# -------------------------------------------------------------------------
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME" && echo "yes" || echo "no")

if [ "$DB_EXISTS" = "yes" ]; then
    echo "[WARNING] Database '${DB_NAME}' already exists and will be dropped and recreated!"
    read -p "Continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "[ABORTED] Restore cancelled by user."
        exit 0
    fi
fi

# -------------------------------------------------------------------------
# Drop and recreate the database
# -------------------------------------------------------------------------
echo "[INFO] Dropping database '${DB_NAME}' if it exists..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS \"${DB_NAME}\";" 2>/dev/null || true

echo "[INFO] Creating database '${DB_NAME}'..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE \"${DB_NAME}\";"

# -------------------------------------------------------------------------
# Restore from backup
# -------------------------------------------------------------------------
echo "[INFO] Restoring from backup..."
if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 1>/dev/null; then
    echo "[OK] Restore successful!"
else
    echo "[WARNING] Restore completed with some warnings (this may be normal for re-creates)."
fi

echo ""
echo "To verify, check the Directus CMS admin panel:"
echo "  http://localhost:8055/admin"
echo ""
echo "============================================"
echo " Restore complete — $(date)"
echo "============================================"