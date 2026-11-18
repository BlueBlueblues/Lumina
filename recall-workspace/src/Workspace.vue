<script setup lang="ts">
import { computed, ref } from "vue";
import { demoMemories, memoryRepository, searchMemories, type Memory, type SearchArgs } from "./repository";

type Status = "supported" | "conflict" | "unknown";
interface Comparison { memoryId: string; clueId: string; status: Status; sources: {field: string; quote: string}[] }
interface RecallResult {
  clues: {id: string; text: string}[]; comparisons: Comparison[];
  candidates: {memoryId: string; supported: number; conflicts: number; complete: boolean}[];
  status: "matched" | "uncertain" | "no_evidence";
  clarification: {question: string; options: {label: string; text: string}[]} | null;
  rejected: number; checkedQuotes: number;
}
interface ToolCall { id: string; name: string; args: Record<string, unknown> }
interface Step { sessionId?: string; phase: "tools" | "done"; calls?: ToolCall[]; result?: RecallResult }
interface Trace { name: string; args: string; result: string; time: number }
const query = ref("");
const correction = ref("");
const corrections = ref<string[]>([]);
const activeQuery = ref("");
const busy = ref(false);
const statusText = ref("说说你记得的片段，线索记不准也没关系。");
const error = ref("");
const demo = ref(false);
const result = ref<RecallResult | null>(null);
const snapshot = ref<Memory[]>([]);
const selected = ref("");
const selectedClue = ref("");
const trace = ref<Trace[]>([]);
const controller = ref<AbortController | null>(null);
const readIds = new Set<string>();
let runId = 0;
const chosen = computed(() => snapshot.value.find((m) => m.id === selected.value));
const cards = computed(() => (result.value?.candidates ?? []).map((c) => ({ ...c, memory: snapshot.value.find((m) => m.id === c.memoryId)! })).filter((c) => c.memory));
const statusLabel: Record<Status, string> = { supported: "原文支持", conflict: "明确冲突", unknown: "没有足够证据" };
const fieldName = (field: string) => ({ user_note: "用户原话", user_supplement: "用户补充", user_mood: "自选心情", record_date: "记录日期", image_scene: "图像分析·场景", image_light: "图像分析·光线", image_subjects: "图像分析·主体", image_text: "图像分析·文字" }[field] ?? (field.startsWith("user_turn_") ? "用户对话原话" : field));
const verdict = computed(() => !result.value ? "" : result.value.status === "matched" ? "一条记录与当前线索吻合" : result.value.status === "uncertain" ? "有相关记录，暂时无法确认是哪一次" : "现有记录无法确认这段经历");
const evidence = computed(() => (result.value?.comparisons ?? []).filter((c) => c.memoryId === selected.value && (!selectedClue.value || c.clueId === selectedClue.value)));

async function post(path: string, body: unknown, signal: AbortSignal): Promise<Step> {
  const timeout = new AbortController();
  const abort = () => timeout.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) timeout.abort();
  const timer = window.setTimeout(() => timeout.abort(), 100_000);
  try {
    const response = await fetch(`/api/recall/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: timeout.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `请求失败（${response.status}）`);
    return data;
  } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
}
function stop() { runId++; controller.value?.abort(); controller.value = null; busy.value = false; statusText.value = "已停止。可以调整线索后重新查找。"; }
function comparisonFor(memoryId: string, clueId: string) { return result.value?.comparisons.find((c) => c.memoryId === memoryId && c.clueId === clueId); }
function pickMemory(id: string) { selected.value = id; }
function pickClue(id: string) { selectedClue.value = selectedClue.value === id ? "" : id; }

async function run(keepCorrections = false) {
  if (busy.value) return;
  const text = query.value.trim();
  if (!text) { error.value = "先写一句你记得的片段。"; return; }
  if (!keepCorrections) corrections.value = [];
  busy.value = true;
  const currentRun = ++runId;
  let rows: Memory[];
  try { rows = demo.value ? demoMemories() : await memoryRepository.list(); }
  catch { busy.value = false; error.value = "本地数据库未能读取，记录没有改动。请重试。"; return; }
  if (currentRun !== runId) return;
  if (!rows.length) { busy.value = false; error.value = "这台设备还没有记录。先记一条，或试用合成案例。"; return; }
  snapshot.value = rows;
  busy.value = true; error.value = ""; result.value = null; trace.value = []; selected.value = ""; selectedClue.value = ""; readIds.clear();
  activeQuery.value = text;
  const aborter = new AbortController(); controller.value = aborter;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const started = performance.now();
  try {
    statusText.value = "正在理解线索，决定检索条件…";
    let step = await post("start", { query: text, corrections: corrections.value, today }, aborter.signal);
    for (let round = 0; step.phase === "tools"; round++) {
      if (round >= 4) throw new Error("已到检索轮数上限，请减少或调整线索后重试。");
      const outputs = (step.calls ?? []).map((call) => {
        let output: unknown;
        let summary: string;
        if (call.name === "search_memories") {
          const args = call.args as unknown as SearchArgs;
          statusText.value = "正在本机查找相关记录…";
          const found = searchMemories(snapshot.value, args); output = found;
          summary = `检索 ${found.searched} 条，命中 ${found.total} 条，返回 ${found.matches.length} 条`;
        } else if (call.name === "get_memory") {
          statusText.value = "正在读取候选原文…";
          const memory = snapshot.value.find((m) => m.id === call.args.id) ?? null;
          if (memory) readIds.add(memory.id);
          output = { memory: memory ? { ...memory, generated: "" } : null }; summary = memory ? `已读取 ${memory.date} 的记录及 ${memory.sources.length} 个来源字段` : "原始记录不存在";
        } else throw new Error("模型请求了不支持的工具。");
        trace.value.push({ name: call.name, args: JSON.stringify(call.args), result: summary, time: Math.round(performance.now()-started) });
        return { callId: call.id, result: output };
      });
      statusText.value = "正在对照原文，并检查引用和语义…";
      step = await post("continue", { sessionId: step.sessionId, results: outputs }, aborter.signal);
    }
    if (currentRun !== runId) return;
    if (!step.result) throw new Error("没有收到完整的证据结果，请重试。");
    // 页面再查一次记录ID与逐字引文，拒绝不存在的来源。
    for (const item of step.result.comparisons) {
      const memory = snapshot.value.find((m) => m.id === item.memoryId);
      if (!readIds.has(item.memoryId) || !memory || item.sources.some((quote) => !memory.sources.some((s) => s.field === quote.field && s.origin !== "image_model" && s.text.includes(quote.quote)))) {
        throw new Error("证据与本地原文不一致，本次结果未展示。请重新查找。");
      }
    }
    result.value = step.result;
    selected.value = step.result.candidates[0]?.memoryId ?? "";
    statusText.value = `已完成 ${trace.value.length} 次本地工具执行；${( (performance.now()-started)/1000 ).toFixed(1)} 秒。`;
  } catch (cause) {
    if (currentRun !== runId) return;
    error.value = aborter.signal.aborted ? "已停止检索。" : cause instanceof DOMException && cause.name === "AbortError" ? "请求超时，请稍后重试。" : cause instanceof Error ? cause.message : "检索失败，请稍后重试。";
    statusText.value = "这次没有生成结论，也没有修改日记。";
  } finally { if (currentRun === runId) { busy.value = false; controller.value = null; } }
}
function refine(text: string) {
  if (corrections.value.length >= 8) { error.value = "已达到本轮澄清上限，请开启一次新查询。"; return; }
  corrections.value.push(text); correction.value = ""; void run(true);
}
function switchData() {
  stop(); demo.value = !demo.value; result.value = null; trace.value = []; corrections.value = []; snapshot.value = []; selected.value = ""; error.value = "";
  query.value = demo.value ? "我记得去年有次和小林在河边看晚霞，好像还下雨了。" : "";
  statusText.value = demo.value ? "当前使用三条合成日记；点击查找后将真实执行模型和本地工具。" : "已切回这台设备的记录。";
}
</script>

<template>
  <section class="er-workspace" aria-label="证据回忆工作台">
    <div class="er-intro"><div><p class="er-eyebrow">聊着找</p><h2>把记得的片段，放回原文里核对。</h2><p>线索可以不完整，也可以改。没写下来的事，先留作未知。</p></div><button class="er-link" type="button" :disabled="busy" @click="switchData">{{ demo ? '返回我的记录' : '试用合成案例' }}</button></div>
    <p v-if="demo" class="er-demo" role="note">合成案例 · 仅在此工作台临时使用，不会写入、覆盖或同步你的日记。模型输出不预设。</p>
    <form class="er-search" @submit.prevent="run(false)"><label for="er-query">你记得什么？</label><div class="er-search-row"><textarea id="er-query" v-model="query" :disabled="busy" maxlength="1000" rows="2" placeholder="记得和谁、在哪儿，或者那时的心情…"></textarea><button class="er-primary" type="submit" :disabled="busy">{{ busy ? '正在核对…' : '查找并核对' }}</button><button v-if="busy" class="er-link" type="button" @click="stop">停止</button></div><small>检索在本机执行；匹配摘要和选中候选的文字会发送给 AI 服务核对，照片不会随本次查询上传。这里的纠正只改变线索。</small></form>
    <p class="er-stage" role="status" aria-live="polite">{{ statusText }}</p><p v-if="error" class="er-error" role="alert">{{ error }}</p>
    <div v-if="result" class="er-verdict"><h3>{{ verdict }}</h3><p>这是记录与线索的吻合情况，不能证明当时实际发生了什么。{{ result.rejected ? `有 ${result.rejected} 项判断未通过核验，已按未知处理。` : '' }}</p></div>
    <div v-if="result" class="er-grid">
      <aside class="er-panel er-clues"><h3>你的线索</h3><p class="er-hint">点选一条，查看候选与原文如何对应。</p><button v-for="clue in result.clues" :key="clue.id" class="er-clue" :class="{active:selectedClue===clue.id}" :aria-pressed="selectedClue===clue.id" @click="pickClue(clue.id)">{{ clue.text }}</button><div v-if="corrections.length" class="er-corrections"><h4>本轮纠正</h4><p v-for="(item,i) in corrections" :key="i">{{ item }}</p></div></aside>
      <section class="er-panel er-candidates"><h3>候选记忆 <span>{{ cards.length }}</span></h3><p v-if="!cards.length" class="er-hint">没有读到可用候选。可以删除不确定的日期或换一个场景词。</p><button v-for="card in cards" :key="card.memoryId" class="er-memory" :class="{active:selected===card.memoryId}" :aria-pressed="selected===card.memoryId" @click="pickMemory(card.memoryId)"><span class="er-date">{{ card.memory.date }}</span><strong>{{ card.memory.title }}</strong><span class="er-hint">{{ card.supported }} 条线索有支持 · {{ card.conflicts }} 条明确冲突</span><span v-for="clue in result.clues.filter(c=>!selectedClue||c.id===selectedClue)" :key="clue.id" class="er-matrix"><span>{{ clue.text }}</span><span class="er-tag" :data-status="comparisonFor(card.memoryId,clue.id)?.status ?? 'unknown'">{{ statusLabel[comparisonFor(card.memoryId,clue.id)?.status ?? 'unknown'] }}</span></span></button></section>
      <section class="er-panel er-evidence"><h3>原始证据</h3><template v-if="chosen"><p class="er-date">{{ chosen.date }} · {{ chosen.id }}</p><article v-for="item in evidence" :key="item.clueId" class="er-proof"><h4>{{ result.clues.find(c=>c.id===item.clueId)?.text }}</h4><span class="er-tag" :data-status="item.status">{{ statusLabel[item.status] }}</span><p v-if="item.status==='unknown'" class="er-hint">没有找到足够的原文依据。未提及，不代表没有发生。</p><blockquote v-for="(source,i) in item.sources" :key="i"><span>{{ source.quote }}</span><cite>{{ fieldName(source.field) }} · 已核对逐字引用</cite></blockquote></article><details class="er-original"><summary>查看这条记录的完整来源</summary><div v-for="source in chosen.sources" :key="source.field"><h4>{{ fieldName(source.field) }} <small v-if="source.origin==='image_model'">未核对的 AI 观察</small></h4><p>{{ source.text }}</p></div><div v-if="chosen.generated"><h4>AI 整理 / 保存正文 <small>不作为用户原话证据</small></h4><p>{{ chosen.generated }}</p></div><p v-if="!chosen.sources.some(s=>s.origin==='user')" class="er-hint">此记录缺少可用的用户原话，不能仅凭 AI 整理内容确认细节。</p></details></template><p v-else class="er-hint">选一条候选记录查看证据。</p></section>
    </div>
    <section v-if="result" class="er-refine"><h3>{{ result.clarification?.question || '有什么线索需要调整？' }}</h3><div class="er-options"><button v-for="(option,i) in result.clarification?.options ?? []" :key="i" class="er-option" :disabled="busy" @click="refine(option.text)">{{ option.label }}</button></div><form @submit.prevent="correction.trim()&&refine(correction.trim())"><label for="er-correction">补充或纠正线索</label><div class="er-search-row"><input id="er-correction" v-model="correction" :disabled="busy" maxlength="500" placeholder="例如：更确定是小林，下雨这条先不算"><button class="er-primary" :disabled="busy||!correction.trim()">调整后重新查找</button></div></form><p class="er-hint">每次调整都会重新执行检索；原始日记不会改变。</p></section>
    <details v-if="trace.length" class="er-trace"><summary>为什么这样判断 · 查看真实工具执行（{{ trace.length }} 次）</summary><ol><li v-for="(entry,i) in trace" :key="i"><strong>{{ entry.name }}</strong><span>{{ entry.result }} · {{ entry.time }}ms</span><code>{{ entry.args }}</code></li></ol><p>轨迹来自本次模型请求及浏览器实际执行，不是预设步骤。逐字引用校验与语义核验在结论展示前执行。</p></details>
    <p v-if="activeQuery&&!result&&!busy&&!error" class="er-hint">上次线索：{{ activeQuery }}</p>
  </section>
</template>
