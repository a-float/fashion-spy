import { $ } from "bun";
import { logger } from "logger";

const MAX_BACKUPS = 16;

export async function backupDatabase() {
  logger.notice("Starting database backup");
  // Set database and backup directory
  const DB_PATH = process.env.DB_PATH;
  const BACKUP_DIR = process.env.DB_BACKUP_DIR;

  // Create backup filename with timestamp
  const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");
  const BACKUP_FILE = `${BACKUP_DIR}/db_backup_${TIMESTAMP}.sqlite`;

  // Ensure the backup directory exists
  await $`mkdir -p ${BACKUP_DIR}`;

  // Perform the backup
  await $`sqlite3 ${DB_PATH} ".backup '${BACKUP_FILE}'"`;
  logger.notice(`Backup completed: ${BACKUP_FILE}`);

  // Keep only the last 10 backups, delete older ones
  const backups = (await $`ls -t ${BACKUP_DIR}/db_backup_*.sqlite`)
    .text()
    .split("\n")
    .filter(Boolean);

  if (backups.length > MAX_BACKUPS) {
    const oldBackups = backups.slice(MAX_BACKUPS);
    await $`rm -f ${oldBackups}`;
    console.info(`Deleted old backups: ${oldBackups.join(", ")}`);
  }
}
