#!/bin/bash
# ===========================================================
# Health Check Script — Tume ya Utumishi Serikalini
# ===========================================================
# Checks that all services are running and responding.
# Can be run via cron for monitoring.
#
# Usage: ./healthcheck.sh
# ===========================================================

set -euo pipefail

# Configuration
FRONTEND_URL="http://localhost:3000"
CMS_URL="http://localhost:8055"
MINIO_URL="http://localhost:9000"
ALERT_EMAIL="admin@zanajira.go.tz"
LOG_FILE="/var/log/tume-web/healthcheck.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

FAILED=0

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_url() {
  local name="$1"
  local url="$2"
  local expected_status="$3"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$STATUS" = "$expected_status" ] || [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
    log "${GREEN}✓${NC} $name: OK (HTTP $STATUS)"
  else
    log "${RED}✗${NC} $name: FAIL (HTTP $STATUS, expected $expected_status)"
    FAILED=1
  fi
}

check_process() {
  local name="$1"
  if pgrep -f "$name" > /dev/null 2>&1; then
    log "${GREEN}✓${NC} Process $name: running"
  else
    log "${RED}✗${NC} Process $name: NOT running"
    FAILED=1
  fi
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log "========================================="
log "Health Check — Tume ya Utumishi Serikalini"
log "========================================="

# Check processes
check_process "next"
check_process "directus"
check_process "minio"

# Check URLs
check_url "Next.js Frontend" "$FRONTEND_URL" "200"
check_url "Directus CMS" "$CMS_URL/server/info" "200"
check_url "MinIO" "$MINIO_URL/minio/health/live" "200"

# Check PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
  log "${GREEN}✓${NC} PostgreSQL: running"
else
  log "${RED}✗${NC} PostgreSQL: NOT running"
  FAILED=1
fi

# Summary
if [ $FAILED -eq 0 ]; then
  log "All services healthy!"
else
  log "Some services are DOWN! Check logs above."
  # Optional: send email alert
  # echo "Health check failed for Tume ya Utumishi Serikalini. Check $LOG_FILE for details." | mail -s "Health Check FAILED" "$ALERT_EMAIL"
fi

exit $FAILED