import { ICurrencyData, CurrencyCategory } from '../market.types';
import { categorizeCurrency } from '../utils/currencyCategorizer';
import { filterCurrencies, filterSymbols } from '../utils/currencyFilter';

/**
 * MarketPriceStore
 * 
 * Single source of truth for market prices in the backend.
 * Stores currency data in memory with Map for O(1) access.
 * 
 * Future: Can be extended to use Redis or Database for persistence.
 */
export class MarketPriceStore {
  private prices = new Map<string, ICurrencyData>();
  private previousPrices = new Map<string, number>(); // Store previous buyPrice for change calculation

  /**
   * Update prices with new data
   * Merges new data into existing prices
   * Calculates changePercent based on previous prices
   */
  update(data: Record<string, ICurrencyData>): void {
    Object.values(data).forEach((item) => {
      // Calculate changePercent if we have previous price
      const previousPrice = this.previousPrices.get(item.symbol);
      if (previousPrice && previousPrice > 0) {
        const change = item.buyPrice - previousPrice;
        item.changePercent = (change / previousPrice) * 100;
      } else {
        // No previous price, set to 0
        item.changePercent = 0;
      }

      // Categorize currency if not already categorized
      if (!item.category) {
        item.category = categorizeCurrency(item.symbol);
      }

      // Store current price as previous for next update
      this.previousPrices.set(item.symbol, item.buyPrice);

      // Update prices
      this.prices.set(item.symbol, item);
    });
  }

  /**
   * Get price for a specific symbol
   * @param symbol - Currency symbol (e.g., 'GAU', 'USD')
   * @returns Currency data or undefined if not found
   */
  get(symbol: string): ICurrencyData | undefined {
    return this.prices.get(symbol);
  }

  /**
   * Get all prices as an array (filtered - blacklisted symbols removed)
   * @returns Array of all currency data (filtered)
   */
  getAll(): ICurrencyData[] {
    return filterCurrencies(Array.from(this.prices.values()));
  }

  /**
   * Get all prices as a map
   * @returns Map of all currency data
   */
  getAllAsMap(): Map<string, ICurrencyData> {
    return new Map(this.prices);
  }

  /**
   * Clear all prices
   * Useful for testing or reset scenarios
   */
  clear(): void {
    this.prices.clear();
  }

  /**
   * Get count of stored prices
   * @returns Number of stored prices
   */
  size(): number {
    return this.prices.size;
  }

  /**
   * Get all available symbols (filtered - blacklisted symbols removed)
   * @returns Array of symbol strings (filtered)
   */
  getSymbols(): string[] {
    return filterSymbols(Array.from(this.prices.keys()));
  }

  /**
   * Get prices by category (filtered - blacklisted symbols removed)
   * @param category - Currency category
   * @returns Array of currency data for the specified category (filtered)
   */
  getByCategory(category: CurrencyCategory): ICurrencyData[] {
    return filterCurrencies(
      Array.from(this.prices.values()).filter(
        (price) => price.category === category
      )
    );
  }

  /**
   * Get stock market currencies (forex/döviz)
   * @returns Array of stock market currency data
   */
  getStockMarket(): ICurrencyData[] {
    return this.getByCategory(CurrencyCategory.STOCK_MARKET);
  }

  /**
   * Get precious metals (altın/gümüş)
   * @returns Array of precious metal data
   */
  getPreciousMetals(): ICurrencyData[] {
    return this.getByCategory(CurrencyCategory.PRECIOUS_METALS);
  }

  /**
   * Get symbols by category (filtered - blacklisted symbols removed)
   * @param category - Currency category
   * @returns Array of symbol strings for the specified category (filtered)
   */
  getSymbolsByCategory(category: CurrencyCategory): string[] {
    return filterSymbols(
      this.getByCategory(category).map((price) => price.symbol)
    );
  }
}
