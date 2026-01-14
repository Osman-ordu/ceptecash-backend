import { Request, Response, NextFunction } from 'express';
import quickTransactionsService from '../quickTransactions.service';
import { sendSuccess } from '../../../../utils/response';

export const getQuickTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await quickTransactionsService.getQuickTransactions();
    return sendSuccess(
      res,
      'Quick transactions retrieved successfully',
      transactions
    );
  } catch (error: any) {
    next(error);
  }
};

