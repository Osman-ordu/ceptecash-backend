import { ICurrencyData } from '../market.types';
import { parseSocketIOPayload, normalizeSymbol, parsePrice, isValidPrice } from './utils/payloadParser';

/**
 * Raw payload structure from external market API
 */
interface RawCurrencyValue {
  alis?: string | number;
  satis?: string | number;
  percent?: string | number;
}

/**
 * parseCurrencyPayload
 * 
 * Pure function that parses raw market payload into structured currency data.
 * Side-effect free, easily testable.
 * 
 * @param payload - Raw payload from market socket (string or parsed object)
 * @returns Record of symbol -> ICurrencyData
 */
export function parseCurrencyPayload(
  payload: unknown
): Record<string, ICurrencyData> {
  const data = parseSocketIOPayload(payload);
  if (!data) return {};

  const result: Record<string, ICurrencyData> = {};

  Object.entries(data).forEach(([key, value]: [string, any]) => {
    if (!value || typeof value !== 'object') return;
    if (!value.alis || !value.satis) return;

    const symbol = normalizeSymbol(key);
    const buyPrice = parsePrice(value.alis);
    const sellPrice = parsePrice(value.satis);

    // Validate prices
    if (!isValidPrice(buyPrice) || !isValidPrice(sellPrice)) {
      return;
    }

    // Parse change percent (if available)
    const changePercent = value.percent !== undefined && value.percent !== null
      ? parsePrice(value.percent) || 0
      : 0;

    result[symbol] = {
      symbol,
      buyPrice,
      sellPrice,
      changePercent, // Will be recalculated in MarketPriceStore if 0
      timestamp: Date.now(),
    };
  });

  return result;
}
