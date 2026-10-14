#!/usr/bin/env bash
# ClinicOS Database Backup Rotation Script
# Enforces 30 days retention policy for PostgreSQL backups

set -euo pipefail

BACKUP_DIR="/var/backups/clinicos"
LOG_FILE="/var/log/clinicos-backup.log"
RETENTION_DAYS=30

touch "${LOG_FILE}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ROTATION] $1" >> "${LOG_FILE}"
}

log "Starting backup rotation check (Retention: ${RETENTION_DAYS} days)..."

if [ ! -d "${BACKUP_DIR}" ]; then
    log "ERROR: Backup directory ${BACKUP_DIR} does not exist. Rotation skipped."
    exit 1
fi

# List files that are candidates for deletion
DELETION_CANDIDATES=$(find "${BACKUP_DIR}" -type f -name "clinicos-db-*.sql.gz" -mtime +"${RETENTION_DAYS}")

if [ -n "${DELETION_CANDIDATES}" ]; then
    # Log files being deleted
    echo "${DELETION_CANDIDATES}" | while read -r file; do
        log "Deleting expired backup file: ${file}"
    done
    
    # Delete the files
    find "${BACKUP_DIR}" -type f -name "clinicos-db-*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete
    log "Rotation completed. Expired files pruned."
else
    log "No expired backups found. Retention requirements are satisfied."
fi
