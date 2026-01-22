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
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
}

export default new UserService();
