import { apiClient } from './client';

export type FeedbackPayload = {
  type: 'bug' | 'feature' | 'new_medication' | 'new_indication';
  message: string;
  contact?: string;
};

export async function sendFeedback(payload: FeedbackPayload) {
  await apiClient.post('/api/feedback', payload);
}

