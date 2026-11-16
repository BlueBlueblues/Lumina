import { dbGet, dbGetAll, dbPut, kvGet, kvSet, randomId } from "./indexeddb.js";

export function todayString() {
  return new Date().toLocaleDateString("sv-SE");
}

export async function getDeviceId() {
  const existing = await kvGet("deviceId");
  if (existing) return existing;
  const deviceId = randomId();
  await kvSet("deviceId", deviceId);
  return deviceId;
}

export async function emptyMemory(deviceId = null) {
  const now = Date.now();
  return {
    id: randomId(),
    title: "",
    content: "",
    recordDate: todayString(),
    mood: null,
    tags: [],
    aiFacts: [],
    supplement: null,
    hasPhoto: false,
    createdAt: now,
    updatedAt: now,
    revision: 0,
    deviceId: deviceId ?? (await getDeviceId()),
    deletedAt: null,
  };
}

export async function listMemories({ includeDeleted = false } = {}) {
  const all = await dbGetAll("memories");
  return all
    .filter((memory) => includeDeleted || !memory.deletedAt)
    .sort((a, b) => {
      const dateA = a.recordDate ?? "";
      const dateB = b.recordDate ?? "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return b.updatedAt - a.updatedAt;
    });
}

export async function getMemory(id) {
  return dbGet("memories", id);
}

export async function saveMemory(input) {
  const existing = input.id ? await getMemory(input.id) : null;
  const now = Date.now();

  const record = {
    id: input.id ?? randomId(),
    title: input.title ?? existing?.title ?? "",
    content: input.content ?? existing?.content ?? "",
    recordDate:
      input.recordDate !== undefined
        ? input.recordDate || null
        : existing?.recordDate ?? todayString(),
    mood:
      input.mood !== undefined ? input.mood || null : existing?.mood ?? null,
    tags: Array.isArray(input.tags) ? input.tags : existing?.tags ?? [],
    aiFacts: Array.isArray(input.aiFacts)
      ? input.aiFacts
      : existing?.aiFacts ?? [],
    supplement:
      input.supplement !== undefined
        ? input.supplement || null
        : existing?.supplement ?? null,
    hasPhoto:
      input.hasPhoto !== undefined
        ? Boolean(input.hasPhoto)
        : Boolean(existing?.hasPhoto),
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
    revision: existing?.revision ?? input.revision ?? 0,
    deviceId: existing?.deviceId ?? input.deviceId ?? (await getDeviceId()),
    deletedAt:
      input.deletedAt !== undefined
        ? input.deletedAt
        : existing?.deletedAt ?? null,
  };

  await dbPut("memories", record);
  return record;
}

export async function markMemoryDeleted(id) {
  const existing = await getMemory(id);
  if (!existing) return null;

  return saveMemory({
    ...existing,
    title: "",
    content: "",
    mood: null,
    tags: [],
    aiFacts: [],
    supplement: null,
    hasPhoto: false,
    deletedAt: Date.now(),
  });
}

export async function applyRemoteMemory(remote) {
  const record = {
    id: remote.id,
    title: remote.title ?? "",
    content: remote.content ?? "",
    recordDate: remote.recordDate ?? null,
    mood: remote.mood ?? null,
    tags: Array.isArray(remote.tags) ? remote.tags : [],
    aiFacts: Array.isArray(remote.aiFacts) ? remote.aiFacts : [],
    supplement: remote.supplement ?? null,
    hasPhoto: Boolean(remote.hasPhoto),
    createdAt: remote.createdAt,
    updatedAt: remote.updatedAt,
    revision: remote.revision,
    deviceId: remote.deviceId,
    deletedAt: remote.deletedAt ?? null,
  };

  await dbPut("memories", record);
  return record;
}

export async function updateLocalRevision(id, revision) {
  const existing = await getMemory(id);
  if (!existing) return null;
  const record = { ...existing, revision };
  await dbPut("memories", record);
  return record;
}

export async function resetAllRevisions() {
  const all = await dbGetAll("memories");
  for (const memory of all) {
    if (memory.revision !== 0) {
      await dbPut("memories", { ...memory, revision: 0 });
    }
  }
}
