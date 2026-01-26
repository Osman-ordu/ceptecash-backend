import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { MarketSocketClient } from './socket/MarketSocketClient';
import { MarketPriceStore } from './store/MarketPriceStore';
import { createMarketGateway } from './socket/gateway';

/**
 * MarketService
 * 
 * Orchestrates market data flow:
 * - External Market Socket → MarketSocketClient
 * - MarketSocketClient → MarketPriceStore (single source of truth)
 * - MarketPriceStore → MarketGateway → Frontend
 * 
 * This service initializes and manages the entire market data pipeline.
 */
export class MarketService {
  private priceStore: MarketPriceStore;
  private marketClient: MarketSocketClient;
  private gateway?: SocketIOServer;

  constructor() {
    // Initialize price store (single source of truth)
    this.priceStore = new MarketPriceStore();

    // Initialize market client (connects to external socket)
    this.marketClient = new MarketSocketClient(this.priceStore);
  }

  /**
   * Initialize market service
   * Connects to external market socket and creates gateway for frontend
   */
  initialize(server: HTTPServer): void {
    // Connect to external market socket
    this.marketClient.connect();

    // Create gateway for frontend connections
    this.gateway = createMarketGateway(server, this.priceStore);

    console.log('✅ Market service initialized');
  }

  /**
   * Get price store instance
   * Useful for accessing prices in other parts of the application
   */
  getPriceStore(): MarketPriceStore {
    return this.priceStore;
  }

  /**
   * Get market client instance
   * Useful for monitoring connection status
   */
  getMarketClient(): MarketSocketClient {
    return this.marketClient;
  }

  /**
   * Gracefully shutdown market service
   */
  shutdown(): void {
    console.log('🛑 Shutting down market service...');
    this.marketClient.disconnect();
    this.gateway?.close();
    console.log('✅ Market service shut down');
  }

  /**
   * Get Socket.IO server instance
   * Useful for accessing Socket.IO features in other parts of the application
   */
  getGateway(): SocketIOServer | undefined {
    return this.gateway;
  }
}

// Singleton instance
let marketServiceInstance: MarketService | null = null;

/**
 * Get or create market service instance
 */
export function getMarketService(): MarketService {
  if (!marketServiceInstance) {
    marketServiceInstance = new MarketService();
  }
  return marketServiceInstance;
}
