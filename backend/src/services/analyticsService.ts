import crypto from 'node:crypto';

import { Request } from 'express';
import { z } from 'zod';

import { query } from '../db/pool.js';

const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 25;
const MAX_PAYLOAD_KEYS = 40;

const analyticsEventSchema = z.object({
  eventName: z.string().min(1).max(80).regex(/^[a-z0-9_:-]+$/i),
  sessionId: z.string().uuid().optional(),
  path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  payload: z.record(z.unknown()).optional()
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

export const parseAnalyticsEvent = (body: unknown): AnalyticsEventInput => {
  return analyticsEventSchema.parse(body);
};

export const recordAnalyticsEvent = async (event: AnalyticsEventInput, req: Request) => {
  if (process.env.ANALYTICS_ENABLED === 'false') {
    return;
  }

  const visitorHash = hashVisitor(req);
  const userAgent = truncateString(req.get('user-agent') ?? undefined);

  await query(
    `
      INSERT INTO analytics_events (
        event_name,
        session_id,
        visitor_hash,
        path,
        referrer,
        user_agent,
        payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      event.eventName,
      event.sessionId ?? null,
      visitorHash,
      truncateString(event.path),
      truncateString(event.referrer),
      userAgent,
      JSON.stringify(sanitizePayload(event.payload ?? {}))
    ]
  );
};

export const getAnalyticsSummary = async (days: number) => {
  const boundedDays = Math.min(Math.max(days, 1), 365);
  const params = [boundedDays];

  const overview = await query(
    `
      SELECT
        COUNT(*)::int AS total_events,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(DISTINCT visitor_hash)::int AS visitors,
        COUNT(*) FILTER (WHERE event_name = 'page_view')::int AS page_views,
        COUNT(*) FILTER (WHERE event_name = 'search_results')::int AS searches,
        COUNT(*) FILTER (WHERE event_name = 'outbound_link_click')::int AS outbound_clicks,
        COUNT(*) FILTER (WHERE event_name = 'feedback_opened')::int AS feedback_opens
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
    `,
    params
  );

  const daily = await query(
    `
      SELECT
        DATE_TRUNC('day', created_at)::date AS date,
        COUNT(*)::int AS events,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(DISTINCT visitor_hash)::int AS visitors,
        COUNT(*) FILTER (WHERE event_name = 'search_results')::int AS searches,
        COUNT(*) FILTER (WHERE event_name = 'outbound_link_click')::int AS outbound_clicks
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      GROUP BY 1
      ORDER BY 1 DESC
    `,
    params
  );

  const topFilters = await query(
    `
      SELECT
        payload->>'filterKey' AS filter_key,
        payload->>'valueLabel' AS value_label,
        COUNT(*)::int AS count
      FROM analytics_events
      WHERE
        created_at >= NOW() - ($1::int * INTERVAL '1 day')
        AND event_name = 'filter_changed'
        AND payload ? 'filterKey'
        AND payload ? 'valueLabel'
      GROUP BY 1, 2
      ORDER BY count DESC
      LIMIT 50
    `,
    params
  );

  const topDrugs = await query(
    `
      SELECT
        payload->>'drug' AS drug,
        COUNT(*)::int AS clicks
      FROM analytics_events
      WHERE
        created_at >= NOW() - ($1::int * INTERVAL '1 day')
        AND event_name = 'outbound_link_click'
        AND payload ? 'drug'
      GROUP BY 1
      ORDER BY clicks DESC
      LIMIT 50
    `,
    params
  );

  const resultDistribution = await query(
    `
      SELECT
        WIDTH_BUCKET((payload->>'totalResults')::int, 0, 500, 10) AS bucket,
        COUNT(*)::int AS searches
      FROM analytics_events
      WHERE
        created_at >= NOW() - ($1::int * INTERVAL '1 day')
        AND event_name = 'search_results'
        AND payload ? 'totalResults'
      GROUP BY 1
      ORDER BY 1
    `,
    params
  );

  return {
    days: boundedDays,
    overview: overview.rows[0],
    daily: daily.rows,
    topFilters: topFilters.rows,
    topDrugs: topDrugs.rows,
    resultDistribution: resultDistribution.rows
  };
};

const hashVisitor = (req: Request) => {
  const salt = process.env.ANALYTICS_SALT || 'rheum-biologics-analytics';
  const forwardedFor = req.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || req.ip || '';
  const userAgent = req.get('user-agent') || '';

  return crypto
    .createHash('sha256')
    .update(`${salt}:${ip}:${userAgent}`)
    .digest('hex');
};

const sanitizePayload = (payload: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(payload)
      .slice(0, MAX_PAYLOAD_KEYS)
      .map(([key, value]) => [key, sanitizeValue(value)])
  );
};

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return truncateString(value);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map(sanitizeValue);
  }

  if (typeof value === 'object' && value) {
    return sanitizePayload(value as Record<string, unknown>);
  }

  return null;
};

const truncateString = (value?: string) => {
  if (!value) {
    return null;
  }

  return value.length > MAX_STRING_LENGTH ? value.slice(0, MAX_STRING_LENGTH) : value;
};
