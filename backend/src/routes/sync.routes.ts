import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { AppError } from "../lib/errors.js";
import { parseWith } from "../lib/parse.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import {
  disableRequestSchema,
  pairRequestSchema,
  pullQuerySchema,
  pushRequestSchema,
  resolveRequestSchema,
} from "../schemas/sync.schema.js";
import {
  authenticate,
  createVault,
  disableSync,
  issuePairingCode,
  joinVault,
  pullChanges,
  pushChanges,
  recoverVault,
  resolveConflict,
} from "../services/sync.service.js";

function requireBearer(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "unauthorized", "Device token is required.");
  }
  const token = header.slice("Bearer ".length).trim();
  if (token.length < 20 || token.length > 200) {
    throw new AppError(401, "unauthorized", "Device token is invalid.");
  }
  return token;
}

export const syncRoutes: FastifyPluginAsync = async (app) => {
  const pairingRateLimit = createRateLimiter(30);

  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("Cache-Control", "no-store");
    return payload;
  });

  app.post("/pair", { preHandler: pairingRateLimit }, async (request) => {
    const input = parseWith(pairRequestSchema, request.body, "pair request");

    switch (input.mode) {
      case "create":
        return createVault(input.deviceName);
      case "join":
        return joinVault(input.code, input.deviceName);
      case "recover":
        return recoverVault(input.recoveryCode, input.deviceName);
      case "new-code": {
        const auth = await authenticate(requireBearer(request));
        return issuePairingCode(auth);
      }
    }
  });

  app.post("/push", async (request) => {
    const auth = await authenticate(requireBearer(request));
    const input = parseWith(pushRequestSchema, request.body, "push request");
    return pushChanges(auth, input.changes);
  });

  app.get("/pull", async (request) => {
    const auth = await authenticate(requireBearer(request));
    const query = parseWith(pullQuerySchema, request.query, "pull query");
    return pullChanges(auth, query.cursor, query.limit);
  });

  app.post("/resolve", async (request) => {
    const auth = await authenticate(requireBearer(request));
    const input = parseWith(resolveRequestSchema, request.body, "resolve request");
    return resolveConflict(auth, input);
  });

  app.post("/disable", async (request) => {
    const auth = await authenticate(requireBearer(request));
    const input = parseWith(disableRequestSchema, request.body, "disable request");
    return disableSync(auth, input);
  });
};
