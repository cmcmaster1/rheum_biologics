import { apiClient } from './client';
export async function sendFeedback(payload) {
    await apiClient.post('/api/feedback', payload);
}
