const E2EE_PREFIX = "LUMINA_E2EE_V1:";
const E2EE_SALT = new TextEncoder().encode("lumina-zero-knowledge-vault-v1");

function toBase64(bytes) {
  let binary = "";
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < view.length; i += 1) {
    binary += String.fromCharCode(view[i]);
  }
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export async function deriveVaultKey(passphrase, vaultId = "") {
  const raw = String(passphrase ?? "").trim().replace(/[-\s]/g, "").toUpperCase();
  if (!raw) throw new Error("加密口令或恢复码不能为空。");
  const cryptoSubtle = globalThis.crypto?.subtle;
  if (!cryptoSubtle) throw new Error("当前运行环境不支持 Web Crypto API。");
  const keyMaterial = await cryptoSubtle.importKey(
    "raw",
    new TextEncoder().encode(`${raw}:${vaultId}`),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );
  const key = await cryptoSubtle.deriveKey(
    {
      name: "PBKDF2",
      salt: E2EE_SALT,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const exported = await cryptoSubtle.exportKey("raw", key);
  return toBase64(new Uint8Array(exported));
}

async function importRawKey(base64Key) {
  return globalThis.crypto.subtle.importKey(
    "raw",
    fromBase64(base64Key),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function isEncryptedMemory(memory) {
  return typeof memory?.content === "string" && memory.content.startsWith(E2EE_PREFIX);
}

export async function encryptMemoryPayload(payload, base64Key) {
  if (!base64Key || payload.deletedAt) return payload;
  const key = await importRawKey(base64Key);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const secretBundle = {
    v: 1,
    title: payload.title ?? "",
    content: payload.content ?? "",
    mood: payload.mood ?? null,
    tags: payload.tags ?? [],
    aiFacts: payload.aiFacts ?? [],
    supplement: payload.supplement ?? null,
    original: payload.original ?? null,
  };
  const encoded = new TextEncoder().encode(JSON.stringify(secretBundle));
  const cipherBuf = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  const envelope = `${E2EE_PREFIX}${toBase64(iv)}.${toBase64(new Uint8Array(cipherBuf))}`;
  const out = {
    ...payload,
    title: "🔒 端到端加密记录",
    content: envelope,
    tags: ["e2ee"],
    aiFacts: [],
  };
  delete out.mood;
  delete out.supplement;
  delete out.original;
  return out;
}

export async function decryptMemoryPayload(remote, base64Key) {
  if (!isEncryptedMemory(remote) || !base64Key) return remote;
  const body = remote.content.slice(E2EE_PREFIX.length);
  const dotIndex = body.indexOf(".");
  if (dotIndex <= 0) return remote;
  const iv = fromBase64(body.slice(0, dotIndex));
  const ciphertext = fromBase64(body.slice(dotIndex + 1));
  const key = await importRawKey(base64Key);
  const plainBuf = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  const bundle = JSON.parse(new TextDecoder().decode(plainBuf));
  return {
    ...remote,
    title: bundle.title ?? "",
    content: bundle.content ?? "",
    mood: bundle.mood ?? null,
    tags: Array.isArray(bundle.tags) ? bundle.tags : [],
    aiFacts: Array.isArray(bundle.aiFacts) ? bundle.aiFacts : [],
    supplement: bundle.supplement ?? null,
    original: bundle.original ?? null,
  };
}
