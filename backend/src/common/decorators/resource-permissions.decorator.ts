import { SetMetadata } from '@nestjs/common';

import { METADATA_KEYS } from '../constants/app.constants';

/** Applies HTTP-method-derived permissions for a resource (e.g. GET → crm:read). */
export const ResourcePermissions = (resource: string) =>
  SetMetadata(METADATA_KEYS.PERMISSION_RESOURCE, resource);
