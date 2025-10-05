import { z } from 'zod';
import { ParsedQs } from 'qs';

type RawValue = string | string[] | undefined;

type RawQuery = Record<string, RawValue> | ParsedQs;

const coerceNumber = (value: RawValue, fallback: number) => {
  if (Array.isArray(value)) {
    return Number.parseInt(value[0] ?? `${fallback}`, 10);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
};

const paginationSchema = z.object({
  limit: z.number().min(1).max(200).default(25),
  offset: z.number().min(0).default(0)
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const parsePagination = (query: RawQuery): PaginationParams => {
  const limit = coerceNumber(query.limit, 25);
  const offset = coerceNumber(query.offset, 0);
  return paginationSchema.parse({ limit, offset });
};
