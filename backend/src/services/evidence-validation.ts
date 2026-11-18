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

const NEGATION = /没有|没(?:有|去|和|与)|不是|并非|从未|未曾|不曾|未去|无(?=雨|雪)/g;
function terms(text: string) {
  const value = text.replace(NEGATION, "").replace(/当时|那天|今天|发生|记录|时间|一起|在|与|和|我|了|的|，|。|\s/g, "");
  return [...new Set([...value].slice(0,-1).map((_c,i)=>value.slice(i,i+2)))];
}
// 冲突必须有直接涉及该线索的否定，不能用“不相干的活动”排除另一段经历。
export function relationIsPossible(clue: string, quote: string, status: string) {
  const keys = terms(clue);
  const negativeClue = new RegExp(NEGATION.source).test(clue);
  const negativeChunks = [...quote.matchAll(new RegExp(`(?:${NEGATION.source})([^。！？；\n]{0,40})`,"g"))];
  const negativeQuote = negativeChunks.some(m=>keys.some(key=>(m[1]??"").includes(key)));
  const explicitWeatherOpposite = /下雨|雨天/.test(clue) && /晴天|全程晴/.test(quote) && !/下雨|雨天/.test(quote);
  if (status === "conflict" && explicitWeatherOpposite && !negativeClue) return true;
  if (status === "conflict") return keys.some(key=>quote.includes(key)) && negativeClue !== negativeQuote;
  if (status === "supported" && negativeQuote && !negativeClue) return false;
  return true;
}
export function dateSupport(clue: string, date: string, today: string): "supported" | "conflict" | null {
  const cleaned=clue.replace(/记录时间|记录日期|时间|发生|大约|约|是|在|为|的|[（）()：:\s]/g,"");
  if (!/^[\d年月日号\-去今前]+$/.test(cleaned) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const explicit=clue.match(/(\d{4})年/);
  const relative=clue.includes("去年")?-1:clue.includes("前年")?-2:clue.includes("今年")?0:null;
  if (explicit && relative!==null && Number(explicit[1])!==Number(today.slice(0,4))+relative) return null;
  const year=explicit?Number(explicit[1]):relative!==null?Number(today.slice(0,4))+relative:null;
  const exact=clue.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (exact) return exact===date?"supported":"conflict";
  const month=cleaned.match(/(\d{1,2})月/)?.[1];
  const day=cleaned.match(/(\d{1,2})[日号]/)?.[1];
  if (year!==null || month || day) return (year===null || Number(date.slice(0,4))===year) && (!month || Number(date.slice(5,7))===Number(month)) && (!day || Number(date.slice(8,10))===Number(day)) ? "supported" : "conflict";
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
