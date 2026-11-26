import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { searchMemories, toMemory, type Memory, type RecordInput } from "../../recall-workspace/src/repository.ts";

const dataset = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "dataset-100-60.json"), "utf-8"));
const memories100: Memory[] = dataset.memories.map(toMemory);

// Exact legacy 13-cluster constant scorer from pre-upgrade repository.ts
const LEGACY_CLUSTERS = [
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
const NEG_PRE = /(?:没有|没|未|未曾|不曾|并非|不是)[^，。！？；\n]{0,6}$/;
function incAff(text: string, term: string) {
  let idx = text.indexOf(term);
  while (idx !== -1) {
    if (!NEG_PRE.test(text.slice(Math.max(0, idx - 8), idx))) return true;
    idx = text.indexOf(term, idx + term.length);
  }
  return false;
}
function legacySearch(mems: Memory[], terms: string[], limit: number) {
  const exact = [...new Set(terms.map((s) => s.toLowerCase().trim()).filter(Boolean))];
  const exp = new Map<string, string[]>();
  for (const t of exact) {
    const rel = new Set<string>();
    for (const c of LEGACY_CLUSTERS) if (c.some((w) => t.includes(w) || w.includes(t))) for (const w of c) if (w !== t) rel.add(w);
    if (/^[\u4e00-\u9fff]{3,}$/.test(t)) for (let i = 0; i < t.length - 1; i++) rel.add(t.slice(i, i + 2));
    exp.set(t, [...rel]);
  }
  return mems.flatMap((memory) => {
    const orig = memory.sources.filter((s) => s.origin !== "image_model").map((s) => s.text).join("\n").toLowerCase();
    const img = memory.sources.filter((s) => s.origin === "image_model").map((s) => s.text).join("\n").toLowerCase();
    const gen = memory.generated.toLowerCase();
    const score = exact.reduce((n, t) => {
      if (orig.includes(t)) return n + 4;
      if (img.includes(t)) return n + 2;
      if (gen.includes(t)) return n + 1;
      const syns = exp.get(t) ?? [];
      if (syns.some((s) => incAff(orig, s))) return n + 2.5;
      if (syns.some((s) => incAff(img, s))) return n + 1.2;
      if (syns.some((s) => incAff(gen, s))) return n + 0.5;
      return n;
    }, 0);
    return score ? [{ id: memory.id, date: memory.date, score }] : [];
  }).sort((a, b) => b.score - a.score || b.date.localeCompare(a.date)).slice(0, limit).map((x) => x.id);
}

// Build 500-diary stress corpus (100 real + 400 realistic high-frequency distractor diaries)
const distractors: RecordInput[] = [];
const templates = [
  "今天傍晚去校园走走，吹了会儿风，感觉有点累但还算平静。",
  "下午去食堂吃了晚饭，回宿舍整理今天上课记的笔记，晚上早点睡。",
  "周六上午在房间里收拾桌面，把前几天买的书放到书架上，天气不错。",
  "傍晚下课后沿路散步回寝室，天色慢慢暗下来，路灯亮了一排。",
  "今天在图书馆坐了三个小时写实验代码，中途喝了点水休息一会儿。",
  "晚上和室友在楼下买水果顺便聊了几句，微风很凉爽。",
  "周日醒得比较晚，泡了杯茶在阳台晒太阳看云，度过平静的一天。",
  "下午去超市补货买日用品，回来路上看见一只晒太阳的小猫。",
];
for (let i = 0; i < 400; i++) {
  const m = String((i % 12) + 1).padStart(2, "0");
  const d = String((i % 28) + 1).padStart(2, "0");
  const yr = i < 200 ? 2025 : 2026;
  distractors.push({ id: `bg_${i + 1}`, ts: `${yr}-${m}-${d}T18:00:00+08:00`, note: templates[i % templates.length]! });
}
const memories500: Memory[] = [...memories100, ...distractors.map(toMemory)];

const relQueries = dataset.queries.filter((q: any) => q.relevantIds.length > 0);
const paraQueries = relQueries.filter((q: any) => q.category === "paraphrase");

function runEval(mems: Memory[], label: string, fn: (terms: string[]) => string[]) {
  const measure = (qs: any[]) => {
    let h1 = 0, r6 = 0, r12 = 0, mrr = 0;
    const t0 = performance.now();
    const REPS = 10;
    for (let rep = 0; rep < REPS; rep++) {
      for (const q of qs) {
        const ids = fn(q.searchTerms);
        if (rep === 0) {
          const set = new Set(q.relevantIds);
          if (ids.slice(0, 1).some((id) => set.has(id))) h1++;
          r6 += q.relevantIds.filter((id: string) => ids.slice(0, 6).includes(id)).length / q.relevantIds.length;
          r12 += q.relevantIds.filter((id: string) => ids.slice(0, 12).includes(id)).length / q.relevantIds.length;
          const fi = ids.findIndex((id) => set.has(id));
          if (fi !== -1) mrr += 1 / (fi + 1);
        }
      }
    }
    const ms = (performance.now() - t0) / (REPS * qs.length);
    return {
      hitAt1: +(h1 / qs.length).toFixed(4),
      recallAt6: +(r6 / qs.length).toFixed(4),
      recallAt12: +(r12 / qs.length).toFixed(4),
      mrrAt12: +(mrr / qs.length).toFixed(4),
      avgLatencyMs: +ms.toFixed(3),
    };
  };
  return { label, corpusSize: mems.length, overall: measure(relQueries), paraphrase: measure(paraQueries) };
}

const out = {
  corpus100: [
    runEval(memories100, "R0_Keyword_Exact", (t) => searchMemories(memories100, { terms: t, limit: 12 }, "keyword").matches.map((m) => m.id)),
    runEval(memories100, "R1_Legacy_13Cluster_OR", (t) => legacySearch(memories100, t, 12)),
    runEval(memories100, "R2_Hybrid_BM25F_Vector_RRF", (t) => searchMemories(memories100, { terms: t, limit: 12 }, "hybrid").matches.map((m) => m.id)),
  ],
  corpus500: [
    runEval(memories500, "R0_Keyword_Exact", (t) => searchMemories(memories500, { terms: t, limit: 12 }, "keyword").matches.map((m) => m.id)),
    runEval(memories500, "R1_Legacy_13Cluster_OR", (t) => legacySearch(memories500, t, 12)),
    runEval(memories500, "R2_Hybrid_BM25F_Vector_RRF", (t) => searchMemories(memories500, { terms: t, limit: 12 }, "hybrid").matches.map((m) => m.id)),
  ],
};
fs.writeFileSync(path.resolve(import.meta.dirname, "results-retrieval.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
