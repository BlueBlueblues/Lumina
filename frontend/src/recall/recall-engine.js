import { aiProvider } from "../providers/ai.provider.js";
import { kvGet, kvSet } from "../storage/indexeddb.js";
import { listMemories } from "../storage/memories.js";

const INDEX_KEY = "recallIndex";

function queryTerms(query) {
  const lower = String(query ?? "").toLowerCase().trim();
  if (!lower) return [];

  const words = lower.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const terms = new Set(words);

  for (const word of words) {
    if (/[\u4e00-\u9fff]/.test(word)) {
      const characters = [...word];
      for (const character of characters) terms.add(character);
      for (let index = 0; index < characters.length - 1; index += 1) {
        terms.add(characters[index] + characters[index + 1]);
      }
    }
  }

  return [...terms].filter(Boolean);
}

function termsForMemory(memory) {
  const text = [
    memory.title,
    (memory.content ?? "").slice(0, 20_000),
    (memory.tags ?? []).join(" "),
    memory.mood ?? "",
    (memory.aiFacts ?? []).join(" "),
  ]
    .filter(Boolean)
    .join("\n");

  return queryTerms(text).slice(0, 4_000);
}

function buildIndex(memories) {
  const postings = Object.create(null);

  for (const memory of memories) {
    for (const term of termsForMemory(memory)) {
      if (!postings[term]) postings[term] = [];
      if (!postings[term].includes(memory.id)) {
        postings[term].push(memory.id);
      }
    }
  }

  return postings;
}

export async function ensureIndex() {
  const memories = await listMemories();
  const latestUpdate = memories.reduce(
    (latest, memory) => Math.max(latest, memory.updatedAt ?? 0),
    0,
  );
  const version = `v1:${memories.length}:${latestUpdate}`;
  const cached = await kvGet(INDEX_KEY);

  if (cached?.version === version && cached.postings) {
    return { memories, postings: cached.postings };
  }

  const postings = buildIndex(memories);
  await kvSet(INDEX_KEY, { version, postings });
  return { memories, postings };
}

function scoreMemory(memory, terms, queryLower) {
  const title = (memory.title ?? "").toLowerCase();
  const content = (memory.content ?? "").toLowerCase();
  const tags = (memory.tags ?? []).map((tag) => tag.toLowerCase());
  const facts = (memory.aiFacts ?? []).map((fact) => fact.toLowerCase());
  const mood = (memory.mood ?? "").toLowerCase();

  let score = 0;
  const fields = new Set();

  for (const term of terms) {
    if (title.includes(term)) {
      score += 4;
      fields.add("标题");
    }
    if (tags.some((tag) => tag.includes(term))) {
      score += 3;
      fields.add("标签");
    }
    if (facts.some((fact) => fact.includes(term))) {
      score += 2;
      fields.add("AI 事实");
    }
    if (content.includes(term)) {
      score += 1;
      fields.add("正文");
    }
    if (mood.includes(term)) {
      score += 1;
      fields.add("情绪");
    }
  }

  if (queryLower && title.includes(queryLower)) score += 4;
  if (queryLower && content.includes(queryLower)) score += 2;

  const normalized = Math.max(
    0,
    Math.min(1, score / Math.max(4, terms.length * 5)),
  );

  return { score: normalized, fields: [...fields] };
}

export async function localRecall(query, limit = 20) {
  const queryLower = String(query ?? "").toLowerCase().trim();
  if (!queryLower) return [];

  const { memories, postings } = await ensureIndex();
  const terms = queryTerms(queryLower);
  const candidates = new Set();

  for (const term of terms) {
    for (const id of postings[term] ?? []) candidates.add(id);
  }

  if (!candidates.size) {
    for (const memory of memories) candidates.add(memory.id);
  }

  const byId = new Map(memories.map((memory) => [memory.id, memory]));
  const results = [];

  for (const id of candidates) {
    const memory = byId.get(id);
    if (!memory) continue;
    const { score, fields } = scoreMemory(memory, terms, queryLower);
    if (score <= 0) continue;
    results.push({
      memory,
      score,
      reason: fields.length ? `${fields.join("、")}命中` : "相关记录",
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function aiRecall(query, limit = 10) {
  const local = await localRecall(query, 50);
  let candidates = local.map((item) => item.memory);

  if (!candidates.length) {
    candidates = (await listMemories()).slice(0, 50);
  }
  if (!candidates.length) return [];

  const response = await aiProvider.recall({
    query,
    limit,
    memories: candidates.map((memory) => ({
      id: memory.id,
      title: memory.title ?? "",
      content: (memory.content ?? "").slice(0, 2_000),
      ...(memory.recordDate ? { recordDate: memory.recordDate } : {}),
      ...(memory.mood ? { mood: memory.mood } : {}),
      tags: memory.tags ?? [],
    })),
  });

  const byId = new Map(candidates.map((memory) => [memory.id, memory]));
  return (response?.results ?? [])
    .map((item) => ({
      memory: byId.get(item.id),
      score: item.score,
      reason: item.reason || "AI 相关",
    }))
    .filter((item) => item.memory);
}
