import { Response, NextFunction } from 'express';
import quickTransactionsService from '../quickTransactions.service';
import { sendSuccess, sendError } from '../../../utils/response';
import { createQuickTransactionSchema } from '../quickTransactions.schema';
import { AuthRequest } from '../../../middlewares/auth.middleware';

export const createQuickTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const validatedData = createQuickTransactionSchema.parse(req.body);
    const transaction = await quickTransactionsService.createQuickTransaction(
      validatedData,
      userId
    );
    return sendSuccess(
      res,
      'Quick transaction created successfully',
      transaction,
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation error', 400, error.message);
    }
    next(error);
  }
};

