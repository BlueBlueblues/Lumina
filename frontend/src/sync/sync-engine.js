import { normalizeOriginal } from "../storage/record-codec.js";
import { kvDelete, kvGet, kvSet } from "../storage/indexeddb.js";
import {
  applyRemoteMemory,
  getDeviceId,
  getMemory,
  listMemories,
  resetAllRevisions,
  updateLocalRevision,
} from "../storage/memories.js";
import {
  enqueueMemory,
  hasUnsynced,
  listPending,
  markConflict,
  markPending,
  markSending,
  remove,
  removeByMemoryId,
  removeConflictItems,
} from "../storage/outbox.js";
import { syncApi } from "./api.js";
import {
  addConflict,
  clearConflicts,
  listConflicts,
  removeConflict,
} from "./conflict.js";

const K = {
  token: "syncToken",
  vault: "syncVaultId",
  device: "syncDeviceId",
  cursor: "syncCursor",
  lastAt: "syncLastAt",
  deviceName: "syncDeviceName",
};

let running = null;

export async function getSyncState() {
  const [token, vaultId, deviceId, cursor, lastAt, deviceName] =
    await Promise.all([
      kvGet(K.token),
      kvGet(K.vault),
      kvGet(K.device),
      kvGet(K.cursor),
      kvGet(K.lastAt),
      kvGet(K.deviceName),
    ]);

  return {
    token: token ?? null,
    vaultId: vaultId ?? null,
    deviceId: deviceId ?? null,
    cursor: Number(cursor) || 0,
    lastAt: typeof lastAt === "number" ? lastAt : null,
    deviceName: deviceName ?? "",
    enabled: Boolean(token && vaultId && deviceId),
  };
}

async function storeCredentials(data, deviceName) {
  await kvSet(K.token, data.deviceToken);
  await kvSet(K.vault, data.vaultId);
  await kvSet(K.device, data.deviceId);
  await kvSet(K.cursor, 0);
  await kvSet(K.lastAt, null);
  if (deviceName) await kvSet(K.deviceName, deviceName);
}

async function enqueueAllLocalMemories() {
  const memories = await listMemories();
  for (const memory of memories) {
    await enqueueMemory(memory.id, 0);
  }
}

export async function createSyncSpace(deviceName) {
  const data = await syncApi.pair({ mode: "create", deviceName });
  await storeCredentials(data, deviceName);
  await enqueueAllLocalMemories();
  return data;
}

export async function joinSyncSpace(code, deviceName) {
  const data = await syncApi.pair({ mode: "join", code, deviceName });
  await storeCredentials(data, deviceName);
  await enqueueAllLocalMemories();
  return data;
}

export async function recoverSyncSpace(recoveryCode, deviceName) {
  const data = await syncApi.pair({ mode: "recover", recoveryCode, deviceName });
  await storeCredentials(data, deviceName);
  await enqueueAllLocalMemories();
  return data;
}

export async function generatePairingCode() {
  const state = await getSyncState();
  if (!state.enabled) throw new Error("云同步尚未开启。");
  return syncApi.pair({ mode: "new-code" }, state.token);
}

export async function disableSync(purgeCloudData = false, confirmPurge) {
  const state = await getSyncState();

  if (state.enabled) {
    await syncApi.disable(
      {
        purgeCloudData,
        ...(purgeCloudData ? { confirmPurge } : {}),
      },
      state.token,
    );
  }

  await kvDelete(K.token);
  await kvDelete(K.vault);
  await kvDelete(K.device);
  await kvDelete(K.cursor);
  await kvDelete(K.lastAt);

  await resetAllRevisions();
  await clearConflicts();
  await removeConflictItems();

  return { disabled: true };
}

export function syncNow() {
  if (running) return running;

  running = (async () => {
    try {
      const state = await getSyncState();
      if (!state.enabled) return { skipped: true };

      const pulled = await pullAll(state.token);
      const pushed = await pushAll(state.token);
      await kvSet(K.lastAt, Date.now());
      return { ok: true, pulled, pushed };
    } finally {
      running = null;
    }
  })();

  return running;
}

async function pullAll(token) {
  let cursor = Number(await kvGet(K.cursor)) || 0;
  let hasMore = true;
  let pages = 0;
  let applied = 0;

  while (hasMore && pages < 20) {
    const page = await syncApi.pull(cursor, 100, token);
    for (const event of page?.events ?? []) {
      if (await applyRemoteEvent(event)) applied += 1;
    }
    cursor = Number(page?.nextCursor) || cursor;
    await kvSet(K.cursor, cursor);
    hasMore = Boolean(page?.hasMore);
    pages += 1;
  }

  return applied;
}

async function applyRemoteEvent(event) {
  const memory = event?.memory;
  if (!memory?.id) return false;
  if (await hasUnsynced(memory.id)) return false;
  await applyRemoteMemory(memory);
  return true;
}

async function pushAll(token) {
  const pending = await listPending(50);
  if (!pending.length) return 0;

  const sent = [];

  for (const item of pending) {
    let memory = await getMemory(item.memoryId);
    if (!memory) {
      await remove(item.seq);
      continue;
    }
    if (memory.deletedAt && (memory.revision ?? 0) === 0) {
      await remove(item.seq);
      continue;
    }
    if (!memory.deviceId) {
      memory = { ...memory, deviceId: await getDeviceId() };
    }
    const bytes = new TextEncoder().encode(JSON.stringify(toSyncPayload(memory))).length;
    const currentBytes = sent.reduce((sum, entry) => sum + entry.bytes, 0);
    if (sent.length && currentBytes + bytes > 8 * 1024 * 1024) break;
    sent.push({ item, memory, bytes });
    await markSending(item.seq);
  }

  if (!sent.length) return 0;

  let response;
  try {
    response = await syncApi.push(
      sent.map(({ item, memory }) => ({
        baseRevision: item.baseRevision ?? memory.revision ?? 0,
        memory: toSyncPayload(memory),
      })),
      token,
    );
  } catch (error) {
    for (const entry of sent) {
      try {
        await markPending(entry.item.seq, error?.message || "同步失败");
      } catch {
        // Keep the original error.
      }
    }
    throw error;
  }

  let applied = 0;
  const results = Array.isArray(response?.results) ? response.results : [];

  for (let index = 0; index < sent.length; index += 1) {
    const entry = sent[index];
    const result = results[index];

    if (!result) {
      await markPending(entry.item.seq, "服务器返回结果不完整");
      continue;
    }

    if (result.status === "applied") {
      const revision =
        result.serverMemory?.revision ?? (entry.memory.revision ?? 0) + 1;
      await updateLocalRevision(entry.memory.id, revision);
      await remove(entry.item.seq);
      applied += 1;
      continue;
    }

    if (result.status === "conflict") {
      if (
        result.serverMemory &&
        sameContent(entry.memory, result.serverMemory)
      ) {
        await updateLocalRevision(
          entry.memory.id,
          result.serverMemory.revision,
        );
        await remove(entry.item.seq);
        applied += 1;
        continue;
      }

      await markConflict(entry.item.seq);
      await addConflict({
        memoryId: entry.memory.id,
        local: entry.memory,
        server: result.serverMemory ?? null,
        baseRevision:
          entry.item.baseRevision ?? entry.memory.revision ?? 0,
      });
      continue;
    }

    await markPending(entry.item.seq, "未知同步状态");
  }

  return applied;
}

export async function resolveConflictWithServer(memoryId, strategy, merged = null) {
  const state = await getSyncState();
  if (!state.enabled) throw new Error("云同步尚未开启。");

  const conflicts = await listConflicts();
  const conflict = conflicts.find((item) => item.memoryId === memoryId);
  if (!conflict) throw new Error("这条冲突已经不存在。");

  if (strategy === "server") {
    if (!conflict.server) {
      throw new Error("服务器上没有这条记录，请保留本地版本或重新同步。");
    }
    await applyRemoteMemory(conflict.server);
    await removeConflict(memoryId);
    await removeByMemoryId(memoryId);
    return { status: "server_kept", memory: conflict.server };
  }

  const local = await getMemory(memoryId);
  const source = strategy === "merged" ? merged : local;
  if (!source) throw new Error("本地记录已不存在。");

  const payload = {
    title: source.title ?? "",
    content: source.content ?? "",
    ...(source.recordDate ? { recordDate: source.recordDate } : {}),
    ...(source.mood ? { mood: source.mood } : {}),
    tags: source.tags ?? [],
    aiFacts: source.aiFacts ?? [],
    ...(source.supplement ? { supplement: source.supplement } : {}),
    ...(source.original !== undefined ? { original: source.original } : {}),
    hasPhoto: Boolean(source.hasPhoto),
    deletedAt: source.deletedAt ?? null,
  };

  const baseRevision =
    conflict.server?.revision ?? conflict.baseRevision ?? 0;

  const response = await syncApi.resolve(
    { memoryId, baseRevision, strategy, memory: payload },
    state.token,
  );

  await applyRemoteMemory(response.memory);
  await removeConflict(memoryId);
  await removeByMemoryId(memoryId);
  return response;
}

function toSyncPayload(memory) {
  return {
    id: memory.id,
    title: memory.title ?? "",
    content: memory.content ?? "",
    ...(memory.recordDate ? { recordDate: memory.recordDate } : {}),
    ...(memory.mood ? { mood: memory.mood } : {}),
    tags: memory.tags ?? [],
    aiFacts: memory.aiFacts ?? [],
    ...(memory.supplement ? { supplement: memory.supplement } : {}),
    ...(memory.original !== undefined ? { original: memory.original } : {}),
    hasPhoto: Boolean(memory.hasPhoto),
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt,
    revision: memory.revision ?? 0,
    deviceId: memory.deviceId,
    deletedAt: memory.deletedAt ?? null,
  };
}

function normalizeContent(memory) {
  return JSON.stringify({
    title: memory.title ?? "",
    content: memory.content ?? "",
    recordDate: memory.recordDate ?? null,
    mood: memory.mood ?? null,
    tags: memory.tags ?? [],
    aiFacts: memory.aiFacts ?? [],
    supplement: memory.supplement ?? null,
    original: normalizeOriginal(memory.original),
    hasPhoto: Boolean(memory.hasPhoto),
    deletedAt: memory.deletedAt ?? null,
  });
}

function sameContent(left, right) {
  return normalizeContent(left) === normalizeContent(right);
}
