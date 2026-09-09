import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  MicroserviceHealthIndicator,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

import { env } from '../config/env.config';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly http: HttpHealthIndicator,
  ) {}

  private redisPingCheck() {
    return () =>
      this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: {
          host: env.redis.host,
          port: env.redis.port,
          ...(env.redis.password ? { password: env.redis.password } : {}),
        },
      });
  }

  private optionalDependencyChecks() {
    const checks = [];

    const qdrantUrl = env.qdrant.url;
    if (qdrantUrl) {
      const base = qdrantUrl.replace(/\/$/, '');
      checks.push(() => this.http.pingCheck('qdrant', `${base}/healthz`));
    }

    const minioHost = env.minio.endpoint;
    if (minioHost) {
      const minioPort = env.minio.port;
      checks.push(() =>
        this.http.pingCheck('minio', `http://${minioHost}:${minioPort}/minio/health/live`),
      );
    }

    return checks;
  }

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  check() {
    const diskThreshold = env.health.diskThreshold;
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', {
          path: process.cwd(),
          thresholdPercent: diskThreshold,
        }),
      this.redisPingCheck(),
      ...this.optionalDependencyChecks(),
    ]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe' })
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      this.redisPingCheck(),
      ...this.optionalDependencyChecks(),
    ]);
  }
}
