import { PrismaClient, Prisma } from '@prisma/client';
import { createBuyLedger } from '../ledger/ledger.service';
import { updateHoldingAfterBuy } from '../holding/holding.service';

const prisma = new PrismaClient();

export async function buyAsset(
  userId: string,
  assetId: string,
  quantity: Prisma.Decimal,
  unitPrice: Prisma.Decimal
) {
  return prisma.$transaction(async () => {
    await createBuyLedger(userId, assetId, quantity, unitPrice);
    await updateHoldingAfterBuy(userId, assetId, quantity, unitPrice);

    return { success: true };
  });
}
