import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants/app.constants';

/**
 * @PlanFeature('whatsapp') — marks a route as requiring a specific plan feature.
 * The PlanGuard reads this metadata and checks the tenant's plan.
 */
export const PlanFeature = (feature: string) => SetMetadata(METADATA_KEYS.PLAN_FEATURE, feature);
