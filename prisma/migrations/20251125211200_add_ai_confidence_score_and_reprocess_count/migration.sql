-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "reprocessCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AIConfidenceScore" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "clarityScore" DOUBLE PRECISION NOT NULL,
    "patternMatchScore" DOUBLE PRECISION NOT NULL,
    "completenessScore" DOUBLE PRECISION NOT NULL,
    "priorityCoherenceScore" DOUBLE PRECISION NOT NULL,
    "taskValidityScore" DOUBLE PRECISION NOT NULL,
    "tagsQualityScore" DOUBLE PRECISION NOT NULL,
    "feedbackPenalty" DOUBLE PRECISION NOT NULL,
    "interpretation" TEXT NOT NULL,
    "requiresReview" BOOLEAN NOT NULL,
    "reviewPriority" INTEGER NOT NULL,
    "confidenceReason" TEXT NOT NULL,
    "breakdown" JSONB,

    CONSTRAINT "AIConfidenceScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIConfidenceScore_emailId_key" ON "AIConfidenceScore"("emailId");

-- CreateIndex
CREATE INDEX "AIConfidenceScore_overallScore_idx" ON "AIConfidenceScore"("overallScore");

-- CreateIndex
CREATE INDEX "AIConfidenceScore_reviewPriority_idx" ON "AIConfidenceScore"("reviewPriority");

-- AddForeignKey
ALTER TABLE "AIConfidenceScore" ADD CONSTRAINT "AIConfidenceScore_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
