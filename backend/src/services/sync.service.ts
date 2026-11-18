import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { config } from "../config.js";
import { getPool } from "../database/connection.js";
import { AppError } from "../lib/errors.js";
import {
  hashSecret,
  normalizeCode,
  randomPairingCode,
  randomRecoveryCode,
  randomToken,
} from "../lib/tokens.js";
import type { MemorySync } from "../schemas/memory.schema.js";
import type {
  DisableRequest,
  PushChange,
  ResolveRequest,
} from "../schemas/sync.schema.js";

export interface DeviceAuth {
  vaultId: string;
  deviceId: string;
  deviceName: string;
}

interface MemoryRow {
  vault_id: string;
  id: string;
  title: string;
  content: string;
  record_date: string | null;
  mood: string | null;
  tags: string[] | null;
  ai_facts: unknown;
  supplement: string | null;
  original: MemorySync["original"];
  has_photo: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  revision: number;
  device_id: string;
  deleted_at: Date | string | null;
}

interface EventRow {
  id: string;
  memory_id: string;
  revision: number;
  device_id: string;
  operation: "upsert" | "delete";
  payload: unknown;
  created_at: Date | string;
}

export type PushResult =
  | { id: string; status: "applied"; serverMemory: MemorySync }
  | {
      id: string;
      status: "conflict";
      serverMemory: MemorySync | null;
      clientMemory: MemorySync;
      serverRevision: number;
    };

export interface PairCreateResult {
  mode: "create";
  vaultId: string;
  deviceId: string;
  deviceToken: string;
  recoveryCode: string;
  pairingCode: string;
  pairingExpiresAt: number;
}

export interface PairJoinResult {
  mode: "join" | "recover";
  vaultId: string;
  deviceId: string;
  deviceToken: string;
}

export interface PairingCodeResult {
  pairingCode: string;
  pairingExpiresAt: number;
}

interface WriteContent {
  title: string;
  content: string;
  recordDate: string | null;
  mood: string | null;
  tags: string[];
  aiFacts: string[];
  supplement: string | null;
  original?: MemorySync["original"];
  hasPhoto: boolean;
}

const EMPTY_CONTENT: WriteContent = {
  title: "",
  content: "",
  recordDate: null,
  mood: null,
  tags: [],
  aiFacts: [],
  supplement: null,
  original: null,
  hasPhoto: false,
};

function toMillis(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function serializeMemory(row: MemoryRow): MemorySync {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ...(row.record_date ? { recordDate: row.record_date } : {}),
    ...(row.mood ? { mood: row.mood } : {}),
    tags: row.tags ?? [],
    aiFacts: Array.isArray(row.ai_facts)
      ? row.ai_facts.filter((value): value is string => typeof value === "string")
      : [],
    ...(row.supplement ? { supplement: row.supplement } : {}),
    ...(row.original !== undefined ? { original: row.original } : {}),
    hasPhoto: row.has_photo,
    createdAt: toMillis(row.created_at),
    updatedAt: toMillis(row.updated_at),
    revision: row.revision,
    deviceId: row.device_id,
    deletedAt: row.deleted_at ? toMillis(row.deleted_at) : null,
  };
}

function toWriteContent(memory: MemorySync, isDelete: boolean): WriteContent {
  if (isDelete) return EMPTY_CONTENT;
  return {
    title: memory.title,
    content: memory.content,
    recordDate: memory.recordDate ?? null,
    mood: memory.mood ?? null,
    tags: memory.tags,
    aiFacts: memory.aiFacts,
    supplement: memory.supplement ?? null,
    original: memory.original,
    hasPhoto: memory.hasPhoto,
  };
}

async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors; the original error matters more.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function insertEvent(
  client: PoolClient,
  auth: DeviceAuth,
  memoryId: string,
  revision: number,
  operation: "upsert" | "delete" | "conflict",
  payload: unknown,
): Promise<void> {
  await client.query(
    `INSERT INTO sync_events (vault_id, memory_id, revision, device_id, operation, payload)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      auth.vaultId,
      memoryId,
      revision,
      auth.deviceId,
      operation,
      JSON.stringify(payload),
    ],
  );
}

export async function createVault(deviceName: string): Promise<PairCreateResult> {
  const vaultId = randomUUID();
  const deviceId = randomUUID();
  const deviceToken = randomToken();
  const recoveryCode = randomRecoveryCode();
  const pairingCode = randomPairingCode();
  const pairingExpiresAt = new Date(
    Date.now() + config.PAIRING_CODE_TTL_SECONDS * 1_000,
  );

  await withTransaction(async (client) => {
    await client.query(
      "INSERT INTO sync_vaults (id, recovery_hash) VALUES ($1, $2)",
      [vaultId, hashSecret(normalizeCode(recoveryCode))],
    );
    await client.query(
      `INSERT INTO sync_devices (id, vault_id, name, token_hash)
       VALUES ($1, $2, $3, $4)`,
      [deviceId, vaultId, deviceName, hashSecret(deviceToken)],
    );
    await client.query(
      `INSERT INTO pairing_codes (code_hash, vault_id, created_by_device, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [
        hashSecret(normalizeCode(pairingCode)),
        vaultId,
        deviceId,
        pairingExpiresAt,
      ],
    );
  });

  return {
    mode: "create",
    vaultId,
    deviceId,
    deviceToken,
    recoveryCode,
    pairingCode,
    pairingExpiresAt: pairingExpiresAt.getTime(),
  };
}

export async function joinVault(
  code: string,
  deviceName: string,
): Promise<PairJoinResult> {
  const codeHash = hashSecret(normalizeCode(code));
  const deviceId = randomUUID();
  const deviceToken = randomToken();

  return withTransaction(async (client) => {
    const claimed = await client.query<{ vault_id: string }>(
      `UPDATE pairing_codes
       SET used_at = now()
       WHERE code_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING vault_id`,
      [codeHash],
    );
    const row = claimed.rows[0];
    if (!row) {
      throw new AppError(
        401,
        "invalid_pairing_code",
        "Pairing code is invalid or expired.",
      );
    }

    await client.query(
      `INSERT INTO sync_devices (id, vault_id, name, token_hash)
       VALUES ($1, $2, $3, $4)`,
      [deviceId, row.vault_id, deviceName, hashSecret(deviceToken)],
    );

    return {
      mode: "join" as const,
      vaultId: row.vault_id,
      deviceId,
      deviceToken,
    };
  });
}

export async function recoverVault(
  recoveryCode: string,
  deviceName: string,
): Promise<PairJoinResult> {
  const recoveryHash = hashSecret(normalizeCode(recoveryCode));
  const deviceId = randomUUID();
  const deviceToken = randomToken();

  return withTransaction(async (client) => {
    const vault = await client.query<{ id: string }>(
      "SELECT id FROM sync_vaults WHERE recovery_hash = $1",
      [recoveryHash],
    );
    const row = vault.rows[0];
    if (!row) {
      throw new AppError(
        401,
        "invalid_recovery_code",
        "Recovery code is invalid.",
      );
    }

    await client.query(
      `INSERT INTO sync_devices (id, vault_id, name, token_hash)
       VALUES ($1, $2, $3, $4)`,
      [deviceId, row.id, deviceName, hashSecret(deviceToken)],
    );

    return {
      mode: "recover" as const,
      vaultId: row.id,
      deviceId,
      deviceToken,
    };
  });
}

export async function issuePairingCode(
  auth: DeviceAuth,
): Promise<PairingCodeResult> {
  const pairingCode = randomPairingCode();
  const pairingExpiresAt = new Date(
    Date.now() + config.PAIRING_CODE_TTL_SECONDS * 1_000,
  );

  await withTransaction(async (client) => {
    await client.query(
      "UPDATE pairing_codes SET used_at = now() WHERE vault_id = $1 AND used_at IS NULL",
      [auth.vaultId],
    );
    await client.query(
      `INSERT INTO pairing_codes (code_hash, vault_id, created_by_device, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [
        hashSecret(normalizeCode(pairingCode)),
        auth.vaultId,
        auth.deviceId,
        pairingExpiresAt,
      ],
    );
  });

  return { pairingCode, pairingExpiresAt: pairingExpiresAt.getTime() };
}

export async function authenticate(token: string): Promise<DeviceAuth> {
  const result = await getPool().query<{
    id: string;
    vault_id: string;
    name: string;
  }>(
    `SELECT id, vault_id, name
     FROM sync_devices
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [hashSecret(token)],
  );
  const row = result.rows[0];
  if (!row) {
    throw new AppError(401, "invalid_device_token", "Device token is invalid.");
  }

  await getPool().query(
    "UPDATE sync_devices SET last_seen_at = now() WHERE id = $1",
    [row.id],
  );

  return {
    vaultId: row.vault_id,
    deviceId: row.id,
    deviceName: row.name,
  };
}

export async function pushChanges(
  auth: DeviceAuth,
  changes: PushChange[],
): Promise<{ results: PushResult[] }> {
  return withTransaction(async (client) => {
    const results: PushResult[] = [];

    for (const change of changes) {
      const memory = change.memory;
      const deletedAtMs =
        typeof memory.deletedAt === "number" ? memory.deletedAt : null;
      const isDelete = deletedAtMs !== null;

      const existingResult = await client.query<MemoryRow>(
        `SELECT * FROM memories
         WHERE vault_id = $1 AND id = $2
         FOR UPDATE`,
        [auth.vaultId, memory.id],
      );
      const existing = existingResult.rows[0] ?? null;

      if (!existing && change.baseRevision !== 0) {
        await insertEvent(client, auth, memory.id, 0, "conflict", {
          server: null,
          client: memory,
          baseRevision: change.baseRevision,
        });
        results.push({
          id: memory.id,
          status: "conflict",
          serverMemory: null,
          clientMemory: memory,
          serverRevision: 0,
        });
        continue;
      }

      if (existing && existing.revision !== change.baseRevision) {
        const serverMemory = serializeMemory(existing);
        await insertEvent(
          client,
          auth,
          memory.id,
          existing.revision,
          "conflict",
          { server: serverMemory, client: memory, baseRevision: change.baseRevision },
        );
        results.push({
          id: memory.id,
          status: "conflict",
          serverMemory,
          clientMemory: memory,
          serverRevision: existing.revision,
        });
        continue;
      }

      const content = toWriteContent(memory, isDelete);

      if (!existing) {
        const inserted = await client.query<MemoryRow>(
          `INSERT INTO memories (
             vault_id, id, title, content, record_date, mood, tags, ai_facts,
             supplement, has_photo, created_at, updated_at, revision, device_id, deleted_at, original
           )
           VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8::jsonb,
             $9, $10, $11, $12, 1, $13, $14, $15::jsonb
           )
           RETURNING *`,
          [
            auth.vaultId,
            memory.id,
            content.title,
            content.content,
            content.recordDate,
            content.mood,
            content.tags,
            JSON.stringify(content.aiFacts),
            content.supplement,
            content.hasPhoto,
            new Date(memory.createdAt),
            new Date(memory.updatedAt),
            auth.deviceId,
            isDelete ? new Date(deletedAtMs) : null,
            JSON.stringify(content.original ?? null),
          ],
        );
        const row = inserted.rows[0];
        if (!row) throw new Error("Insert returned no row.");
        const serverMemory = serializeMemory(row);
        await insertEvent(
          client,
          auth,
          memory.id,
          serverMemory.revision,
          isDelete ? "delete" : "upsert",
          serverMemory,
        );
        results.push({ id: memory.id, status: "applied", serverMemory });
        continue;
      }

      const updated = await client.query<MemoryRow>(
        `UPDATE memories
         SET title = $3,
             content = $4,
             record_date = $5,
             mood = $6,
             tags = $7,
             ai_facts = $8::jsonb,
             supplement = $9,
             has_photo = $10,
             updated_at = $11,
             revision = revision + 1,
             device_id = $12,
             deleted_at = $13,
             original = CASE WHEN $14 THEN $15::jsonb ELSE original END
         WHERE vault_id = $1 AND id = $2
         RETURNING *`,
        [
          auth.vaultId,
          memory.id,
          content.title,
          content.content,
          content.recordDate,
          content.mood,
          content.tags,
          JSON.stringify(content.aiFacts),
          content.supplement,
          content.hasPhoto,
          new Date(memory.updatedAt),
          auth.deviceId,
          isDelete ? new Date(deletedAtMs) : null,
          isDelete || memory.original !== undefined,
          JSON.stringify(content.original ?? null),
        ],
      );
      const row = updated.rows[0];
      if (!row) throw new Error("Update returned no row.");
      const serverMemory = serializeMemory(row);
      await insertEvent(
        client,
        auth,
        memory.id,
        serverMemory.revision,
        isDelete ? "delete" : "upsert",
        serverMemory,
      );
      results.push({ id: memory.id, status: "applied", serverMemory });
    }

    return { results };
  });
}

export async function pullChanges(
  auth: DeviceAuth,
  cursor: number,
  limit: number,
): Promise<{
  events: Array<{
    cursor: number;
    memory: MemorySync;
    operation: "upsert" | "delete";
    revision: number;
    deviceId: string;
    createdAt: number;
  }>;
  nextCursor: number;
  hasMore: boolean;
}> {
  const result = await getPool().query<EventRow>(
    `SELECT id, memory_id, revision, device_id, operation, payload, created_at
     FROM sync_events
     WHERE vault_id = $1 AND id > $2 AND operation IN ('upsert', 'delete')
     ORDER BY id ASC
     LIMIT $3`,
    [auth.vaultId, cursor, limit + 1],
  );

  const hasMore = result.rows.length > limit;
  const rows = hasMore ? result.rows.slice(0, limit) : result.rows;
  const events = rows.map((row) => ({
    cursor: Number(row.id),
    memory: row.payload as MemorySync,
    operation: row.operation,
    revision: row.revision,
    deviceId: row.device_id,
    createdAt: toMillis(row.created_at),
  }));
  const nextCursor =
    events.length > 0 ? events[events.length - 1]!.cursor : cursor;

  return { events, nextCursor, hasMore };
}

export async function resolveConflict(
  auth: DeviceAuth,
  input: ResolveRequest,
): Promise<{ status: "server_kept" | "resolved"; memory: MemorySync }> {
  return withTransaction(async (client) => {
    const existingResult = await client.query<MemoryRow>(
      `SELECT * FROM memories
       WHERE vault_id = $1 AND id = $2
       FOR UPDATE`,
      [auth.vaultId, input.memoryId],
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      throw new AppError(404, "memory_not_found", "Memory was not found.");
    }

    if (existing.revision !== input.baseRevision) {
      throw new AppError(
        409,
        "revision_conflict",
        "Memory was updated on the server. Pull the latest version and try again.",
        {
          serverMemory: serializeMemory(existing),
          serverRevision: existing.revision,
        },
      );
    }

    if (input.strategy === "server") {
      return { status: "server_kept", memory: serializeMemory(existing) };
    }

    if (!input.memory) {
      throw new AppError(
        400,
        "validation_error",
        "Resolved memory content is required.",
      );
    }

    const deletedAtMs =
      typeof input.memory.deletedAt === "number" ? input.memory.deletedAt : null;
    const content = toWriteContent(
      {
        ...input.memory,
        id: input.memoryId,
        createdAt: 1,
        updatedAt: Date.now(),
        revision: existing.revision,
        deviceId: auth.deviceId,
        deletedAt: deletedAtMs,
      },
      deletedAtMs !== null,
    );

    const updated = await client.query<MemoryRow>(
      `UPDATE memories
       SET title = $3,
           content = $4,
           record_date = $5,
           mood = $6,
           tags = $7,
           ai_facts = $8::jsonb,
           supplement = $9,
           has_photo = $10,
           updated_at = now(),
           revision = revision + 1,
           device_id = $11,
           deleted_at = $12,
           original = CASE WHEN $13 THEN $14::jsonb ELSE original END
       WHERE vault_id = $1 AND id = $2
       RETURNING *`,
      [
        auth.vaultId,
        input.memoryId,
        content.title,
        content.content,
        content.recordDate,
        content.mood,
        content.tags,
        JSON.stringify(content.aiFacts),
        content.supplement,
        content.hasPhoto,
        auth.deviceId,
        deletedAtMs !== null ? new Date(deletedAtMs) : null,
        deletedAtMs !== null || input.memory.original !== undefined,
        JSON.stringify(content.original ?? null),
      ],
    );
    const row = updated.rows[0];
    if (!row) throw new Error("Resolve update returned no row.");

    const memory = serializeMemory(row);
    await insertEvent(
      client,
      auth,
      memory.id,
      memory.revision,
      deletedAtMs !== null ? "delete" : "upsert",
      memory,
    );

    return { status: "resolved", memory };
  });
}

export async function disableSync(
  auth: DeviceAuth,
  input: DisableRequest,
): Promise<{ disabled: true; purged: boolean }> {
  if (input.purgeCloudData) {
    await getPool().query("DELETE FROM sync_vaults WHERE id = $1", [auth.vaultId]);
    return { disabled: true, purged: true };
  }

  await getPool().query(
    "UPDATE sync_devices SET revoked_at = now() WHERE id = $1 AND vault_id = $2",
    [auth.deviceId, auth.vaultId],
  );
  return { disabled: true, purged: false };
}
