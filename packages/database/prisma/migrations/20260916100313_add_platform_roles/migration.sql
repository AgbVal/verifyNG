-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('REVIEWER', 'OPERATIONS_ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "platformRole" "PlatformRole";
