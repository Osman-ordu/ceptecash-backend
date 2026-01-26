/**
 * Currency Labels
 * 
 * Turkish labels for currency symbols.
 * Used to provide human-readable names for currencies.
 * All labels are in Turkish and meaningful for end users.
 */
export const CURRENCY_LABELS: Record<string, string> = {
  // ============================================
  // TEMEL DÖVİZLER (TRY ile)
  // ============================================
  USD: 'Dolar',
  USDTRY: 'Dolar',
  EUR: 'Euro',
  EURTRY: 'Euro',
  GBP: 'İngiliz Sterlini',
  GBPTRY: 'İngiliz Sterlini',
  
  // ============================================
  // ALTIN ÇEŞİTLERİ
  // ============================================
  AYAR22: '22 Ayar Altın',
  AYAR14: '14 Ayar Altın',
  GRAM: 'Gram Altın',
  CEYREK: 'Çeyrek Altın',
  YARIM: 'Yarım Altın',
  ATA: 'Ata Lira',
  HAS: 'Has Altın',
  GAU: 'Gram Altın',
  
  // Altın çeşitleri (Eski ve özel)
  YARIM_ESKI: 'Yarım Altın (Eski)',
  TEK_ESKI: 'Tek Altın (Eski)',
  TEK: 'Tek Altın',
  GREMSE_ESKI: 'Gremse Altın (Eski)',
  GREMSE: 'Gremse Altın',
  CEYREK_ESKI: 'Çeyrek Altın (Eski)',
  ATA_ESKI: 'Ata Lira (Eski)',
  ATA5: 'Ata 5\'li',
  ATA5_ESKI: 'Ata 5\'li (Eski)',
  
  // ============================================
  // GÜMÜŞ
  // ============================================
  GUMUSTRY: 'Gümüş',
  GUMUS: 'Gümüş',
  
  // ============================================
  // FOREX ÇİFTLERİ (Anlamlı Türkçe İsimler)
  // ============================================
  // USD bazlı çiftler
  USDJPY: 'Japon Yeni',
  USDAUD: 'Avustralya Doları',
  USDCHF: 'İsviçre Frangı',
  USDSGD: 'Singapur Doları',
  USDSEK: 'İsveç Kronu',
  USDRUB: 'Rus Rublesi',
  
  // EUR bazlı çiftler
  EURUSD: 'Euro',
  EURGBP: 'Euro/İngiliz Sterlini',
  EURJPY: 'Euro/Japon Yeni',
  
  // GBP bazlı çiftler
  GBPUSD: 'İngiliz Sterlini',
  GBPJPY: 'İngiliz Sterlini/Japon Yeni',
  
  // Diğer çiftler
  AUDUSD: 'Avustralya Doları',
  NZDUSD: 'Yeni Zelanda Doları',
  CADUSD: 'Kanada Doları',
  
  // ============================================
  // DEĞERLİ MADENLER (Forex Formatında)
  // Not: XAUUSD, XAGUSD, XAUXAG, GUMUSUSD frontend'e gönderilmez (filtered)
  // ============================================
  XAU: 'Altın',
  XAG: 'Gümüş',
  
  // ============================================
  // ENDEKSLER
  // ============================================
  DXYUSD: 'Dolar Endeksi',
  DXY: 'Dolar Endeksi',
  
  // ============================================
  // TEKİL DÖVİZLER (Forex çifti değil)
  // ============================================
  JPY: 'Japon Yeni',
  CHF: 'İsviçre Frangı',
  AUD: 'Avustralya Doları',
  SEK: 'İsveç Kronu',
  RUB: 'Rus Rublesi',
  SGD: 'Singapur Doları',
  CAD: 'Kanada Doları',
  NZD: 'Yeni Zelanda Doları',
  MXN: 'Meksika Pesosu',
  ZAR: 'Güney Afrika Randı',
  BRL: 'Brezilya Reali',
  INR: 'Hindistan Rupisi',
  CNY: 'Çin Yuanı',
  HKD: 'Hong Kong Doları',
  KRW: 'Güney Kore Wonu',
  NOK: 'Norveç Kronu',
  
  // TRY ile çiftler (ek)
  SARTRY: 'Suudi Arabistan Riyali',
  NOKTRY: 'Norveç Kronu',
  
  // ============================================
  // DEFAULT
  // ============================================
  default: 'Türk Lirası',
};

/**
 * Get currency label for a symbol
 * 
 * Smart label resolution:
 * 1. Direct match (case-insensitive)
 * 2. Try with TRY suffix removed
 * 3. Try with TRY suffix added
 * 4. Forex pair pattern matching
 * 5. Return symbol itself if not found
 * 
 * @param symbol - Currency symbol
 * @returns Human-readable Turkish label
 */
export function getCurrencyLabel(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  
  // Direct match
  if (CURRENCY_LABELS[upperSymbol]) {
    return CURRENCY_LABELS[upperSymbol];
  }
  
  // Try removing TRY suffix
  if (upperSymbol.endsWith('TRY') && upperSymbol.length > 3) {
    const withoutTRY = upperSymbol.slice(0, -3);
    if (CURRENCY_LABELS[withoutTRY]) {
      return CURRENCY_LABELS[withoutTRY];
    }
  }
  
  // Try adding TRY suffix (for single currency codes)
  if (!upperSymbol.includes('TRY') && upperSymbol.length <= 3) {
    const withTRY = upperSymbol + 'TRY';
    if (CURRENCY_LABELS[withTRY]) {
      return CURRENCY_LABELS[withTRY];
    }
  }
  
  // Forex pair pattern matching (e.g., USDJPY -> Japon Yeni)
  // If it's a 6-character forex pair, try to extract the quote currency
  if (upperSymbol.length === 6) {
    const base = upperSymbol.substring(0, 3);
    const quote = upperSymbol.substring(3, 6);
    
    // If quote currency has a label, use it
    if (CURRENCY_LABELS[quote]) {
      return CURRENCY_LABELS[quote];
    }
    
    // Try the full pair
    if (CURRENCY_LABELS[upperSymbol]) {
      return CURRENCY_LABELS[upperSymbol];
    }
  }
  
  // Fallback: return symbol as-is (better than showing technical code)
  return symbol;
}

/**
 * Get all currency labels
 * @returns Record of symbol -> label
 */
export function getAllCurrencyLabels(): Record<string, string> {
  return CURRENCY_LABELS;
}
