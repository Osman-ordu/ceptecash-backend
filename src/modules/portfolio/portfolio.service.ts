import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import {
  PortfolioStatistics,
  PortfolioAssetDistribution,
} from './portfolio.schema';

export class PortfolioService {
  /**
   * Kullanıcıya özel portfolio istatistiklerini hesapla
   * Sadece BUY transaction'ları dikkate alınır
   */
  async getPortfolioStatistics(userId: string): Promise<PortfolioStatistics> {
    // Kullanıcının tüm BUY transaction'larını getir
    const buyTransactions = await (prisma as any).quickTransaction.findMany({
      where: {
        userId,
        side: 'BUY', // Sadece BUY transaction'ları
      },
      select: {
        baseAsset: true,
        total: true,
      },
    });

    // Eğer hiç transaction yoksa boş portfolio döndür
    if (buyTransactions.length === 0) {
      return {
        totalPortfolioValue: 0,
        dailyChange: null,
        totalProfitLoss: null,
        topAsset: null,
        assetNumber: 0,
        distribution: [],
      };
    }

    // baseAsset'e göre grupla ve toplamları hesapla
    const assetTotals = new Map<string, { total: number; count: number }>();

    buyTransactions.forEach((transaction: { baseAsset: string; total: Prisma.Decimal }) => {
      const baseAsset = transaction.baseAsset;
      const total = transaction.total.toNumber();

      if (assetTotals.has(baseAsset)) {
        const existing = assetTotals.get(baseAsset)!;
        assetTotals.set(baseAsset, {
          total: existing.total + total,
          count: existing.count + 1,
        });
      } else {
        assetTotals.set(baseAsset, {
          total,
          count: 1,
        });
      }
    });

    // Tüm baseAsset'lerin toplamını hesapla (totalPortfolioValue)
    let totalPortfolioValue = 0;
    assetTotals.forEach((value) => {
      totalPortfolioValue += value.total;
    });

    // Her baseAsset için yüzdesel dağılımı hesapla
    const distribution: PortfolioAssetDistribution[] = Array.from(
      assetTotals.entries()
    ).map(([baseAsset, data]) => {
      const percentage =
        totalPortfolioValue > 0
          ? (data.total / totalPortfolioValue) * 100
          : 0;

      return {
        baseAsset,
        total: data.total,
        percentage: Math.round(percentage * 100) / 100, // 2 ondalık basamak
        transactionCount: data.count,
      };
    });

    // Yüzdesel dağılıma göre sırala (en yüksekten en düşüğe)
    distribution.sort((a, b) => b.percentage - a.percentage);

    // En yüksek total'e sahip baseAsset'i bul (topAsset)
    let topAsset: string | null = null;
    let maxTotal = 0;

    assetTotals.forEach((data, baseAsset) => {
      if (data.total > maxTotal) {
        maxTotal = data.total;
        topAsset = baseAsset;
      }
    });

    // Farklı baseAsset sayısı (assetNumber)
    const assetNumber = assetTotals.size;

    return {
      totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100, // 2 ondalık basamak
      dailyChange: null, // Şimdilik boş
      totalProfitLoss: null, // Şimdilik boş
      topAsset,
      assetNumber,
      distribution,
    };
  }
}

export default new PortfolioService();
