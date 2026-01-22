import { Response, NextFunction } from 'express';
import userService from './user.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

/**
 * GET /api/user
 * Login olmuş kullanıcının profil bilgilerini döndürür (password hariç)
 */
export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const userProfile = await userService.getUserProfile(userId);

    if (!userProfile) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(
      res,
      'User profile retrieved successfully',
      userProfile
    );
  } catch (error: any) {
    console.error('Get user profile error:', error);
    next(error);
  }
};
