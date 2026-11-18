import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { memorySyncSchema } from "../src/schemas/memory.schema.js";
import {
  luminaObserveRequestSchema,
  luminaWriteRequestSchema,
} from "../src/schemas/lumina.schema.js";
import {
  disableRequestSchema,
  pairRequestSchema,
  pullQuerySchema,
  resolveRequestSchema,
} from "../src/schemas/sync.schema.js";

function validMemory() {
  return {
    id: randomUUID(),
    title: "雨后",
    content: "窗外的树叶被打湿了。",
    mood: "平静",
    tags: ["雨天"],
    aiFacts: ["窗外有树"],
    hasPhoto: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    revision: 0,
    deviceId: randomUUID(),
    deletedAt: null,
  };
}

describe("memory schemas", () => {
  it("accepts a complete memory payload", () => {
    const parsed = memorySyncSchema.parse(validMemory());
    expect(parsed.tags).toEqual(["雨天"]);
    expect(parsed.deletedAt).toBeNull();
  });

  it("accepts an existing frontend record id and rejects an empty id", () => {
    expect(memorySyncSchema.parse({ ...validMemory(), id: "r4x2k9" }).id).toBe(
      "r4x2k9",
    );
    expect(() => memorySyncSchema.parse({ ...validMemory(), id: "  " })).toThrow();
    expect(() => memorySyncSchema.parse({ ...validMemory(), id: "" })).toThrow();
  });

  it("rejects an invalid record date", () => {
    expect(() =>
      memorySyncSchema.parse({ ...validMemory(), recordDate: "2026/11/16" }),
    ).toThrow();
  });

  it("rejects null mood because optional fields must be omitted", () => {
    expect(() =>
      memorySyncSchema.parse({ ...validMemory(), mood: null }),
    ).toThrow();
  });
});

describe("sync schemas", () => {
  it("parses the four pair modes", () => {
    expect(pairRequestSchema.parse({ mode: "create", deviceName: "Mac" }).mode).toBe(
      "create",
    );
    expect(
      pairRequestSchema.parse({ mode: "join", code: "ABCD2345", deviceName: "Phone" })
        .mode,
    ).toBe("join");
    expect(
      pairRequestSchema.parse({
        mode: "recover",
        recoveryCode: "ABCD-EFGH-2345-6789",
        deviceName: "New phone",
      }).mode,
    ).toBe("recover");
    expect(pairRequestSchema.parse({ mode: "new-code" }).mode).toBe("new-code");
  });

  it("coerces pull query strings", () => {
    const query = pullQuerySchema.parse({ cursor: "12", limit: "25" });
    expect(query).toEqual({ cursor: 12, limit: 25 });
  });

  it("requires memory content unless keeping the server version", () => {
    expect(() =>
      resolveRequestSchema.parse({
        memoryId: randomUUID(),
        baseRevision: 3,
        strategy: "client",
      }),
    ).toThrow();

    expect(
      resolveRequestSchema.parse({
        memoryId: randomUUID(),
        baseRevision: 3,
        strategy: "server",
      }).strategy,
    ).toBe("server");
  });

  it("requires explicit DELETE confirmation to purge cloud data", () => {
    expect(() =>
      disableRequestSchema.parse({ purgeCloudData: true }),
    ).toThrow();
    expect(
      disableRequestSchema.parse({
        purgeCloudData: true,
        confirmPurge: "DELETE",
      }).purgeCloudData,
    ).toBe(true);
  });
});

describe("handoff frontend schemas", () => {
  it("parses the observe payload used by the single-file UI", () => {
    const parsed = luminaObserveRequestSchema.parse({
      image: "data:image/jpeg;base64,AAAA",
      iso: "2026-11-16T19:30:00+08:00",
    });
    expect(parsed.iso).toContain("2026-11-16");
  });

  it("parses draft and memory write payloads", () => {
    const base = {
      facts: {
        scene: "窗边的餐桌",
        time: "上午",
        light: "均匀的灰白天光",
        subjects: ["吐司"],
        absence: ["画面里没有人"],
        palette: ["#c9a27a"],
        brightness: 0.62,
        saturation: 0.34,
        conf: 0.78,
      },
      mood: { phi: 45, r: 0.6, label: "偏雀跃·中等" },
      note: "慢慢吃了一顿早饭",
    };

    expect(
      luminaWriteRequestSchema.parse({ ...base, stage: "draft" }).stage,
    ).toBe("draft");
    expect(
      luminaWriteRequestSchema.parse({
        ...base,
        stage: "memory",
        variant: 0,
        extra: "后来又坐了一会儿",
      }).variant,
    ).toBe(0);
  });
});
