import { env } from "../config/env.js";
import { createOpenAiClient } from "../lib/openai.js";

export class AiConfigurationError extends Error {}

export async function createEmbeddings(inputs: string[]): Promise<number[][]> {
  if (!env.OPENAI_API_KEY)
    throw new AiConfigurationError("OPENAI_API_KEY is not configured.");

  const response = await createOpenAiClient().embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input: inputs,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.embedding);
}
