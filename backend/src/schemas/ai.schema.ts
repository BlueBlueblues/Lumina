import { z } from "zod";
import { isoDateSchema, memoryIdSchema } from "./memory.schema.js";

export const imageDataUrlSchema = z
  .string()
  .max(12_000_000)
  .regex(
    /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/,
    "Expected a base64 image data URL",
  );

export const visionRequestSchema = z.object({
  imageDataUrl: imageDataUrlSchema,
  prompt: z.string().trim().max(1_000).optional(),
  locale: z.enum(["zh-CN", "en"]).default("zh-CN"),
});

export const writingRequestSchema = z.object({
  facts: z.array(z.string().trim().min(1).max(2_000)).min(1).max(20),
  mood: z.string().trim().max(40).optional(),
  tone: z.string().trim().max(40).optional(),
  locale: z.enum(["zh-CN", "en"]).default("zh-CN"),
});

export const conversationRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(8_000),
      }),
    )
    .min(1)
    .max(40),
  context: z.string().max(20_000).optional(),
});

export const recallRequestSchema = z.object({
  query: z.string().trim().min(1).max(500),
  memories: z
    .array(
      z.object({
        id: memoryIdSchema,
        title: z.string().max(200).default(""),
        content: z.string().max(20_000).default(""),
        recordDate: isoDateSchema.optional(),
        mood: z.string().max(40).optional(),
        tags: z.array(z.string().max(40)).max(30).default([]),
      }),
    )
    .min(1)
    .max(200),
  limit: z.number().int().min(1).max(50).default(10),
});

export const visionResultSchema = z.object({
  facts: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  mood: z.string().trim().max(40).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

export const writingResultSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(20_000),
});

export const conversationResultSchema = z.object({
  reply: z.string().trim().min(1).max(8_000),
});

export const recallResultSchema = z.object({
  results: z
    .array(
      z.object({
        id: memoryIdSchema,
        score: z.number().min(0).max(1),
        reason: z.string().max(300).default(""),
      }),
    )
    .max(50),
});

export type VisionRequest = z.infer<typeof visionRequestSchema>;
export type VisionResult = z.infer<typeof visionResultSchema>;
export type WritingRequest = z.infer<typeof writingRequestSchema>;
export type WritingResult = z.infer<typeof writingResultSchema>;
export type ConversationRequest = z.infer<typeof conversationRequestSchema>;
export type RecallRequest = z.infer<typeof recallRequestSchema>;
export type RecallResult = z.infer<typeof recallResultSchema>;
