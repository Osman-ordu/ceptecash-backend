import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    return sendError(res, 'Database error occurred', 500, err.message);
  }

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, err.message);
  }

  return sendError(
    res,
    err.message || 'Internal server error',
    500,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

