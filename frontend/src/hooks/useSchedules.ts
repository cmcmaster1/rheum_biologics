import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../api/client';

export type ScheduleOption = {
  schedule_year: number;
  schedule_month: string;
  schedule_code: string;
  latest: boolean;
};

const fetchSchedules = async (): Promise<ScheduleOption[]> => {
  const response = await apiClient.get<{ data: ScheduleOption[] }>('/api/schedules');
  return response.data.data;
};

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    staleTime: 1000 * 60 * 60
  });
};
