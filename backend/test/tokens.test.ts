import { describe, expect, it } from "vitest";
import {
  hashSecret,
  normalizeCode,
  randomPairingCode,
  randomRecoveryCode,
  randomToken,
} from "../src/lib/tokens.js";

describe("tokens", () => {
  it("generates 8-character pairing codes from the unambiguous alphabet", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(randomPairingCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    }
  });

  it("generates grouped recovery codes and normalizes them", () => {
    const code = randomRecoveryCode();
    expect(code).toMatch(
      /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/,
    );
    expect(normalizeCode(code)).toHaveLength(16);
  });

  it("normalizes case and separators", () => {
    expect(normalizeCode(" abcd-efgh 2345 ")).toBe("ABCDEFGH2345");
  });

  it("hashes deterministically to sha256 hex", () => {
    const hash = hashSecret("hello");
    expect(hash).toBe(hashSecret("hello"));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(hashSecret("hello2"));
  });

  it("generates high-entropy device tokens", () => {
    expect(randomToken()).toMatch(/^[A-Za-z0-9_-]{40,}$/);
  });
});
