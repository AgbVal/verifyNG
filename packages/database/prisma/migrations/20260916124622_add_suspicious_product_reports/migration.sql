-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('PACKAGING_ISSUE', 'PRODUCT_QUALITY', 'CODE_REUSED', 'DETAILS_MISMATCH', 'OTHER');

-- CreateTable
CREATE TABLE "SuspiciousProductReport" (
    "id" TEXT NOT NULL,
    "verificationCodeId" TEXT,
    "token" TEXT,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuspiciousProductReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuspiciousProductReport_verificationCodeId_idx" ON "SuspiciousProductReport"("verificationCodeId");

-- CreateIndex
CREATE INDEX "SuspiciousProductReport_status_idx" ON "SuspiciousProductReport"("status");

-- CreateIndex
CREATE INDEX "SuspiciousProductReport_createdAt_idx" ON "SuspiciousProductReport"("createdAt");

-- AddForeignKey
ALTER TABLE "SuspiciousProductReport" ADD CONSTRAINT "SuspiciousProductReport_verificationCodeId_fkey" FOREIGN KEY ("verificationCodeId") REFERENCES "VerificationCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
