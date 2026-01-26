/**
 * Currency Category
 * Classifies currencies into different types for UI organization
 */
export enum CurrencyCategory {
  STOCK_MARKET = 'STOCK_MARKET',      // Borsa (Forex, Döviz)
  PRECIOUS_METALS = 'PRECIOUS_METALS', // Değerli Metaller (Altın, Gümüş)
}

/**
 * Currency data interface
 * Represents real-time market price data for a currency/asset
 */
export interface ICurrencyData {
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  changePercent: number;
  timestamp: number;
  category?: CurrencyCategory; // Category for UI organization (auto-assigned in MarketPriceStore)
}
