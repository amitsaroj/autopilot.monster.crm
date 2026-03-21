import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { HEADERS } from '../constants/app.constants';

/** Swagger decorator to document the x-tenant-id header requirement */
export const ApiTenantHeader = () =>
  applyDecorators(
    ApiHeader({
      name: HEADERS.TENANT_ID,
      description: 'Tenant identifier — required for all authenticated endpoints',
      required: true,
    }),
    ApiHeader({
      name: HEADERS.CORRELATION_ID,
      description: 'Optional correlation ID for distributed tracing',
      required: false,
    }),
  );
