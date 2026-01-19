-- CreateEnum
CREATE TYPE "TransactionSide" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "QuickTransaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "side" "TransactionSide" NOT NULL,
    "base_asset" TEXT NOT NULL,
    "quote_asset" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "total" DECIMAL(18,8) NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuickTransaction_user_id_transaction_date_idx" ON "QuickTransaction"("user_id", "transaction_date");

-- CreateIndex
CREATE INDEX "QuickTransaction_user_id_idx" ON "QuickTransaction"("user_id");

-- AddForeignKey
ALTER TABLE "QuickTransaction" ADD CONSTRAINT "QuickTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
