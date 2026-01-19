import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CreateQuickTransactionInput } from './quickTransactions.schema';

// Prisma'dan gelen QuickTransaction tipi
// Not: Migration çalıştırıldıktan sonra bu tip otomatik olarak oluşacak
type PrismaQuickTransaction = {
  id: string;
  userId: string;
  side: 'BUY' | 'SELL';
  baseAsset: string;
  quoteAsset: string;
  amount: Prisma.Decimal;
  total: Prisma.Decimal;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Schema'daki QuickTransaction interface'ine uyumlu format
export interface QuickTransaction {
  id: string;
  userId: string;
  side: 'buy' | 'sell';
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  transactionDate: Date;
  total: number;
}

export class QuickTransactionsService {
  /**
   * Kullanıcıya özel tüm quick transaction'ları getir
   */
  async getQuickTransactions(userId: string): Promise<QuickTransaction[]> {
    // Prisma client'ta model adı camelCase olarak erişilir: QuickTransaction -> quickTransaction
    // Not: Migration çalıştırıldıktan sonra bu property otomatik olarak oluşacak
    const transactions = await (prisma as any).quickTransaction.findMany({
      where: {
        userId, // Sadece bu user'ın transaction'ları
      },
      orderBy: {
        transactionDate: 'desc', // En yeni önce
      },
    });

    // Prisma'dan gelen veriyi schema formatına çevir
    return transactions.map((t: PrismaQuickTransaction) => this.mapPrismaToSchema(t));
  }

  /**
   * Yeni quick transaction oluştur
   */
  async createQuickTransaction(
    data: CreateQuickTransactionInput,
    userId: string
  ): Promise<QuickTransaction> {
    // Not: Migration çalıştırıldıktan sonra bu property otomatik olarak oluşacak
    const newTransaction = await (prisma as any).quickTransaction.create({
      data: {
        userId,
        side: data.side.toUpperCase() as 'BUY' | 'SELL', // Enum'a uygun format
        baseAsset: data.baseAsset,
        quoteAsset: data.quoteAsset,
        amount: new Prisma.Decimal(data.amount),
        total: new Prisma.Decimal(data.total),
        transactionDate: data.transactionDate
          ? new Date(data.transactionDate)
          : new Date(),
      },
    });

    return this.mapPrismaToSchema(newTransaction as PrismaQuickTransaction);
  }

  /**
   * ID'ye göre transaction getir (user kontrolü ile)
   */
  async getQuickTransactionById(
    id: string,
    userId: string
  ): Promise<QuickTransaction | null> {
    // Not: Migration çalıştırıldıktan sonra bu property otomatik olarak oluşacak
    const transaction = await (prisma as any).quickTransaction.findFirst({
      where: {
        id,
        userId, // Sadece bu user'ın transaction'ı
      },
    });

    if (!transaction) {
      return null;
    }

    return this.mapPrismaToSchema(transaction as PrismaQuickTransaction);
  }

  /**
   * Prisma model'ini schema formatına çevir
   * @private
   */
  private mapPrismaToSchema(prismaTransaction: PrismaQuickTransaction): QuickTransaction {
    return {
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      side: (prismaTransaction.side.toLowerCase() as 'buy' | 'sell'),
      baseAsset: prismaTransaction.baseAsset,
      quoteAsset: prismaTransaction.quoteAsset,
      amount: prismaTransaction.amount.toNumber(),
      transactionDate: prismaTransaction.transactionDate,
      total: prismaTransaction.total.toNumber(),
    };
  }
}

export default new QuickTransactionsService();

