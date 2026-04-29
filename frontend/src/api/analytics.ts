import { apiClient } from './client';

const SESSION_STORAGE_KEY = 'rheumai_analytics_session_id';
const SESSION_STARTED_KEY = 'rheumai_analytics_session_started';

type AnalyticsPayload = Record<string, unknown>;

type AnalyticsEvent = {
  eventName: string;
  payload?: AnalyticsPayload;
};

export const trackAnalyticsEvent = ({ eventName, payload = {} }: AnalyticsEvent) => {
  if (import.meta.env.VITE_ANALYTICS_ENABLED === 'false') {
    return;
  }

  const body = {
    eventName,
    sessionId: getSessionId(),
    path: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
    payload: {
      ...commonPayload(),
      ...payload
    }
  };

  const url = `${apiClient.defaults.baseURL ?? ''}/api/analytics/events`;
  const serialized = JSON.stringify(body);

  if (navigator.sendBeacon) {
    const blob = new Blob([serialized], { type: 'application/json' });
    if (navigator.sendBeacon(url, blob)) {
      return;
    }
  }

  void apiClient.post('/api/analytics/events', body).catch(() => {
    // Analytics must never break the clinical lookup workflow.
  });
};

export const trackSessionStart = () => {
  if (sessionStorage.getItem(SESSION_STARTED_KEY)) {
    return;
  }

  sessionStorage.setItem(SESSION_STARTED_KEY, 'true');
  trackAnalyticsEvent({ eventName: 'session_start' });
};

const getSessionId = () => {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
};

const commonPayload = () => ({
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language
});
