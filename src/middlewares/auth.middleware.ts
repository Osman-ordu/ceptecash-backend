import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { firebaseAdmin } from '../lib/firebase';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    firebaseUid: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Token missing', 401);
    }

    const token = authHeader.split(' ')[1];

  if (!token) {
      return sendError(res, 'Token missing', 401);
    }

    // Firebase token doğrulama
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Veritabanından kullanıcıyı bul (sadece aktif kullanıcılar)
    const user = await prisma.user.findFirst({
      where: { 
        firebaseUid,
        deletedAt: null, // Sadece silinmemiş kullanıcılar
      },
      select: {
        id: true,
        email: true,
        firebaseUid: true,
        deletedAt: true, // Kontrol için
      },
    });

    if (!user) {
      return sendError(res, 'User not found or account has been deleted', 404);
    }

    // Ekstra güvenlik: deletedAt kontrolü
    if (user.deletedAt) {
      return sendError(res, 'Account has been deleted', 403);
    }

    // firebaseUid kontrolü (where clause'da kullandığımız için null olamaz ama TypeScript için)
    if (!user.firebaseUid) {
      return sendError(res, 'User firebaseUid not found', 404);
    }

    // Request'e user bilgisini ekle
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return sendError(res, 'Token expired', 401);
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return sendError(res, 'Token revoked', 401);
    }

    return sendError(res, 'Invalid or expired token', 401);
  }
};

