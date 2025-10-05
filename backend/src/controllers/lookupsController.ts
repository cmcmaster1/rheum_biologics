import { Request, Response } from 'express';

import { getLookupValues } from '../services/biologicsService.js';

const createLookupHandler = (column: string) => async (req: Request, res: Response) => {
  const values = await getLookupValues(column, req.query as any);
  res.json({ data: values });
};

export const getDrugs = createLookupHandler('drug');
export const getBrands = createLookupHandler('brand');
export const getFormulations = createLookupHandler('formulation');
export const getIndications = createLookupHandler('indication');
export const getTreatmentPhases = createLookupHandler('treatment_phase');
export const getHospitalTypes = createLookupHandler('hospital_type');
