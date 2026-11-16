export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sync_vaults (
  id uuid PRIMARY KEY,
  recovery_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_devices (
  id uuid PRIMARY KEY,
  vault_id uuid NOT NULL REFERENCES sync_vaults(id) ON DELETE CASCADE,
  name text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sync_devices_vault ON sync_devices (vault_id);

CREATE TABLE IF NOT EXISTS pairing_codes (
  code_hash text PRIMARY KEY,
  vault_id uuid NOT NULL REFERENCES sync_vaults(id) ON DELETE CASCADE,
  created_by_device uuid REFERENCES sync_devices(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pairing_codes_vault ON pairing_codes (vault_id);

CREATE TABLE IF NOT EXISTS memories (
  vault_id uuid NOT NULL REFERENCES sync_vaults(id) ON DELETE CASCADE,
  id text NOT NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  record_date text CHECK (record_date IS NULL OR record_date ~ '^\\d{4}-\\d{2}-\\d{2}$'),
  mood text,
  tags text[] NOT NULL DEFAULT '{}',
  ai_facts jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(ai_facts) = 'array'),
  supplement text,
  has_photo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  revision integer NOT NULL CHECK (revision >= 1),
  device_id uuid NOT NULL,
  deleted_at timestamptz,
  PRIMARY KEY (vault_id, id)
);

CREATE INDEX IF NOT EXISTS idx_memories_vault_updated ON memories (vault_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS sync_events (
  id bigserial PRIMARY KEY,
  vault_id uuid NOT NULL REFERENCES sync_vaults(id) ON DELETE CASCADE,
  memory_id text NOT NULL,
  revision integer NOT NULL CHECK (revision >= 0),
  device_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('upsert', 'delete', 'conflict')),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_events_vault_id ON sync_events (vault_id, id);
`;
