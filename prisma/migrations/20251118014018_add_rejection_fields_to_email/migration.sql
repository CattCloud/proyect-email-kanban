-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "previousAIResult" JSONB,
ADD COLUMN     "rejectionReason" TEXT;
