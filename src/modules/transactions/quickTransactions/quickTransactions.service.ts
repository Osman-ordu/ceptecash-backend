import { QuickTransaction } from './quickTransactions.schema';

export class QuickTransactionsService {
  async getQuickTransactions(): Promise<QuickTransaction[]> {
    // Mock data - gerçek uygulamada veritabanından veya API'den çekilebilir
    const transactions: QuickTransaction[] = [
      {
        baseAsset: 'TRY',
        quoteAsset: 'USD',
        amount: 100,
        transactionDate: new Date(),
        total: 4200,
      },
      {
        baseAsset: 'TRY',
        quoteAsset: 'EUR',
        amount: 100,
        transactionDate: new Date(),
        total: 5100,
      },
    ];

    return transactions;
  }
}

export default new QuickTransactionsService();

