import {
  LUMINA_OBSERVE_PROMPT,
  LUMINA_PHOTO_QUESTION_PROMPT,
  LUMINA_TEXT_INTEGRATE_PROMPT,
  LUMINA_TEXT_REPLY_PROMPT,
  LUMINA_WRITE_PROMPT,
} from "../prompts/lumina.prompts.js";
import { deepSeek } from "../providers/deepseek.provider.js";
import {
  luminaFactsResultSchema,
  luminaQuestionResultSchema,
  luminaReplyResultSchema,
  luminaTextResultSchema,
  type LuminaObserveRequest,
  type LuminaPhotoQuestionRequest,
  type LuminaTextIntegrateRequest,
  type LuminaTextReplyRequest,
  type LuminaWriteRequest,
} from "../schemas/lumina.schema.js";

export async function observeLuminaPhoto(input: LuminaObserveRequest) {
  const userPrompt = [
    `拍摄时间：${input.iso}`,
    "请观察照片，输出画面事实 JSON。",
    "subjects 只列明确可见的主体；absence 只列值得注意的缺席；palette 给出最多 5 个主色。",
  ].join("\n");

  return deepSeek.visionJson(
    LUMINA_OBSERVE_PROMPT,
    userPrompt,
    input.image,
    luminaFactsResultSchema,
    { maxTokens: 900 },
  );
}

export async function writeLuminaText(input: LuminaWriteRequest) {
  const payload = {
    facts: input.facts,
    mood: input.mood ?? null,
    note: input.note,
    extra: input.extra,
    stage: input.stage,
    variant: input.variant,
  };

  return deepSeek.json(
    [
      { role: "system", content: LUMINA_WRITE_PROMPT },
      { role: "user", content: JSON.stringify(payload) },
    ],
    luminaTextResultSchema,
    { maxTokens: 800 },
  );
}

export async function replyLuminaText(input: LuminaTextReplyRequest) {
  return deepSeek.json(
    [
      { role: "system", content: LUMINA_TEXT_REPLY_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          turns: input.turns,
          mood: input.mood ?? null,
        }),
      },
    ],
    luminaReplyResultSchema,
    { maxTokens: 500 },
  );
}

export async function integrateLuminaText(
  input: LuminaTextIntegrateRequest,
) {
  return deepSeek.json(
    [
      { role: "system", content: LUMINA_TEXT_INTEGRATE_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          turns: input.turns,
          mood: input.mood ?? null,
        }),
      },
    ],
    luminaTextResultSchema,
    { maxTokens: 700 },
  );
}

export async function questionLuminaPhoto(
  input: LuminaPhotoQuestionRequest,
) {
  return deepSeek.json(
    [
      { role: "system", content: LUMINA_PHOTO_QUESTION_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          facts: input.facts,
          mood: input.mood ?? null,
          note: input.note,
        }),
      },
    ],
    luminaQuestionResultSchema,
    { maxTokens: 200 },
  );
}
