/**
 * Market Socket Configuration
 * Centralized configuration for external market socket connection
 */
export const MARKET_CONFIG = {
  SOCKET_URL:
    process.env.MARKET_SOCKET_URL,
  CHANNEL_NAME: process.env.MARKET_SOCKET_CHANNEL,
  RECONNECT_DELAY: 2000, // 2 seconds
  MAX_RECONNECT_ATTEMPTS: Infinity, // Unlimited reconnection attempts
} as const;

/**
 * Socket.IO Protocol Messages
 */
export const SOCKET_IO_MESSAGES = {
  CONNECT: '40',
  PONG: '3',
  PING: '2',
  DATA_PREFIX: '42',
} as const;

/**
 * Market Event Types
 */
export const MARKET_EVENTS = {
  KAPALICARSI: process.env.MARKET_SOCKET_CHANNEL,
  UPDATE: process.env.SECOND_MARKET_SOCKET_CHANNEL,
} as const;
