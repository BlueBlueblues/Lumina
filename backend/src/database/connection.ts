import pg from "pg";
import { config } from "../config.js";
import { ServiceUnavailableError } from "../lib/errors.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(config.DATABASE_URL);
}

export function getPool(): pg.Pool {
  if (!config.DATABASE_URL) {
    throw new ServiceUnavailableError(
      "sync_unavailable",
      "Cloud sync is not configured on this server.",
    );
  }

  if (!pool) {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: config.DATABASE_POOL_MAX,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      statement_timeout: 15_000,
      application_name: "lumina-backend",
    });

    pool.on("error", (error) => {
      console.error("[postgres] unexpected pool error:", error.message);
    });
  }

  return pool;
}

export async function pingDatabase(): Promise<boolean> {
  if (!config.DATABASE_URL) return false;
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (!pool) return;
  const current = pool;
  pool = null;
  await current.end();
}
