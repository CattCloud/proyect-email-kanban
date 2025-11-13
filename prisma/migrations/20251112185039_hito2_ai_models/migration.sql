-- AlterTable
ALTER TABLE "EmailMetadata" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "emailMetadataId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "tags" TEXT[],
    "participants" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'todo',

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_emailMetadataId_idx" ON "Task"("emailMetadataId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "EmailMetadata_emailId_idx" ON "EmailMetadata"("emailId");

-- CreateIndex
CREATE INDEX "EmailMetadata_createdAt_idx" ON "EmailMetadata"("createdAt");

-- CreateIndex
CREATE INDEX "EmailMetadata_category_priority_hasTask_taskStatus_idx" ON "EmailMetadata"("category", "priority", "hasTask", "taskStatus");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_emailMetadataId_fkey" FOREIGN KEY ("emailMetadataId") REFERENCES "EmailMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
