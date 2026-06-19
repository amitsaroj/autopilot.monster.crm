import { Injectable } from '@nestjs/common';

import { Lead } from '../../database/entities/lead.entity';

@Injectable()
export class LeadScoringService {
  computeScore(lead: Partial<Lead>): number {
    let score = 0;
    const metadata = (lead.metadata ?? {}) as Record<string, unknown>;

    const source = String(metadata.source ?? '').toLowerCase();
    if (source === 'referral') score += 30;
    else if (source === 'website') score += 20;
    else if (source === 'cold') score += 5;

    if (lead.phone) score += 10;
    if (metadata.company) score += 10;
    if (metadata.title) score += 10;

    if (metadata.emailOpened === true) score += 5;
    if (metadata.meetingBooked === true) score += 20;

    const companySize = String(metadata.companySize ?? '');
    if (companySize === '201-500') score += 15;

    const lastContactedAt = metadata.lastContactedAt;
    if (lastContactedAt) {
      const contactedMs = new Date(String(lastContactedAt)).getTime();
      const daysSince = (Date.now() - contactedMs) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }
}
