import { Response, NextFunction } from 'express';
import quickTransactionsService from '../quickTransactions.service';
import { sendSuccess, sendError } from '../../../utils/response';
import { AuthRequest } from '../../../middlewares/auth.middleware';

/**
 * GET /api/transactions/quick-transaction/latest
 * Kullanıcıya özel son yapılan quick transaction'ı döndürür
 */
export const getLatestQuickTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Son yapılan transaction'ı getir
    const transaction = await quickTransactionsService.getLatestQuickTransaction(userId);
    
    if (!transaction) {
      return sendSuccess(
        res,
        'No transactions found',
        null
      );
    }

    return sendSuccess(
      res,
      'Latest quick transaction retrieved successfully',
      transaction
    );
  } catch (error: any) {
    next(error);
  }
};
