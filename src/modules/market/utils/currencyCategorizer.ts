import { CurrencyCategory } from '../market.types';

/**
 * Precious Metals Symbols
 * All symbols that represent precious metals (gold, silver, etc.)
 */
const PRECIOUS_METALS_SYMBOLS = new Set([
  // Altın çeşitleri
  'AYAR22',
  'AYAR14',
  'GRAM',
  'CEYREK',
  'YARIM',
  'ATA',
  'HAS',
  'GAU',
  'GOLD',
  
  // Altın çeşitleri (Eski ve özel)
  'YARIM_ESKI',
  'TEK_ESKI',
  'TEK',
  'GREMSE_ESKI',
  'GREMSE',
  'CEYREK_ESKI',
  'ATA_ESKI',
  'ATA5',
  'ATA5_ESKI',
  
  // Gümüş
  'GUMUSTRY',
  'GUMUS',
  'SILVER',
  
  // Forex formatında değerli madenler (XAUUSD, XAGUSD filtered - frontend'e gönderilmez)
  'XAU',
  'XAG',
]);

/**
 * Stock Market Symbols
 * All symbols that represent forex/stock market currencies
 * These are typically forex pairs or single currencies
 */
const STOCK_MARKET_SYMBOLS = new Set([
  // Temel dövizler
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'AUD',
  'SEK',
  'RUB',
  'SGD',
  'CAD',
  'NZD',
  'MXN',
  'ZAR',
  'BRL',
  'INR',
  'CNY',
  'HKD',
  'KRW',
  
  // TRY ile çiftler
  'USDTRY',
  'EURTRY',
  'GBPTRY',
  
  // Forex çiftleri
  'USDJPY',
  'USDAUD',
  'USDCHF',
  'USDSGD',
  'USDSEK',
  'USDRUB',
  'EURUSD',
  'EURGBP',
  'EURJPY',
  'GBPUSD',
  'GBPJPY',
  'AUDUSD',
  'NZDUSD',
  'CADUSD',
  
  // Endeksler
  'DXYUSD',
  'DXY',
]);

/**
 * Categorize currency symbol
 * 
 * Determines if a symbol is a precious metal or stock market currency.
 * 
 * @param symbol - Currency symbol
 * @returns CurrencyCategory
 */
export function categorizeCurrency(symbol: string): CurrencyCategory {
  const upperSymbol = symbol.toUpperCase();
  
  // Check if it's a precious metal
  if (PRECIOUS_METALS_SYMBOLS.has(upperSymbol)) {
    return CurrencyCategory.PRECIOUS_METALS;
  }
  
  // Check if symbol contains precious metal keywords
  if (
    upperSymbol.includes('GOLD') ||
    upperSymbol.includes('SILVER') ||
    upperSymbol.includes('XAU') ||
    upperSymbol.includes('XAG') ||
    upperSymbol.includes('GUMUS') ||
    upperSymbol.includes('AYAR') ||
    upperSymbol.includes('ATA') ||
    upperSymbol.includes('CEYREK') ||
    upperSymbol.includes('YARIM') ||
    upperSymbol.includes('TEK') ||
    upperSymbol.includes('GREMSE') ||
    upperSymbol === 'GRAM' ||
    upperSymbol === 'HAS' ||
    upperSymbol === 'GAU'
  ) {
    return CurrencyCategory.PRECIOUS_METALS;
  }
  
  // Default to stock market (forex/currency)
  return CurrencyCategory.STOCK_MARKET;
}

/**
 * Check if symbol is a precious metal
 * @param symbol - Currency symbol
 * @returns true if precious metal
 */
export function isPreciousMetal(symbol: string): boolean {
  return categorizeCurrency(symbol) === CurrencyCategory.PRECIOUS_METALS;
}

/**
 * Check if symbol is a stock market currency
 * @param symbol - Currency symbol
 * @returns true if stock market currency
 */
export function isStockMarket(symbol: string): boolean {
  return categorizeCurrency(symbol) === CurrencyCategory.STOCK_MARKET;
}
