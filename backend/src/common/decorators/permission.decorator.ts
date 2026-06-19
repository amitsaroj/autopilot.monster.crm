import { SetMetadata } from '@nestjs/common';

import { METADATA_KEYS } from '../constants/app.constants';

/** @RequirePermission('crm:write') — sets required permission on a route */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(METADATA_KEYS.PERMISSIONS, permissions);

/** Alias for @RequirePermission — audit/docs name */
export const Permissions = RequirePermission;
