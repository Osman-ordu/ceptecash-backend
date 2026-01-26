import { parseCurrencyPayload } from '../../parsers/parseCurrencyPayload';
import { parseUpdatePayload } from '../../parsers/parseUpdatePayload';
import { SOCKET_IO_MESSAGES, MARKET_EVENTS } from '../market.config';
import { MarketPriceStore } from '../../store/MarketPriceStore';

/**
 * Socket Message Handler
 * 
 * Handles parsing and processing of incoming socket messages.
 * Separated from connection logic for better testability.
 */
export class SocketMessageHandler {
  constructor(private readonly store: MarketPriceStore) {}

  /**
   * Handle incoming socket message
   * @param message - Raw message string from socket
   * @returns true if message was handled, false otherwise
   */
  handleMessage(message: string): boolean {
    // Handle ping/pong (Socket.IO heartbeat)
    if (message === SOCKET_IO_MESSAGES.PING) {
      return true; // Pong will be sent by caller
    }

    // Handle connection acknowledgment
    if (message.startsWith(SOCKET_IO_MESSAGES.CONNECT)) {
      return true; // Connection established
    }

    // Handle data messages (Socket.IO format: '42["event", data]')
    if (message.startsWith(SOCKET_IO_MESSAGES.DATA_PREFIX)) {
      return this.handleDataMessage(message);
    }

    return false;
  }

  /**
   * Handle data message (starts with '42')
   */
  private handleDataMessage(message: string): boolean {
    const payload = message.slice(SOCKET_IO_MESSAGES.DATA_PREFIX.length);

    // Parse to check event name
    let eventData: unknown;
    try {
      eventData = JSON.parse(payload);
    } catch {
      console.warn('⚠️  Failed to parse payload:', payload.substring(0, 100));
      return false;
    }

    // Validate event data format
    if (!Array.isArray(eventData) || eventData.length < 2) {
      return false;
    }

    const eventName = eventData[0];
    const eventPayload = eventData[1];

    // Handle "kapalicarsi" event
    if (eventName === MARKET_EVENTS.KAPALICARSI) {
      return this.handleKapalicarsiEvent(payload, message.length);
    }

    // Handle "update" event
    if (eventName === MARKET_EVENTS.UPDATE) {
      return this.handleUpdateEvent(payload, message.length);
    }

    return false;
  }

  /**
   * Handle kapalicarsi event (gold and currency prices with buy/sell)
   */
  private handleKapalicarsiEvent(payload: string, messageLength: number): boolean {
    const parsed = parseCurrencyPayload(payload);

    if (Object.keys(parsed).length === 0) {
      console.warn('⚠️  kapalicarsi parsing returned empty. Raw payload:', payload.substring(0, 200));
      return false;
    }

    console.log(`📨 Received kapalicarsi event (length: ${messageLength})`);
    console.log(`📡 Received ${Object.keys(parsed).length} price updates from kapalicarsi`);
    
    this.store.update(parsed);
    console.log(`📊 Store now has ${this.store.size()} prices`);

    return true;
  }

  /**
   * Handle update event (forex rates - single price)
   */
  private handleUpdateEvent(payload: string, messageLength: number): boolean {
    const parsed = parseUpdatePayload(payload);

    if (Object.keys(parsed).length === 0) {
      console.warn('⚠️  update parsing returned empty. Raw payload:', payload.substring(0, 200));
      return false;
    }

    console.log(`📨 Received update event (length: ${messageLength})`);
    console.log(`📡 Received ${Object.keys(parsed).length} forex rate updates from update`);
    
    this.store.update(parsed);
    console.log(`📊 Store now has ${this.store.size()} prices`);

    return true;
  }
}
