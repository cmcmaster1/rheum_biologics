import { apiClient } from '../../api/client';

import { CombinationResponse } from './types';

export type CombinationQuery = {
  specialty?: string;
  schedule_year?: number;
  schedule_month?: string;
  drug?: string[];
  brand?: string[];
  formulation?: string[];
  indication?: string[];
  treatment_phase?: string[];
  hospital_type?: string[];
  pbs_code?: string[];
  limit: number;
  offset: number;
  sort?: string;
};

const stringifyList = (value?: string[]) => {
  if (!value || value.length === 0) return undefined;
  return value.join(',');
};

export const fetchCombinations = async (query: CombinationQuery): Promise<CombinationResponse> => {
  const params = {
    specialty: query.specialty,
    schedule_year: query.schedule_year,
    schedule_month: query.schedule_month,
    drug: stringifyList(query.drug),
    brand: stringifyList(query.brand),
    formulation: stringifyList(query.formulation),
    indication: stringifyList(query.indication),
    treatment_phase: stringifyList(query.treatment_phase),
    hospital_type: stringifyList(query.hospital_type),
    pbs_code: stringifyList(query.pbs_code),
    limit: query.limit,
    offset: query.offset,
    sort: query.sort
  };

  const response = await apiClient.get<CombinationResponse>('/api/combinations', { params });
  return response.data;
};
