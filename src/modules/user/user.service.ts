import { prisma } from '../../lib/prisma';

export interface UserProfile {
  id: string;
  firebaseUid: string | null;
  email: string;
  phone: string;
  name: string | null;
  surName: string | null;
  picture: string | null;
  provider: string | null;
  emailVerified: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  /**
   * Kullanıcı ID'sine göre profil bilgilerini getir (password hariç)
   * Sadece aktif (silinmemiş) kullanıcıları döndürür
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null, // Sadece aktif kullanıcılar
      },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        phone: true,
        name: true,
        surName: true,
        picture: true,
        provider: true,
        emailVerified: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // passwordHash'i select'e dahil etmiyoruz
      },
    });

    if (!user) {
      return null;
    }

    return user as UserProfile;
  }

  /**
   * Soft delete user account
   * Sets deletedAt timestamp instead of removing from database
   * Email ve phone'u unique constraint sorununu önlemek için değiştirir
   * 
   * @param userId - User ID to delete
   */
  async deleteAccount(userId: string): Promise<void> {
    const timestamp = Date.now();
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
        // Email ve phone'u unique constraint sorununu önlemek için değiştir
        email: `deleted_${timestamp}_${userId}@deleted.local`,
        phone: `deleted_${timestamp}_${userId}`,
        // Firebase UID'yi de null yap (opsiyonel)
        firebaseUid: null,
      },
    });
  }

  /**
   * Check if user account is deleted
   * 
   * @param userId - User ID to check
   * @returns true if user is deleted
   */
  async isUserDeleted(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });
    
    return user?.deletedAt !== null;
  }
}

export default new UserService();
