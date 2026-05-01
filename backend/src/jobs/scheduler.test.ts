import { describe, expect, it } from 'vitest';

import { getSchedulerTargetMonthDate } from './schedulerDate.js';

describe('getSchedulerTargetMonthDate', () => {
  it('uses the scheduler timezone instead of the server UTC month', () => {
    const utcTimeDuringSydneyMay = new Date('2026-04-30T18:00:00.000Z');

    expect(
      getSchedulerTargetMonthDate(utcTimeDuringSydneyMay, 'Australia/Sydney').toISOString()
    ).toBe('2026-05-01T00:00:00.000Z');
  });

  it('resolves the UTC month when the scheduler timezone is UTC', () => {
    const utcTimeDuringSydneyMay = new Date('2026-04-30T18:00:00.000Z');

    expect(getSchedulerTargetMonthDate(utcTimeDuringSydneyMay, 'UTC').toISOString()).toBe(
      '2026-04-01T00:00:00.000Z'
    );
  });
});
