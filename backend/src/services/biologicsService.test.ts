import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/pool.js', () => ({
  pool: {
    connect: vi.fn()
  },
  query: vi.fn()
}));

import { query } from '../db/pool.js';
import { getLookupValues, getSchedules, searchCombinations } from './biologicsService.js';

const mockQuery = vi.mocked(query);

const sampleCombination = {
  id: 123,
  pbs_code: 'ABC123',
  drug: 'Drug A',
  brand: 'Brand A',
  formulation: 'Form',
  indication: 'Indication',
  treatment_phase: null,
  streamlined_code: null,
  authority_method: null,
  online_application: null,
  hospital_type: 'Hospital',
  maximum_prescribable_pack: 1,
  maximum_quantity_units: 2,
  number_of_repeats: 3,
  schedule_code: '2025-01',
  schedule_year: 2025,
  schedule_month: 'JANUARY',
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z')
};

describe('biologicsService', () => {
  const makeResult = <T>(rows: T[]): any => ({
    command: 'SELECT',
    rowCount: rows.length,
    oid: 0,
    fields: [],
    rows
  });

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('builds queries for combination search filters and pagination', async () => {
    mockQuery
      .mockResolvedValueOnce(makeResult([sampleCombination]))
      .mockResolvedValueOnce(makeResult([{ total: '1' }]));

    const result = await searchCombinations({ drug: 'Drug A' }, 10, 0);

    expect(mockQuery).toHaveBeenCalledTimes(2);

    const [dataSql, dataValues] = mockQuery.mock.calls[0];
    const [, countValues] = mockQuery.mock.calls[1];

    expect(dataSql).toContain('FROM ranked');
    expect(dataValues).toEqual(['Drug A', 10, 0]);
    expect(countValues).toEqual(['Drug A']);

    expect(result.meta).toEqual({ limit: 10, offset: 0, total: 1 });
    expect(result.data[0]).toMatchObject({
      drug: 'Drug A',
      pbs_code: 'ABC123'
    });
  });

  it('skips the lookup column when filtering lookup values', async () => {
    mockQuery.mockResolvedValueOnce(
      makeResult([{ brand: 'Brand X' }, { brand: 'Brand Y' }])
    );

    const values = await getLookupValues('brand', {
      drug: 'Drug X',
      brand: 'Brand X'
    });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('SELECT DISTINCT brand');
    expect(sql).toContain('WHERE drug');
    expect(params).toEqual(['Drug X']);
    expect(values).toEqual(['Brand X', 'Brand Y']);
  });

  it('rejects unsupported lookup columns', async () => {
    await expect(
      getLookupValues('unsupported', {})
    ).rejects.toMatchObject({ status: 400 });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns schedules in descending order', async () => {
    mockQuery.mockResolvedValueOnce(
      makeResult([
        {
          schedule_year: 2025,
          schedule_month: 'JANUARY',
          schedule_code: '2025-01',
          latest: true
        }
      ])
    );

    const schedules = await getSchedules();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(schedules[0]).toEqual({
      schedule_year: 2025,
      schedule_month: 'JANUARY',
      schedule_code: '2025-01',
      latest: true
    });
  });
});
