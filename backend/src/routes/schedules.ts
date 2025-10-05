import { Router } from 'express';

import { getSchedulesHandler } from '../controllers/schedulesController.js';

const router = Router();

router.get('/', getSchedulesHandler);

export const schedulesRouter = router;
