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

const SYNONYM_CLUSTERS: string[][] = [
  ["下雨", "雨天", "淋雨", "雨停", "大雨", "小雨", "阵雨", "雷雨", "冒雨", "阴雨"],
  ["晴天", "晴朗", "大晴", "艳阳", "阳光", "放晴", "天晴"],
  ["晚霞", "夕阳", "日落", "黄昏", "落日", "暮色"],
  ["清晨", "早上", "早晨", "晨光", "日出", "清早"],
  ["夜里", "夜晚", "深夜", "晚上", "夜色", "月光"],
  ["河边", "江边", "河岸", "溪边", "水边", "沿河"],
  ["海边", "海岸", "沙滩", "海滩", "海风", "海浪"],
  ["咖啡", "咖啡店", "咖啡馆", "拿铁", "美式"],
  ["看书", "读书", "阅读", "书店", "翻书"],
  ["散步", "溜达", "走走", "漫步", "步行"],
  ["开心", "雀跃", "高兴", "愉快", "快乐", "喜悦"],
  ["难过", "低落", "伤心", "沮丧", "失落", "郁闷"],
  ["平静", "安宁", "安静", "宁静", "舒缓"],
];

const NEGATED_PREFIX = /(?:没有|没|未|未曾|不曾|并非|不是)[^，。！？；\n]{0,6}$/;

function includesAffirmative(text: string, term: string): boolean {
  let idx = text.indexOf(term);
  while (idx !== -1) {
    const before = text.slice(Math.max(0, idx - 8), idx);
    if (!NEGATED_PREFIX.test(before)) return true;
    idx = text.indexOf(term, idx + term.length);
  }
  return false;
}

export function expandQueryTerms(rawTerms: string[]): { exact: string[]; expanded: Map<string, string[]> } {
  const exact = [...new Set(rawTerms.map((s) => s.toLowerCase().trim()).filter(Boolean))];
  const expanded = new Map<string, string[]>();
  for (const term of exact) {
    const related = new Set<string>();
    for (const cluster of SYNONYM_CLUSTERS) {
      if (cluster.some((w) => term.includes(w) || w.includes(term))) {
        for (const w of cluster) if (w !== term) related.add(w);
      }
    }
    if (/^[\u4e00-\u9fff]{3,}$/.test(term)) {
      for (let i = 0; i < term.length - 1; i++) {
        related.add(term.slice(i, i + 2));
      }
    }
    expanded.set(term, [...related]);
  }
  return { exact, expanded };
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

export function searchMemories(memories: Memory[], args: SearchArgs) {
  const { exact, expanded } = expandQueryTerms(args.terms);
  const matches = memories.flatMap((memory) => {
    if ((args.from && memory.date < args.from) || (args.to && memory.date > args.to)) return [];
    const original = memory.sources.filter((s) => s.origin !== "image_model").map((s) => s.text).join("\n").toLowerCase();
    const image = memory.sources.filter((s) => s.origin === "image_model").map((s) => s.text).join("\n").toLowerCase();
    const generated = memory.generated.toLowerCase();
    const score = exact.reduce((n, t) => {
      if (original.includes(t)) return n + 4;
      if (image.includes(t)) return n + 2;
      if (generated.includes(t)) return n + 1;
      const syns = expanded.get(t) ?? [];
      if (syns.some((syn) => includesAffirmative(original, syn))) return n + 2.5;
      if (syns.some((syn) => includesAffirmative(image, syn))) return n + 1.2;
      if (syns.some((syn) => includesAffirmative(generated, syn))) return n + 0.5;
      return n;
    }, 0);
    if (!score) return [];
    return [{ memory, score }];
  }).sort((a,b) => b.score-a.score || b.memory.date.localeCompare(a.memory.date));
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
  return { matches: matches.slice(0, Math.min(12, Math.max(1,args.limit))).map(({memory}) => ({ id: memory.id, title: memory.title, date: memory.date, excerpt: buildExcerpt(memory) })), total: matches.length, searched: memories.length };
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
