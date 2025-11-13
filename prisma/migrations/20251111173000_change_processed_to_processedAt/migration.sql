-- CreateEnum
CREATE TYPE "Email_ProcessStatus" AS ENUM ('NOT_PROCESSED', 'PROCESSED');

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "processedAt" TIMESTAMP(3);

-- Migrate data: convert processed=true to processedAt=now()
UPDATE "Email" SET "processedAt" = now() WHERE "processed" = true;

-- DropColumn
ALTER TABLE "Email" DROP COLUMN "processed";

-- DropEnum
DROP TYPE IF EXISTS "Email_ProcessStatus";

-- CreateIndex
CREATE INDEX "Email_processedAt_idx" ON "Email"("processedAt");