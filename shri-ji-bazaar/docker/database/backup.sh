#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec sji-postgres pg_dump -U shrijibazaar shriji_bazaar > $BACKUP_DIR/backup_$DATE.sql
echo "Backup completed: backup_$DATE.sql"