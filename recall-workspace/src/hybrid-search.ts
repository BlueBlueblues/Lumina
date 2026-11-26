import type { Memory } from "./repository";

/**
 * 端侧轻量混合召回引擎（Client-Side Hybrid Retrieval Engine）
 * 架构：
 *   1. 字段加权 BM25F（Okapi BM25 + 语料级 IDF + 长度归一化 + 否定前缀感知 + 同义语义簇扩展）
 *      来源权重严格遵循可信度分级：user(4.0) > image_model(1.8) > generated(0.8)
 *   2. 端侧轻量语义向量重排（Dense Semantic Concept + Char-Bigram L2-Normalized Cosine Similarity）
 *      覆盖 28 维中文日常记忆语义概念轴（天气/季节/昼夜/地点/社交/情绪/活动/饮食/学习科研等）
 *      并预留可选 WebGPU/WASM 神经网络向量插槽（setLocalEmbedder）
 *   3. 倒数排名融合（Reciprocal Rank Fusion, RRF, k = 60）合并稀疏检索与稠密语义排序
 */

export interface LocalEmbedder {
  embed(text: string): Promise<Float32Array> | Float32Array;
}

let customEmbedder: LocalEmbedder | null = null;
export function setLocalEmbedder(embedder: LocalEmbedder | null): void {
  customEmbedder = embedder;
}
export function getLocalEmbedder(): LocalEmbedder | null {
  return customEmbedder;
}

export const SYNONYM_CLUSTERS: string[][] = [
  ["下雨", "雨天", "淋雨", "雨停", "大雨", "小雨", "阵雨", "雷雨", "冒雨", "阴雨", "梅雨", "细雨"],
  ["晴天", "晴朗", "大晴", "艳阳", "阳光", "放晴", "天晴", "万里无云"],
  ["下雪", "雪天", "暴雪", "小雪", "飘雪", "初雪", "积雪", "雪景"],
  ["刮风", "大风", "吹风", "微风", "晚风", "寒风", "海风", "江风"],
  ["晚霞", "夕阳", "日落", "黄昏", "落日", "暮色", "余晖", "傍晚"],
  ["清晨", "早上", "早晨", "晨光", "日出", "清早", "天刚亮", "早起"],
  ["夜里", "夜晚", "深夜", "晚上", "夜色", "月光", "凌晨", "半夜", "宵夜"],
  ["河边", "江边", "河岸", "溪边", "水边", "沿河", "滨江", "河堤", "江岸"],
  ["海边", "海岸", "沙滩", "海滩", "海风", "海浪", "看海", "礁石", "灯塔"],
  ["公园", "草坪", "银杏", "树林", "湖边", "植物园", "林荫道", "步道"],
  ["咖啡", "咖啡店", "咖啡馆", "拿铁", "美式", "手冲", "卡布奇诺", "冷萃"],
  ["茶馆", "喝茶", "奶茶", "清茶", "乌龙", "抹茶", "茶室"],
  ["看书", "读书", "阅读", "书店", "翻书", "图书馆", "小说", "自习", "书架"],
  ["散步", "溜达", "走走", "漫步", "步行", "压马路", "逛街", "闲逛"],
  ["跑步", "夜跑", "晨跑", "慢跑", "操场", "运动", "健身", "骑行", "骑车"],
  ["吃饭", "聚餐", "晚饭", "午饭", "火锅", "烧烤", "拉面", "小馆", "餐厅", "做饭"],
  ["电影", "看电影", "影院", "电影院", "观影", "放映厅"],
  ["展览", "美术馆", "博物馆", "画展", "看展", "艺术馆"],
  ["开心", "雀跃", "高兴", "愉快", "快乐", "喜悦", "满足", "畅快", "轻松", "舒畅"],
  ["难过", "低落", "伤心", "沮丧", "失落", "郁闷", "烦躁", "压抑", "堵得慌", "很闷", "心情差", "委屈", "焦虑"],
  ["平静", "安宁", "安静", "宁静", "舒缓", "踏实", "发呆", "放空"],
  ["疲惫", "好累", "累坏了", "困倦", "通宵", "熬夜", "加班", "赶稿"],
  ["独自", "一个人", "独处", "孤身", "自己"],
  ["一起", "同行", "陪同", "结伴", "聚会", "约了", "碰面", "聊天"],
  ["实验", "答辩", "论文", "代码", "调试", "比赛", "项目", "实验室", "课题组", "汇报"],
  ["旅行", "出游", "爬山", "徒步", "古镇", "高铁", "火车", "航班", "民宿"],
  ["拍照", "相机", "胶片", "快门", "摄影", "镜头", "抓拍"],
  ["猫", "小猫", "猫咪", "橘猫", "狸花猫", "狗", "小狗", "遛狗"],
];

const NEGATED_PREFIX = /(?:没有|没|未曾|不曾|并非|不是|不在|不去|别去)[^，,。！？；\n]{0,6}$/;
const STOP_BIGRAMS = new Set([
  "今天", "昨天", "那天", "当时", "时候", "觉得", "感觉", "一下", "一点", "有点",
  "一个", "一起", "因为", "所以", "但是", "还是", "已经", "真的", "非常", "特别",
  "自己", "我们", "他们", "什么", "怎么", "好像", "记得", "去年", "今年", "前年",
]);

export function includesAffirmative(text: string, term: string): boolean {
  let idx = text.indexOf(term);
  while (idx !== -1) {
    const before = text.slice(Math.max(0, idx - 8), idx);
    if (!NEGATED_PREFIX.test(before)) return true;
    idx = text.indexOf(term, idx + term.length);
  }
  return false;
}

export function countAffirmative(text: string, term: string): number {
  if (!term) return 0;
  let count = 0;
  let idx = text.indexOf(term);
  while (idx !== -1) {
    const before = text.slice(Math.max(0, idx - 8), idx);
    if (!NEGATED_PREFIX.test(before)) count++;
    idx = text.indexOf(term, idx + term.length);
  }
  return count;
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
        const bg = term.slice(i, i + 2);
        if (!STOP_BIGRAMS.has(bg)) related.add(bg);
      }
    }
    expanded.set(term, [...related]);
  }
  return { exact, expanded };
}

// 96-dim lightweight dense vector: [0..27] semantic concept axes + [28..95] signed hashed char-bigram features
const CONCEPT_DIMS = SYNONYM_CLUSTERS.length; // 28
const HASH_DIMS = 68;
const TOTAL_DIMS = CONCEPT_DIMS + HASH_DIMS; // 96

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function computeLocalSemanticVector(text: string): Float32Array {
  const vec = new Float32Array(TOTAL_DIMS);
  const lower = text.toLowerCase();

  // 1. Semantic concept projection (affirmative-aware)
  for (let c = 0; c < CONCEPT_DIMS; c++) {
    const cluster = SYNONYM_CLUSTERS[c]!;
    let hits = 0;
    for (const word of cluster) {
      if (includesAffirmative(lower, word)) hits += 1;
    }
    if (hits > 0) {
      vec[c] = 1.6 * (1 + Math.log1p(hits));
    }
  }

  // 2. Character bigrams + ASCII tokens hashed into remaining dimensions
  const cjk = lower.replace(/[^\u4e00-\u9fff]/g, "");
  for (let i = 0; i < cjk.length - 1; i++) {
    const bg = cjk.slice(i, i + 2);
    if (STOP_BIGRAMS.has(bg)) continue;
    const h = fnv1a(bg);
    const dim = CONCEPT_DIMS + (h % HASH_DIMS);
    const sign = (h & 1) === 0 ? 1 : -1;
    vec[dim] += sign * 0.7;
  }
  const asciiWords = lower.match(/[a-z0-9]{2,}/g) ?? [];
  for (const w of asciiWords) {
    const h = fnv1a(w);
    const dim = CONCEPT_DIMS + (h % HASH_DIMS);
    const sign = (h & 1) === 0 ? 1 : -1;
    vec[dim] += sign * 0.9;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < TOTAL_DIMS; i++) norm += vec[i]! * vec[i]!;
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < TOTAL_DIMS; i++) vec[i] = vec[i]! / norm;
  }
  return vec;
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i++) dot += a[i]! * b[i]!;
  return dot;
}

export type RetrievalMode = "keyword" | "synonym" | "hybrid";

export interface ScoredMemory {
  memory: Memory;
  score: number;
  bm25Score: number;
  semanticScore: number;
}

/**
 * 端侧混合检索核心实现（支持 keyword / synonym / hybrid 三种模式便于消融评测）
 */
export function rankMemoriesHybrid(
  memories: Memory[],
  rawTerms: string[],
  mode: RetrievalMode = "hybrid",
): ScoredMemory[] {
  const { exact, expanded } = expandQueryTerms(rawTerms);
  if (!exact.length || !memories.length) return [];

  const docs = memories.map((memory) => {
    const original = memory.sources
      .filter((s) => s.origin !== "image_model")
      .map((s) => s.text)
      .join("\n")
      .toLowerCase();
    const image = memory.sources
      .filter((s) => s.origin === "image_model")
      .map((s) => s.text)
      .join("\n")
      .toLowerCase();
    const generated = memory.generated.toLowerCase();
    const len = Math.max(1, original.length + image.length * 0.5 + generated.length * 0.25);
    return { memory, original, image, generated, len };
  });

  if (mode === "keyword") {
    return docs
      .flatMap(({ memory, original, image, generated }) => {
        const s = exact.reduce((n, t) => {
          if (original.includes(t)) return n + 4;
          if (image.includes(t)) return n + 2;
          if (generated.includes(t)) return n + 1;
          return n;
        }, 0);
        return s > 0 ? [{ memory, score: s, bm25Score: s, semanticScore: 0 }] : [];
      })
      .sort((a, b) => b.score - a.score || b.memory.date.localeCompare(a.memory.date));
  }

  if (mode === "synonym") {
    return docs
      .flatMap(({ memory, original, image, generated }) => {
        const s = exact.reduce((n, t) => {
          if (original.includes(t)) return n + 4;
          if (image.includes(t)) return n + 2;
          if (generated.includes(t)) return n + 1;
          const syns = expanded.get(t) ?? [];
          if (syns.some((syn) => includesAffirmative(original, syn))) return n + 2.5;
          if (syns.some((syn) => includesAffirmative(image, syn))) return n + 1.2;
          if (syns.some((syn) => includesAffirmative(generated, syn))) return n + 0.5;
          return n;
        }, 0);
        return s > 0 ? [{ memory, score: s, bm25Score: s, semanticScore: 0 }] : [];
      })
      .sort((a, b) => b.score - a.score || b.memory.date.localeCompare(a.memory.date));
  }

  // Hybrid Mode: BM25F + Dense Concept/Char-Bigram Semantic Vector + RRF Fusion
  const N = docs.length;
  const avgLen = docs.reduce((acc, d) => acc + d.len, 0) / N;
  const k1 = 1.5;
  const b = 0.75;

  // Compute corpus document frequency (df) for exact terms and their expanded synonyms
  const dfExact = new Map<string, number>();
  for (const t of exact) {
    let df = 0;
    const syns = expanded.get(t) ?? [];
    for (const d of docs) {
      if (
        d.original.includes(t) ||
        d.image.includes(t) ||
        d.generated.includes(t) ||
        syns.some((s) => includesAffirmative(d.original, s) || includesAffirmative(d.image, s))
      ) {
        df++;
      }
    }
    dfExact.set(t, df);
  }

  // Stage 1: BM25F sparse scoring
  const queryVec = computeLocalSemanticVector(exact.join(" "));
  const scored = docs.map((d) => {
    let bm25 = 0;
    const dlNorm = 1 - b + b * (d.len / avgLen);

    for (const t of exact) {
      const df = dfExact.get(t) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

      // Weighted term frequency across trust tiers: user(4.0) > image_model(1.8) > generated(0.8)
      const tfOrigExact = d.original.includes(t) ? Math.max(1, countAffirmative(d.original, t)) : 0;
      const tfImgExact = d.image.includes(t) ? 1 : 0;
      const tfGenExact = d.generated.includes(t) ? 1 : 0;

      let tfWeighted = tfOrigExact * 4.0 + tfImgExact * 1.8 + tfGenExact * 0.8;

      if (tfOrigExact === 0) {
        const syns = expanded.get(t) ?? [];
        let synOrig = 0;
        let synImg = 0;
        let synGen = 0;
        for (const syn of syns) {
          if (includesAffirmative(d.original, syn)) synOrig++;
          else if (includesAffirmative(d.image, syn)) synImg++;
          else if (includesAffirmative(d.generated, syn)) synGen++;
        }
        // Cap synonym contribution so exact match always dominates
        tfWeighted += Math.min(2, synOrig) * 2.4 + Math.min(1, synImg) * 1.1 + Math.min(1, synGen) * 0.4;
      }

      if (tfWeighted > 0) {
        bm25 += idf * ((tfWeighted * (k1 + 1)) / (tfWeighted + k1 * dlNorm));
      }
    }

    // Stage 2: Client-side semantic vector cosine similarity (user original text prioritized)
    const docVecText = d.original || d.image || d.generated;
    const sem = cosineSimilarity(queryVec, computeLocalSemanticVector(docVecText));
    return { memory: d.memory, bm25Score: bm25, semanticScore: sem };
  });

  // Keep candidates that have either BM25 hit or strong semantic similarity (>= 0.22)
  const active = scored.filter((item) => item.bm25Score > 0 || item.semanticScore >= 0.22);
  if (!active.length) return [];

  // Reciprocal Rank Fusion (RRF, k = 60) combining BM25F rank + Semantic Vector rank
  const RRF_K = 60;
  const byBm25 = [...active].sort((a, b) => b.bm25Score - a.bm25Score || b.semanticScore - a.semanticScore);
  const bySem = [...active].sort((a, b) => b.semanticScore - a.semanticScore || b.bm25Score - a.bm25Score);

  const bm25Rank = new Map<string, number>();
  const semRank = new Map<string, number>();
  byBm25.forEach((item, idx) => bm25Rank.set(item.memory.id, idx + 1));
  bySem.forEach((item, idx) => semRank.set(item.memory.id, idx + 1));

  return active
    .map((item) => {
      const rB = bm25Rank.get(item.memory.id) ?? active.length;
      const rS = semRank.get(item.memory.id) ?? active.length;
      // Sparse BM25F weighted 0.68, Dense Semantic Rerank weighted 0.32 + raw BM25 tie-breaker
      const bm25Rrf = item.bm25Score > 0 ? 0.68 / (RRF_K + rB) : 0;
      const semRrf = item.semanticScore > 0.08 ? 0.32 / (RRF_K + rS) : 0;
      const fused = bm25Rrf + semRrf + item.bm25Score * 0.0005 + Math.max(0, item.semanticScore) * 0.001;
      return {
        memory: item.memory,
        score: fused,
        bm25Score: item.bm25Score,
        semanticScore: item.semanticScore,
      };
    })
    .sort((a, b) => b.score - a.score || b.memory.date.localeCompare(a.memory.date));
}
