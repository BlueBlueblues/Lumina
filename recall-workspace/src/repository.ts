import {
  expandQueryTerms,
  rankMemoriesHybrid,
  setLocalEmbedder,
  type RetrievalMode,
} from "./hybrid-search";

export { expandQueryTerms, rankMemoriesHybrid, setLocalEmbedder };
export type { RetrievalMode };

export interface Source { field: string; text: string; origin: "user" | "image_model" | "metadata" }
export interface Memory { id: string; title: string; date: string; sources: Source[]; generated: string }
export interface SearchArgs { terms: string[]; from?: string | null; to?: string | null; limit: number }
export interface RecordInput {
  id: string; ts?: string; note?: string; extra?: string; final?: string; draft?: string;
  demo?: boolean; chat?: {role: string; text: string}[]; mood?: {label?: string};
  facts?: {scene?: string; light?: string; subjects?: string[]; text_spans?: string[]};
}
declare global {
  interface Window { LuminaRecords?: { ready?: Promise<void>; list(): RecordInput[] }; LuminaEvidence?: { version: string } }
}

export function toMemory(record: RecordInput): Memory {
  const sources: Source[] = [];
  const add = (field: string, value: unknown, origin: Source["origin"]) => {
    if (typeof value === "string" && value.trim()) { for(let offset=0;offset<value.length;offset+=8000) sources.push({field:value.length>8000?`${field}_part_${offset/8000}`:field,text:value.slice(offset,offset+8000),origin}); }
  };
  add("user_note", record.note, "user");
  add("user_supplement", record.extra, "user");
  for (const [i, turn] of (record.chat ?? []).slice(0, 100).entries()) if (turn.role === "me") add(`user_turn_${i}`, turn.text, "user");
  add("user_mood", record.mood?.label, "user");
  const parsed = new Date(record.ts ?? "");
  const date = Number.isNaN(parsed.getTime()) ? "日期未知" : `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,"0")}-${String(parsed.getDate()).padStart(2,"0")}`;
  if (date !== "日期未知") add("record_date", date, "metadata");
  add("image_scene", record.facts?.scene, "image_model");
  add("image_light", record.facts?.light, "image_model");
  add("image_subjects", record.facts?.subjects?.join("、"), "image_model");
  add("image_text", record.facts?.text_spans?.join("\n"), "image_model");
  return { id: record.id, date, title: (record.note || record.chat?.find((t) => t.role === "me")?.text || "一条记录").slice(0, 80), sources, generated: String(record.final || record.draft || "").slice(0, 2_000) };
}

export function searchMemories(memories: Memory[], args: SearchArgs, mode: RetrievalMode = "hybrid") {
  const { exact, expanded } = expandQueryTerms(args.terms);
  const filtered = memories.filter(
    (memory) => !(args.from && memory.date < args.from) && !(args.to && memory.date > args.to),
  );
  const matches = rankMemoriesHybrid(filtered, args.terms, mode);
  const allTerms = [...exact, ...[...expanded.values()].flat()];
  const buildExcerpt = (memory: Memory) => {
    const full = memory.sources.filter((s) => s.origin === "user").map((s) => s.text).join("\n");
    if (full.length <= 500) return full;
    const lower = full.toLowerCase();
    let hit = -1;
    for (const term of allTerms) {
      const idx = lower.indexOf(term);
      if (idx !== -1 && (hit === -1 || idx < hit)) hit = idx;
    }
    if (hit <= 200) return full.slice(0, 500);
    const start = Math.max(0, hit - 160);
    const end = Math.min(full.length, start + 496);
    return `${start > 0 ? "…" : ""}${full.slice(start, end)}${end < full.length ? "…" : ""}`;
  };
  return {
    matches: matches.slice(0, Math.min(12, Math.max(1, args.limit))).map(({ memory }) => ({
      id: memory.id,
      title: memory.title,
      date: memory.date,
      excerpt: buildExcerpt(memory),
    })),
    total: matches.length,
    searched: memories.length,
  };
}

export const memoryRepository = { list: async () => { await window.LuminaRecords?.ready; return (window.LuminaRecords?.list() ?? []).map(toMemory); } };

export function demoMemories(): Memory[] {
  const year = new Date().getFullYear() - 1;
  return [
    { id: "synthetic-rain", ts: `${year}-09-18T18:00:00+08:00`, note: "傍晚在河边看晚霞。刚坐下就下雨了，我在桥下等雨停。" },
    { id: "synthetic-friend", ts: `${year}-09-25T18:00:00+08:00`, note: "今天和小林去了河边看晚霞。全程晴天，没有下雨。我们沿河走回家。" },
    { id: "synthetic-coffee", ts: `${year}-10-02T14:00:00+08:00`, note: "下午和小林在咖啡店聊天，没有去河边。" },
  ].map(toMemory);
}
