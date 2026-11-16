import { createHash, randomBytes, randomInt } from "node:crypto";
import { config } from "../config.js";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomFromAlphabet(length: number): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += CODE_ALPHABET.charAt(randomInt(CODE_ALPHABET.length));
  }
  return result;
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function randomPairingCode(): string {
  return randomFromAlphabet(8);
}

export function randomRecoveryCode(): string {
  return Array.from({ length: 4 }, () => randomFromAlphabet(4)).join("-");
}

export function normalizeCode(code: string): string {
  return code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function hashSecret(secret: string): string {
  return createHash("sha256")
    .update(`${config.TOKEN_PEPPER}:${secret}`)
    .digest("hex");
}
