import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { UrlExtractionError } from "../services/url-extractor.service.js";
import { AiConfigurationError } from "../services/embedding.service.js";
import { errorContext, logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const upstreamStatus =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : undefined;

  const errorType =
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    typeof error.type === "string"
      ? error.type
      : undefined;

  const statusCode =
    error instanceof ZodError || error instanceof SyntaxError
      ? 400
      : errorType === "entity.too.large"
        ? 413
        : error instanceof AiConfigurationError
          ? 503
          : error instanceof UrlExtractionError
            ? 422
            : upstreamStatus === 401 ||
                upstreamStatus === 429 ||
                (upstreamStatus !== undefined && upstreamStatus >= 500)
              ? 502
              : 500;

  logger.error("http.request.failed", {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.path,
    statusCode,
    ...errorContext(error),
  });

  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: error.flatten() });
  }
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  if (errorType === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }
  if (error instanceof AiConfigurationError) {
    return res.status(503).json({
      error:
        "Add OPENAI_API_KEY to server/.env before using AI ingestion or questions.",
    });
  }
  if (error instanceof UrlExtractionError) {
    return res.status(422).json({ error: error.message });
  }
  if (
    upstreamStatus === 401 ||
    upstreamStatus === 429 ||
    (upstreamStatus !== undefined && upstreamStatus >= 500)
  ) {
    return res
      .status(502)
      .json({ error: "An upstream service failed. Please try again." });
  }
  return res
    .status(500)
    .json({ error: "An unexpected server error occurred." });
};
