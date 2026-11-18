import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const memoryIdSchema = z.string().trim().min(1).max(140);

export const originalRecordSchema = z.object({
  version: z.literal(1),
  note: z.string().max(100_000),
  extra: z.string().max(50_000),
  chat: z.array(z.object({ role: z.enum(["me", "it"]), text: z.string().max(16_000), question: z.string().max(1_000).optional() })).max(100),
}).refine(value => JSON.stringify(value).length <= 200_000, "Original source text exceeds sync limit");

export const memoryContentSchema = z.object({
  title: z.string().max(200).default(""),
  content: z.string().max(200_000).default(""),
  recordDate: isoDateSchema.optional(),
  mood: z.string().trim().max(40).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  aiFacts: z.array(z.string().trim().min(1).max(2_000)).max(50).default([]),
  supplement: z.string().max(50_000).optional(),
  original: originalRecordSchema.nullable().optional(),
  hasPhoto: z.boolean().default(false),
});

export const memorySyncSchema = memoryContentSchema.extend({
  id: memoryIdSchema,
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  revision: z.number().int().nonnegative(),
  deviceId: z.string().uuid(),
  deletedAt: z.number().int().nonnegative().nullable().optional(),
});

export type MemoryContent = z.infer<typeof memoryContentSchema>;
export type MemorySync = z.infer<typeof memorySyncSchema>;
