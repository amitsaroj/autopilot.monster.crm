import { SetMetadata } from '@nestjs/common';

import { METADATA_KEYS } from '../constants/app.constants';

/**
 * @Limit('contacts') — marks a route as requiring a specific usage limit check.
 */
export const Limit = (metric: string) => SetMetadata(METADATA_KEYS.PLAN_LIMIT, metric);
