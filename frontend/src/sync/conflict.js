import { kvGet, kvSet } from "../storage/indexeddb.js";

const CONFLICT_KEY = "syncConflicts";

export async function listConflicts() {
  const list = await kvGet(CONFLICT_KEY);
  return Array.isArray(list) ? list : [];
}

async function saveConflicts(list) {
  await kvSet(CONFLICT_KEY, list);
}

export async function addConflict({ memoryId, local, server, baseRevision }) {
  const list = await listConflicts();
  const next = list.filter((item) => item.memoryId !== memoryId);
  next.push({
    memoryId,
    local,
    server,
    baseRevision,
    detectedAt: Date.now(),
  });
  await saveConflicts(next);
  return next;
}

export async function getConflict(memoryId) {
  const list = await listConflicts();
  return list.find((item) => item.memoryId === memoryId) ?? null;
}

export async function removeConflict(memoryId) {
  const list = await listConflicts();
  await saveConflicts(list.filter((item) => item.memoryId !== memoryId));
}

export async function clearConflicts() {
  await saveConflicts([]);
}
