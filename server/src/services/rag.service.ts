import { env } from "../config/env.js";
import { createOpenAiClient } from "../lib/openai.js";
import { prisma } from "../lib/prisma.js";
import { AiConfigurationError, createEmbeddings } from "./embedding.service.js";
import { searchVectors } from "./vector-store.service.js";

export async function answerQuestion(question: string) {
  if (!env.OPENAI_API_KEY)
    throw new AiConfigurationError("OPENAI_API_KEY is not configured.");

  const [questionEmbedding] = await createEmbeddings([question]);
  const matches = await searchVectors(questionEmbedding, 5);
  const matchIds = matches.map((match) => String(match.id));
  if (!matchIds.length)
    return {
      answer:
        "I could not find relevant information in your saved content to answer that question.",
      sources: [],
    };

  const chunks = await prisma.knowledgeSegment.findMany({
    where: { id: { in: matchIds } },
    include: { entry: true },
  });
  const byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const retrievedChunks = matches.flatMap((match) => {
    const chunk = byId.get(String(match.id));
    return chunk ? [{ chunk, score: match.score }] : [];
  });

  const groups = new Map<
    string,
    {
      entryId: string;
      chunkId: string;
      title: string;
      sourceUrl: string | null;
      snippet: string;
      score: number;
      content: string[];
    }
  >();
  for (const { chunk, score } of retrievedChunks) {
    const group = groups.get(chunk.entryId);
    if (group) {
      group.content.push(chunk.content);
      continue;
    }
    groups.set(chunk.entryId, {
      entryId: chunk.entryId,
      chunkId: chunk.id,
      title: chunk.entry.title ?? "Untitled content",
      sourceUrl: chunk.entry.sourceUrl,
      snippet: chunk.content.slice(0, 320),
      score,
      content: [chunk.content],
    });
  }
  const groupedSources = [...groups.values()];

  if (!groupedSources.length)
    return {
      answer:
        "I could not find relevant information in your saved content to answer that question.",
      sources: [],
    };

  const context = groupedSources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.title}\n${source.content.join("\n\n")}`,
    )
    .join("\n\n");

  const completion = await createOpenAiClient().chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Answer only from the provided saved-content context. If context does not support an answer, say so plainly. Cite sources using bracket numbers such as [1].",
      },
      {
        role: "user",
        content: `Question: ${question}\n\nSaved-content context:\n${context}`,
      },
    ],
  });

  return {
    answer:
      completion.choices[0]?.message.content ??
      "I could not generate an answer.",
    sources: groupedSources.map(({ content: _content, ...source }) => source),
  };
}
