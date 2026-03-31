import { SetMetadata } from '@nestjs/common';

import { METADATA_KEYS } from '../constants/app.constants';

/** @Public() — marks a route as publicly accessible (skips JWT guard) */
export const Public = () => SetMetadata(METADATA_KEYS.IS_PUBLIC, true);
