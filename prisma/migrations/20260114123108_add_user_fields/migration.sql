-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('METAL', 'CURRENCY', 'CRYPTO');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PROFIT_PERCENT', 'PRICE_TARGET');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "surName" TEXT,
    "picture" TEXT,
    "passwordHash" TEXT NOT NULL,
    "provider" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "precision" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetPrice" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerTransaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "unit_price" DECIMAL(18,8) NOT NULL,
    "total_amount" DECIMAL(18,8) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "totalQuantity" DECIMAL(18,8) NOT NULL,
    "averageCost" DECIMAL(18,8) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "targetValue" DECIMAL(18,8) NOT NULL,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_code_key" ON "Asset"("code");

-- CreateIndex
CREATE INDEX "AssetPrice_assetId_createdAt_idx" ON "AssetPrice"("assetId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerTransaction_user_id_asset_id_created_at_idx" ON "LedgerTransaction"("user_id", "asset_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_userId_assetId_key" ON "Holding"("userId", "assetId");

-- CreateIndex
CREATE INDEX "Alert_userId_assetId_idx" ON "Alert"("userId", "assetId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "AssetPrice" ADD CONSTRAINT "AssetPrice_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;
