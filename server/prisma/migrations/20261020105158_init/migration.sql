-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('NOTE', 'URL');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "title" TEXT,
    "sourceUrl" TEXT,
    "rawContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chunk_itemId_idx" ON "Chunk"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Chunk_itemId_chunkIndex_key" ON "Chunk"("itemId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
