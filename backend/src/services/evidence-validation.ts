import type { EvidenceMemory, EvidenceResult } from "../schemas/evidence.schema.js";

// AI 改写、图像推断和无效引用不能升级为用户原话证据。
export function validateEvidence(result: EvidenceResult, memories: EvidenceMemory[], today = new Date().toISOString().slice(0,10)) {
  const byId = new Map(memories.map((m) => [m.id, m]));
  const clueIds = new Set(result.clues.map((c) => c.id));
  const seen = new Set<string>();
  let rejected = 0;
  const comparisons: EvidenceResult["comparisons"] = [];
  for (const item of result.comparisons) {
    const key = `${item.memoryId}:${item.clueId}`;
    const memory = byId.get(item.memoryId);
    if (!memory || !clueIds.has(item.clueId) || seen.has(key)) { rejected++; continue; }
    seen.add(key);
    const clue = result.clues.find(c => c.id === item.clueId)!;
    const date = dateSupport(clue.text, memory.date, today);
    if (date && memory.sources.some(s=>s.field==="record_date" && s.origin==="metadata" && s.text===memory.date)) {
      comparisons.push({ ...item, status: date, sources: [{field:"record_date",quote:memory.date}] });
      continue;
    }
    const sources = item.sources.filter((quote) => memory.sources.some((source) =>
      source.field === quote.field && source.origin === "user" &&
      quote.quote.trim().length > 0 && source.text.includes(quote.quote),
    ) && relationIsPossible(clue.text, quote.quote, item.status));
    const valid = item.status === "unknown" || sources.length > 0;
    if (!valid || sources.length !== item.sources.length) rejected++;
    comparisons.push({ ...item, status: valid ? item.status : "unknown", sources: valid && item.status !== "unknown" ? sources : [] });
  }
  for (const memory of memories) for (const clue of result.clues) {
    if (!seen.has(`${memory.id}:${clue.id}`)) {
      const date=memory.sources.some(s=>s.field==="record_date" && s.origin==="metadata" && s.text===memory.date) ? dateSupport(clue.text,memory.date,today) : null;
      comparisons.push({ memoryId: memory.id, clueId: clue.id, status: date ?? "unknown", sources: date ? [{field:"record_date",quote:memory.date}] : [] });
    }
  }
  return { ...result, comparisons, rejected };
}

const NEGATION = /没有|没(?:有|去|和|与|下|看|见|到|在|买|吃|聊|来|带|拍|提)|不是|不在|不去|不会|不能|不再|并未|并非|从未|未曾|不曾|未去|未见|未到|未下|无(?=雨|雪)|不要|别去|别再/g;
const SEMANTIC_OPPOSITES: [RegExp, RegExp][] = [
  [/下雨|雨天|淋雨|冒雨/, /晴天|全程晴|艳阳|晴朗|大晴/],
  [/下雪|雪天|暴雪/, /晴天|全程晴|艳阳|晴朗/],
  [/白天|上午|清晨|早上|中午|午后/, /夜里|深夜|半夜|凌晨|夜晚/],
  [/独自|一个人|独处|孤身/, /一起|同行|陪同|结伴|聚会/],
  [/安静|寂静|冷清|静谧/, /喧闹|嘈杂|热闹|拥挤|鼎沸/],
  [/室内|屋里|房间里|家里/, /户外|露天|野外|郊外/],
];

function terms(text: string) {
  const value = text.replace(NEGATION, "").replace(/当时|那天|今天|发生|记录|时间|一起|在|与|和|我|了|的|，|。|\s/g, "");
  return [...new Set([...value].slice(0,-1).map((_c,i)=>value.slice(i,i+2)))];
}

function hasSemanticOpposite(clue: string, quote: string): boolean {
  for (const [patternA, patternB] of SEMANTIC_OPPOSITES) {
    if ((patternA.test(clue) && patternB.test(quote) && !patternA.test(quote)) ||
        (patternB.test(clue) && patternA.test(quote) && !patternB.test(quote))) {
      return true;
    }
  }
  return false;
}

// 冲突必须有直接涉及该线索的否定或明确语义互斥，不能用“不相干的活动”排除另一段经历。
export function relationIsPossible(clue: string, quote: string, status: string) {
  const keys = terms(clue);
  const negativeClue = new RegExp(NEGATION.source).test(clue);
  const negativeChunks = [...quote.matchAll(new RegExp(`([^，,。！？；\n]{0,12})(?:${NEGATION.source})([^。！？；\n]{0,40})`,"g"))];
  const negativeQuote = negativeChunks.some(m=>keys.some(key=>(m[1]??"").includes(key)||(m[2]??"").includes(key)));
  const semanticOpposite = hasSemanticOpposite(clue, quote);
  if (status === "conflict" && semanticOpposite && !negativeClue) return true;
  if (status === "conflict") return keys.some(key=>quote.includes(key)) && negativeClue !== negativeQuote;
  if (status === "supported" && negativeQuote && !negativeClue) return false;
  if (status === "supported" && semanticOpposite && !negativeClue && !negativeQuote) return false;
  return true;
}

const SEASON_MONTHS: Record<string, number[]> = {
  "春": [3, 4, 5],
  "夏": [6, 7, 8],
  "秋": [9, 10, 11],
  "冬": [12, 1, 2],
};

const CN_MONTH_MAP: [RegExp, string][] = [
  [/十二月|腊月/g, "12月"],
  [/十一月|冬月/g, "11月"],
  [/十月/g, "10月"],
  [/九月/g, "9月"],
  [/八月/g, "8月"],
  [/七月/g, "7月"],
  [/六月/g, "6月"],
  [/五月/g, "5月"],
  [/四月/g, "4月"],
  [/三月/g, "3月"],
  [/二月/g, "2月"],
  [/一月|正月/g, "1月"],
];

const FESTIVAL_PATTERN = /中秋|春节|元旦|端午|清明|国庆|重阳|七夕|圣诞/;

export function dateSupport(clue: string, date: string, today: string): "supported" | "conflict" | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (FESTIVAL_PATTERN.test(clue)) return null;
  let normalized = clue;
  for (const [pattern, replacement] of CN_MONTH_MAP) {
    normalized = normalized.replace(pattern, replacement);
  }
  const cleaned = normalized.replace(/记录时间|记录日期|时间|发生|大约|大概|可能|记得|好像|约|是|在|为|的|时候|期间|[（）()：:\s]/g, "");
  if (!/^[\d年月日号\-去今前春夏秋冬初末底中上下半旬天季]+$/.test(cleaned)) return null;
  const explicit = normalized.match(/(\d{4})年/);
  const relative = normalized.includes("去年") ? -1 : normalized.includes("前年") ? -2 : normalized.includes("今年") ? 0 : null;
  if (explicit && relative !== null && Number(explicit[1]) !== Number(today.slice(0, 4)) + relative) return null;
  const year = explicit ? Number(explicit[1]) : relative !== null ? Number(today.slice(0, 4)) + relative : null;
  const exact = normalized.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (exact) return exact === date ? "supported" : "conflict";

  const halfYear = cleaned.match(/(上半年|下半年)/)?.[1];
  const seasonMatch = cleaned.match(/([春夏秋冬])(?:季|天)?/);
  const month = cleaned.match(/(\d{1,2})月/)?.[1];
  const day = cleaned.match(/(\d{1,2})[日号]/)?.[1];
  const dekad = cleaned.match(/(上旬|中旬|下旬|月初|月底|月末)/)?.[1];

  const recYear = Number(date.slice(0, 4));
  const recMonth = Number(date.slice(5, 7));
  const recDay = Number(date.slice(8, 10));

  if (year !== null || halfYear || seasonMatch || month || day || dekad) {
    if (seasonMatch?.[1] === "冬" && year !== null) {
      // 跨年冬季：如“去年冬天(2025)”覆盖 2025-12 与 2026-01/02
      const inWinterSpan = (recYear === year && recMonth === 12) || (recYear === year + 1 && (recMonth === 1 || recMonth === 2));
      if (!inWinterSpan) return "conflict";
    } else {
      if (year !== null && recYear !== year) return "conflict";
      if (seasonMatch) {
        const allowedMonths = SEASON_MONTHS[seasonMatch[1]!]!;
        if (!allowedMonths.includes(recMonth)) return "conflict";
      }
    }
    if (halfYear === "上半年" && recMonth > 6) return "conflict";
    if (halfYear === "下半年" && recMonth < 7) return "conflict";
    if (month && recMonth !== Number(month)) return "conflict";
    if (day && recDay !== Number(day)) return "conflict";
    if (dekad) {
      if ((dekad === "上旬" || dekad === "月初") && recDay > 10) return "conflict";
      if (dekad === "中旬" && (recDay < 11 || recDay > 20)) return "conflict";
      if ((dekad === "下旬" || dekad === "月底" || dekad === "月末") && recDay < 21) return "conflict";
    }
    return "supported";
  }
  return null;
}

export function buildClarification(result: EvidenceResult, status: string) {
  if (status === "matched") return null;
  if (status === "no_evidence") return { question: "现有记录没有足够依据。你想修改哪条人物、时间或场景线索？", options: [] };
  const choices = result.clues.map((clue) => {
    const states = result.comparisons.filter((c) => c.clueId === clue.id).map((c) => c.status);
    return { clue, spread: new Set(states).size, supported: states.includes("supported") };
  }).filter((item) => item.spread > 1 && item.supported).sort((a,b) => b.spread-a.spread).slice(0,2);
  return {
    question: choices.length ? "目前的记录分别支持不同线索。你对哪一条更确定？" : "这些记录还不能区分。你还记得别的具体细节吗？",
    options: choices.map(({clue}, index) => ({
      label: `更确定：${clue.text}`.slice(0,60),
      text: `我更确定「${clue.text}」。${choices[1-index] ? `「${choices[1-index]!.clue.text}」暂不作为条件；` : ""}其余线索保留，请重新检索。`,
    })),
  };
}
