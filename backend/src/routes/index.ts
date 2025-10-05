import { Router } from 'express';

import { combinationsRouter } from './combinations.js';
import { lookupsRouter } from './lookups.js';
import { schedulesRouter } from './schedules.js';
import { feedbackRouter } from './feedback.js';
import { runBiologicsIngestion } from '../jobs/biologicsIngestion.js';

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

export default router;
