import { Router } from 'express';

import {
  getBrands,
  getDrugs,
  getFormulations,
  getHospitalTypes,
  getIndications,
  getPbsCodes,
  getTreatmentPhases
} from '../controllers/lookupsController.js';

const router = Router();

router.get('/drugs', getDrugs);
router.get('/indications', getIndications);
router.get('/brands', getBrands);
router.get('/formulations', getFormulations);
router.get('/treatment-phases', getTreatmentPhases);
router.get('/hospital-types', getHospitalTypes);
router.get('/pbs-codes', getPbsCodes);

export const lookupsRouter = router;
