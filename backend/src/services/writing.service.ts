import { WRITING_SYSTEM_PROMPT } from "../prompts/writing.prompt.js";
import { deepSeek } from "../providers/deepseek.provider.js";
import {
  writingResultSchema,
  type WritingRequest,
  type WritingResult,
} from "../schemas/ai.schema.js";

export async function writeDiary(input: WritingRequest): Promise<WritingResult> {
  const userContent = JSON.stringify({
    facts: input.facts,
    mood: input.mood ?? null,
    tone: input.tone ?? null,
    locale: input.locale,
  });

  return deepSeek.json(
    [
      { role: "system", content: WRITING_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    writingResultSchema,
    { maxTokens: 1_200 },
  );
}
