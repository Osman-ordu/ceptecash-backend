import { Request, Response, NextFunction } from 'express';
import quickTransactionsService from '../quickTransactions.service';
import { sendSuccess, sendError } from '../../../../utils/response';
import { createQuickTransactionSchema } from '../quickTransactions.schema';

export const createQuickTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createQuickTransactionSchema.parse(req.body);
    const transaction = await quickTransactionsService.createQuickTransaction(
      validatedData
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

