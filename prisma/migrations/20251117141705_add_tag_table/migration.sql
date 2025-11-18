-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_descripcion_key" ON "Tag"("descripcion");

-- CreateIndex
CREATE INDEX "Tag_descripcion_idx" ON "Tag"("descripcion");
