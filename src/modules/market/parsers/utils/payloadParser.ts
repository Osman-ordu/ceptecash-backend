/**
 * Payload Parser Utilities
 * 
 * Shared utilities for parsing Socket.IO payloads.
 * Extracted common logic for better maintainability.
 */

/**
 * Parse Socket.IO array format payload
 * Handles: ["eventName", dataString] or ["eventName", dataObject]
 * 
 * @param data - Raw data (string or already parsed)
 * @returns Parsed data object or null if parsing fails
 */
export function parseSocketIOPayload(data: unknown): any | null {
  if (!data) return null;

  let parsed: any;

  // Parse string to object if needed
  try {
    parsed = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }

  // Handle Socket.IO array format: ["eventName", dataString]
  if (Array.isArray(parsed)) {
    if (parsed.length >= 2 && typeof parsed[1] === 'string') {
      // Second element is JSON string, parse it
      try {
        parsed = JSON.parse(parsed[1]);
      } catch {
        return null;
      }
    } else if (parsed.length >= 2) {
      // Second element is already an object
      parsed = parsed[1];
    } else {
      // Single element
      parsed = parsed[0];
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  return parsed;
}

/**
 * Normalize currency symbol
 * Removes TRY suffix if present
 * 
 * @param symbol - Raw symbol string
 * @returns Normalized symbol
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.endsWith('TRY') && symbol.length > 3
    ? symbol.replace('TRY', '')
    : symbol;
}

/**
 * Parse price value (handles comma as decimal separator)
 * 
 * @param value - Price value (string or number)
 * @returns Parsed number or NaN
 */
export function parsePrice(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  return parseFloat(String(value).replace(',', '.'));
}

/**
 * Validate price is positive number
 * 
 * @param price - Price value
 * @returns true if valid positive number
 */
export function isValidPrice(price: number): boolean {
  return !isNaN(price) && price > 0;
}
