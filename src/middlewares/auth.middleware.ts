import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  // TODO: Implement JWT token verification
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return sendError(res, 'Authentication required', 401);
  }

  try {
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

