import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
const fetchSchedules = async () => {
    const response = await apiClient.get('/api/schedules');
    return response.data.data;
};
export const useSchedules = () => {
    return useQuery({
        queryKey: ['schedules'],
        queryFn: fetchSchedules,
        staleTime: 1000 * 60 * 60
    });
};
