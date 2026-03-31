import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminEnvironmentService {
  constructor() {}

  async getEnv() {
    // Redact sensitive keys
    const env = process.env;
    const redactedEnv: Record<string, string> = {};
    const sensitiveKeywords = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'AUTH', 'DB', 'DATABASE'];

    for (const key in env) {
      const isSensitive = sensitiveKeywords.some(keyword => key.toUpperCase().includes(keyword));
      redactedEnv[key] = isSensitive ? '********' : env[key] || '';
    }

    return {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: redactedEnv,
    };
  }
}
