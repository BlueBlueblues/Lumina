import type { FastifyPluginAsync } from "fastify";
import { config } from "../config.js";
import { parseWith } from "../lib/parse.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import { startRecallSchema, continueRecallSchema } from "../schemas/evidence.schema.js";
import { startEvidenceRecall, continueEvidenceRecall } from "../services/evidence-agent.js";

export const evidenceRoutes: FastifyPluginAsync = async (app) => {
  const rateLimit = createRateLimiter(config.AI_RATE_LIMIT_PER_MINUTE);
  app.addHook("onSend", async (_request, reply, payload) => { reply.header("Cache-Control", "no-store"); return payload; });
  app.post("/start", { preHandler: rateLimit }, async (request) => startEvidenceRecall(parseWith(startRecallSchema, request.body, "recall request")));
  app.post("/continue", { preHandler: rateLimit }, async (request) => continueEvidenceRecall(parseWith(continueRecallSchema, request.body, "tool results")));
};
