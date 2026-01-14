import { QuickTransaction, CreateQuickTransactionInput } from './quickTransactions.schema';

// In-memory storage (geçici olarak - server restart olunca kaybolur)
class TransactionStorage {
  private transactions: QuickTransaction[] = [
    {
      id: '1',
      side: 'buy',
      baseAsset: 'TRY',
      quoteAsset: 'USD',
      amount: 100,
      transactionDate: new Date(),
      total: 4200,
    },
    {
      id: '2',
      side: 'sell',
      baseAsset: 'TRY',
      quoteAsset: 'EUR',
      amount: 100,
      transactionDate: new Date(),
      total: 5100,
    },
  ];

  getAll(): QuickTransaction[] {
    return this.transactions;
  }

  add(transaction: QuickTransaction): QuickTransaction {
    this.transactions.push(transaction);
    return transaction;
  }

  findById(id: string): QuickTransaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }
}

// Singleton instance
const storage = new TransactionStorage();

export class QuickTransactionsService {
  async getQuickTransactions(): Promise<QuickTransaction[]> {
    return storage.getAll();
  }

  async createQuickTransaction(
    data: CreateQuickTransactionInput
  ): Promise<QuickTransaction> {
    // Yeni ID oluştur (basit counter - gerçek uygulamada UUID kullanılmalı)
    const id = (storage.getAll().length + 1).toString();

    const newTransaction: QuickTransaction = {
      id,
      side: data.side,
      baseAsset: data.baseAsset,
      quoteAsset: data.quoteAsset,
      amount: data.amount,
      transactionDate: data.transactionDate
        ? new Date(data.transactionDate)
        : new Date(),
      total: data.total,
    };

    return storage.add(newTransaction);
  }
}

export default new QuickTransactionsService();

