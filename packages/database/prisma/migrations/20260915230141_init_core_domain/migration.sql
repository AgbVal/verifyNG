-- CreateEnum
CREATE TYPE "ProducerStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VerificationCodeStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateTable
CREATE TABLE "Producer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "cacNumber" TEXT,
    "status" "ProducerStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT,
    "size" TEXT,
    "barcode" TEXT,
    "nafdacNumber" TEXT,
    "imageUrl" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufacturedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "VerificationCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstScannedAt" TIMESTAMP(3),
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producer_cacNumber_key" ON "Producer"("cacNumber");

-- CreateIndex
CREATE INDEX "Product_producerId_idx" ON "Product"("producerId");

-- CreateIndex
CREATE INDEX "Batch_productId_idx" ON "Batch"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_productId_batchNumber_key" ON "Batch"("productId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_token_key" ON "VerificationCode"("token");

-- CreateIndex
CREATE INDEX "VerificationCode_batchId_idx" ON "VerificationCode"("batchId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
