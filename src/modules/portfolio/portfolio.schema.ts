/**
 * Portfolio Schema and Types
 * User'a özel portfolio hesaplamaları için type definitions
 */

export interface PortfolioAssetDistribution {
  baseAsset: string; // Örn: "14 Ayar Altın", "USD"
  total: number; // Bu baseAsset için toplam TL tutarı
  percentage: number; // Portföy içindeki yüzdesel dağılım (0-100)
  transactionCount: number; // Bu baseAsset için yapılan işlem sayısı
}

export interface PortfolioStatistics {
  totalPortfolioValue: number; // Tüm BUY transaction'ların total'lerinin toplamı (TL)
  dailyChange: null; // Şimdilik boş, ileride günlük değişim hesaplanacak
  totalProfitLoss: null; // Şimdilik boş, ileride kar/zarar hesaplanacak
  topAsset: string | null; // TL'ye göre en yüksek total'e sahip baseAsset
  assetNumber: number; // Farklı baseAsset sayısı (örn: 2 baseAsset varsa 2)
  distribution: PortfolioAssetDistribution[]; // Her baseAsset için toplam ve yüzdesel dağılım
}

export interface PortfolioResponse {
  statistics: PortfolioStatistics;
}
