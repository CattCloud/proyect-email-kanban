-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "rejectedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Email_rejectedAt_idx" ON "Email"("rejectedAt");
