import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const server = app.listen(env.PORT, () =>
  logger.info("server.started", {
    port: env.PORT,
    environment: process.env.NODE_ENV ?? "development",
  }),
);

process.on("SIGTERM", () =>
  server.close(() => logger.info("server.stopped", { signal: "SIGTERM" })),
);
