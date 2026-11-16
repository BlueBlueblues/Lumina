import type { FastifyPluginAsync } from "fastify";
import { config } from "../config.js";
import { parseWith } from "../lib/parse.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import {
  conversationRequestSchema,
  recallRequestSchema,
  visionRequestSchema,
  writingRequestSchema,
} from "../schemas/ai.schema.js";
import { converse } from "../services/conversation.service.js";
import { rankMemories } from "../services/recall.service.js";
import { analyzeImage } from "../services/vision.service.js";
import { writeDiary } from "../services/writing.service.js";

export const aiRoutes: FastifyPluginAsync = async (app) => {
  const rateLimit = createRateLimiter(config.AI_RATE_LIMIT_PER_MINUTE);

  app.post("/vision", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(visionRequestSchema, request.body, "vision request");
    return analyzeImage(input);
  });

  app.post("/writing", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(writingRequestSchema, request.body, "writing request");
    return writeDiary(input);
  });

  app.post("/conversation", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(
      conversationRequestSchema,
      request.body,
      "conversation request",
    );
    return converse(input);
  });

  app.post("/recall", { preHandler: rateLimit }, async (request) => {
    const input = parseWith(recallRequestSchema, request.body, "recall request");
    return rankMemories(input);
  });
};
