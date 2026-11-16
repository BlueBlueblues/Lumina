import type { FastifyPluginAsync } from "fastify";
import { config } from "../config.js";
import { parseWith } from "../lib/parse.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import {
  luminaObserveRequestSchema,
  luminaPhotoQuestionRequestSchema,
  luminaTextIntegrateRequestSchema,
  luminaTextReplyRequestSchema,
  luminaWriteRequestSchema,
} from "../schemas/lumina.schema.js";
import {
  integrateLuminaText,
  observeLuminaPhoto,
  questionLuminaPhoto,
  replyLuminaText,
  writeLuminaText,
} from "../services/lumina.service.js";

export const luminaRoutes: FastifyPluginAsync = async (app) => {
  const rateLimit = createRateLimiter(config.AI_RATE_LIMIT_PER_MINUTE);

  app.post("/observe", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(
      luminaObserveRequestSchema,
      request.body,
      "observe request",
    );
    return observeLuminaPhoto(input);
  });

  app.post("/write", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(
      luminaWriteRequestSchema,
      request.body,
      "write request",
    );
    return writeLuminaText(input);
  });

  app.post("/text/reply", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(
      luminaTextReplyRequestSchema,
      request.body,
      "text reply request",
    );
    return replyLuminaText(input);
  });

  app.post("/text/integrate", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(
      luminaTextIntegrateRequestSchema,
      request.body,
      "text integrate request",
    );
    return integrateLuminaText(input);
  });

  app.post("/photo/question", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(
      luminaPhotoQuestionRequestSchema,
      request.body,
      "photo question request",
    );
    return questionLuminaPhoto(input);
  });
};
