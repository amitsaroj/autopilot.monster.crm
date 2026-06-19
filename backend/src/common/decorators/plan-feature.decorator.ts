import { SetMetadata } from '@nestjs/common';

import { METADATA_KEYS } from '../constants/app.constants';

/**
 * @PlanFeature('whatsapp') — marks a route as requiring a specific plan feature.
 * PlanGuard evaluates global kill switches, tenant overrides, then plan features.
 */
export const PlanFeature = (feature: string) => SetMetadata(METADATA_KEYS.PLAN_FEATURE, feature);
