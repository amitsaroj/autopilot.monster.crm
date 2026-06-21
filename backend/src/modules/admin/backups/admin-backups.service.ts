import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { StorageService } from '../../../storage/storage.service';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class AdminBackupsService {
  private readonly logger = new Logger(AdminBackupsService.name);
  private currentBackups: any[] = [
    { id: 'bak-001', name: 'weekly-system-backup-01.tar.gz', size: '1.2 GB', createdAt: new Date(Date.now() - 86400000 * 2), status: 'SUCCESS' },
    { id: 'bak-002', name: 'daily-db-snapshot.sql', size: '450 MB', createdAt: new Date(Date.now() - 86400000), status: 'SUCCESS' },
  ];

  constructor(private readonly storageService: StorageService) {}

  async findAll() {
    return this.currentBackups;
  }

  async findOne(id: string) {
    return this.currentBackups.find(b => b.id === id);
  }

  async trigger() {
    const backupId = `bak-${Date.now()}`;
    const fileName = `backup-${Date.now()}.sql`;
    const tempPath = path.join('/tmp', fileName);

    const backupRecord = {
      id: backupId,
      name: fileName,
      status: 'RUNNING',
      createdAt: new Date(),
    };
    this.currentBackups.push(backupRecord);

    // Run backup in background
    this.runBackup(backupId, tempPath, fileName).catch(err => {
      this.logger.error(`Backup ${backupId} failed`, err);
    });

    return backupRecord;
  }

  private async runBackup(id: string, tempPath: string, fileName: string) {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error('DATABASE_URL not set');

      this.logger.log(`Starting DB dump to ${tempPath}`);
      await execAsync(`pg_dump ${dbUrl} -f ${tempPath}`);

      this.logger.log(`Uploading ${fileName} to storage`);
      const fileBuffer = fs.readFileSync(tempPath);
      await this.storageService.getClient().putObject(
        this.storageService.getBackupsBucket(),
        fileName,
        fileBuffer
      );

      const stats = fs.statSync(tempPath);
      const size = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';

      // Update record
      const record = this.currentBackups.find(b => b.id === id);
      if (record) {
        record.status = 'SUCCESS';
        record.size = size;
      }

      // Cleanup
      fs.unlinkSync(tempPath);
      this.logger.log(`Backup ${id} completed successfully`);
    } catch (err: any) {
      const record = this.currentBackups.find(b => b.id === id);
      if (record) {
        record.status = 'FAILED';
        record.errorMessage = err.message;
      }
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw err;
    }
  }
}
