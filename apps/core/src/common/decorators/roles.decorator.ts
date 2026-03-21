import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants/app.constants';

/** @Roles('admin', 'manager') — sets allowed roles on a route */
export const Roles = (...roles: string[]) => SetMetadata(METADATA_KEYS.ROLES, roles);
