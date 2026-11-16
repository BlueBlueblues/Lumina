import { z } from "zod";

const moodSchema = z
  .object({
    phi: z.number().nullish(),
    r: z.number().min(0).max(1).nullish(),
    valence: z.number().min(-1).max(1).nullish(),
    arousal: z.number().min(-1).max(1).nullish(),
    anchor: z.string().max(10).nullish(),
    label: z.string().max(40).nullish(),
    color: z.string().max(20).nullish(),
  })
  .nullable()
  .optional();

const factsSchema = z
  .object({
    scene: z.string().max(200).nullish(),
    time: z.string().max(50).nullish(),
    light: z.string().max(200).nullish(),
    subjects: z.array(z.string().max(100)).max(30).catch([]),
    absence: z.array(z.string().max(100)).max(30).catch([]),
    text_spans: z.array(z.string().max(200)).max(30).catch([]),
    palette: z.array(z.string().max(20)).max(10).catch([]),
    brightness: z.number().min(0).max(1).nullish(),
    saturation: z.number().min(0).max(1).nullish(),
    conf: z.number().min(0).max(1).nullish(),
  })
  .passthrough();

const turnSchema = z.object({
  role: z.enum(["me", "it"]),
  text: z.string().max(8_000).default(""),
  question: z.string().max(300).optional(),
});

export const luminaObserveRequestSchema = z.object({
  image: z
    .string()
    .max(6_000_000)
    .regex(
      /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/,
      "Expected a base64 image data URL",
    ),
  iso: z.string().min(1).max(100),
});

export const luminaWriteRequestSchema = z.object({
  facts: factsSchema,
  mood: moodSchema,
  note: z.string().max(4_000).optional().default(""),
  extra: z.string().max(4_000).optional().default(""),
  stage: z.enum(["draft", "memory", "final"]).default("draft"),
  variant: z.number().int().min(0).max(2).default(0),
});

export const luminaTextReplyRequestSchema = z.object({
  turns: z.array(turnSchema).min(1).max(100),
  mood: moodSchema,
});

export const luminaTextIntegrateRequestSchema = z.object({
  turns: z.array(turnSchema).min(1).max(100),
  mood: moodSchema,
});

export const luminaPhotoQuestionRequestSchema = z.object({
  facts: factsSchema,
  mood: moodSchema,
  note: z.string().max(4_000).optional().default(""),
});

export const luminaFactsResultSchema = z.object({
  scene: z.string().max(200).catch(""),
  time: z.string().max(50).catch(""),
  light: z.string().max(200).catch(""),
  subjects: z.array(z.string().max(100)).max(30).catch([]),
  absence: z.array(z.string().max(100)).max(30).catch([]),
  text_spans: z.array(z.string().max(200)).max(30).catch([]),
  palette: z.array(z.string().max(20)).max(10).catch([]),
  brightness: z.number().min(0).max(1).catch(0.5),
  saturation: z.number().min(0).max(1).catch(0.4),
  conf: z.number().min(0).max(1).catch(0.6),
});

export const luminaTextResultSchema = z.object({
  text: z.string().trim().min(1).max(4_000),
});

export const luminaReplyResultSchema = z.object({
  reply: z.string().trim().min(1).max(1_000),
  question: z.string().max(300).catch(""),
});

export const luminaQuestionResultSchema = z.object({
  question: z.string().trim().min(1).max(300),
});

export type LuminaObserveRequest = z.infer<typeof luminaObserveRequestSchema>;
export type LuminaWriteRequest = z.infer<typeof luminaWriteRequestSchema>;
export type LuminaTextReplyRequest = z.infer<
  typeof luminaTextReplyRequestSchema
>;
export type LuminaTextIntegrateRequest = z.infer<
  typeof luminaTextIntegrateRequestSchema
>;
export type LuminaPhotoQuestionRequest = z.infer<
  typeof luminaPhotoQuestionRequestSchema
>;
