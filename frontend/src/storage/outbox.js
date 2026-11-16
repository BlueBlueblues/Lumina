import {
  dbDelete,
  dbGetAll,
  dbPut,
  openDb,
  requestToPromise,
} from "./indexeddb.js";

export async function enqueueMemory(memoryId, baseRevision = null) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("outbox", "readwrite");
    const store = transaction.objectStore("outbox");
    const index = store.index("memoryId");
    const request = index.openCursor(IDBKeyRange.only(memoryId));

    let found = false;
    let blockedByConflict = false;

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        if (!found && !blockedByConflict) {
          store.add({
            memoryId,
            baseRevision: baseRevision ?? null,
            status: "pending",
            attempts: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        return;
      }

      const value = cursor.value;
      if (value.status === "conflict") {
        blockedByConflict = true;
      } else if (
        value.status === "pending" ||
        value.status === "failed" ||
        value.status === "sending"
      ) {
        cursor.update({
          ...value,
          baseRevision: value.baseRevision ?? baseRevision ?? null,
          status: "pending",
          updatedAt: Date.now(),
        });
        found = true;
      }

      cursor.continue();
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function listPending(limit = 50) {
  const all = await dbGetAll("outbox");
  return all
    .filter(
      (item) =>
        item.status === "pending" ||
        item.status === "failed" ||
        item.status === "sending",
    )
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, limit);
}

export async function markSending(seq) {
  const all = await dbGetAll("outbox");
  const item = all.find((entry) => entry.seq === seq);
  if (!item) return;
  await dbPut("outbox", { ...item, status: "sending", updatedAt: Date.now() });
}

export async function markPending(seq, message) {
  const all = await dbGetAll("outbox");
  const item = all.find((entry) => entry.seq === seq);
  if (!item) return;
  await dbPut("outbox", {
    ...item,
    status: "pending",
    attempts: (item.attempts ?? 0) + 1,
    lastError: message,
    updatedAt: Date.now(),
  });
}

export async function markConflict(seq) {
  const all = await dbGetAll("outbox");
  const item = all.find((entry) => entry.seq === seq);
  if (!item) return;
  await dbPut("outbox", {
    ...item,
    status: "conflict",
    updatedAt: Date.now(),
  });
}

export async function remove(seq) {
  await dbDelete("outbox", seq);
}

export async function removeByMemoryId(memoryId) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("outbox", "readwrite");
    const index = transaction.objectStore("outbox").index("memoryId");
    const request = index.openCursor(IDBKeyRange.only(memoryId));

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function removeConflictItems() {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("outbox", "readwrite");
    const store = transaction.objectStore("outbox");
    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value.status === "conflict") cursor.delete();
      cursor.continue();
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function hasUnsynced(memoryId) {
  const db = await openDb();
  const count = await requestToPromise(
    db
      .transaction("outbox", "readonly")
      .objectStore("outbox")
      .index("memoryId")
      .count(IDBKeyRange.only(memoryId)),
  );
  return count > 0;
}
