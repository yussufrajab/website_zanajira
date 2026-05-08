#!/bin/bash

# =============================================================================
# Tume ya Utumishi Serikalini — Service Manager
# =============================================================================
# Manages: PostgreSQL, MinIO, Directus CMS, Next.js Frontend
# Supports dev and production modes
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR"
LOG_DIR="/var/log/tume-web"

# Mode: dev or prod (default: dev)
MODE="${TUME_MODE:-dev}"

# =============================================================================
# NVM SETUP (required for Node.js)
# =============================================================================
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# =============================================================================
# SUDO PASSWORD (for PostgreSQL start/stop)
# =============================================================================
SUDO_PASSWORD="${TUME_SUDO_PASSWORD:-}"
sudo_refresh() {
    if [ -n "$SUDO_PASSWORD" ]; then
        echo "$SUDO_PASSWORD" | sudo -S -v >/dev/null 2>&1
    else
        sudo -v 2>/dev/null
    fi
}

# =============================================================================
# SERVICE PORTS
# =============================================================================
POSTGRES_PORT=5432
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
CMS_PORT=8055
FRONTEND_PORT=3000

# =============================================================================
# LOG FILES
# =============================================================================
CMS_LOG="$LOG_DIR/cms.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# =============================================================================
# DATABASE CONFIG
# =============================================================================
DB_NAME="${DB_NAME:-tume_cms}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"

# =============================================================================
# MINIO CONFIG
# =============================================================================
MINIO_ACCESS_KEY="${MINIO_KEY:-minio_access_key}"
MINIO_SECRET_KEY="${MINIO_SECRET:-minio_secret_key}"
MINIO_BUCKET="${MINIO_BUCKET:-tume-web-assets}"

# =============================================================================
# COLORS
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# =============================================================================
# LOGGING
# =============================================================================

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[FAIL]${NC} $1"; }

log_header() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo ""
}

# =============================================================================
# PORT & PROCESS MANAGEMENT
# =============================================================================

port_is_open() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 && return 0
    ss -tlnp 2>/dev/null | grep -qE ":${port}[[:space:]]" && return 0
    return 1
}

http_responds() {
    local port=$1
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 --connect-timeout 2 "http://localhost:$port/" 2>/dev/null)
    [ "$code" != "000" ] && [ -n "$code" ]
}

port_pid() {
    local pid
    pid=$(lsof -ti:$1 2>/dev/null | head -1)
    if [ -z "$pid" ]; then
        pid=$(ss -tlnp "( sport = :$1 )" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
    fi
    echo "$pid"
}

kill_port() {
    local port=$1
    local label="${2:-port $port}"

    if ! port_is_open "$port"; then
        return 0
    fi

    log_warning "$label: port $port is in use, freeing it..."

    local pid
    pid=$(port_pid "$port")
    if [ -n "$pid" ]; then
        kill -9 "$pid" 2>/dev/null || sudo kill -9 "$pid" 2>/dev/null
        sleep 1
    fi

    if port_is_open "$port"; then
        fuser -k "$port/tcp" 2>/dev/null || sudo fuser -k "$port/tcp" 2>/dev/null
        sleep 1
    fi

    if port_is_open "$port"; then
        pid=$(port_pid "$port")
        if [ -n "$pid" ]; then
            sudo kill -9 "$pid" 2>/dev/null
            sleep 1
        fi
    fi

    if port_is_open "$port"; then
        log_error "$label: could not free port $port"
        return 1
    fi

    log_success "$label: port $port freed"
    return 0
}

ensure_port_free() {
    local port=$1
    local label="${2:-service}"

    if port_is_open "$port"; then
        log_warning "$label is already running on port $port"
        kill_port "$port" "$label"
        if [ $? -ne 0 ]; then
            log_error "Cannot start $label — port $port is occupied"
            return 1
        fi
    fi
    return 0
}

wait_for_port() {
    local port=$1
    local label="${2:-service}"
    local timeout=${3:-30}
    local elapsed=0

    log_info "Waiting for $label on port $port..."

    while [ $elapsed -lt $timeout ]; do
        if port_is_open "$port"; then
            local pid=$(port_pid "$port")
            if [ -n "$pid" ]; then
                log_success "$label is ready on port $port (PID: $pid)"
            else
                log_success "$label is ready on port $port"
            fi
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done

    log_error "$label failed to start within ${timeout}s"
    return 1
}

# =============================================================================
# MODE HELPERS
# =============================================================================

is_dev()  { [ "$MODE" = "dev" ]; }
is_prod() { [ "$MODE" = "prod" ]; }

mode_label() {
    if is_dev; then echo "DEV"; else echo "PROD"; fi
}

# =============================================================================
# INFRASTRUCTURE (direct process management)
# =============================================================================

start_infra() {
    log_info "Starting infrastructure services [$(mode_label)]..."
    local failures=0

    start_postgres || failures=$((failures + 1))
    start_minio || failures=$((failures + 1))

    return $failures
}

stop_infra() {
    log_info "Stopping infrastructure services..."
    stop_minio
    stop_postgres
}

restart_infra() {
    log_info "Restarting infrastructure services..."
    stop_infra
    sleep 1
    start_infra
}

# =============================================================================
# POSTGRESQL
# =============================================================================

start_postgres() {
    if is_postgres_running; then
        log_success "postgresql: already running"
        return 0
    fi
    if command -v systemctl &>/dev/null; then
        sudo systemctl start postgresql 2>/dev/null
    fi
    if ! is_postgres_running && command -v pg_ctlcluster &>/dev/null; then
        sudo pg_ctlcluster 16 main start 2>/dev/null || sudo pg_ctlcluster 15 main start 2>/dev/null || sudo pg_ctlcluster 14 main start 2>/dev/null
    fi
    if ! is_postgres_running && command -v service &>/dev/null; then
        sudo service postgresql start 2>/dev/null
    fi
    for i in $(seq 1 10); do
        if is_postgres_running; then
            log_success "postgresql: started"
            return 0
        fi
        sleep 1
    done
    log_error "postgresql: failed to start"
    return 1
}

stop_postgres() {
    if ! is_postgres_running; then
        log_info "postgresql: not running"
        return 0
    fi
    if command -v systemctl &>/dev/null; then
        sudo systemctl stop postgresql 2>/dev/null || true
    fi
    if is_postgres_running && command -v pg_ctlcluster &>/dev/null; then
        sudo -u postgres pg_ctlcluster 16 main stop -m fast 2>/dev/null || \
        sudo -u postgres pg_ctlcluster 15 main stop -m fast 2>/dev/null || \
        sudo -u postgres pg_ctlcluster 14 main stop -m fast 2>/dev/null || \
        sudo pg_ctlcluster 16 main stop -m fast 2>/dev/null || true
    fi
    if is_postgres_running && command -v service &>/dev/null; then
        sudo service postgresql stop 2>/dev/null || true
    fi
    for i in $(seq 1 5); do
        if ! is_postgres_running; then
            log_success "postgresql: stopped"
            return 0
        fi
        sleep 1
    done
    local pid
    pid=$(port_pid "$POSTGRES_PORT")
    if [ -n "$pid" ]; then
        sudo kill "$pid" 2>/dev/null
    fi
    log_success "postgresql: stopped"
}

is_postgres_running() {
    PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -p "$POSTGRES_PORT" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1
}

check_database() {
    PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -p "$POSTGRES_PORT" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1
}

# =============================================================================
# MINIO
# =============================================================================

start_minio() {
    if is_minio_running; then
        log_success "minio: already running"
        return 0
    fi

    # Try systemd first (production setup)
    if command -v systemctl &>/dev/null && systemctl is-enabled --quiet minio 2>/dev/null; then
        sudo systemctl start minio 2>/dev/null
        for i in $(seq 1 10); do
            if is_minio_running; then
                log_success "minio: started (systemd)"
                return 0
            fi
            sleep 1
        done
    fi

    # Fallback: start directly
    local minio_bin="$(command -v minio 2>/dev/null)"
    if [ -z "$minio_bin" ]; then
        minio_bin="/usr/local/bin/minio"
    fi
    if [ ! -x "$minio_bin" ]; then
        log_error "minio: binary not found"
        return 1
    fi

    local minio_data="${MINIO_DATA_DIR:-/opt/minio/data}"
    mkdir -p "$minio_data"
    MINIO_ROOT_USER="$MINIO_ACCESS_KEY" MINIO_ROOT_PASSWORD="$MINIO_SECRET_KEY" \
        nohup "$minio_bin" server "$minio_data" --address ":$MINIO_PORT" --console-address ":$MINIO_CONSOLE_PORT" \
        > /tmp/minio.log 2>&1 < /dev/null &
    disown

    for i in $(seq 1 15); do
        if is_minio_running; then
            sleep 1
            # Ensure bucket exists
            if command -v mc &>/dev/null; then
                mc alias set local "http://localhost:$MINIO_PORT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --quiet 2>/dev/null
                mc mb "local/$MINIO_BUCKET" --ignore-existing --quiet 2>/dev/null || true
                mc anonymous set download "local/$MINIO_BUCKET" --quiet 2>/dev/null || true
            fi
            log_success "minio: started"
            return 0
        fi
        sleep 1
    done
    log_error "minio: failed to start"
    return 1
}

stop_minio() {
    # Try systemd first
    if command -v systemctl &>/dev/null && systemctl is-active --quiet minio 2>/dev/null; then
        sudo systemctl stop minio 2>/dev/null
        log_success "minio: stopped (systemd)"
        return 0
    fi

    # Fallback: kill by port
    local pid
    pid=$(port_pid "$MINIO_PORT")
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null
        log_success "minio: stopped"
    else
        log_info "minio: not running"
    fi
}

is_minio_running() {
    port_is_open "$MINIO_PORT"
}

# =============================================================================
# DIRECTUS CMS
# =============================================================================

is_cms_running() {
    port_is_open "$CMS_PORT"
}

start_cms() {
    log_info "Starting Directus CMS on port $CMS_PORT [$(mode_label)]..."

    ensure_port_free "$CMS_PORT" "CMS"
    [ $? -ne 0 ] && return 1

    # Verify dependencies
    if ! is_postgres_running; then
        log_error "PostgreSQL is not running. Start it first: ./manage.sh start postgres"
        return 1
    fi

    mkdir -p "$LOG_DIR"

    if is_dev; then
        cd "$APP_DIR/cms"
        nohup npx directus start > "$CMS_LOG" 2>&1 < /dev/null &
        disown
    else
        # Production: use PM2 if available
        if command -v pm2 &>/dev/null; then
            cd "$APP_DIR"
            pm2 start "npx directus start" --name tume-cms --cwd "$APP_DIR/cms"
        else
            cd "$APP_DIR/cms"
            NODE_ENV=production nohup npx directus start > "$CMS_LOG" 2>&1 < /dev/null &
            disown
        fi
    fi

    wait_for_port "$CMS_PORT" "Directus CMS" 30
}

stop_cms() {
    log_info "Stopping Directus CMS..."
    if command -v pm2 &>/dev/null && pm2 describe tume-cms >/dev/null 2>&1; then
        pm2 stop tume-cms 2>/dev/null
        pm2 delete tume-cms 2>/dev/null
    fi
    pkill -f "directus start" 2>/dev/null
    kill_port "$CMS_PORT" "CMS"
    log_success "Directus CMS stopped"
}

restart_cms() {
    log_info "Restarting Directus CMS..."
    stop_cms
    sleep 1
    start_cms
}

# =============================================================================
# FRONTEND (Next.js)
# =============================================================================

is_frontend_running() {
    port_is_open "$FRONTEND_PORT"
}

start_frontend() {
    log_info "Starting frontend on port $FRONTEND_PORT [$(mode_label)]..."

    ensure_port_free "$FRONTEND_PORT" "Frontend"
    [ $? -ne 0 ] && return 1

    mkdir -p "$LOG_DIR"

    if is_dev; then
        cd "$APP_DIR/frontend"
        nohup npm run dev > "$FRONTEND_LOG" 2>&1 < /dev/null &
        disown
    else
        # Production: build first if needed
        if [ ! -d "$APP_DIR/frontend/.next" ]; then
            log_warning "Production build not found. Building frontend..."
            cd "$APP_DIR/frontend"
            npm run build
        fi

        if command -v pm2 &>/dev/null; then
            cd "$APP_DIR"
            pm2 start "npm start" --name tume-frontend --cwd "$APP_DIR/frontend"
        else
            cd "$APP_DIR/frontend"
            NODE_ENV=production nohup npx next start > "$FRONTEND_LOG" 2>&1 < /dev/null &
            disown
        fi
    fi

    wait_for_port "$FRONTEND_PORT" "Frontend" 45
}

stop_frontend() {
    log_info "Stopping frontend..."
    if command -v pm2 &>/dev/null && pm2 describe tume-frontend >/dev/null 2>&1; then
        pm2 stop tume-frontend 2>/dev/null
        pm2 delete tume-frontend 2>/dev/null
    fi
    pkill -f "next dev" 2>/dev/null
    pkill -f "next start" 2>/dev/null
    pkill -f "next-server" 2>/dev/null
    kill_port "$FRONTEND_PORT" "Frontend"
    log_success "Frontend stopped"
}

restart_frontend() {
    log_info "Restarting frontend..."
    stop_frontend
    sleep 1
    start_frontend
}

# =============================================================================
# PM2 PRODUCTION START
# =============================================================================

start_prod_all() {
    log_header "Starting all services [PROD]"

    # 1. Build first
    log_info "Building frontend for production..."
    cd "$APP_DIR/frontend"
    npm run build
    if [ $? -ne 0 ]; then
        log_error "Frontend build failed. Aborting production start."
        return 1
    fi

    # 2. Set mode to prod
    MODE="prod"

    # 3. Start infrastructure
    start_infra
    local infra_fail=$?
    if [ $infra_fail -gt 0 ]; then
        log_warning "Some infrastructure services failed to start"
    fi

    # 4. CMS
    start_cms
    local cms_result=$?

    # 5. Frontend
    start_frontend
    local fe_result=$?

    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  Production Start Summary${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    local result=0

    if is_postgres_running; then
        echo -e "  ${GREEN}● PostgreSQL${NC}  port $POSTGRES_PORT  db: $DB_NAME"
    else
        echo -e "  ${RED}● PostgreSQL${NC}  NOT RUNNING"
        result=1
    fi

    if is_minio_running; then
        echo -e "  ${GREEN}● MinIO${NC}       port $MINIO_PORT  bucket: $MINIO_BUCKET"
    else
        echo -e "  ${RED}● MinIO${NC}       NOT RUNNING"
        result=1
    fi

    if [ $cms_result -eq 0 ]; then
        echo -e "  ${GREEN}● CMS${NC}         port $CMS_PORT  http://localhost:$CMS_PORT/admin"
    else
        echo -e "  ${RED}● CMS${NC}         FAILED TO START"
        result=1
    fi

    if [ $fe_result -eq 0 ]; then
        echo -e "  ${GREEN}● Frontend${NC}    port $FRONTEND_PORT  http://localhost:$FRONTEND_PORT"
    else
        echo -e "  ${RED}● Frontend${NC}    FAILED TO START"
        result=1
    fi

    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ $result -eq 0 ]; then
        log_success "All services started in PRODUCTION mode. Access: http://localhost:$FRONTEND_PORT"
    else
        log_error "Some services failed to start"
    fi

    return $result
}

# =============================================================================
# PM2 MANAGED PRODUCTION START
# =============================================================================

start_prod_apps_pm2() {
    log_header "Starting production apps via PM2"

    if ! command -v pm2 &>/dev/null; then
        log_error "PM2 is not installed. Install it: npm install -g pm2"
        return 1
    fi

    # Kill any existing processes on app ports
    log_info "Killing processes on ports $CMS_PORT and $FRONTEND_PORT..."
    fuser -k "$CMS_PORT/tcp" 2>/dev/null || true
    fuser -k "$FRONTEND_PORT/tcp" 2>/dev/null || true
    sleep 1

    # Delete old PM2 processes
    pm2 delete tume-cms 2>/dev/null || true
    pm2 delete tume-frontend 2>/dev/null || true
    sleep 1

    # Build frontend
    log_info "Building frontend..."
    cd "$APP_DIR/frontend"
    npm run build
    if [ $? -ne 0 ]; then
        log_error "Frontend build failed. Aborting."
        return 1
    fi

    # Ensure infrastructure is running
    if ! is_postgres_running; then
        log_warning "PostgreSQL not running — starting infra..."
        start_infra
    fi

    # Start via ecosystem config
    log_info "Starting PM2 processes from ecosystem.config.js..."
    cd "$APP_DIR"
    pm2 start ecosystem.config.js
    pm2 save
    pm2 list

    log_success "Production apps started via PM2"
}

# =============================================================================
# DEV MODE: START ONLY APPS (frontend + CMS) — kills ports first
# =============================================================================

start_dev_apps() {
    log_header "Starting dev apps (frontend + CMS)"

    # Force-kill anything on the app ports first
    log_info "Killing processes on ports $CMS_PORT and $FRONTEND_PORT..."
    fuser -k "$CMS_PORT/tcp" 2>/dev/null || true
    fuser -k "$FRONTEND_PORT/tcp" 2>/dev/null || true
    sleep 1

    ensure_port_free "$CMS_PORT" "CMS"
    ensure_port_free "$FRONTEND_PORT" "Frontend"

    # Start both in dev mode
    start_cms
    start_frontend
}

# =============================================================================
# START / STOP / RESTART ALL
# =============================================================================

start_all() {
    log_header "Starting all services [$(mode_label)]"
    local result=0

    # 1. Infrastructure first
    start_infra
    local infra_fail=$?
    if [ $infra_fail -gt 0 ]; then
        log_warning "Some infrastructure services failed to start"
    fi

    # 2. CMS (depends on infra)
    start_cms
    local cms_result=$?

    # 3. Frontend
    start_frontend
    local fe_result=$?

    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  Start Summary${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if is_postgres_running; then
        echo -e "  ${GREEN}● PostgreSQL${NC}  port $POSTGRES_PORT  db: $DB_NAME"
    else
        echo -e "  ${RED}● PostgreSQL${NC}  NOT RUNNING"
        result=1
    fi

    if is_minio_running; then
        echo -e "  ${GREEN}● MinIO${NC}       port $MINIO_PORT  bucket: $MINIO_BUCKET"
    else
        echo -e "  ${RED}● MinIO${NC}       NOT RUNNING"
        result=1
    fi

    if [ $cms_result -eq 0 ]; then
        echo -e "  ${GREEN}● CMS${NC}         port $CMS_PORT  http://localhost:$CMS_PORT/admin"
    else
        echo -e "  ${RED}● CMS${NC}         FAILED TO START"
        result=1
    fi

    if [ $fe_result -eq 0 ]; then
        echo -e "  ${GREEN}● Frontend${NC}    port $FRONTEND_PORT  http://localhost:$FRONTEND_PORT"
    else
        echo -e "  ${RED}● Frontend${NC}    FAILED TO START"
        result=1
    fi

    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ $result -eq 0 ]; then
        log_success "All services started. Access: http://localhost:$FRONTEND_PORT"
    else
        log_error "Some services failed to start"
    fi

    return $result
}

stop_all() {
    log_header "Stopping all services"

    # Stop in reverse order: app layer first, then infra
    stop_frontend
    stop_cms
    stop_infra

    log_success "All services stopped"
}

restart_all() {
    stop_all
    sleep 2
    start_all
}

# =============================================================================
# STATUS
# =============================================================================

_service_status_line() {
    local label=$1
    local port=$2
    local extra=$3

    if port_is_open "$port"; then
        local pid=$(port_pid "$port")
        local pid_info=""
        [ -n "$pid" ] && pid_info=" (PID: $pid)"
        echo -e "  ${GREEN}● ${label}${NC}  port ${port}${pid_info}  ${extra}"
    else
        echo -e "  ${RED}● ${label}${NC}  port ${port}  ${RED}Stopped${NC}"
    fi
}

_systemd_status_line() {
    local label=$1
    local svc=$2
    local port=$3
    local extra=$4

    if systemctl is-active --quiet "$svc" 2>/dev/null || port_is_open "$port"; then
        local pid=$(port_pid "$port")
        local pid_info=""
        [ -n "$pid" ] && pid_info=" (PID: $pid)"
        echo -e "  ${GREEN}● ${label}${NC}  port ${port}${pid_info}  ${extra}"
    else
        echo -e "  ${RED}● ${label}${NC}  port ${port}  ${RED}Stopped${NC}"
    fi
}

check_status() {
    log_header "Tume ya Utumishi Service Status [$(mode_label)]"

    echo -e "  ${BOLD}Infrastructure${NC}"
    echo -e "  ${CYAN}─────────────────────────────────────────────${NC}"
    _systemd_status_line "PostgreSQL " "postgresql" "$POSTGRES_PORT" "db: $DB_NAME"
    _systemd_status_line "MinIO      " "minio" "$MINIO_PORT" "bucket: $MINIO_BUCKET"

    echo ""
    echo -e "  ${BOLD}Application${NC}"
    echo -e "  ${CYAN}─────────────────────────────────────────────${NC}"
    _service_status_line "CMS        " "$CMS_PORT" "http://localhost:$CMS_PORT/admin"
    _service_status_line "Frontend   " "$FRONTEND_PORT" "http://localhost:$FRONTEND_PORT"

    echo ""
}

# =============================================================================
# LOGS
# =============================================================================

show_logs() {
    local service="${1:-all}"
    local lines="${2:-50}"

    case "$service" in
        cms|directus|api|backend)
            log_info "CMS logs (last $lines lines):"
            tail -n "$lines" "$CMS_LOG" 2>/dev/null || log_error "No CMS log found at $CMS_LOG"
            ;;
        frontend|client|web|next)
            log_info "Frontend logs (last $lines lines):"
            tail -n "$lines" "$FRONTEND_LOG" 2>/dev/null || log_error "No frontend log found at $FRONTEND_LOG"
            ;;
        postgres|postgresql)
            log_info "PostgreSQL logs (last $lines lines):"
            if [ -f /var/log/postgresql/postgresql-16-main.log ]; then
                sudo tail -n "$lines" /var/log/postgresql/postgresql-16-main.log 2>/dev/null || tail -n "$lines" /var/log/postgresql/postgresql-16-main.log 2>/dev/null || log_error "Could not read PostgreSQL logs"
            elif [ -f /var/log/postgresql/postgresql-15-main.log ]; then
                sudo tail -n "$lines" /var/log/postgresql/postgresql-15-main.log 2>/dev/null || tail -n "$lines" /var/log/postgresql/postgresql-15-main.log 2>/dev/null || log_error "Could not read PostgreSQL logs"
            else
                journalctl -u postgresql -n "$lines" --no-pager 2>/dev/null || log_error "Could not read PostgreSQL logs"
            fi
            ;;
        minio)
            log_info "MinIO logs (last $lines lines):"
            if command -v systemctl &>/dev/null && systemctl is-active --quiet minio 2>/dev/null; then
                journalctl -u minio -n "$lines" --no-pager 2>/dev/null || log_error "Could not read MinIO journal logs"
            else
                tail -n "$lines" /tmp/minio.log 2>/dev/null || log_error "Could not read MinIO logs (check /tmp/minio.log)"
            fi
            ;;
        all|"")
            for svc_label in "CMS:$CMS_LOG" "Frontend:$FRONTEND_LOG"; do
                local name="${svc_label%%:*}"
                local file="${svc_label##*:}"
                echo ""
                log_info "=== $name (last 30 lines) ==="
                tail -n 30 "$file" 2>/dev/null || log_error "No log found at $file"
            done
            ;;
        *)
            log_error "Unknown service: $service"
            log_info "Valid: cms, frontend, postgres, minio, all"
            ;;
    esac
}

tail_logs() {
    local service="${1:-all}"

    case "$service" in
        cms|directus|api|backend)
            log_info "Tailing CMS logs (Ctrl+C to stop)..."
            tail -f "$CMS_LOG" 2>/dev/null || log_error "No CMS log found"
            ;;
        frontend|client|web|next)
            log_info "Tailing frontend logs (Ctrl+C to stop)..."
            tail -f "$FRONTEND_LOG" 2>/dev/null || log_error "No frontend log found"
            ;;
        all|"")
            log_info "Tailing all logs (Ctrl+C to stop)..."
            tail -f "$CMS_LOG" "$FRONTEND_LOG" 2>/dev/null || log_error "No log files found"
            ;;
        *)
            log_error "Unknown service: $service"
            ;;
    esac
}

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

db_migrate() {
    log_info "Running Directus migrations..."
    cd "$APP_DIR/cms"
    node migrations/001_initial_schema.js
    log_success "Migrations complete"
}

db_seed() {
    log_info "Seeding database..."
    cd "$APP_DIR/cms"
    node seed/seed-data.js
    log_success "Database seeded"
}

db_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$APP_DIR/backups"
    local backup_file="$backup_dir/tume_cms_${timestamp}.sql.gz"
    mkdir -p "$backup_dir"
    log_info "Backing up database '$DB_NAME'..."
    PGPASSWORD="$DB_PASS" pg_dump -U "$DB_USER" -h localhost -p "$POSTGRES_PORT" -d "$DB_NAME" | gzip > "$backup_file"
    if [ $? -eq 0 ]; then
        log_success "Database backed up to $backup_file"
    else
        log_error "Database backup failed"
        return 1
    fi
}

db_restore() {
    local backup_file="${1:-}"
    if [ -z "$backup_file" ]; then
        backup_file=$(ls -t "$APP_DIR"/backups/tume_cms_*.sql.gz 2>/dev/null | head -1)
        if [ -z "$backup_file" ]; then
            log_error "No backup files found in $APP_DIR/backups/"
            return 1
        fi
        log_info "Using most recent backup: $backup_file"
    fi

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi

    log_warning "This will REPLACE the current database '$DB_NAME' with the backup!"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        log_info "Cancelled"
        return 0
    fi

    log_info "Restoring database from $backup_file..."
    gunzip -c "$backup_file" | PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -p "$POSTGRES_PORT" -d "$DB_NAME"
    if [ $? -eq 0 ]; then
        log_success "Database restored from $backup_file"
    else
        log_error "Database restore failed"
        return 1
    fi
}

db_reset() {
    log_warning "This will DELETE ALL DATA from database '$DB_NAME'!"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        log_info "Dropping and recreating database '$DB_NAME'..."
        PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -p "$POSTGRES_PORT" -d postgres -c "DROP DATABASE \"$DB_NAME\";" 2>/dev/null || true
        PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -p "$POSTGRES_PORT" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
        log_info "Running migrations..."
        cd "$APP_DIR/cms"
        node migrations/001_initial_schema.js
        log_success "Database reset"
    else
        log_info "Cancelled"
    fi
}

# =============================================================================
# BUILD & UTILITIES
# =============================================================================

build_all() {
    log_info "Building frontend [$(mode_label)]..."
    cd "$APP_DIR/frontend"
    npm run build
    log_success "Build complete"
}

install_deps() {
    log_info "Installing frontend dependencies..."
    cd "$APP_DIR/frontend"
    npm install
    log_info "Installing CMS dependencies..."
    cd "$APP_DIR/cms"
    npm install
    log_success "Dependencies installed"
}

clean_build() {
    log_info "Cleaning build artifacts..."
    rm -rf "$APP_DIR/frontend/.next"
    rm -rf "$APP_DIR/frontend/node_modules/.cache"
    log_success "Cleaned"
}

health_check() {
    log_info "Running health checks..."
    echo ""

    # Check each service port
    for svc in "PostgreSQL:$POSTGRES_PORT" "MinIO:$MINIO_PORT" "CMS:$CMS_PORT" "Frontend:$FRONTEND_PORT"; do
        local name="${svc%%:*}"
        local port="${svc##*:}"
        if port_is_open "$port"; then
            echo -e "  ${GREEN}● $name${NC} port $port — listening"
        else
            echo -e "  ${RED}● $name${NC} port $port — not listening"
        fi
    done

    # HTTP health checks
    echo ""
    if http_responds "$CMS_PORT"; then
        echo -e "  ${GREEN}● CMS /admin${NC} — responding"
    else
        echo -e "  ${RED}● CMS /admin${NC} — not responding"
    fi

    if http_responds "$FRONTEND_PORT"; then
        echo -e "  ${GREEN}● Frontend${NC} — responding"
    else
        echo -e "  ${RED}● Frontend${NC} — not responding"
    fi

    # MinIO health
    echo ""
    local minio_health
    minio_health=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:$MINIO_PORT/minio/health/live" 2>/dev/null)
    if [ "$minio_health" = "200" ] || [ "$minio_health" = "204" ]; then
        echo -e "  ${GREEN}● MinIO health${NC} — healthy"
    else
        echo -e "  ${RED}● MinIO health${NC} — not responding"
    fi

    echo ""
}

# =============================================================================
# HELP
# =============================================================================

show_help() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   Tume ya Utumishi Serikalini — Service Manager        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Mode: ${BOLD}dev${NC} (default) or ${BOLD}prod${NC} (set TUME_MODE=prod)"
    echo ""
    echo -e "  ${BOLD}Usage:${NC} ./manage.sh <command> [service]"
    echo ""
    echo -e "  ${BOLD}Service Control:${NC}"
    echo "    start [service]       Start service or all (dev mode)"
    echo "    dev                   Start only frontend + CMS in dev mode"
    echo "    prod                  Start frontend + CMS via PM2 (production)"
    echo "    start-prod            Build & start all in PRODUCTION mode"
    echo "    stop [service]        Stop service or all"
    echo "    restart [service]     Restart service or all"
    echo "    status                Status of all services"
    echo "    health                HTTP health checks"
    echo ""
    echo -e "  ${BOLD}Services:${NC}"
    echo "    all          All services (default)"
    echo "    postgres     PostgreSQL database"
    echo "    minio        MinIO object storage"
    echo "    infra        Infrastructure only (postgres + minio)"
    echo "    cms          Directus CMS"
    echo "    frontend     Next.js frontend"
    echo ""
    echo -e "  ${BOLD}Database:${NC}"
    echo "    db-migrate            Run Directus migrations"
    echo "    db-seed               Seed database with initial data"
    echo "    db-backup             Backup database to backups/ directory"
    echo "    db-restore [file]     Restore database from backup"
    echo "    db-reset              Drop and recreate database (destructive)"
    echo ""
    echo -e "  ${BOLD}Logs:${NC}"
    echo "    logs [service]        View logs (cms, frontend, postgres, minio, all)"
    echo "    tail [service]        Tail logs in real-time"
    echo ""
    echo -e "  ${BOLD}Utilities:${NC}"
    echo "    install               Install npm dependencies"
    echo "    build                 Build frontend for production"
    echo "    clean                 Clean build artifacts"
    echo ""
    echo -e "  ${BOLD}Examples:${NC}"
    echo "    ./manage.sh start              # Start everything in dev mode"
    echo "    ./manage.sh dev                # Start only frontend + CMS"
    echo "    ./manage.sh prod               # Start frontend + CMS via PM2"
    echo "    ./manage.sh start-prod         # Build & start everything in production"
    echo "    ./manage.sh start cms          # Start only the CMS"
    echo "    ./manage.sh stop frontend      # Stop only the frontend"
    echo "    ./manage.sh logs cms            # View CMS logs"
    echo "    ./manage.sh tail frontend      # Tail frontend logs"
    echo "    ./manage.sh status             # Check all services"
    echo "    ./manage.sh health             # HTTP health checks"
    echo ""
}

# =============================================================================
# INTERACTIVE MENU
# =============================================================================

show_menu() {
    local mode_str="$(mode_label)"

    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Tume ya Utumishi Service Manager  [${BOLD}${mode_str}${NC}${CYAN}]${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BOLD}Infrastructure${NC}"
    echo "    1)  Start all infrastructure"
    echo "    2)  Stop all infrastructure"
    echo "    3)  Start PostgreSQL"
    echo "    4)  Start MinIO"
    echo ""
    echo -e "  ${BOLD}Application${NC}"
    echo "    5)  Start all (infra + cms + frontend) [DEV]"
    echo "    6)  Start frontend + CMS only           [DEV]"
    echo "    7)  Start frontend + CMS via PM2       [PROD]"
    echo "    8)  Start all (build + start)           [PROD]"
    echo "    9)  Stop all"
    echo "   10)  Restart all"
    echo "   11)  Start CMS"
    echo "   12)  Stop CMS"
    echo "   13)  Restart CMS"
    echo "   14)  Start Frontend"
    echo "   15)  Stop Frontend"
    echo "   16)  Restart Frontend"
    echo ""
    echo -e "  ${BOLD}Database${NC}"
    echo "   17)  Run migrations"
    echo "   18)  Seed database"
    echo "   19)  Backup database"
    echo "   20)  Restore database"
    echo "   21)  Reset database"
    echo ""
    echo -e "  ${BOLD}Monitoring${NC}"
    echo "   22)  Check status"
    echo "   23)  Health check"
    echo "   24)  View CMS logs"
    echo "   25)  View Frontend logs"
    echo "   26)  View all logs"
    echo "   27)  Tail CMS logs"
    echo "   28)  Tail Frontend logs"
    echo "   29)  Tail all logs"
    echo ""
    echo -e "  ${BOLD}Utilities${NC}"
    echo "   30)  Install dependencies"
    echo "   31)  Build frontend"
    echo "   32)  Clean build artifacts"
    echo "   33)  Toggle dev/prod mode"
    echo ""
    echo "    0)  Exit"
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
}

run_interactive() {
    while true; do
        show_menu
        echo -n "  Enter choice [0-33]: "
        read -r choice

        case $choice in
            # Infrastructure
            1)  start_infra ;;
            2)  stop_infra ;;
            3)  start_postgres ;;
            4)  start_minio ;;
            # Application
            5)  start_all ;;
            6)  start_dev_apps ;;
            7)  start_prod_apps_pm2 ;;
            8)  start_prod_all ;;
            9)  stop_all ;;
            10) restart_all ;;
            11) start_cms ;;
            12) stop_cms ;;
            13) restart_cms ;;
            14) start_frontend ;;
            15) stop_frontend ;;
            16) restart_frontend ;;
            # Database
            17) db_migrate ;;
            18) db_seed ;;
            19) db_backup ;;
            20) db_restore ;;
            21) db_reset ;;
            # Monitoring
            22) check_status ;;
            23) health_check ;;
            24) show_logs cms ;;
            25) show_logs frontend ;;
            26) show_logs all ;;
            27) tail_logs cms ;;
            28) tail_logs frontend ;;
            29) tail_logs all ;;
            # Utilities
            30) install_deps ;;
            31) build_all ;;
            32) clean_build ;;
            33)
                if is_dev; then
                    MODE="prod"
                    log_info "Switched to PRODUCTION mode"
                else
                    MODE="dev"
                    log_info "Switched to DEVELOPMENT mode"
                fi
                ;;
            0)  log_info "Bye"; exit 0 ;;
            *)  log_error "Invalid option" ;;
        esac

        # Don't pause for tail commands
        case $choice in
            24|25|26) ;;
            *)
                echo ""
                echo -n "  Press Enter to continue..."
                read -r
                ;;
        esac
    done
}

# =============================================================================
# COMMAND ROUTER
# =============================================================================

resolve_service() {
    local action=$1
    local service="${2:-all}"

    case "$service" in
        all|"")             ${action}_all ;;
        infra)              ${action}_infra ;;
        postgres|postgresql) ${action}_postgres ;;
        minio)              ${action}_minio ;;
        cms|directus|api|backend) ${action}_cms ;;
        frontend|client|web|next) ${action}_frontend ;;
        *)
            log_error "Unknown service: $service"
            log_info "Valid: all, infra, postgres, minio, cms, frontend"
            exit 1
            ;;
    esac
}

case "${1:-}" in
    start)
        resolve_service start "${2:-all}"
        ;;
    dev)
        start_dev_apps
        ;;
    start-prod)
        start_prod_all
        ;;
    prod)
        start_prod_apps_pm2
        ;;
    stop)
        resolve_service stop "${2:-all}"
        ;;
    restart)
        resolve_service restart "${2:-all}"
        ;;
    status)
        check_status
        ;;
    health)
        health_check
        ;;
    logs)
        show_logs "${2:-all}" "${3:-50}"
        ;;
    tail|tail-logs)
        tail_logs "${2:-all}"
        ;;
    db-migrate|migrate)
        db_migrate
        ;;
    db-seed|seed)
        db_seed
        ;;
    db-backup|backup)
        db_backup
        ;;
    db-restore|restore)
        db_restore "${2:-}"
        ;;
    db-reset)
        db_reset
        ;;
    install)
        install_deps
        ;;
    build)
        build_all
        ;;
    clean)
        clean_build
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        run_interactive
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

exit 0