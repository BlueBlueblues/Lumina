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
import {
  decryptMemoryPayload,
  deriveVaultKey,
  encryptMemoryPayload,
  isEncryptedMemory,
} from "./e2ee.js";

const K = {
  token: "syncToken",
  vault: "syncVaultId",
  device: "syncDeviceId",
  cursor: "syncCursor",
  lastAt: "syncLastAt",
  deviceName: "syncDeviceName",
  e2eeKey: "syncE2eeKey",
};

let running = null;

export async function getSyncState() {
  const [token, vaultId, deviceId, cursor, lastAt, deviceName, e2eeKey] =
    await Promise.all([
      kvGet(K.token),
      kvGet(K.vault),
      kvGet(K.device),
      kvGet(K.cursor),
      kvGet(K.lastAt),
      kvGet(K.deviceName),
      kvGet(K.e2eeKey),
    ]);

  return {
    token: token ?? null,
    vaultId: vaultId ?? null,
    deviceId: deviceId ?? null,
    cursor: Number(cursor) || 0,
    lastAt: typeof lastAt === "number" ? lastAt : null,
    deviceName: deviceName ?? "",
    e2eeEnabled: Boolean(e2eeKey),
    enabled: Boolean(token && vaultId && deviceId),
  };
}

export async function enableE2eeWithPassphrase(passphrase) {
  const state = await getSyncState();
  if (!state.vaultId) throw new Error("请先开启云同步空间，再启用端到端加密。");
  const key = await deriveVaultKey(passphrase, state.vaultId);
  await kvSet(K.e2eeKey, key);
  await kvSet(K.cursor, 0);
  await enqueueAllLocalMemories();
  return { e2eeEnabled: true };
}

export async function disableE2ee() {
  await kvDelete(K.e2eeKey);
  return { e2eeEnabled: false };
}

async function storeCredentials(data, deviceName, passphraseForE2ee = null) {
  await kvSet(K.token, data.deviceToken);
  await kvSet(K.vault, data.vaultId);
  await kvSet(K.device, data.deviceId);
  await kvSet(K.cursor, 0);
  await kvSet(K.lastAt, null);
  if (deviceName) await kvSet(K.deviceName, deviceName);
  if (passphraseForE2ee) {
    try {
      const key = await deriveVaultKey(passphraseForE2ee, data.vaultId);
      await kvSet(K.e2eeKey, key);
    } catch {
      // Fallback gracefully if subtle crypto is unavailable
    }
  }
}

async function enqueueAllLocalMemories() {
  const memories = await listMemories();
  for (const memory of memories) {
    await enqueueMemory(memory.id, memory.revision ?? 0);
  }
}

export async function createSyncSpace(deviceName, { e2eePassphrase = null } = {}) {
  const data = await syncApi.pair({ mode: "create", deviceName });
  await storeCredentials(data, deviceName, e2eePassphrase);
  await enqueueAllLocalMemories();
  return data;
}

export async function joinSyncSpace(code, deviceName, { recoveryCodeForE2ee = null } = {}) {
  const data = await syncApi.pair({ mode: "join", code, deviceName });
  await storeCredentials(data, deviceName, recoveryCodeForE2ee);
  await enqueueAllLocalMemories();
  return data;
}

export async function recoverSyncSpace(recoveryCode, deviceName, { enableE2ee = false } = {}) {
  const data = await syncApi.pair({ mode: "recover", recoveryCode, deviceName });
  await storeCredentials(data, deviceName, enableE2ee ? recoveryCode : null);
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
  await kvDelete(K.e2eeKey);

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
  const e2eeKey = await kvGet(K.e2eeKey);
  let hasMore = true;
  let pages = 0;
  let applied = 0;

  while (hasMore && pages < 20) {
    const page = await syncApi.pull(cursor, 100, token);
    for (const event of page?.events ?? []) {
      if (await applyRemoteEvent(event, e2eeKey)) applied += 1;
    }
    cursor = Number(page?.nextCursor) || cursor;
    await kvSet(K.cursor, cursor);
    hasMore = Boolean(page?.hasMore);
    pages += 1;
  }

  return applied;
}

async function applyRemoteEvent(event, e2eeKey = null) {
  let memory = event?.memory;
  if (!memory?.id) return false;
  if (await hasUnsynced(memory.id)) return false;
  if (isEncryptedMemory(memory) && e2eeKey) {
    try {
      memory = await decryptMemoryPayload(memory, e2eeKey);
    } catch {
      return false;
    }
  }
  await applyRemoteMemory(memory);
  return true;
}

async function pushAll(token) {
  const pending = await listPending(50);
  if (!pending.length) return 0;
  const e2eeKey = await kvGet(K.e2eeKey);

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
    const rawPayload = toSyncPayload(memory);
    const wirePayload = e2eeKey ? await encryptMemoryPayload(rawPayload, e2eeKey) : rawPayload;
    const bytes = new TextEncoder().encode(JSON.stringify(wirePayload)).length;
    const currentBytes = sent.reduce((sum, entry) => sum + entry.bytes, 0);
    if (sent.length && currentBytes + bytes > 8 * 1024 * 1024) break;
    sent.push({ item, memory, wirePayload, bytes });
    await markSending(item.seq);
  }

  if (!sent.length) return 0;

  let response;
  try {
    response = await syncApi.push(
      sent.map(({ item, memory, wirePayload }) => ({
        baseRevision: item.baseRevision ?? memory.revision ?? 0,
        memory: wirePayload,
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
      let serverMem = result.serverMemory ?? null;
      if (serverMem && isEncryptedMemory(serverMem) && e2eeKey) {
        try {
          serverMem = await decryptMemoryPayload(serverMem, e2eeKey);
        } catch {
          // keep encrypted if key mismatch
        }
      }
      if (
        serverMem &&
        sameContent(entry.memory, serverMem)
      ) {
        await updateLocalRevision(
          entry.memory.id,
          serverMem.revision,
        );
        await remove(entry.item.seq);
        applied += 1;
        continue;
      }

      await markConflict(entry.item.seq);
      await addConflict({
        memoryId: entry.memory.id,
        local: entry.memory,
        server: serverMem,
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
  const e2eeKey = await kvGet(K.e2eeKey);

  const conflicts = await listConflicts();
  const conflict = conflicts.find((item) => item.memoryId === memoryId);
  if (!conflict) throw new Error("这条冲突已经不存在。");

  if (strategy === "server") {
    if (!conflict.server) {
      throw new Error("服务器上没有这条记录，请保留本地版本或重新同步。");
    }
    const serverDecoded =
      isEncryptedMemory(conflict.server) && e2eeKey
        ? await decryptMemoryPayload(conflict.server, e2eeKey)
        : conflict.server;
    await applyRemoteMemory(serverDecoded);
    await removeConflict(memoryId);
    await removeByMemoryId(memoryId);
    return { status: "server_kept", memory: serverDecoded };
  }

  const local = await getMemory(memoryId);
  const source = strategy === "merged" ? merged : local;
  if (!source) throw new Error("本地记录已不存在。");

  const rawPayload = {
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
  const payload = e2eeKey ? await encryptMemoryPayload(rawPayload, e2eeKey) : rawPayload;

  const baseRevision =
    conflict.server?.revision ?? conflict.baseRevision ?? 0;

  const response = await syncApi.resolve(
    { memoryId, baseRevision, strategy, memory: payload },
    state.token,
  );

  const resolvedMem =
    isEncryptedMemory(response.memory) && e2eeKey
      ? await decryptMemoryPayload(response.memory, e2eeKey)
      : response.memory;
  await applyRemoteMemory(resolvedMem);
  await removeConflict(memoryId);
  await removeByMemoryId(memoryId);
  return { ...response, memory: resolvedMem };
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
