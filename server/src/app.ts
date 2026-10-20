import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { apiRouter } from "./routes/api.routes.js";

export const app = express();
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRouter);
app.use(errorHandler);
