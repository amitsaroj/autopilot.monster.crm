import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminBackupsService } from '../backups/admin-backups.service';
import { StorageService } from '../../../storage/storage.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

import { env } from '../../../config/env.config';

const execAsync = promisify(exec);

@Injectable()
export class AdminRestoreService {
  private readonly logger = new Logger(AdminRestoreService.name);

  constructor(
    private readonly backupsService: AdminBackupsService,
    private readonly storageService: StorageService,
  ) {}

  async initiate(backupId: string) {
    const backup = await this.backupsService.findOne(backupId);
    if (!backup) {
      throw new NotFoundException(`Backup record ${backupId} not found`);
    }

    const tempPath = path.join('/tmp', `restore-${backupId}-${backup.name}`);

    // Trigger restoration process in background
    this.runRestore(backupId, backup.name, tempPath).catch((err) => {
      this.logger.error(`Restore job ${backupId} failed`, err);
    });

    return {
      backupId,
      status: 'RECOVERY_IN_PROGRESS',
      startedAt: new Date(),
    };
  }

  private async runRestore(backupId: string, fileName: string, tempPath: string) {
    try {
      this.logger.log(`Starting restore process for backup ${backupId} (${fileName})`);

      const dbUrl = env.database.url;
      if (!dbUrl) throw new Error('DATABASE_URL not set');

      this.logger.log(`Downloading backup archive from MinIO to ${tempPath}`);
      const client = this.storageService.getClient();
      const bucket = this.storageService.getBackupsBucket();

      await client.fGetObject(bucket, fileName, tempPath);
      this.logger.log(
        `Downloaded ${fileName} successfully. File size: ${fs.statSync(tempPath).size} bytes`,
      );

      this.logger.log(`Restoring database snapshot...`);
      // Run psql command to execute SQL file.
      try {
        await execAsync(`psql "${dbUrl}" -f "${tempPath}"`);
        this.logger.log(`Database restore from ${fileName} completed successfully via psql`);
      } catch (execErr: any) {
        this.logger.error(`Failed to execute psql restore: ${execErr.message}`);
        throw execErr;
      }

      // Cleanup
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      this.logger.log(`Restore process for backup ${backupId} finalized.`);
    } catch (err: any) {
      this.logger.error(
        `Critical failure in restore process for backup ${backupId}: ${err.message}`,
      );
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw err;
    }
  }
}
