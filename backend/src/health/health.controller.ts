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
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          ...(process.env.REDIS_PASSWORD
            ? { password: process.env.REDIS_PASSWORD }
            : {}),
        },
      });
  }

  private optionalDependencyChecks() {
    const checks = [];

    const qdrantUrl = process.env.QDRANT_URL;
    if (qdrantUrl) {
      const base = qdrantUrl.replace(/\/$/, '');
      checks.push(() => this.http.pingCheck('qdrant', `${base}/healthz`));
    }

    const minioHost = process.env.MINIO_ENDPOINT;
    if (minioHost) {
      const minioPort = process.env.MINIO_PORT ?? '9000';
      checks.push(() =>
        this.http.pingCheck(
          'minio',
          `http://${minioHost}:${minioPort}/minio/health/live`,
        ),
      );
    }

    return checks;
  }

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  check() {
    const diskThreshold = parseFloat(process.env.HEALTH_DISK_THRESHOLD ?? '0.98');
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
