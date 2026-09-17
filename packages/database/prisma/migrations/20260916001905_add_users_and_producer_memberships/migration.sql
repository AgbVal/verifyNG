-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProducerRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProducerMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "role" "ProducerRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProducerMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ProducerMembership_producerId_idx" ON "ProducerMembership"("producerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProducerMembership_userId_producerId_key" ON "ProducerMembership"("userId", "producerId");

-- AddForeignKey
ALTER TABLE "ProducerMembership" ADD CONSTRAINT "ProducerMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducerMembership" ADD CONSTRAINT "ProducerMembership_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
