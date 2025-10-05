import { Request, Response } from 'express';

import { getSchedules } from '../services/biologicsService.js';

export const getSchedulesHandler = async (_req: Request, res: Response) => {
  const schedules = await getSchedules();
  res.json({ data: schedules });
};
