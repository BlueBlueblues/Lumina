import { RECALL_SYSTEM_PROMPT } from "../prompts/recall.prompt.js";
import { deepSeek } from "../providers/deepseek.provider.js";
import {
  recallResultSchema,
  type RecallRequest,
  type RecallResult,
} from "../schemas/ai.schema.js";

export async function rankMemories(input: RecallRequest): Promise<RecallResult> {
  const candidates = input.memories.map((memory) => ({
    id: memory.id,
    title: memory.title,
    content: memory.content.slice(0, 4_000),
    recordDate: memory.recordDate ?? null,
    mood: memory.mood ?? null,
    tags: memory.tags,
  }));

  const userContent = JSON.stringify({
    query: input.query,
    limit: input.limit,
    candidates,
  });

  const raw = await deepSeek.json(
    [
      { role: "system", content: RECALL_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    recallResultSchema,
    { maxTokens: 1_000 },
  );

  const allowed = new Set(input.memories.map((memory) => memory.id));
  const seen = new Set<string>();
  const results: RecallResult["results"] = [];

  for (const item of raw.results.sort((a, b) => b.score - a.score)) {
    if (!allowed.has(item.id) || seen.has(item.id)) continue;
    seen.add(item.id);
    results.push(item);
    if (results.length >= input.limit) break;
  }

  return { results };
}
