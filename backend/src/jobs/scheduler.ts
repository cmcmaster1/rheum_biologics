import cron from 'node-cron';

import { runBiologicsIngestion } from './biologicsIngestion.js';
import { getSchedules } from '../services/biologicsService.js';
import { sendIngestionNotification } from '../services/emailService.js';

const enabled = (process.env.BIOLOGICS_INGEST_ENABLED ?? 'true').toLowerCase() !== 'false';
// Run at 4 AM Sydney time on days 1, 3, 5, 7, and 15 of each month to catch PBS data publication
const expression = process.env.BIOLOGICS_INGEST_CRON ?? '0 4 1,3,5,7,15 * *';
const timezone = process.env.BIOLOGICS_INGEST_TZ ?? 'Australia/Sydney';
const lookbackMonths = Number.parseInt(process.env.BIOLOGICS_INGEST_LOOKBACK ?? '6', 10);

let schedulerStatus: {
  enabled: boolean;
  active: boolean;
  cronExpression: string;
  timezone: string;
  lookbackMonths: number;
  lastRun?: Date;
  lastResult?: { schedule: string; count: number; skipped?: boolean };
  lastError?: string;
} = {
  enabled,
  active: false,
  cronExpression: expression,
  timezone,
  lookbackMonths
};

export const getSchedulerStatus = () => ({ ...schedulerStatus });

/**
 * Check if the current month's schedule is already ingested.
 * Returns the schedule code for the current month (e.g., "2025-12").
 */
const getCurrentMonthScheduleCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const isCurrentMonthAlreadyIngested = async (): Promise<boolean> => {
  try {
    const schedules = await getSchedules();
    const currentCode = getCurrentMonthScheduleCode();
    return schedules.some(s => s.schedule_code === currentCode);
  } catch (error) {
    console.warn('[Scheduler] Failed to check existing schedules, will attempt ingestion:', error);
    return false;
  }
};

export const startSchedulers = () => {
  if (!enabled) {
    console.log('[Scheduler] Biologics ingestion disabled via BIOLOGICS_INGEST_ENABLED');
    schedulerStatus.active = false;
    return;
  }

  if (!cron.validate(expression)) {
    console.warn(
      `[Scheduler] Invalid cron expression "${expression}" provided for BIOLOGICS_INGEST_CRON. Scheduler not started.`
    );
    schedulerStatus.active = false;
    return;
  }

  cron.schedule(
    expression,
    async () => {
      const startedAt = new Date();
      schedulerStatus.lastRun = startedAt;
      schedulerStatus.lastError = undefined;
      schedulerStatus.lastResult = undefined;
      console.log(`[Scheduler] Starting biologics ingestion check at ${startedAt.toISOString()}`);

      try {
        // Skip if current month is already ingested
        const alreadyIngested = await isCurrentMonthAlreadyIngested();
        if (alreadyIngested) {
          const currentCode = getCurrentMonthScheduleCode();
          console.log(`[Scheduler] Current month ${currentCode} already ingested, skipping.`);
          schedulerStatus.lastResult = { schedule: currentCode, count: 0, skipped: true };
          // No email for skipped runs
          return;
        }

        const result = await runBiologicsIngestion({ lookbackMonths });
        schedulerStatus.lastResult = { 
          schedule: result.schedule.code, 
          count: result.count,
          skipped: false
        };
        console.log(
          `[Scheduler] Completed biologics ingestion for schedule ${result.schedule.code} (inserted ${result.count}).`
        );

        // Send success notification
        await sendIngestionNotification({
          success: true,
          schedule: result.schedule,
          count: result.count
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        schedulerStatus.lastError = errorMessage;
        console.error('[Scheduler] Biologics ingestion failed:', error);

        // Send failure notification
        await sendIngestionNotification({
          success: false,
          error: errorMessage
        });
      }
    },
    { timezone }
  );

  schedulerStatus.active = true;
  console.log(
    `[Scheduler] Biologics ingestion scheduled with cron "${expression}" (timezone ${timezone})`
  );
};
