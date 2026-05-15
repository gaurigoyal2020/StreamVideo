import express from "express";
import dotenv from "dotenv";

// Load env FIRST before anything else imports from config/env.js
dotenv.config();

import { validateEnv, env } from "./config/env.js";
import { corsConfig } from "./config/cors.config.js";
import { setupMiddlewares } from "./config/app.config.js";
import videoRoutes from "./routes/video.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { ensureUploadsDir } from "./utils/file.utils.js";
import { logger } from "./utils/logger.js";

// ── Startup validation ────────────────────────────────────────────────────────
validateEnv();
ensureUploadsDir();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(corsConfig);
setupMiddlewares(app);

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "VideoTranscribe API", version: "1.0.0" });
});

// All feature routes live under /api
app.use("/api", videoRoutes);

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(env.port, () => {
  logger.info(`Server running`, { port: env.port, env: env.nodeEnv });
  logger.info(`Health check: http://localhost:${env.port}/health`);
  logger.info(`Upload endpoint: POST http://localhost:${env.port}/api/upload`);
});
