import { Router } from 'express';

import {
  exportDashboardAnalyticsCsv,
  getDashboardAnalytics,
  getDashboardAuthStatus,
  getDashboardMe,
  loginToDashboard,
  logoutFromDashboard,
  setupDashboard
} from '../controllers/dashboardController.js';

export const dashboardRouter = Router();

dashboardRouter.get('/status', getDashboardAuthStatus);
dashboardRouter.post('/setup', setupDashboard);
dashboardRouter.post('/login', loginToDashboard);
dashboardRouter.post('/logout', logoutFromDashboard);
dashboardRouter.get('/me', getDashboardMe);
dashboardRouter.get('/analytics', getDashboardAnalytics);
dashboardRouter.get('/analytics.csv', exportDashboardAnalyticsCsv);
