import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
const fetchLookup = async (resource, params) => {
    const response = await apiClient.get(`/api/${resource}`, {
        params
    });
    return response.data.data;
};
const sortValues = (values) => [...values]
    .filter((value) => Boolean(value))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
export const useLookupOptions = (resource, params) => {
    return useQuery({
        queryKey: ['lookup', resource, params],
        queryFn: () => fetchLookup(resource, params),
        select: sortValues,
        staleTime: 1000 * 60 * 60
    });
};
