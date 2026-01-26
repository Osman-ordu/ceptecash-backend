/**
 * Currency Filter
 * 
 * Filters out unwanted currency symbols from being sent to frontend.
 * These symbols are still stored in backend but not exposed to clients.
 */

/**
 * Blacklisted symbols that should not be sent to frontend
 */
const BLACKLISTED_SYMBOLS = new Set([
  'XAUUSD',   // Altın (USD) - forex formatı, kullanıcıya gösterilmez
  'XAGUSD',   // Gümüş (USD) - forex formatı, kullanıcıya gösterilmez
  'XAUXAG',   // Altın/Gümüş çifti - kullanıcıya gösterilmez
  'GUMUSUSD', // Gümüş (USD) - forex formatı, kullanıcıya gösterilmez
  // GUMUSTRY kalacak (Gümüş/TRY)
]);

/**
 * Check if a symbol should be filtered out
 * @param symbol - Currency symbol
 * @returns true if symbol should be filtered (not sent to frontend)
 */
export function isFiltered(symbol: string): boolean {
  return BLACKLISTED_SYMBOLS.has(symbol.toUpperCase());
}

/**
 * Filter array of currency data
 * @param prices - Array of currency data
 * @returns Filtered array (blacklisted symbols removed)
 */
export function filterCurrencies<T extends { symbol: string }>(prices: T[]): T[] {
  return prices.filter((price) => !isFiltered(price.symbol));
}

/**
 * Filter array of symbols
 * @param symbols - Array of symbol strings
 * @returns Filtered array (blacklisted symbols removed)
 */
export function filterSymbols(symbols: string[]): string[] {
  return symbols.filter((symbol) => !isFiltered(symbol));
}
