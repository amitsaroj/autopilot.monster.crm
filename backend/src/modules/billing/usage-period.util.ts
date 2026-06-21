export type UsagePeriod = 'DAILY' | 'MONTHLY' | 'TOTAL';

export interface UsagePeriodBounds {
  periodStart: Date;
  periodEnd: Date;
}

export function resolveUsagePeriodBounds(period: UsagePeriod, now = new Date()): UsagePeriodBounds {
  if (period === 'TOTAL') {
    return {
      periodStart: new Date(0),
      periodEnd: new Date('2099-12-31T23:59:59.999Z'),
    };
  }

  if (period === 'DAILY') {
    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 1);
    periodEnd.setMilliseconds(periodEnd.getMilliseconds() - 1);
    return { periodStart, periodEnd };
  }

  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { periodStart, periodEnd };
}
