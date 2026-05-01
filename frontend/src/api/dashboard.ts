import { apiClient } from './client';

export type DashboardStatus = {
  email: string;
  passwordSet: boolean;
};

export type AnalyticsOverview = {
  total_events: number;
  sessions: number;
  visitors: number;
  page_views: number;
  searches: number;
  outbound_clicks: number;
  feedback_opens: number;
};

export type AnalyticsSummary = {
  days: number;
  eventName: string | null;
  overview: AnalyticsOverview;
  daily: Array<{
    date: string;
    events: number;
    sessions: number;
    visitors: number;
    searches: number;
    outbound_clicks: number;
  }>;
  eventBreakdown: Array<{
    event_name: string;
    events: number;
    sessions: number;
    visitors: number;
  }>;
  topPages: Array<{
    path: string;
    events: number;
    sessions: number;
    visitors: number;
  }>;
  topTimezones: Array<{
    timezone: string;
    events: number;
    sessions: number;
    visitors: number;
  }>;
  topFilters: Array<{
    filter_key: string;
    value_label: string;
    count: number;
  }>;
  topDrugs: Array<{
    drug: string;
    clicks: number;
  }>;
  resultDistribution: Array<{
    bucket: number;
    searches: number;
  }>;
};

export const getDashboardStatus = async () => {
  const { data } = await apiClient.get<DashboardStatus>('/api/dashboard/status');
  return data;
};

export const setupDashboard = async (email: string, password: string) => {
  const { data } = await apiClient.post<{ email: string }>('/api/dashboard/setup', {
    email,
    password
  });
  return data;
};

export const loginDashboard = async (email: string, password: string) => {
  const { data } = await apiClient.post<{ email: string }>('/api/dashboard/login', {
    email,
    password
  });
  return data;
};

export const logoutDashboard = async () => {
  await apiClient.post('/api/dashboard/logout');
};

export const getDashboardMe = async () => {
  const { data } = await apiClient.get<{ email: string }>('/api/dashboard/me');
  return data;
};

export const getDashboardAnalytics = async (days: number, eventName?: string) => {
  const { data } = await apiClient.get<AnalyticsSummary>('/api/dashboard/analytics', {
    params: {
      days,
      eventName: eventName || undefined
    }
  });
  return data;
};

export const dashboardCsvUrl = (days: number, eventName?: string) => {
  const baseURL = apiClient.defaults.baseURL ?? '';
  const params = new URLSearchParams({ days: String(days) });
  if (eventName) {
    params.set('eventName', eventName);
  }
  return `${baseURL}/api/dashboard/analytics.csv?${params.toString()}`;
};
