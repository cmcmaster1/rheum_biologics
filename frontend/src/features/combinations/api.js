import { apiClient } from '../../api/client';
const stringifyList = (value) => {
    if (!value || value.length === 0)
        return undefined;
    return value.join(',');
};
export const fetchCombinations = async (query) => {
    const params = {
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
    const response = await apiClient.get('/api/combinations', { params });
    return response.data;
};
