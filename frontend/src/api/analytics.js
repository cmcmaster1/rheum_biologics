import { apiClient } from './client';
const SESSION_STORAGE_KEY = 'rheumai_analytics_session_id';
const SESSION_STARTED_KEY = 'rheumai_analytics_session_started';
const VISITOR_STORAGE_KEY = 'rheumai_analytics_visitor_id';
export const trackAnalyticsEvent = ({ eventName, payload = {} }) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'false') {
        return;
    }
    const body = {
        eventName,
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
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
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
        return existing;
    }
    const next = createSessionId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
};
const getVisitorId = () => {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) {
        return existing;
    }
    const next = createSessionId();
    localStorage.setItem(VISITOR_STORAGE_KEY, next);
    return next;
};
const createSessionId = () => {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
        .slice(6, 8)
        .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};
const commonPayload = () => ({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
});
