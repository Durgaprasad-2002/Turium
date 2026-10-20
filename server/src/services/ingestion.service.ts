import { randomUUID } from "node:crypto";
import { SourceType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { chunkText } from "./chunking.service.js";
import { createEmbeddings } from "./embedding.service.js";
import { extractUrlContent } from "./url-extractor.service.js";
import { deleteVectors, upsertVectors } from "./vector-store.service.js";

export type IngestInput =
  | { sourceType: "NOTE"; content: string; title?: string }
  | { sourceType: "URL"; url: string };

export async function ingestContent(input: IngestInput) {
  const extracted =
    input.sourceType === "URL" ? await extractUrlContent(input.url) : null;

  const rawContent =
    extracted?.content ?? (input.sourceType === "NOTE" ? input.content : "");
  const title =
    extracted?.title ??
    (input.sourceType === "NOTE" ? input.title?.trim() || null : null);
  const sourceUrl = input.sourceType === "URL" ? input.url : null;

  const contentChunks = chunkText(rawContent);
  if (!contentChunks.length) throw new Error("No usable content was provided.");

  const entryId = randomUUID();
  const chunkRows = contentChunks.map((content, chunkIndex) => ({
    id: randomUUID(),
    entryId,
    content,
    chunkIndex,
  }));
  const embeddings = await createEmbeddings(contentChunks);

  try {
    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.knowledgeEntry.create({
        data: {
          id: entryId,
          sourceType: input.sourceType as SourceType,
          title,
          sourceUrl,
          rawContent,
        },
      });
      await tx.knowledgeSegment.createMany({ data: chunkRows });
      return created;
    });

    await upsertVectors(
      chunkRows.map((chunk, index) => ({
        id: chunk.id,
        vector: embeddings[index],
        entryId,
        sourceType: input.sourceType as SourceType,
        title,
        sourceUrl,
      })),
    );
    return { entry, segmentCount: chunkRows.length };
  } catch (error) {
    await Promise.allSettled([
      prisma.knowledgeEntry.delete({ where: { id: entryId } }),
      deleteVectors(chunkRows.map((chunk) => chunk.id)),
    ]);
    throw error;
  }
}
