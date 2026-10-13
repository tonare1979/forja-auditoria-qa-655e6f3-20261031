-- FORJA V9: dados isolados por usuário; snapshots e histórico de revisão.
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','member')),
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin ON users(role) WHERE role='admin';
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS snapshots (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL DEFAULT 0,
 payload TEXT NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS snapshot_history (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL,
 payload TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 PRIMARY KEY(user_id, revision)
);
CREATE INDEX IF NOT EXISTS idx_history_date ON snapshot_history(user_id, created_at);
CREATE TABLE IF NOT EXISTS login_throttle (
 username TEXT PRIMARY KEY,
 failed_count INTEGER NOT NULL,
 window_start INTEGER NOT NULL,
 blocked_until INTEGER NOT NULL
);
