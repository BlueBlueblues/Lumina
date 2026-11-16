import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const memoryIdSchema = z.string().trim().min(1).max(140);

export const memoryContentSchema = z.object({
  title: z.string().max(200).default(""),
  content: z.string().max(200_000).default(""),
  recordDate: isoDateSchema.optional(),
  mood: z.string().trim().max(40).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  aiFacts: z.array(z.string().trim().min(1).max(2_000)).max(50).default([]),
  supplement: z.string().max(50_000).optional(),
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
