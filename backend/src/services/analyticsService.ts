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
  visitorId: z.string().min(8).max(128).optional(),
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

  const visitorHash = hashVisitor(event, req);
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

export const getAnalyticsSummary = async (days: number, eventName?: string) => {
  const boundedDays = Math.min(Math.max(days, 1), 365);
  const params: Array<string | number> = [boundedDays];
  const eventFilter = eventName ? 'AND event_name = $2' : '';
  if (eventName) {
    params.push(eventName);
  }

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
      ${eventFilter}
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
      ${eventFilter}
      GROUP BY 1
      ORDER BY 1 DESC
    `,
    params
  );

  const eventBreakdown = await query(
    `
      SELECT
        event_name,
        COUNT(*)::int AS events,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(DISTINCT visitor_hash)::int AS visitors
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      ${eventFilter}
      GROUP BY 1
      ORDER BY events DESC
    `,
    params
  );

  const topPages = await query(
    `
      SELECT
        COALESCE(path, '(unknown)') AS path,
        COUNT(*)::int AS events,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(DISTINCT visitor_hash)::int AS visitors
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      ${eventFilter}
      GROUP BY 1
      ORDER BY events DESC
      LIMIT 50
    `,
    params
  );

  const topTimezones = await query(
    `
      SELECT
        COALESCE(payload->>'timezone', '(unknown)') AS timezone,
        COUNT(*)::int AS events,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(DISTINCT visitor_hash)::int AS visitors
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      ${eventFilter}
      GROUP BY 1
      ORDER BY visitors DESC, events DESC
      LIMIT 50
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
        ${eventName ? 'AND event_name = $2' : ''}
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
        ${eventName ? 'AND event_name = $2' : ''}
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
        ${eventName ? 'AND event_name = $2' : ''}
        AND payload ? 'totalResults'
      GROUP BY 1
      ORDER BY 1
    `,
    params
  );

  const sessionJourneys = await query(
    `
      WITH filtered_events AS (
        SELECT
          id,
          created_at,
          event_name,
          session_id,
          visitor_hash,
          path,
          payload
        FROM analytics_events
        WHERE
          created_at >= NOW() - ($1::int * INTERVAL '1 day')
          ${eventFilter}
          AND session_id IS NOT NULL
      ),
      selected_sessions AS (
        SELECT
          session_id,
          LEFT(COALESCE(MAX(visitor_hash), ''), 12) AS visitor_key,
          MIN(created_at) AS first_seen,
          MAX(created_at) AS last_seen,
          COUNT(*)::int AS events,
          COUNT(*) FILTER (WHERE event_name = 'search_results')::int AS searches,
          COUNT(*) FILTER (WHERE event_name = 'filter_changed')::int AS filters,
          COUNT(*) FILTER (WHERE event_name = 'outbound_link_click')::int AS outbound_clicks,
          COUNT(*) FILTER (WHERE event_name = 'feedback_opened')::int AS feedback_opens
        FROM filtered_events
        GROUP BY session_id
        ORDER BY MAX(created_at) DESC
        LIMIT 50
      )
      SELECT
        selected_sessions.session_id::text,
        selected_sessions.visitor_key,
        selected_sessions.first_seen,
        selected_sessions.last_seen,
        selected_sessions.events,
        selected_sessions.searches,
        selected_sessions.filters,
        selected_sessions.outbound_clicks,
        selected_sessions.feedback_opens,
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'created_at', filtered_events.created_at,
            'event_name', filtered_events.event_name,
            'path', filtered_events.path,
            'payload', filtered_events.payload
          )
          ORDER BY filtered_events.created_at ASC, filtered_events.id ASC
        ) AS timeline
      FROM selected_sessions
      JOIN filtered_events ON filtered_events.session_id = selected_sessions.session_id
      GROUP BY
        selected_sessions.session_id,
        selected_sessions.visitor_key,
        selected_sessions.first_seen,
        selected_sessions.last_seen,
        selected_sessions.events,
        selected_sessions.searches,
        selected_sessions.filters,
        selected_sessions.outbound_clicks,
        selected_sessions.feedback_opens
      ORDER BY selected_sessions.last_seen DESC
    `,
    params
  );

  const topSequences = await query(
    `
      WITH session_sequences AS (
        SELECT
          session_id,
          STRING_AGG(event_name, ' -> ' ORDER BY created_at ASC, id ASC) AS sequence,
          COUNT(*) FILTER (WHERE event_name = 'outbound_link_click') > 0 AS converted
        FROM analytics_events
        WHERE
          created_at >= NOW() - ($1::int * INTERVAL '1 day')
          ${eventFilter}
          AND session_id IS NOT NULL
        GROUP BY session_id
      )
      SELECT
        sequence,
        COUNT(*)::int AS sessions,
        COUNT(*) FILTER (WHERE converted)::int AS sessions_with_click
      FROM session_sequences
      GROUP BY sequence
      ORDER BY sessions DESC, sessions_with_click DESC
      LIMIT 25
    `,
    params
  );

  return {
    days: boundedDays,
    eventName: eventName ?? null,
    overview: overview.rows[0],
    daily: daily.rows,
    eventBreakdown: eventBreakdown.rows,
    topPages: topPages.rows,
    topTimezones: topTimezones.rows,
    topFilters: topFilters.rows,
    topDrugs: topDrugs.rows,
    resultDistribution: resultDistribution.rows,
    sessionJourneys: sessionJourneys.rows,
    topSequences: topSequences.rows
  };
};

export const getAnalyticsEventsForExport = async (days: number, eventName?: string) => {
  const boundedDays = Math.min(Math.max(days, 1), 365);
  const params: Array<string | number> = [boundedDays];
  const eventFilter = eventName ? 'AND event_name = $2' : '';
  if (eventName) {
    params.push(eventName);
  }

  const result = await query(
    `
      SELECT
        created_at,
        event_name,
        path,
        referrer,
        session_id,
        LEFT(COALESCE(visitor_hash, ''), 12) AS visitor_key,
        payload
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      ${eventFilter}
      ORDER BY created_at DESC
      LIMIT 10000
    `,
    params
  );

  const rows = [
    ['created_at', 'event_name', 'path', 'referrer', 'session_id', 'visitor_key', 'payload'],
    ...result.rows.map((row) => [
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      row.event_name,
      row.path,
      row.referrer,
      row.session_id,
      row.visitor_key,
      JSON.stringify(row.payload ?? {})
    ])
  ];

  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
};

const hashVisitor = (event: AnalyticsEventInput, req: Request) => {
  const salt = process.env.ANALYTICS_SALT || 'rheum-biologics-analytics';
  if (event.visitorId) {
    return crypto.createHash('sha256').update(`${salt}:visitor:${event.visitorId}`).digest('hex');
  }

  const forwardedFor = req.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || req.ip || '';
  const userAgent = req.get('user-agent') || '';

  return crypto
    .createHash('sha256')
    .update(`${salt}:${ip}:${userAgent}`)
    .digest('hex');
};

const csvCell = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
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
