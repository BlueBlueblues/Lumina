const DB_NAME = "lumina";
const DB_VERSION = 1;

let dbPromise = null;

export function randomId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("memories")) {
        const store = db.createObjectStore("memories", { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }

      if (!db.objectStoreNames.contains("assets")) {
        const store = db.createObjectStore("assets", { keyPath: "id" });
        store.createIndex("memoryId", "memoryId");
      }

      if (!db.objectStoreNames.contains("outbox")) {
        const store = db.createObjectStore("outbox", {
          keyPath: "seq",
          autoIncrement: true,
        });
        store.createIndex("memoryId", "memoryId");
        store.createIndex("status", "status");
      }

      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function txDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function dbGetAll(storeName) {
  const db = await openDb();
  return requestToPromise(
    db.transaction(storeName, "readonly").objectStore(storeName).getAll(),
  );
}

export async function dbGet(storeName, key) {
  const db = await openDb();
  return requestToPromise(
    db.transaction(storeName, "readonly").objectStore(storeName).get(key),
  );
}

export async function dbPut(storeName, value) {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).put(value);
  await txDone(transaction);
  return value;
}

export async function dbDelete(storeName, key) {
  const db = await openDb();
  const transaction = db.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).delete(key);
  await txDone(transaction);
}

export async function kvGet(key) {
  const row = await dbGet("kv", key);
  return row?.value;
}

export async function kvSet(key, value) {
  await dbPut("kv", { key, value });
}

export async function kvDelete(key) {
  await dbDelete("kv", key);
}
