import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminInternalService {
  constructor(private readonly dataSource: DataSource) {}

  async getSystemHealth() {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }

  async getDbStatus() {
    const connection = this.dataSource;
    return {
      isConnected: connection.isInitialized,
      type: connection.options.type,
      database: connection.options.database,
      schema: (connection.options as any).schema || 'public',
      entitiesCount: connection.entityMetadatas.length,
    };
  }
}
