import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AdminDebugService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async clearCache() {
    await (this.cacheManager as any).reset();
  }

  async simulateError() {
    throw new Error('DEBUG_SIMULATION: Systematic core failure induced by administrator.');
  }

  async getSanitizedEnv() {
    const env = process.env;
    const sanitized: Record<string, string> = {};
    
    const secretKeys = ['PORT', 'NODE_ENV', 'APP_NAME']; // Only allow non-sensitive keys or mask others
    
    Object.keys(env).forEach(key => {
       if (secretKeys.includes(key)) {
          sanitized[key] = env[key] || '';
       } else {
          sanitized[key] = '********';
       }
    });

    return sanitized;
  }
}
