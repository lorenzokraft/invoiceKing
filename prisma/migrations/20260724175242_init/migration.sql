-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'DRAFT', 'PACKING_SLIP', 'CREDIT_NOTE', 'RETURN_FORM', 'RECEIPT', 'QUOTE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('OPEN', 'COMPLETED', 'SENT', 'VOID');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'PREMIUM');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "storeName" TEXT,
    "storeUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "taxNumber" TEXT,
    "address" TEXT,
    "addressFormat" TEXT NOT NULL DEFAULT 'United Arab Emirates',
    "dateFormat" TEXT NOT NULL DEFAULT 'd MMMM, yyyy',
    "timeFormat" TEXT NOT NULL DEFAULT 'none',
    "currencyFormat" TEXT NOT NULL DEFAULT '{currency_symbol} {price_with_dot}',
    "priceDecimals" INTEGER NOT NULL DEFAULT 2,
    "primaryLocale" TEXT NOT NULL DEFAULT 'en',
    "additionalLocales" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useCustomerCurrency" BOOLEAN NOT NULL DEFAULT false,
    "creditNoteOnCancel" BOOLEAN NOT NULL DEFAULT false,
    "creditNoteOnFullRefund" BOOLEAN NOT NULL DEFAULT false,
    "creditNoteOnPartialRefund" BOOLEAN NOT NULL DEFAULT false,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'OPEN',
    "number" TEXT NOT NULL,
    "orderId" TEXT,
    "orderName" TEXT,
    "draftOrderId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "currency" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "payload" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyUsage" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "invoiceCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");

-- CreateIndex
CREATE INDEX "Document_shop_type_idx" ON "Document"("shop", "type");

-- CreateIndex
CREATE INDEX "Document_shop_orderId_idx" ON "Document"("shop", "orderId");

-- CreateIndex
CREATE INDEX "Template_shop_type_idx" ON "Template"("shop", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyUsage_shop_periodStart_key" ON "MonthlyUsage"("shop", "periodStart");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_shop_fkey" FOREIGN KEY ("shop") REFERENCES "ShopSettings"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_shop_fkey" FOREIGN KEY ("shop") REFERENCES "ShopSettings"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyUsage" ADD CONSTRAINT "MonthlyUsage_shop_fkey" FOREIGN KEY ("shop") REFERENCES "ShopSettings"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;
