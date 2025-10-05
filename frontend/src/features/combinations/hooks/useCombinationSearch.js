import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchStore } from '../../../store/searchStore';
import { fetchCombinations } from '../api';
export const useCombinationSearch = () => {
    const filters = useSearchStore((state) => state);
    const queryParams = useMemo(() => {
        const offset = (filters.page - 1) * filters.limit;
        return {
            schedule_year: filters.scheduleYear,
            schedule_month: filters.scheduleMonth,
            drug: filters.drug,
            brand: filters.brand,
            formulation: filters.formulation,
            indication: filters.indication,
            treatment_phase: filters.treatmentPhase,
            hospital_type: filters.hospitalType,
            limit: filters.limit,
            offset
        };
    }, [filters]);
    const queryKey = useMemo(() => [
        'combinations',
        {
            ...queryParams,
            page: filters.page
        }
    ], [queryParams, filters.page]);
    const query = useQuery({
        queryKey,
        queryFn: () => fetchCombinations(queryParams),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 30
    });
    return {
        ...query,
        queryParams
    };
};
