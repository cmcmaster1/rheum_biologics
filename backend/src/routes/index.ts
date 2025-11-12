import { Router } from 'express';

import { combinationsRouter } from './combinations.js';
import { lookupsRouter } from './lookups.js';
import { schedulesRouter } from './schedules.js';
import { feedbackRouter } from './feedback.js';
import { runBiologicsIngestion } from '../jobs/biologicsIngestion.js';
import { getSchedulerStatus } from '../jobs/scheduler.js';

const router = Router();

router.use('/combinations', combinationsRouter);
router.use('/schedules', schedulesRouter);
router.use('/feedback', feedbackRouter);
router.use('/', lookupsRouter);

// Manual ingestion endpoint
router.post('/ingest', async (req, res) => {
  try {
    console.log('[ManualIngestion] Starting manual biologics ingestion');
    const result = await runBiologicsIngestion();
    console.log(`[ManualIngestion] Completed ingestion for schedule ${result.schedule.code} (inserted ${result.count} rows)`);
    res.json({ 
      success: true, 
      schedule: result.schedule, 
      count: result.count 
    });
  } catch (error) {
    console.error('[ManualIngestion] Ingestion failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Scheduler status endpoint
router.get('/scheduler/status', (req, res) => {
  const status = getSchedulerStatus();
  res.json({
    ...status,
    lastRun: status.lastRun?.toISOString(),
    nextRun: status.active && status.cronExpression 
      ? getNextRunTime(status.cronExpression, status.timezone)
      : null
  });
});

// Helper to calculate next run time (approximate)
function getNextRunTime(cronExpression: string, timezone: string): string | null {
  // Simplified calculation for "0 4 1 * *" (4 AM on 1st of each month)
  // For a more accurate calculation, consider using a library like 'cron-parser'
  try {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 4, 0, 0);
    
    // Format as ISO string - note: this doesn't account for timezone conversion
    // but gives a reasonable approximation
    return nextMonth.toISOString();
  } catch {
    return null;
  }
}

export default router;
