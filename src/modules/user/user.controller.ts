import { Response, NextFunction } from 'express';
import userService from './user.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { firebaseAdmin } from '../../lib/firebase';

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

/**
 * DELETE /api/user
 * Kullanıcının kendi hesabını soft delete ile siler
 * 
 * Güvenlik:
 * - Sadece authenticated kullanıcılar erişebilir
 * - Kullanıcı sadece kendi hesabını silebilir (req.userId kontrolü)
 * - Başka bir token ile başka kullanıcının hesabı silinemez
 * - Silinmiş hesap ile login olunamaz (authMiddleware'de kontrol edilir)
 */
export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    // Authentication kontrolü
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Kullanıcının kendi hesabını kontrol et
    // req.userId authMiddleware'den geliyor, bu yüzden kullanıcı sadece kendi hesabını silebilir
    const user = await userService.getUserProfile(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Hesap zaten silinmiş mi kontrol et
    const isDeleted = await userService.isUserDeleted(userId);
    if (isDeleted) {
      return sendError(res, 'Account has already been deleted', 400);
    }

    // Soft delete: Database'de etkisiz bırak
    await userService.deleteAccount(userId);

    // Opsiyonel: Firebase Authentication'dan da sil
    // Not: Bu işlem geri alınamaz, ama database'deki veriler korunur
    if (user.firebaseUid) {
      try {
        await firebaseAdmin.auth().deleteUser(user.firebaseUid);
        console.log(`Firebase user deleted: ${user.firebaseUid}`);
      } catch (error: any) {
        // Firebase silme başarısız olsa bile devam et
        // Database'de zaten soft delete yapıldı
        console.warn('Failed to delete Firebase user:', error.message);
      }
    }

    return sendSuccess(
      res,
      'Account deleted successfully',
      {
        message: 'Your account has been deleted. You can no longer access it.',
        deletedAt: new Date().toISOString(),
      }
    );
  } catch (error: any) {
    console.error('Delete account error:', error);
    next(error);
  }
};
