#!/usr/bin/env bash
# ClinicOS Database Backup Automation Script
# Scheduled via host crontab to run daily at 2:00 AM

set -euo pipefail

# Configurations
APP_DIR="/home/ubuntu/clinicos"
BACKUP_DIR="/var/backups/clinicos"
ENV_FILE="${APP_DIR}/deployment/.env"
LOG_FILE="/var/log/clinicos-backup.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/clinicos-db-${TIMESTAMP}.sql.gz"

# Ensure log and backup directories exist
mkdir -p "${BACKUP_DIR}"
touch "${LOG_FILE}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "${LOG_FILE}"
}

log "--- Database backup started ---"

# Load environment variables
if [ -f "${ENV_FILE}" ]; then
    # Export variables from .env
    export $(grep -v '^#' "${ENV_FILE}" | xargs)
else
    log "ERROR: Environment file not found at ${ENV_FILE}. Backup aborted."
    exit 1
fi

# Run pg_dump inside the docker container and stream to compressed file on the host
if docker ps --format '{{.Names}}' | grep -Eq "^clinicos-db$"; then
    log "Database container found. Executing pg_dump..."
    if docker exec -t clinicos-db pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c | gzip > "${BACKUP_FILE}"; then
        # Secure the file permissions
        chmod 600 "${BACKUP_FILE}"
        
        # Verify file is not empty
        FILE_SIZE=$(wc -c < "${BACKUP_FILE}")
        if [ "${FILE_SIZE}" -gt 100 ]; then
            log "SUCCESS: Backup written successfully to ${BACKUP_FILE} (${FILE_SIZE} bytes)."
        else
            log "WARNING: Backup file size is unusually small (${FILE_SIZE} bytes). Please verify database integrity."
        fi
    else
        log "ERROR: pg_dump execution failed."
        exit 1
    fi
else
    log "ERROR: PostgreSQL container 'clinicos-db' is not running. Backup aborted."
    exit 1
fi

log "--- Database backup completed ---"
