import { Response, NextFunction } from 'express';
import quickTransactionsService from '../quickTransactions.service';
import { sendSuccess, sendError } from '../../../utils/response';
import { AuthRequest } from '../../../middlewares/auth.middleware';

export const getQuickTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Sadece bu user'ın transaction'larını getir
    const transactions = await quickTransactionsService.getQuickTransactions(userId);
    return sendSuccess(
      res,
      'Quick transactions retrieved successfully',
      transactions
    );
  } catch (error: any) {
    next(error);
  }
};

