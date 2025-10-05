import { Router } from 'express';

import { combinationsRouter } from './combinations.js';
import { lookupsRouter } from './lookups.js';
import { schedulesRouter } from './schedules.js';

const router = Router();

router.use('/combinations', combinationsRouter);
router.use('/schedules', schedulesRouter);
router.use('/', lookupsRouter);

export default router;
