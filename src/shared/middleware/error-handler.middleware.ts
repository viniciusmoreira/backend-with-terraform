import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/base.error';

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};
