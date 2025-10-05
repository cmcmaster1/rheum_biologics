import cron from 'node-cron';

import { runBiologicsIngestion } from './biologicsIngestion.js';

const enabled = (process.env.BIOLOGICS_INGEST_ENABLED ?? 'true').toLowerCase() !== 'false';
const expression = process.env.BIOLOGICS_INGEST_CRON ?? '0 4 1 * *';
const timezone = process.env.BIOLOGICS_INGEST_TZ ?? 'Australia/Sydney';
const lookbackMonths = Number.parseInt(process.env.BIOLOGICS_INGEST_LOOKBACK ?? '6', 10);

export const startSchedulers = () => {
  if (!enabled) {
    console.log('[Scheduler] Biologics ingestion disabled via BIOLOGICS_INGEST_ENABLED');
    return;
  }

  if (!cron.validate(expression)) {
    console.warn(
      `[Scheduler] Invalid cron expression "${expression}" provided for BIOLOGICS_INGEST_CRON. Scheduler not started.`
    );
    return;
  }

  cron.schedule(
    expression,
    async () => {
      const startedAt = new Date();
      console.log(`[Scheduler] Starting biologics ingestion at ${startedAt.toISOString()}`);
      try {
        const result = await runBiologicsIngestion({ lookbackMonths });
        console.log(
          `[Scheduler] Completed biologics ingestion for schedule ${result.schedule.code} (inserted ${result.count}).`
        );
      } catch (error) {
        console.error('[Scheduler] Biologics ingestion failed', error);
      }
    },
    { timezone }
  );

  console.log(
    `[Scheduler] Biologics ingestion scheduled with cron "${expression}" (timezone ${timezone})`
  );
};
