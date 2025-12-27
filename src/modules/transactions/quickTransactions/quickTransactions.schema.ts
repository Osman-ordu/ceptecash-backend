import { z } from 'zod';

export interface QuickTransaction {
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  transactionDate: Date;
  total: number;
}

export type QuickTransactionResponse = QuickTransaction[];

