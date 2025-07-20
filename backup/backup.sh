#!/bin/sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/backups/malaka_db_backup_${TIMESTAMP}.sql"

PGPASSWORD="$PGPASSWORD" pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi

# Optional: Clean up old backups (e.g., keep last 7 days)
find /backups -type f -name "malaka_db_backup_*.sql" -mtime +7 -delete
