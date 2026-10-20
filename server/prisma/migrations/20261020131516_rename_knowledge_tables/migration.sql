-- AlterTable
ALTER TABLE "knowledge_entries" RENAME CONSTRAINT "Item_pkey" TO "knowledge_entries_pkey";

-- AlterTable
ALTER TABLE "knowledge_segments" RENAME CONSTRAINT "Chunk_pkey" TO "knowledge_segments_pkey";
