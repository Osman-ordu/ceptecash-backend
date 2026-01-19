import { Response, NextFunction } from 'express';
import portfolioService from './portfolio.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

/**
 * GET /api/portfolio
 * Kullanıcıya özel portfolio istatistiklerini döndürür
 * 
 * Response Structure:
 * {
 *   success: true,
 *   message: "Portfolio statistics retrieved successfully",
 *   data: {
 *     statistics: {
 *       totalPortfolioValue: number,      // Tüm BUY transaction'ların total'lerinin toplamı (TL)
 *       dailyChange: null,                 // Şimdilik boş, günlük değişim hesaplanacak
 *       totalProfitLoss: null,             // Şimdilik boş, kar/zarar hesaplanacak
 *       topAsset: string | null,           // TL'ye göre en yüksek total'e sahip baseAsset
 *       assetNumber: number,               // Farklı baseAsset sayısı (örn: 2 baseAsset varsa 2)
 *       distribution: [                    // Her baseAsset için toplam ve yüzdesel dağılım
 *         {
 *           baseAsset: string,             // Örn: "14 Ayar Altın", "USD"
 *           total: number,                 // Bu baseAsset için toplam TL tutarı
 *           percentage: number,            // Portföy içindeki yüzdesel dağılım (0-100)
 *           transactionCount: number       // Bu baseAsset için yapılan işlem sayısı
 *         }
 *       ]
 *     }
 *   }
 * }
 */
export const getPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const statistics = await portfolioService.getPortfolioStatistics(userId);

    return sendSuccess(
      res,
      'Portfolio statistics retrieved successfully',
      { statistics }
    );
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    next(error);
  }
};
