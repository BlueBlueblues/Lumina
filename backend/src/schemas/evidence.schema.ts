import { z } from "zod";

export const searchArgsSchema = z.object({
  terms: z.array(z.string().trim().min(1).max(60)).min(1).max(12),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  limit: z.number().int().min(1).max(12).default(8),
});
export const sourceSchema = z.object({
  field: z.string().max(80),
  text: z.string().max(8_000),
  origin: z.enum(["user", "image_model", "metadata"]),
});
export const recallMemorySchema = z.object({
  id: z.string().min(1).max(140),
  title: z.string().max(200),
  date: z.string().max(40),
  sources: z.array(sourceSchema).max(160),
  generated: z.string().max(2_000).default(""),
});
export type EvidenceMemory = z.infer<typeof recallMemorySchema>;
export const startRecallSchema = z.object({
  query: z.string().trim().min(1).max(1_000),
  corrections: z.array(z.string().trim().min(1).max(500)).max(8).default([]),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const continueRecallSchema = z.object({
  sessionId: z.string().uuid(),
  results: z.array(z.object({ callId: z.string().min(1).max(200), result: z.unknown() })).min(1).max(4),
});
export const resultSchema = z.object({
  clues: z.array(z.object({ id: z.string().max(30), text: z.string().min(1).max(200) })).min(1).max(8),
  comparisons: z.array(z.object({
    memoryId: z.string().max(140), clueId: z.string().max(30),
    status: z.enum(["supported", "conflict", "unknown"]),
    sources: z.array(z.preprocess((value) => {
      if (value && typeof value === "object") {
        const item = value as Record<string, unknown>;
        return { ...item, quote: item.quote ?? item.text };
      }
      return value;
    }, z.object({ field: z.string().max(80), quote: z.string().min(1).max(600) }))).max(3),
  })).max(64),
  clarification: z.object({
    question: z.string().max(240),
    options: z.array(z.object({ label: z.string().min(1).max(60), text: z.string().min(1).max(300) })).max(3),
  }).nullable().default(null),
});
export type EvidenceResult = z.infer<typeof resultSchema>;
