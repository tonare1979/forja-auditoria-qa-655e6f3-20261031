-- Executar SOMENTE na D1 isolada, após backup e verificação do schema.
CREATE TABLE IF NOT EXISTS password_reset_requests (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
 token_hash TEXT NOT NULL, ip_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
 used_at INTEGER, attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_requests(user_id,created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_ip ON password_reset_requests(ip_hash,created_at);
