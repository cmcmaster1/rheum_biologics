import { Router } from 'express';

import { getAnalytics, postAnalyticsEvent } from '../controllers/analyticsController.js';

export const analyticsRouter = Router();

analyticsRouter.post('/events', postAnalyticsEvent);
analyticsRouter.get('/summary', getAnalytics);
