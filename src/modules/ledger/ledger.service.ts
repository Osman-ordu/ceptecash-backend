import { PrismaClient, LedgerType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Immutable BUY ledger record (FIFO)
 */
export async function createBuyLedger(
  userId: string,
  assetId: string,
  quantity: Prisma.Decimal,
  unitPrice: Prisma.Decimal
) {
  return prisma.ledgerTransaction.create({
    data: {
      userId,
      assetId,
      type: LedgerType.BUY,
      quantity,
      unitPrice,
      totalAmount: quantity.mul(unitPrice),
    },
  });
}
