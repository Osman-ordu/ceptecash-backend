import { z } from 'zod';

export interface QuickTransaction {
  id: string;
  side: 'buy' | 'sell';
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  transactionDate: Date;
  total: number;
}

export type QuickTransactionResponse = QuickTransaction[];

// POST için validation schema
export const createQuickTransactionSchema = z.object({
  side: z.enum(['buy', 'sell'], {
    required_error: 'Side is required',
    invalid_type_error: 'Side must be either "buy" or "sell"',
  }),
  baseAsset: z.string().min(1, 'Base asset is required'),
  quoteAsset: z.string().min(1, 'Quote asset is required'),
  amount: z.number().positive('Amount must be positive'),
  total: z.number().positive('Total must be positive'),
  transactionDate: z.string().datetime().optional().or(z.date().optional()),
});

export type CreateQuickTransactionInput = z.infer<typeof createQuickTransactionSchema>;

