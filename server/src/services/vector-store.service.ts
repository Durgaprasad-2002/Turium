import type { SourceType } from "@prisma/client";
import { qdrant } from "../lib/qdrant.js";

const COLLECTION_NAME = "knowledge_chunks";
const VECTOR_SIZE = 1536;

type VectorRecord = {
  id: string;
  vector: number[];
  entryId: string;
  sourceType: SourceType;
  title: string | null;
  sourceUrl: string | null;
};

export async function ensureCollection(): Promise<void> {
  const exists = await qdrant.collectionExists(COLLECTION_NAME);
  if (!exists.exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
  }
}

export async function upsertVectors(records: VectorRecord[]): Promise<void> {
  await ensureCollection();
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: records.map((record) => ({
      id: record.id,
      vector: record.vector,
      payload: {
        chunkId: record.id,
        entryId: record.entryId,
        sourceType: record.sourceType,
        title: record.title,
        sourceUrl: record.sourceUrl,
      },
    })),
  });
}

export async function searchVectors(
  vector: number[],
  limit = 5,
  scoreThreshold = 0.45,
) {
  await ensureCollection();
  return qdrant.search(COLLECTION_NAME, {
    vector,
    limit,
    score_threshold: scoreThreshold,
    with_payload: true,
  });
}

export async function deleteVectors(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await qdrant.delete(COLLECTION_NAME, { wait: true, points: ids });
}
