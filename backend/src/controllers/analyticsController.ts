import { Request, Response } from 'express';
import { ZodError } from 'zod';

import {
  getAnalyticsSummary,
  parseAnalyticsEvent,
  recordAnalyticsEvent
} from '../services/analyticsService.js';

export const postAnalyticsEvent = async (req: Request, res: Response) => {
  try {
    const event = parseAnalyticsEvent(req.body);
    await recordAnalyticsEvent(event, req);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid analytics event' });
      return;
    }

    throw error;
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  const token = process.env.ANALYTICS_ADMIN_TOKEN;

  if (!token || req.get('x-analytics-token') !== token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const days = Number(req.query.days ?? 30);
  const summary = await getAnalyticsSummary(Number.isFinite(days) ? days : 30);
  res.json(summary);
};
