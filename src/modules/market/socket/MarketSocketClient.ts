import WebSocket from 'ws';
import { MarketPriceStore } from '../store/MarketPriceStore';
import { SocketMessageHandler } from './utils/socketMessageHandler';
import { MARKET_CONFIG, SOCKET_IO_MESSAGES } from './market.config';

/**
 * MarketSocketClient
 * 
 * Handles connection to external market socket API.
 * Only responsible for receiving data, no business logic.
 * 
 * Responsibilities:
 * - Connect to external market socket
 * - Handle connection lifecycle (connect, disconnect, reconnect)
 * - Parse incoming messages
 * - Update MarketPriceStore with new data
 */
export class MarketSocketClient {
  private ws?: WebSocket;
  private subscribed = false;
  private reconnectTimeout?: NodeJS.Timeout;
  private isConnecting = false;
  private messageHandler: SocketMessageHandler;

  constructor(private readonly store: MarketPriceStore) {
    this.messageHandler = new SocketMessageHandler(store);
  }

  /**
   * Connect to external market socket
   * Automatically reconnects on disconnect
   */
  connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.subscribed = false;

    try {
      if (!MARKET_CONFIG.SOCKET_URL) {
        throw new Error('MARKET_SOCKET_URL environment variable is not set');
      }
      this.ws = new WebSocket(MARKET_CONFIG.SOCKET_URL);
      this.setupEventHandlers();
    } catch (error: any) {
      console.error('📡 Market socket connection error:', error.message);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from market socket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = undefined;
    }

    this.subscribed = false;
    this.isConnecting = false;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.on('open', () => this.handleOpen());
    this.ws.on('message', (raw: Buffer) => this.handleMessage(raw.toString()));
    this.ws.on('close', () => this.handleClose());
    this.ws.on('error', (error: Error) => this.handleError(error));
  }

  /**
   * Handle socket open event
   */
  private handleOpen(): void {
    console.log('📡 Market socket connected');
    this.isConnecting = false;
    this.send(SOCKET_IO_MESSAGES.CONNECT);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: string): void {
    // Handle ping - send pong response
    if (message === SOCKET_IO_MESSAGES.PING) {
      this.send(SOCKET_IO_MESSAGES.PONG);
      return;
    }

    // Handle subscription on first data message
    if (message.startsWith(SOCKET_IO_MESSAGES.DATA_PREFIX) && !this.subscribed) {
      this.subscribe();
      return;
    }

    // Delegate to message handler
    this.messageHandler.handleMessage(message);
  }

  /**
   * Handle socket close event
   */
  private handleClose(): void {
    console.log('📡 Market socket disconnected, reconnecting...');
    this.subscribed = false;
    this.isConnecting = false;
    this.scheduleReconnect();
  }

  /**
   * Handle socket error event
   */
  private handleError(error: Error): void {
    console.error('📡 Market socket error:', error.message);
    this.isConnecting = false;
    this.ws?.close();
  }

  /**
   * Subscribe to market channel
   */
  private subscribe(): void {
    const subscribeMessage = `${SOCKET_IO_MESSAGES.DATA_PREFIX}["subscribe","${MARKET_CONFIG.CHANNEL_NAME}"]`;
    this.send(subscribeMessage);
    this.subscribed = true;
    console.log(`📡 Subscribed to channel: ${MARKET_CONFIG.CHANNEL_NAME}`);
  }

  /**
   * Send message to market socket
   */
  private send(message: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      return;
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = undefined;
      this.connect();
    }, MARKET_CONFIG.RECONNECT_DELAY);
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
