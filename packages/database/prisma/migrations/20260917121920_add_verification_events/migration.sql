-- CreateEnum
CREATE TYPE "VerificationEventResult" AS ENUM ('VERIFIED', 'PREVIOUSLY_VERIFIED', 'UNKNOWN', 'SUSPICIOUS');

-- CreateTable
CREATE TABLE "VerificationEvent" (
    "id" TEXT NOT NULL,
    "verificationCodeId" TEXT,
    "token" TEXT,
    "result" "VerificationEventResult" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationEvent_verificationCodeId_idx" ON "VerificationEvent"("verificationCodeId");

-- CreateIndex
CREATE INDEX "VerificationEvent_result_idx" ON "VerificationEvent"("result");

-- CreateIndex
CREATE INDEX "VerificationEvent_createdAt_idx" ON "VerificationEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "VerificationEvent" ADD CONSTRAINT "VerificationEvent_verificationCodeId_fkey" FOREIGN KEY ("verificationCodeId") REFERENCES "VerificationCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
