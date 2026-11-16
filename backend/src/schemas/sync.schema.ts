import { z } from "zod";
import {
  memoryContentSchema,
  memoryIdSchema,
  memorySyncSchema,
} from "./memory.schema.js";

const deviceNameSchema = z.string().trim().min(1).max(80);

export const pairRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    deviceName: deviceNameSchema,
  }),
  z.object({
    mode: z.literal("join"),
    code: z.string().trim().min(4).max(64),
    deviceName: deviceNameSchema,
  }),
  z.object({
    mode: z.literal("recover"),
    recoveryCode: z.string().trim().min(8).max(64),
    deviceName: deviceNameSchema,
  }),
  z.object({
    mode: z.literal("new-code"),
  }),
]);

export const pushChangeSchema = z.object({
  baseRevision: z.number().int().nonnegative(),
  memory: memorySyncSchema,
});

export const pushRequestSchema = z.object({
  changes: z.array(pushChangeSchema).min(1).max(50),
});

export const pullQuerySchema = z.object({
  cursor: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const resolveMemorySchema = memoryContentSchema.extend({
  deletedAt: z.number().int().nonnegative().nullable().optional(),
});

export const resolveRequestSchema = z
  .object({
    memoryId: memoryIdSchema,
    baseRevision: z.number().int().nonnegative(),
    strategy: z.enum(["server", "client", "merged"]).default("merged"),
    memory: resolveMemorySchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.strategy !== "server" && !value.memory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "memory is required unless strategy is server",
        path: ["memory"],
      });
    }
  });

export const disableRequestSchema = z
  .object({
    purgeCloudData: z.boolean().default(false),
    confirmPurge: z.literal("DELETE").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.purgeCloudData && value.confirmPurge !== "DELETE") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'confirmPurge must be "DELETE" when purging cloud data',
        path: ["confirmPurge"],
      });
    }
  });

export type PairRequest = z.infer<typeof pairRequestSchema>;
export type PushChange = z.infer<typeof pushChangeSchema>;
export type PullQuery = z.infer<typeof pullQuerySchema>;
export type ResolveRequest = z.infer<typeof resolveRequestSchema>;
export type DisableRequest = z.infer<typeof disableRequestSchema>;
