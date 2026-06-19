import { resolveUsagePeriodBounds } from './usage-period.util';

describe('usage-period.util', () => {
  it('uses epoch bounds for TOTAL period', () => {
    const bounds = resolveUsagePeriodBounds('TOTAL', new Date('2026-06-18T12:00:00Z'));
    expect(bounds.periodStart.getTime()).toBe(0);
    expect(bounds.periodEnd.getUTCFullYear()).toBe(2099);
  });

  it('uses calendar month bounds for MONTHLY period', () => {
    const bounds = resolveUsagePeriodBounds('MONTHLY', new Date('2026-06-18T12:00:00Z'));
    expect(bounds.periodStart).toEqual(new Date(2026, 5, 1));
    expect(bounds.periodEnd.getMonth()).toBe(5);
    expect(bounds.periodEnd.getDate()).toBe(30);
  });

  it('uses day bounds for DAILY period', () => {
    const now = new Date('2026-06-18T15:30:00Z');
    const bounds = resolveUsagePeriodBounds('DAILY', now);
    expect(bounds.periodStart.getHours()).toBe(0);
    expect(bounds.periodStart.getDate()).toBe(now.getDate());
    expect(bounds.periodEnd.getDate()).toBe(now.getDate());
  });
});
