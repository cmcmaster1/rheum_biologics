import { pool, query } from '../db/pool.js';

export type CombinationFilters = {
  schedule_year?: number;
  schedule_month?: string;
  drug?: string[];
  brand?: string[];
  formulation?: string[];
  indication?: string[];
  treatment_phase?: string[];
  hospital_type?: string[];
  authority_method?: string[];
  sort?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

const SORT_COLUMNS: Record<string, string> = {
  drug: 'drug ASC',
  brand: 'brand ASC',
  formulation: 'formulation ASC',
  indication: 'indication ASC',
  schedule: 'schedule_year DESC, schedule_month_date DESC',
  default: 'drug ASC, brand ASC'
};

const normalizeArray = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const appendFilter = (
  clauses: string[],
  values: unknown[],
  field: string,
  filterValues?: string[]
) => {
  if (!filterValues || filterValues.length === 0) {
    return;
  }

  const placeholders = filterValues.map((_, index) => `$${values.length + index + 1}`);
  clauses.push(`${field} = ANY(ARRAY[${placeholders.join(', ')}]::text[])`);
  values.push(...filterValues);
};

export type BiologicsCombination = {
  id: number;
  pbs_code: string;
  drug: string;
  brand: string;
  formulation: string;
  indication: string;
  treatment_phase: string | null;
  streamlined_code: string | null;
  authority_method: string | null;
  online_application: boolean | null;
  hospital_type: string | null;
  maximum_prescribable_pack: number | null;
  maximum_quantity_units: number | null;
  number_of_repeats: number | null;
  schedule_code: string;
  schedule_year: number;
  schedule_month: string;
  created_at: Date;
  updated_at: Date;
};

export type NewBiologicsCombination = {
  pbs_code: string;
  drug: string;
  brand: string;
  formulation: string;
  indication: string;
  treatment_phase: string | null;
  streamlined_code: string | null;
  authority_method: string | null;
  online_application: boolean | null;
  hospital_type: string | null;
  maximum_prescribable_pack: number | null;
  maximum_quantity_units: number | null;
  number_of_repeats: number | null;
  schedule_code: string;
  schedule_year: number;
  schedule_month: string;
};

export const searchCombinations = async (
  filterParams: Record<string, string | string[] | undefined>,
  limit: number,
  offset: number
): Promise<PaginatedResult<BiologicsCombination>> => {
  const filters: CombinationFilters = {
    schedule_year: filterParams.schedule_year ? Number(filterParams.schedule_year) : undefined,
    schedule_month: Array.isArray(filterParams.schedule_month)
      ? filterParams.schedule_month[0]
      : filterParams.schedule_month,
    drug: normalizeArray(filterParams.drug),
    brand: normalizeArray(filterParams.brand),
    formulation: normalizeArray(filterParams.formulation),
    indication: normalizeArray(filterParams.indication),
    treatment_phase: normalizeArray(filterParams.treatment_phase),
    hospital_type: normalizeArray(filterParams.hospital_type),
    authority_method: normalizeArray(filterParams.authority_method),
    sort: Array.isArray(filterParams.sort) ? filterParams.sort[0] : filterParams.sort
  };

  const whereClauses: string[] = [];
  const values: unknown[] = [];

  if (filters.schedule_year) {
    values.push(filters.schedule_year);
    whereClauses.push(`schedule_year = $${values.length}`);
  }

  if (filters.schedule_month) {
    values.push(filters.schedule_month);
    whereClauses.push(`schedule_month = $${values.length}`);
  }

  appendFilter(whereClauses, values, 'drug', filters.drug);
  appendFilter(whereClauses, values, 'brand', filters.brand);
  appendFilter(whereClauses, values, 'formulation', filters.formulation);
  appendFilter(whereClauses, values, 'indication', filters.indication);
  appendFilter(whereClauses, values, 'treatment_phase', filters.treatment_phase);
  appendFilter(whereClauses, values, 'hospital_type', filters.hospital_type);
  appendFilter(whereClauses, values, 'authority_method', filters.authority_method);

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sortKey = filters.sort && SORT_COLUMNS[filters.sort] ? filters.sort : 'default';
  const orderBy = `ORDER BY ${SORT_COLUMNS[sortKey]}`;

  const paginatedSql = `
    WITH ranked AS (
      SELECT
        *,
        TO_DATE(schedule_month, 'MONTH') AS schedule_month_date
      FROM biologics_combinations
    )
    SELECT
      id,
      pbs_code,
      drug,
      brand,
      formulation,
      indication,
      treatment_phase,
      streamlined_code,
      authority_method,
      online_application,
      hospital_type,
      maximum_prescribable_pack,
      maximum_quantity_units,
      number_of_repeats,
      schedule_code,
      schedule_year,
      schedule_month,
      created_at,
      updated_at
    FROM ranked
    ${whereSql}
    ${orderBy}
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2};
  `;

  const countSql = `SELECT COUNT(*) AS total FROM biologics_combinations ${whereSql};`;

  const dataPromise = query(paginatedSql, [...values, limit, offset]);
  const countPromise = query(countSql, values);

  const [dataResult, countResult] = await Promise.all([dataPromise, countPromise]);

  return {
    data: dataResult.rows as BiologicsCombination[],
    meta: {
      total: Number(countResult.rows[0]?.total ?? 0),
      limit,
      offset
    }
  };
};

export const replaceScheduleData = async (
  scheduleCode: string,
  rows: NewBiologicsCombination[]
): Promise<void> => {
  if (rows.length === 0) {
    return;
  }

  const client = await pool.connect();
  const columns = [
    'pbs_code',
    'drug',
    'brand',
    'formulation',
    'indication',
    'treatment_phase',
    'streamlined_code',
    'authority_method',
    'online_application',
    'hospital_type',
    'maximum_prescribable_pack',
    'maximum_quantity_units',
    'number_of_repeats',
    'schedule_code',
    'schedule_year',
    'schedule_month'
  ];

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM biologics_combinations WHERE schedule_code = $1', [scheduleCode]);

    const chunkSize = 500;
    for (let offset = 0; offset < rows.length; offset += chunkSize) {
      const chunk = rows.slice(offset, offset + chunkSize);
      const values: unknown[] = [];
      const placeholders = chunk.map((row, rowIndex) => {
        const baseIndex = rowIndex * columns.length;
        values.push(
          row.pbs_code,
          row.drug,
          row.brand,
          row.formulation,
          row.indication,
          row.treatment_phase,
          row.streamlined_code,
          row.authority_method,
          row.online_application,
          row.hospital_type,
          row.maximum_prescribable_pack,
          row.maximum_quantity_units,
          row.number_of_repeats,
          row.schedule_code,
          row.schedule_year,
          row.schedule_month
        );
        const tokens = columns.map((_, columnIndex) => `$${baseIndex + columnIndex + 1}`);
        return `(${tokens.join(', ')})`;
      });

      const insertSql = `INSERT INTO biologics_combinations (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`;
      await client.query(insertSql, values);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const LOOKUP_COLUMNS = new Set([
  'drug',
  'brand',
  'formulation',
  'indication',
  'treatment_phase',
  'hospital_type'
]);

export const getLookupValues = async (
  column: string,
  filterParams: Record<string, string | string[] | undefined>
): Promise<string[]> => {
  if (!LOOKUP_COLUMNS.has(column)) {
    throw Object.assign(new Error(`Unsupported lookup column: ${column}`), { status: 400 });
  }

    const whereClauses: string[] = [];
  const values: unknown[] = [];

  const filters: CombinationFilters = {
    schedule_year: filterParams.schedule_year ? Number(filterParams.schedule_year) : undefined,
    schedule_month: Array.isArray(filterParams.schedule_month)
      ? filterParams.schedule_month[0]
      : (filterParams.schedule_month as string | undefined),
    drug: normalizeArray(filterParams.drug),
    brand: normalizeArray(filterParams.brand),
    formulation: normalizeArray(filterParams.formulation),
    indication: normalizeArray(filterParams.indication),
    treatment_phase: normalizeArray(filterParams.treatment_phase),
    hospital_type: normalizeArray(filterParams.hospital_type),
    authority_method: normalizeArray(filterParams.authority_method),
    sort: undefined
  };

  if (filters.schedule_year) {
    values.push(filters.schedule_year);
    whereClauses.push(`schedule_year = $${values.length}`);
  }

  if (filters.schedule_month) {
    values.push(filters.schedule_month);
    whereClauses.push(`schedule_month = $${values.length}`);
  }

  const maybeAppend = (field: keyof CombinationFilters, filterValues?: string[]) => {
    if (column === field || column === field.replace('_', '')) {
      return;
    }
    appendFilter(whereClauses, values, field, filterValues);
  };

  maybeAppend('drug', filters.drug);
  maybeAppend('brand', filters.brand);
  maybeAppend('formulation', filters.formulation);
  maybeAppend('indication', filters.indication);
  maybeAppend('treatment_phase', filters.treatment_phase);
  maybeAppend('hospital_type', filters.hospital_type);
  maybeAppend('authority_method', filters.authority_method);

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT DISTINCT ${column}
    FROM biologics_combinations
    ${whereSql}
    ORDER BY ${column} ASC;
  `;

  const result = await query(sql, values);
  return result.rows.map((row) => row[column]).filter(Boolean);
};

export type Schedule = {
  schedule_year: number;
  schedule_month: string;
  schedule_code: string;
  latest: boolean;
};

export const getSchedules = async (): Promise<Schedule[]> => {
  const sql = `
    WITH distinct_schedules AS (
      SELECT DISTINCT schedule_year, schedule_month, schedule_code
      FROM biologics_combinations
    ), ranked AS (
      SELECT
        schedule_year,
        schedule_month,
        schedule_code,
        TO_DATE(schedule_month, 'MONTH') AS schedule_month_date,
        ROW_NUMBER() OVER (
          ORDER BY schedule_year DESC, TO_DATE(schedule_month, 'MONTH') DESC
        ) AS position
      FROM distinct_schedules
    )
    SELECT
      schedule_year,
      schedule_month,
      schedule_code,
      position = 1 AS latest
    FROM ranked
    ORDER BY schedule_year DESC, schedule_month_date DESC;
  `;

  const result = await query(sql);
  return result.rows as Schedule[];
};
