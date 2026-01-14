import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateHoldingAfterBuy(
  userId: string,
  assetId: string,
  quantity: Prisma.Decimal,
  unitPrice: Prisma.Decimal
) {
  const existing = await prisma.holding.findUnique({
    where: {
      userId_assetId: { userId, assetId },
    },
  });

  if (!existing) {
    return prisma.holding.create({
      data: {
        userId,
        assetId,
        totalQuantity: quantity,
        averageCost: unitPrice,
      },
    });
  }

  const newTotalQuantity = existing.totalQuantity.add(quantity);

  const newAverageCost = existing.totalQuantity
    .mul(existing.averageCost)
    .add(quantity.mul(unitPrice))
    .div(newTotalQuantity);

  return prisma.holding.update({
    where: {
      userId_assetId: { userId, assetId },
    },
    data: {
      totalQuantity: newTotalQuantity,
      averageCost: newAverageCost,
    },
  });
}
