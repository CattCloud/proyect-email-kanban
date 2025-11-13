-- AlterTable
ALTER TABLE "public"."Email" ADD COLUMN     "idEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Email_idEmail_key" ON "public"."Email"("idEmail");

-- CreateIndex
CREATE INDEX "Email_idEmail_idx" ON "public"."Email"("idEmail");