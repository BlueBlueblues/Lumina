import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { type FastifyError } from "fastify";
import { config, corsOrigins } from "./config.js";
import { closePool, isDatabaseConfigured } from "./database/connection.js";
import { AppError } from "./lib/errors.js";
import { deepSeek } from "./providers/deepseek.provider.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { luminaRoutes } from "./routes/lumina.routes.js";
import { syncRoutes } from "./routes/sync.routes.js";

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    redact: ["req.headers.authorization", "req.headers.cookie"],
  },
  bodyLimit: 16 * 1024 * 1024,
  trustProxy: config.TRUST_PROXY,
});

await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

await app.register(cors, {
  origin: corsOrigins.includes("*") ? true : corsOrigins,
});

app.setNotFoundHandler((_request, reply) =>
  reply.status(404).send({
    error: { code: "not_found", message: "Not found." },
  }),
);

app.setErrorHandler((error: FastifyError, request, reply) => {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      request.log.error({ err: error, code: error.code }, "request failed");
    }
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        ...(error.statusCode < 500 && error.details !== undefined
          ? { details: error.details }
          : {}),
      },
    });
  }

  if (error.statusCode === 413) {
    return reply.status(413).send({
      error: {
        code: "payload_too_large",
        message: "Request body is too large.",
      },
    });
  }

  request.log.error({ err: error }, "unhandled error");
  return reply.status(500).send({
    error: { code: "internal_error", message: "Internal server error." },
  });
});

app.get("/api/health", async () => ({
  ok: true,
  service: "lumina-backend",
  version: "0.1.0",
  time: new Date().toISOString(),
  syncConfigured: isDatabaseConfigured(),
  aiConfigured: deepSeek.configured,
}));

await app.register(aiRoutes, { prefix: "/api/ai" });
await app.register(luminaRoutes, { prefix: "/api/lumina" });
await app.register(syncRoutes, { prefix: "/api/sync" });

app.addHook("onClose", async () => {
  await closePool();
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, "shutting down");
  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
  app.log.info(
    {
      syncConfigured: isDatabaseConfigured(),
      aiConfigured: deepSeek.configured,
    },
    "Lumina backend ready",
  );
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
