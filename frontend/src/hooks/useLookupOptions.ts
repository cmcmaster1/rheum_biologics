import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../api/client';

export type LookupResource =
  | 'drugs'
  | 'brands'
  | 'formulations'
  | 'indications'
  | 'treatment-phases'
  | 'hospital-types';

type LookupParams = Record<string, string | number | undefined>;

const fetchLookup = async (resource: LookupResource, params: LookupParams) => {
  const response = await apiClient.get<{ data: string[] }>(`/api/${resource}`, {
    params
  });
  return response.data.data;
};

const sortValues = (values: string[]): string[] =>
  [...values]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

export const useLookupOptions = (resource: LookupResource, params: LookupParams) => {
  return useQuery({
    queryKey: ['lookup', resource, params],
    queryFn: () => fetchLookup(resource, params),
    select: sortValues,
    staleTime: 1000 * 60 * 60
  });
};
