import { Router } from 'express';

import { getCombinations } from '../controllers/combinationsController.js';

const router = Router();

router.get('/', getCombinations);

export const combinationsRouter = router;
