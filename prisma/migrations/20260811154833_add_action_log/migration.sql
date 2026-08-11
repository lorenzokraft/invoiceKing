-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('PRINT', 'DOWNLOAD', 'SEND', 'UPLOAD');

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "orderId" TEXT,
    "orderName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionLog_shop_createdAt_idx" ON "ActionLog"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "ActionLog_shop_actionType_createdAt_idx" ON "ActionLog"("shop", "actionType", "createdAt");
