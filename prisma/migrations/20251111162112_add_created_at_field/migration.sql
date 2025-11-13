-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Email_createdAt_idx" ON "Email"("createdAt");
