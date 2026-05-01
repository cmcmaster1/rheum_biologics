import { apiClient } from './client';
export const getDashboardStatus = async () => {
    const { data } = await apiClient.get('/api/dashboard/status');
    return data;
};
export const setupDashboard = async (email, password) => {
    const { data } = await apiClient.post('/api/dashboard/setup', {
        email,
        password
    });
    return data;
};
export const loginDashboard = async (email, password) => {
    const { data } = await apiClient.post('/api/dashboard/login', {
        email,
        password
    });
    return data;
};
export const logoutDashboard = async () => {
    await apiClient.post('/api/dashboard/logout');
};
export const getDashboardMe = async () => {
    const { data } = await apiClient.get('/api/dashboard/me');
    return data;
};
export const getDashboardAnalytics = async (days, eventName) => {
    const { data } = await apiClient.get('/api/dashboard/analytics', {
        params: {
            days,
            eventName: eventName || undefined
        }
    });
    return data;
};
export const dashboardCsvUrl = (days, eventName) => {
    const baseURL = apiClient.defaults.baseURL ?? '';
    const params = new URLSearchParams({ days: String(days) });
    if (eventName) {
        params.set('eventName', eventName);
    }
    return `${baseURL}/api/dashboard/analytics.csv?${params.toString()}`;
};
