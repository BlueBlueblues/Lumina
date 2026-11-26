import { describe, expect, it } from "vitest";
import {
  decryptMemoryPayload,
  deriveVaultKey,
  encryptMemoryPayload,
  isEncryptedMemory,
} from "../../frontend/src/sync/e2ee.js";

describe("client-side zero-knowledge E2EE sync envelope", () => {
  it("encrypts sensitive diary fields with AES-256-GCM and round-trips cleanly", async () => {
    const key = await deriveVaultKey("ABCD-EFGH-2345-6789", "vault-uuid-1");
    const plain = {
      id: "r1",
      title: "河边晚霞",
      content: "今天和小林去了河边看晚霞。",
      recordDate: "2025-09-25",
      mood: "偏雀跃·中等",
      tags: ["河边", "晚霞"],
      aiFacts: ["场景：河边"],
      supplement: "全程晴天",
      original: { version: 1, note: "原话记录", extra: "补充", chat: [{ role: "me", text: "你好" }] },
      hasPhoto: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      revision: 1,
      deviceId: "9e10848a-3a88-4c6c-b829-07cf2ca43719",
      deletedAt: null,
    };

    const encrypted = await encryptMemoryPayload(plain, key);
    expect(isEncryptedMemory(encrypted)).toBe(true);
    expect(encrypted.content).not.toContain("小林");
    expect(encrypted.title).toBe("🔒 端到端加密记录");
    expect(encrypted.original).toBeUndefined();
    expect(encrypted.supplement).toBeUndefined();

    const decrypted = await decryptMemoryPayload(encrypted, key);
    expect(decrypted.title).toBe(plain.title);
    expect(decrypted.content).toBe(plain.content);
    expect(decrypted.mood).toBe(plain.mood);
    expect(decrypted.tags).toEqual(plain.tags);
    expect(decrypted.original).toEqual(plain.original);
  });

  it("rejects decryption when using a different vault key", async () => {
    const keyA = await deriveVaultKey("PASS-AAAA-1111-2222", "vault-1");
    const keyB = await deriveVaultKey("PASS-BBBB-3333-4444", "vault-1");
    const encrypted = await encryptMemoryPayload(
      { id: "r2", title: "秘密", content: "只有我知道", tags: [], aiFacts: [], hasPhoto: false },
      keyA,
    );
    await expect(decryptMemoryPayload(encrypted, keyB)).rejects.toThrow();
  });
});
