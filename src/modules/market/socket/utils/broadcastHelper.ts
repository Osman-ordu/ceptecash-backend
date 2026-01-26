import { Namespace, Socket } from 'socket.io';
import { MarketPriceStore } from '../../store/MarketPriceStore';
import { getCurrencyLabel } from '../../utils/currencyLabels';
import { CurrencyCategory } from '../../market.types';

/**
 * Broadcast Helper
 * 
 * Centralized logic for broadcasting market data to Socket.IO clients.
 * Separated from gateway setup for better maintainability.
 */
export class BroadcastHelper {
  constructor(
    private readonly namespace: Namespace,
    private readonly store: MarketPriceStore
  ) {}

  /**
   * Broadcast all market data to connected clients
   */
  broadcastAll(): void {
    try {
      const prices = this.store.getAll();
      this.namespace.emit('prices', prices);

      // Broadcast by category
      this.broadcastByCategory();
      
      // Broadcast symbols
      this.broadcastSymbols();
    } catch (error: any) {
      console.error('Error broadcasting prices:', error.message);
    }
  }

  /**
   * Broadcast prices by category
   */
  private broadcastByCategory(): void {
    const stockMarket = this.store.getStockMarket();
    const preciousMetals = this.store.getPreciousMetals();
    
    this.namespace.emit('prices:stockMarket', stockMarket);
    this.namespace.emit('prices:preciousMetals', preciousMetals);
  }

  /**
   * Broadcast symbols with labels and categories
   */
  private broadcastSymbols(): void {
    const symbols = this.store.getSymbols();
    
    // Simple symbols array
    this.namespace.emit('symbols', symbols);
    
    // Symbols with labels and categories
    const symbolsWithLabels = this.createSymbolsWithLabels(symbols);
    this.namespace.emit('symbolsWithLabels', symbolsWithLabels);
    
    // Symbols by category
    this.broadcastSymbolsByCategory();
  }

  /**
   * Create symbols with labels array
   */
  private createSymbolsWithLabels(symbols: string[]): Array<{
    symbol: string;
    label: string;
    category: CurrencyCategory;
  }> {
    return symbols.map((symbol) => {
      const price = this.store.get(symbol);
      return {
        symbol,
        label: getCurrencyLabel(symbol),
        category: price?.category || CurrencyCategory.STOCK_MARKET,
      };
    });
  }

  /**
   * Broadcast symbols by category
   */
  private broadcastSymbolsByCategory(): void {
    const stockMarketSymbols = this.store.getSymbolsByCategory(CurrencyCategory.STOCK_MARKET);
    const preciousMetalsSymbols = this.store.getSymbolsByCategory(CurrencyCategory.PRECIOUS_METALS);
    
    this.namespace.emit('symbols:stockMarket', stockMarketSymbols);
    this.namespace.emit('symbols:preciousMetals', preciousMetalsSymbols);
  }

  /**
   * Send initial snapshot to a specific socket
   */
  sendSnapshot(socket: Socket): void {
    try {
      const prices = this.store.getAll();
      socket.emit('prices', prices);
    } catch (error: any) {
      console.error('Error sending snapshot:', error.message);
    }
  }

  /**
   * Send symbols to a specific socket
   */
  sendSymbols(socket: Socket): void {
    try {
      const symbols = this.store.getSymbols();
      const symbolsWithLabels = this.createSymbolsWithLabels(symbols);
      
      socket.emit('symbols', symbols);
      socket.emit('symbolsWithLabels', symbolsWithLabels);
    } catch (error: any) {
      console.error('Error sending symbols:', error.message);
    }
  }
}
