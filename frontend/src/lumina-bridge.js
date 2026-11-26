import { recordsRepository } from "./storage/records.js";
import { recordToMemory, memoryToRecord, syncFieldsChanged } from "./storage/record-codec.js";
import { deleteAssetsForMemory, getOriginal, savePhoto } from "./storage/assets.js";
import {
  getDeviceId,
  getMemory,
  listMemories,
  markMemoryDeleted,
  saveMemory,
} from "./storage/memories.js";
import { enqueueMemory } from "./storage/outbox.js";
import { listConflicts } from "./sync/conflict.js";
import {
  createSyncSpace,
  disableSync,
  generatePairingCode,
  getSyncState,
  joinSyncSpace,
  recoverSyncSpace,
  resolveConflictWithServer,
  syncNow,
} from "./sync/sync-engine.js";

const RECORDS_KEY = "lumina.records.v3";
const PHOTO_CAPTURE_TTL = 30 * 60_000;


const $ = (id) => document.getElementById(id);

let mirrorTimer = null;
let syncTimer = null;
let mirrorChain = Promise.resolve();
let syncing = null;
let ready = Promise.resolve();
let busy = false;
let pendingPhotoFile = null;
let pendingPhotoAt = 0;
let knownRecordIds = new Set();
let currentConflicts = [];
let lastConflictCount = 0;

function toast(message) {
  window.LuminaUI?.toast?.(message);
  if (!window.LuminaUI?.toast) console.info("[Lumina]", message);
}

function readRecords() { return recordsRepository.list(); }
async function writeRecords(records) { await recordsRepository.replace(records, { origin: "remote" }); }

async function mirrorLocalToShadow() {
  await recordsRepository.ready;
  const records = readRecords();
  const deviceId = await getDeviceId();
  const state = await getSyncState();
  const shadows = await listMemories({ includeDeleted: true });
  const byId = new Map(shadows.map((memory) => [memory.id, memory]));
  const localIds = new Set(records.map((record) => record.id));

  for (const record of records) {
    const existing = byId.get(record.id) ?? null;
    const memory = recordToMemory(record, existing, deviceId);

    if (!existing || syncFieldsChanged(existing, memory)) {
      await saveMemory(memory);
      if (state.enabled) {
        await enqueueMemory(record.id, existing?.revision ?? 0);
      }
    }
  }

  const explicitDeletes = await recordsRepository.pendingDeletes();
  for (const id of explicitDeletes) {
    if (localIds.has(id)) continue;
    const shadow = byId.get(id);
    if (shadow && !shadow.deletedAt) {
      await markMemoryDeleted(id);
      await deleteAssetsForMemory(id);
      if (state.enabled) await enqueueMemory(id, shadow.revision ?? 0);
    }
  }
  await recordsRepository.ackDeletes(explicitDeletes);

  if (pendingPhotoFile && Date.now() - pendingPhotoAt < PHOTO_CAPTURE_TTL) {
    const candidate = records.find(
      (record) =>
        (record.kind === "photo" || record.thumb) &&
        !knownRecordIds.has(record.id) &&
        Date.parse(record.ts),
    );
    if (candidate) {
      try {
        const existingOriginal = await getOriginal(candidate.id);
        if (!existingOriginal) {
          await savePhoto(candidate.id, pendingPhotoFile);
        }
      } catch (error) {
        console.warn("[Lumina] original photo save failed", error);
      }
      pendingPhotoFile = null;
    }
  }

  knownRecordIds = localIds;
}

function mirrorNow() {
  mirrorChain = mirrorChain
    .then(() => mirrorLocalToShadow())
    .catch((error) => {
      console.warn("[Lumina] local mirror failed", error);
    });
  return mirrorChain;
}

function scheduleMirror() {
  window.clearTimeout(mirrorTimer);
  mirrorTimer = window.setTimeout(() => {
    void mirrorNow().then(() => {
      scheduleSync(600);
    });
  }, 150);
}

function scheduleSync(delay = 600) {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(async () => {
    syncTimer = null;
    const state = await getSyncState().catch(() => ({ enabled: false }));
    if (state.enabled) {
      await runSync({ silent: true }).catch(() => undefined);
    }
  }, delay);
}

function needsRemoteMerge(local, shadow) {
  return (
    syncFieldsChanged(shadow, recordToMemory(local, shadow, shadow.deviceId))
  );
}

async function mergeRemoteToLocal() {
  const shadows = await listMemories({ includeDeleted: true });
  const records = readRecords();
  const byId = new Map(records.map((record) => [record.id, record]));
  const removed = [];
  let changed = false;

  for (const shadow of shadows) {
    const local = byId.get(shadow.id);

    if (shadow.deletedAt) {
      if (local) {
        byId.delete(shadow.id);
        removed.push(shadow.id);
        changed = true;
      }
      continue;
    }

    if (!local) {
      byId.set(shadow.id, memoryToRecord(shadow, null));
      changed = true;
      continue;
    }

    if (needsRemoteMerge(local, shadow)) {
      const next = memoryToRecord(shadow, local);
      Object.assign(local, next);
      changed = true;
    }
  }

  for (const id of removed) {
    await deleteAssetsForMemory(id).catch(() => undefined);
  }

  if (changed) {
    const merged = [...byId.values()].sort(
      (left, right) => new Date(right.ts) - new Date(left.ts),
    );
    await writeRecords(merged);
    window.LuminaUI?.refresh?.();
  }
}

async function runSync({ silent = true } = {}) {
  if (syncing) return syncing;

  syncing = (async () => {
    try {
      const state = await getSyncState();
      if (!state.enabled) return;

      await mirrorNow();
      await syncNow();
      await mergeRemoteToLocal();
      await refreshCloudUI();

      const conflicts = await listConflicts();
      if (conflicts.length && (lastConflictCount !== conflicts.length || !silent)) {
        toast(`有 ${conflicts.length} 条同步冲突，打开云同步处理`);
      }
      lastConflictCount = conflicts.length;
    } catch (error) {
      console.error("[Lumina] sync failed", error);
      if (!silent) toast(errorMessage(error));
      throw error;
    } finally {
      syncing = null;
    }
  })();

  return syncing;
}

function shortId(value) {
  const text = String(value ?? "");
  return text ? `${text.slice(0, 8)}…` : "—";
}

function errorMessage(error) {
  const code = error?.code;
  const messages = {
    sync_unavailable: "服务器尚未配置云同步数据库。",
    ai_unavailable: "服务器尚未配置 DeepSeek API Key。",
    unauthorized: "设备凭证缺失，请重新配对。",
    invalid_device_token: "设备凭证失效，请重新配对。",
    invalid_pairing_code: "配对码无效或已过期。",
    invalid_recovery_code: "恢复码无效。",
    rate_limited: "请求太频繁，请稍后再试。",
    revision_conflict: "服务器上已有更新版本，请重新同步后再处理。",
    memory_not_found: "服务器上找不到这条记录。",
  };
  return messages[code] || error?.message || "操作失败";
}

function defaultDeviceName() {
  const platform = navigator.platform || "";
  if (/Win/i.test(platform)) return "Windows 浏览器";
  if (/Mac/i.test(platform)) return "Mac 浏览器";
  if (/Linux/i.test(platform)) return "Linux 浏览器";
  return "我的浏览器";
}

function showCloudSecret(entries) {
  const box = $("cloudSecret");
  if (!box) return;
  box.replaceChildren();
  box.hidden = false;
  for (const [label, value] of entries) {
    const labelNode = document.createElement("div");
    labelNode.textContent = label;
    const valueNode = document.createElement("strong");
    valueNode.textContent = value;
    box.append(labelNode, valueNode);
  }
}

async function refreshCloudUI() {
  const state = await getSyncState();
  const conflicts = await listConflicts();
  currentConflicts = conflicts;

  const status = $("cloudStatus");
  if (status) {
    status.textContent = state.enabled
      ? `云同步已开启${state.e2eeEnabled ? "（🔒 零知识加密）" : ""} · 上次同步：${state.lastAt ? new Date(state.lastAt).toLocaleString() : "尚未同步"}`
      : "当前：本地模式（所有数据只在本机）";
    status.classList.toggle("online", state.enabled);
  }

  const menuSyncState = $("menuSyncState");
  if (menuSyncState) {
    menuSyncState.classList.toggle("on", state.enabled);
    menuSyncState.classList.toggle("alert", conflicts.length > 0);
  }
  const menuSync = $("menuSync");
  if (menuSync) {
    menuSync.title = state.enabled
      ? conflicts.length
        ? "云同步：有待处理冲突"
        : "云同步：已开启"
      : "云同步：本地模式";
  }
  const menuClear = $("menuClear");
  if (menuClear) {
    menuClear.textContent = state.enabled
      ? "清空全部（含云端）"
      : "清空本机记录";
  }
  window.LuminaSyncState = { enabled: state.enabled };

  const disabledPanel = $("cloudDisabledPanel");
  const enabledPanel = $("cloudEnabledPanel");
  if (disabledPanel) disabledPanel.hidden = state.enabled;
  if (enabledPanel) enabledPanel.hidden = !state.enabled;

  if ($("cloudVault")) $("cloudVault").textContent = shortId(state.vaultId);
  if ($("cloudE2eeState")) $("cloudE2eeState").textContent = state.e2eeEnabled ? "已启用 (AES-256-GCM)" : "未启用（明文同步）";
  if ($("cloudDevice")) $("cloudDevice").textContent = shortId(state.deviceId);
  if ($("cloudLast")) {
    $("cloudLast").textContent = state.lastAt
      ? new Date(state.lastAt).toLocaleString()
      : "尚未同步";
  }
  if ($("cloudDeviceName") && !$("cloudDeviceName").value) {
    $("cloudDeviceName").value = state.deviceName || defaultDeviceName();
  }

  const conflictsWrap = $("cloudConflictsWrap");
  if (conflictsWrap) conflictsWrap.hidden = conflicts.length === 0;

  if (conflicts.length) {
    const select = $("cloudConflictSelect");
    if (select) {
      select.replaceChildren();
      for (const conflict of conflicts) {
        const option = document.createElement("option");
        option.value = conflict.memoryId;
        option.textContent = conflict.local?.title || "（无标题）";
        select.append(option);
      }
    }
    renderSelectedConflict();
  }
}

function formatConflict(memory) {
  if (!memory) return "（没有版本）";
  return [
    memory.title || "无标题",
    "",
    memory.content || "（无正文）",
    "",
    `修订：v${memory.revision ?? "?"} · 设备：${shortId(memory.deviceId)}`,
  ].join("\n");
}

function renderSelectedConflict() {
  if (!currentConflicts.length) return;
  const select = $("cloudConflictSelect");
  const conflict =
    currentConflicts.find((item) => item.memoryId === select?.value) ??
    currentConflicts[0];

  if (select) select.value = conflict.memoryId;
  if ($("cloudLocal")) $("cloudLocal").value = formatConflict(conflict.local);
  if ($("cloudRemote")) {
    $("cloudRemote").value = conflict.server
      ? formatConflict(conflict.server)
      : "服务器上没有这条记录。";
  }
  if ($("cloudMergeTitle")) $("cloudMergeTitle").value = conflict.local?.title ?? "";
  if ($("cloudMergeContent")) {
    $("cloudMergeContent").value = conflict.local?.content ?? "";
  }
  if ($("cloudKeepServer")) $("cloudKeepServer").disabled = !conflict.server;
}

async function openCloud() {
  if (busy) return;
  await refreshCloudUI();
  const sheet = $("cloudSheet");
  if (sheet) {
    sheet.hidden = false;
    $("cloudDeviceName")?.focus?.();
  }
}

function closeCloud() {
  const sheet = $("cloudSheet");
  if (sheet) sheet.hidden = true;
}

async function onCreateSync() {
  if (busy) return;
  busy = true;
  try {
    await ready;
    const name = ($("cloudDeviceName")?.value || defaultDeviceName()).trim();
    const data = await createSyncSpace(name);
    showCloudSecret([
      ["恢复码（只显示一次，请立即保存到安全位置）", data.recoveryCode],
      ["第二台设备的配对码（10 分钟内有效）", data.pairingCode],
    ]);
    await refreshCloudUI();
    toast("同步空间已创建，请先保存恢复码");
    await runSync({ silent: false });
  } catch (error) {
    toast(errorMessage(error));
  } finally {
    busy = false;
  }
}

async function onJoinSync() {
  if (busy) return;
  const code = $("cloudJoinCode")?.value.trim();
  if (!code) return toast("请输入配对码");
  busy = true;
  try {
    await ready;
    const name = ($("cloudDeviceName")?.value || defaultDeviceName()).trim();
    await joinSyncSpace(code, name);
    await refreshCloudUI();
    toast("已加入同步空间，正在拉取日记");
    await runSync({ silent: false });
  } catch (error) {
    toast(errorMessage(error));
  } finally {
    busy = false;
  }
}

async function onRecoverSync() {
  if (busy) return;
  const code = $("cloudRecoverCode")?.value.trim();
  if (!code) return toast("请输入恢复码");
  busy = true;
  try {
    await ready;
    const name = ($("cloudDeviceName")?.value || defaultDeviceName()).trim();
    await recoverSyncSpace(code, name);
    await refreshCloudUI();
    toast("已通过恢复码接入同步空间");
    await runSync({ silent: false });
  } catch (error) {
    toast(errorMessage(error));
  } finally {
    busy = false;
  }
}

async function onSyncNow() {
  if (busy) return;
  busy = true;
  try {
    await runSync({ silent: false });
    await refreshCloudUI();
    toast("同步完成");
  } catch {
    // runSync already reported the error.
  } finally {
    busy = false;
  }
}

async function onGeneratePairingCode() {
  if (busy) return;
  busy = true;
  try {
    const data = await generatePairingCode();
    const box = $("cloudPairOut");
    if (box) {
      box.replaceChildren();
      box.hidden = false;
      const hint = document.createElement("div");
      hint.textContent = "在第二台设备输入这个配对码（10 分钟内有效）：";
      const code = document.createElement("strong");
      code.textContent = data.pairingCode;
      const expiry = document.createElement("div");
      expiry.textContent = `过期时间：${new Date(data.pairingExpiresAt).toLocaleTimeString()}`;
      box.append(hint, code, expiry);
    }
    toast("配对码已生成，旧配对码已失效");
  } catch (error) {
    toast(errorMessage(error));
  } finally {
    busy = false;
  }
}

async function onDisableSync() {
  if (busy) return;
  const purge = Boolean($("cloudPurge")?.checked);
  const confirmPurge = $("cloudPurgeConfirm")?.value.trim() || "";

  if (purge && confirmPurge !== "DELETE") {
    return toast('请输入 DELETE 确认删除云端数据');
  }

  const message = purge
    ? "将删除云端全部日记数据（所有设备）并关闭同步，不可恢复。继续？"
    : "关闭本设备同步？本地日记和照片仍会保留。";
  if (!window.confirm(message)) return;

  busy = true;
  try {
    await disableSync(purge, confirmPurge);
    if ($("cloudSecret")) $("cloudSecret").hidden = true;
    if ($("cloudPairOut")) $("cloudPairOut").hidden = true;
    await refreshCloudUI();
    window.LuminaUI?.refresh?.();
    toast(purge ? "云端数据已删除，同步已关闭" : "本设备同步已关闭");
  } catch (error) {
    toast(errorMessage(error));
  } finally {
    busy = false;
  }
}

async function onResolveConflict(strategy) {
  if (busy) return;
  const select = $("cloudConflictSelect");
  const conflict = currentConflicts.find(
    (item) => item.memoryId === select?.value,
  );
  if (!conflict) return;

  busy = true;
  try {
    if (strategy === "merged") {
      const local = (await getMemory(conflict.memoryId)) ?? conflict.local;
      await resolveConflictWithServer(conflict.memoryId, "merged", {
        ...local,
        title: $("cloudMergeTitle")?.value ?? local.title,
        content: $("cloudMergeContent")?.value ?? local.content,
      });
    } else {
      await resolveConflictWithServer(conflict.memoryId, strategy);
    }

    await mergeRemoteToLocal();
    await refreshCloudUI();
    window.LuminaUI?.refresh?.();
    toast("冲突已解决");
  } catch (error) {
    toast(errorMessage(error));
  } finally {
    busy = false;
  }
}

function bindCloudUI() {
  $("statusConnect")?.addEventListener("click", (event) => {
    event.preventDefault();
    window.LuminaUI?.openCloud?.();
  });

  $("cloudClose")?.addEventListener("click", closeCloud);
  $("cloudSheet")?.addEventListener("click", (event) => {
    if (event.target === $("cloudSheet")) closeCloud();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("cloudSheet")?.hidden) {
      closeCloud();
    }
  });

  $("cloudCreate")?.addEventListener("click", onCreateSync);
  $("cloudJoin")?.addEventListener("click", onJoinSync);
  $("cloudRecover")?.addEventListener("click", onRecoverSync);
  $("cloudSyncNow")?.addEventListener("click", onSyncNow);
  $("cloudPairCode")?.addEventListener("click", onGeneratePairingCode);
  $("cloudEnableE2ee")?.addEventListener("click", async () => {
    if (busy) return;
    const pass = $("cloudE2eePass")?.value.trim();
    if (!pass) return toast("请输入恢复码或自定义加密口令");
    busy = true;
    try {
      await enableE2eeWithPassphrase(pass);
      if ($("cloudE2eePass")) $("cloudE2eePass").value = "";
      await refreshCloudUI();
      toast("已开启端到端零知识加密，正在加密推送");
      await runSync({ silent: false });
    } catch (err) { toast(errorMessage(err)); } finally { busy = false; }
  });
  $("cloudDisable")?.addEventListener("click", onDisableSync);

  $("cloudPurge")?.addEventListener("change", () => {
    const purge = Boolean($("cloudPurge").checked);
    const input = $("cloudPurgeConfirm");
    if (input) {
      input.disabled = !purge;
      if (!purge) input.value = "";
    }
    if ($("cloudDisable")) {
      $("cloudDisable").textContent = purge
        ? "删除云端数据并关闭同步"
        : "关闭本设备同步";
    }
  });

  $("cloudConflictSelect")?.addEventListener("change", renderSelectedConflict);
  $("cloudKeepLocal")?.addEventListener("click", () => onResolveConflict("local"));
  $("cloudKeepServer")?.addEventListener("click", () => onResolveConflict("server"));
  $("cloudKeepMerged")?.addEventListener("click", () => onResolveConflict("merged"));

  document.addEventListener(
    "change",
    (event) => {
      const input = event.target;
      if (input instanceof HTMLInputElement && input.id === "file" && input.files?.[0]) {
        pendingPhotoFile = input.files[0];
        pendingPhotoAt = Date.now();
      }
    },
    true,
  );
}


async function init() {
  window.addEventListener("lumina:records-changed", (event) => { if (event.detail?.origin !== "remote" && event.detail?.origin !== "hydrate") scheduleMirror(); });
  await recordsRepository.ready;
  bindCloudUI();
  await refreshCloudUI();

  ready = mirrorNow();
  await ready;

  const state = await getSyncState();
  if (state.enabled) {
    scheduleSync(0);
  }

  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void getSyncState()
        .then((current) => {
          if (current.enabled) return runSync({ silent: true });
        })
        .catch(() => undefined);
    }
  }, 30_000);

  window.addEventListener("online", () => {
    void getSyncState()
      .then((current) => {
        if (current.enabled) return runSync({ silent: true });
      })
      .catch(() => undefined);
  });

  window.LuminaCloud = {
    open: openCloud,
    close: closeCloud,
    refresh: refreshCloudUI,
    syncNow: () => runSync({ silent: false }),
  };

  window.LuminaBridge = {
    captureOriginal(file) {
      if (file instanceof File) {
        pendingPhotoFile = file;
        pendingPhotoAt = Date.now();
      }
    },
  };
}

init().catch((error) => {
  console.error("[Lumina] bridge init failed", error);
});
