import { openDb, requestToPromise, txDone } from "./indexeddb.js";
import { memoryToRecord } from "./record-codec.js";

const KEY = "lumina.records.v3";
const MIGRATED = "recordsRepositoryMigrated";
const DELETES = "explicitRecordDeletes";
let cache = legacyRecords();
let chain = Promise.resolve();

function legacyRecords() {
  try { const rows = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows.filter(r => r && typeof r.id === "string") : []; }
  catch { return []; }
}
function publish(rows, origin) {
  cache = rows.sort((a,b) => Date.parse(b.ts) - Date.parse(a.ts));
  // 只是兼容缓存；缓存满不影响已提交到 IndexedDB 的记录。
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { console.warn("[Lumina] compatibility cache unavailable; IndexedDB records are safe"); }
  window.dispatchEvent(new CustomEvent("lumina:records-changed", { detail: { origin } }));
  window.LuminaUI?.refresh?.();
}
async function initialize() {
  const db = await openDb();
  const tx = db.transaction(["records", "memories", "kv"], "readwrite");
  const done = txDone(tx);
  const rowsRequest = tx.objectStore("records").getAll();
  const memoriesRequest = tx.objectStore("memories").getAll();
  const flagRequest = tx.objectStore("kv").get(MIGRATED);
  const [rows, memories, flag] = await Promise.all([rowsRequest, memoriesRequest, flagRequest].map(requestToPromise));
  const byId = new Map(rows.map(r => [r.id, r]));
  if (!flag?.value) {
    for (const record of legacyRecords()) if (!byId.has(record.id)) byId.set(record.id, record);
    for (const memory of memories) {
      if (memory.deletedAt) byId.delete(memory.id);
      else if (!byId.has(memory.id) || memory.revision > 0) byId.set(memory.id, memoryToRecord(memory, byId.get(memory.id) ?? null));
    }
    for (const record of byId.values()) tx.objectStore("records").put(record);
    tx.objectStore("kv").put({ key: MIGRATED, value: true });
  }
  await done;
  publish([...byId.values()], "hydrate");
}

export const recordsRepository = {
  ready: null,
  list() { return structuredClone(cache); },
  replace(rows, { deletedIds = [], origin = "local" } = {}) {
    // 缺失不等于删除。只写入当前调用真正修改的记录；保留其他标签页新建的数据。
    const previous = new Map(cache.map(r => [r.id, JSON.stringify(r)]));
    const changed = structuredClone(rows).filter(r => previous.get(r.id) !== JSON.stringify(r));
    const deletes = [...new Set(deletedIds)];
    const operation = chain.then(async () => {
      await recordsRepository.ready;
      const db = await openDb();
      const tx = db.transaction(["records", "kv"], "readwrite"); const done = txDone(tx);
      const pending = (await requestToPromise(tx.objectStore("kv").get(DELETES)))?.value ?? [];
      const cancel = new Set(changed.map(r => r.id));
      const nextDeletes = [...new Set([...pending.filter(id => !cancel.has(id)), ...deletes])];
      for (const record of changed) tx.objectStore("records").put(record);
      for (const id of deletes) tx.objectStore("records").delete(id);
      tx.objectStore("kv").put({ key: DELETES, value: nextDeletes });
      const all = await requestToPromise(tx.objectStore("records").getAll());
      await done; publish(all, origin);
    });
    chain = operation.catch(() => undefined);
    return operation;
  },
  async pendingDeletes() { await this.ready; const db=await openDb(); return (await requestToPromise(db.transaction("kv").objectStore("kv").get(DELETES)))?.value ?? []; },
  async ackDeletes(ids) {
    const db=await openDb(); const tx=db.transaction("kv","readwrite"); const done=txDone(tx);
    const pending=(await requestToPromise(tx.objectStore("kv").get(DELETES)))?.value ?? [];
    tx.objectStore("kv").put({key:DELETES,value:pending.filter(id=>!ids.includes(id))}); await done;
  },
};
if (typeof window !== "undefined") window.LuminaRecords = recordsRepository;
recordsRepository.ready = initialize();
recordsRepository.ready.catch(error => { console.error("[Lumina] IndexedDB initialization failed", error); window.LuminaUI?.toast?.("本地数据库未能打开，记录未改动。请重试。"); });
