import { Request, Response } from 'express';

import { searchCombinations } from '../services/biologicsService.js';
import { parsePagination } from '../utils/pagination.js';

export const getCombinations = async (req: Request, res: Response) => {
  const { limit, offset } = parsePagination(req.query);
  const result = await searchCombinations(req.query, limit, offset);
  res.json(result);
};
