import type { FastifyPluginAsync } from "fastify";
import { sentenceSources, streamGroundedText } from "../services/grounded-writing.js";
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

  app.post("/text/integrate/stream", { preHandler: rateLimit }, async (request, reply) => {
    const input=parseWith(luminaTextIntegrateRequestSchema,request.body,"text integrate request");
    const sources=sentenceSources(input.turns.filter(t=>t.role==="me").map(t=>t.text));
    const controller=new AbortController();
    const abort=()=>controller.abort();
    reply.hijack();
    reply.raw.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-store","X-Accel-Buffering":"no"});
    reply.raw.on("close",abort);
    const heartbeat=setInterval(()=>{if(!reply.raw.destroyed)reply.raw.write(": keepalive\n\n");},15_000); heartbeat.unref();
    const send=(event:string,data:unknown)=>{if(!reply.raw.destroyed)reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);};
    send("stage",{text:"正在按原句整理…"});
    try { for await(const event of streamGroundedText(sources,controller.signal)) send(event.type,event); }
    catch { if(!controller.signal.aborted)send("error",{message:"这次整理未完成，请重试；原话仍保留。"}); }
    finally { clearInterval(heartbeat);reply.raw.off("close",abort);reply.raw.end(); }
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
