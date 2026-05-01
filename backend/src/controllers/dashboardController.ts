import { Request, Response } from 'express';
import { z } from 'zod';

import {
  getAnalyticsEventsForExport,
  getAnalyticsSummary
} from '../services/analyticsService.js';
import {
  getDashboardStatus,
  loginDashboard,
  logoutDashboard,
  requireDashboardSession,
  setupDashboardPassword
} from '../services/dashboardAuthService.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12)
});

const parseDays = (value: unknown) => {
  const days = Number(value ?? 30);
  return Number.isFinite(days) ? days : 30;
};

const parseEventName = (value: unknown) => {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export const getDashboardAuthStatus = async (_req: Request, res: Response) => {
  res.json(await getDashboardStatus());
};

export const setupDashboard = async (req: Request, res: Response) => {
  const credentials = setupSchema.parse(req.body);
  const session = await setupDashboardPassword(credentials.email, credentials.password, res);
  res.status(201).json(session);
};

export const loginToDashboard = async (req: Request, res: Response) => {
  const credentials = credentialsSchema.parse(req.body);
  const session = await loginDashboard(credentials.email, credentials.password, res);
  res.json(session);
};

export const logoutFromDashboard = async (req: Request, res: Response) => {
  await logoutDashboard(req, res);
  res.status(204).send();
};

export const getDashboardMe = async (req: Request, res: Response) => {
  const session = await requireDashboardSession(req);
  res.json({ email: session.email });
};

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  await requireDashboardSession(req);
  res.json(await getAnalyticsSummary(parseDays(req.query.days), parseEventName(req.query.eventName)));
};

export const exportDashboardAnalyticsCsv = async (req: Request, res: Response) => {
  await requireDashboardSession(req);
  const csv = await getAnalyticsEventsForExport(
    parseDays(req.query.days),
    parseEventName(req.query.eventName)
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="rheumbiologics-analytics-${new Date()
      .toISOString()
      .slice(0, 10)}.csv"`
  );
  res.send(csv);
};
