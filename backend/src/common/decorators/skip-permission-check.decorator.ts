import { SetMetadata } from '@nestjs/common';

import { METADATA_KEYS } from '../constants/app.constants';

/** Routes any authenticated user may access without explicit permission metadata. */
export const SkipPermissionCheck = (): ClassDecorator & MethodDecorator =>
  SetMetadata(METADATA_KEYS.SKIP_PERMISSION_CHECK, true);
