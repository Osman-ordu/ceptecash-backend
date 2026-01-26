import { Request, Response } from 'express';
import { getMarketService } from '../market.service';
import { sendSuccess, sendError } from '../../../utils/response';

/**
 * GET /api/market/status
 * Market socket bağlantı durumunu ve store'daki veri sayısını döndürür
 */
export const getMarketStatus = async (req: Request, res: Response) => {
  try {
    const marketService = getMarketService();
    const marketClient = marketService.getMarketClient();
    const priceStore = marketService.getPriceStore();

    const isConnected = marketClient.isConnected();
    const priceCount = priceStore.size();
    const symbols = priceStore.getSymbols();

    return sendSuccess(res, 'Market status retrieved successfully', {
      connected: isConnected,
      priceCount,
      symbols,
      symbolsCount: symbols.length,
    });
  } catch (error: any) {
    console.error('Get market status error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};
