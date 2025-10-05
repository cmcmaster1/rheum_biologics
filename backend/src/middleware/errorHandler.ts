import { NextFunction, Request, Response } from 'express';

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status ?? 500;
  const payload: Record<string, unknown> = {
    error: err.name || 'Error',
    message: err.message || 'Something went wrong'
  };

  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    console.error(err);
  }

  res.status(status).json(payload);
};
