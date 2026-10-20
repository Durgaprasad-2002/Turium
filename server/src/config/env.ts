import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"),
});

const environmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  QDRANT_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_EMBEDDING_MODEL: z.string().min(1),
  OPENAI_CHAT_MODEL: z.string().min(1),
  PORT: z.coerce.number().int().positive(),
  CLIENT_ORIGIN: z.string().url(),
});

export const env = environmentSchema.parse(process.env);
