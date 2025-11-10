-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMetadata" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT,
    "hasTask" BOOLEAN NOT NULL DEFAULT false,
    "taskDescription" TEXT,
    "taskStatus" TEXT,

    CONSTRAINT "EmailMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Email_from_idx" ON "Email"("from");

-- CreateIndex
CREATE INDEX "Email_subject_idx" ON "Email"("subject");

-- CreateIndex
CREATE INDEX "Email_processed_idx" ON "Email"("processed");

-- CreateIndex
CREATE INDEX "Email_receivedAt_idx" ON "Email"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMetadata_emailId_key" ON "EmailMetadata"("emailId");

-- CreateIndex
CREATE INDEX "EmailMetadata_category_idx" ON "EmailMetadata"("category");

-- CreateIndex
CREATE INDEX "EmailMetadata_priority_idx" ON "EmailMetadata"("priority");

-- CreateIndex
CREATE INDEX "EmailMetadata_hasTask_idx" ON "EmailMetadata"("hasTask");

-- CreateIndex
CREATE INDEX "EmailMetadata_taskStatus_idx" ON "EmailMetadata"("taskStatus");

-- AddForeignKey
ALTER TABLE "EmailMetadata" ADD CONSTRAINT "EmailMetadata_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
