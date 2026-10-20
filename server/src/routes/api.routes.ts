import { Router } from "express";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";
import { ingestContent } from "../services/ingestion.service.js";
import { answerQuestion } from "../services/rag.service.js";

const noteSchema = z
  .object({
    sourceType: z.literal("NOTE"),
    content: z
      .string()
      .trim()
      .min(1, "Note content is required.")
      .max(100_000, "Note content must be 100,000 characters or fewer."),
    title: z
      .string()
      .trim()
      .min(1)
      .max(200, "Title must be 200 characters or fewer.")
      .optional(),
  })
  .strict();

const urlSchema = z
  .object({
    sourceType: z.literal("URL"),
    url: z
      .string()
      .trim()
      .max(2_000, "URL must be 2,000 characters or fewer.")
      .url("Enter a valid URL.")
      .refine((value) => {
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:";
      }, "URL must use http or https."),
  })
  .strict();

const ingestSchema = z.discriminatedUnion("sourceType", [
  noteSchema,
  urlSchema,
]);

const querySchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Question is required.")
      .max(2_000, "Question must be 2,000 characters or fewer."),
  })
  .strict();
const entryParamsSchema = z.object({ id: z.string().uuid() });

export const apiRouter = Router();

apiRouter.use((req, res, next) => {
  if (req.method !== "POST" || req.is("application/json")) return next();
  res.status(415).json({ error: "Content-Type must be application/json." });
});

apiRouter.post("/ingest", async (req, res, next) => {
  try {
    const result = await ingestContent(ingestSchema.parse(req.body));
    logger.info("knowledge.entry.created", {
      requestId: res.locals.requestId,
      entryId: result.entry.id,
      sourceType: result.entry.sourceType,
      segmentCount: result.segmentCount,
    });
    res
      .status(201)
      .json({ item: result.entry, chunkCount: result.segmentCount });
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/items", async (_req, res, next) => {
  try {
    const entries = await prisma.knowledgeEntry.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({
      items: entries.map((entry) => ({
        ...entry,
        preview: entry.rawContent.slice(0, 180),
      })),
    });
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/items/:id", async (req, res, next) => {
  try {
    const entry = await prisma.knowledgeEntry.findUnique({
      where: entryParamsSchema.parse(req.params),
    });
    if (!entry)
      return res.status(404).json({ error: "Knowledge entry not found." });
    res.json({ item: entry });
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/query", async (req, res, next) => {
  try {
    const result = await answerQuestion(querySchema.parse(req.body).question);
    logger.info("knowledge.query.completed", {
      requestId: res.locals.requestId,
      sourceCount: result.sources.length,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
