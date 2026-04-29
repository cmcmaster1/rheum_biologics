import { useEffect } from 'react';

import { trackAnalyticsEvent, trackSessionStart } from '../api/analytics';

export const useAnalyticsPageView = () => {
  useEffect(() => {
    trackSessionStart();
    trackAnalyticsEvent({
      eventName: 'page_view',
      payload: {
        title: document.title
      }
    });
  }, []);
};
