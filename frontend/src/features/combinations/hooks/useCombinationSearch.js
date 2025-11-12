import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchStore } from '../../../store/searchStore';
import { fetchCombinations } from '../api';
export const useCombinationSearch = () => {
    const filters = useSearchStore((state) => ({
        scheduleYear: state.scheduleYear,
        scheduleMonth: state.scheduleMonth,
        drug: state.drug,
        brand: state.brand,
        formulation: state.formulation,
        indication: state.indication,
        treatmentPhase: state.treatmentPhase,
        hospitalType: state.hospitalType,
        pbsCode: state.pbsCode,
        limit: state.limit,
        page: state.page
    }));
    const queryParams = useMemo(() => {
        const offset = (filters.page - 1) * filters.limit;
        return {
            schedule_year: filters.scheduleYear,
            schedule_month: filters.scheduleMonth,
            drug: [...filters.drug],
            brand: [...filters.brand],
            formulation: [...filters.formulation],
            indication: [...filters.indication],
            treatment_phase: [...filters.treatmentPhase],
            hospital_type: [...filters.hospitalType],
            pbs_code: [...filters.pbsCode],
            limit: filters.limit,
            offset
        };
    }, [filters]);
    const queryKey = useMemo(() => {
        return JSON.stringify(queryParams, Object.keys(queryParams).sort());
    }, [queryParams]);
    const query = useQuery({
        queryKey: ['combinations', queryKey],
        queryFn: () => fetchCombinations(queryParams),
        refetchOnWindowFocus: false
    });
    return {
        ...query,
        queryParams
    };
};
