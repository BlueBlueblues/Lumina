import { VISION_SYSTEM_PROMPT } from "../prompts/vision.prompt.js";
import { deepSeek } from "../providers/deepseek.provider.js";
import {
  visionResultSchema,
  type VisionRequest,
  type VisionResult,
} from "../schemas/ai.schema.js";

export async function analyzeImage(input: VisionRequest): Promise<VisionResult> {
  const prompt =
    input.prompt?.trim() ||
    "请观察这张照片，提取可以用于写日记的客观事实、整体氛围和主题标签。";

  return deepSeek.visionJson(
    VISION_SYSTEM_PROMPT,
    prompt,
    input.imageDataUrl,
    visionResultSchema,
    { maxTokens: 800 },
  );
}
