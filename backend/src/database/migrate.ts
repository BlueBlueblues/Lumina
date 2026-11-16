import { closePool, getPool } from "./connection.js";
import { SCHEMA_SQL } from "./schema.js";

async function main(): Promise<void> {
  const pool = getPool();
  await pool.query(SCHEMA_SQL);
  console.log("Lumina schema applied.");
  await closePool();
}

main().catch(async (error) => {
  console.error("Schema migration failed:", error);
  await closePool().catch(() => undefined);
  process.exit(1);
});
