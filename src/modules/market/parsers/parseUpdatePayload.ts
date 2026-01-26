import { ICurrencyData } from '../market.types';
import { parseSocketIOPayload, normalizeSymbol, parsePrice, isValidPrice } from './utils/payloadParser';

/**
 * Metadata fields to skip in update payload
 */
const METADATA_FIELDS = new Set(['S', 'T']);

/**
 * parseUpdatePayload
 * 
 * Parses "update" event payload which contains forex rates.
 * Format: {"USDTRY": 43.3839, "EURTRY": 51.4256, ...}
 * These are single prices (no buy/sell split), so we use the same value for both.
 * 
 * @param payload - Raw payload from update event
 * @returns Record of symbol -> ICurrencyData
 */
export function parseUpdatePayload(
  payload: unknown
): Record<string, ICurrencyData> {
  const data = parseSocketIOPayload(payload);
  if (!data) return {};

  const result: Record<string, ICurrencyData> = {};

  Object.entries(data).forEach(([key, value]: [string, any]) => {
    // Skip metadata fields
    if (METADATA_FIELDS.has(key)) return;

    const price = parsePrice(value);
    
    // Validate price
    if (!isValidPrice(price)) {
      return;
    }

    // Normalize symbol (forex pairs keep as is, TRY pairs normalize)
    const symbol = normalizeSymbol(key);

    // For update events, use same price for buy and sell (forex rates typically have minimal spread)
    result[symbol] = {
      symbol,
      buyPrice: price,
      sellPrice: price,
      changePercent: 0, // Will be calculated in MarketPriceStore
      timestamp: Date.now(),
    };
  });

  return result;
}
