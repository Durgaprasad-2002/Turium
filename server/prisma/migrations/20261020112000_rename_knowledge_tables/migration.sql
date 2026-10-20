ALTER TABLE "Item" RENAME TO "knowledge_entries";
ALTER TABLE "Chunk" RENAME TO "knowledge_segments";
ALTER TABLE "knowledge_segments" RENAME COLUMN "itemId" TO "entryId";
ALTER INDEX "Chunk_itemId_idx" RENAME TO "knowledge_segments_entryId_idx";
ALTER INDEX "Chunk_itemId_chunkIndex_key" RENAME TO "knowledge_segments_entryId_chunkIndex_key";
ALTER TABLE "knowledge_segments" RENAME CONSTRAINT "Chunk_itemId_fkey" TO "knowledge_segments_entryId_fkey";
