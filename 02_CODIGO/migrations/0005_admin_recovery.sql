-- HOMOLOGACAO: aplicar SOMENTE apos verificar o historico e criar backup D1.
-- Registra pedidos de recuperação; não altera credenciais existentes.
CREATE TABLE IF NOT EXISTS admin_recovery_requests (
 id TEXT PRIMARY KEY,
 admin_id TEXT NOT NULL REFERENCES users(id),
 token_hash TEXT NOT NULL,
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 ip_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','claimed')),
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_recovery_time ON admin_recovery_requests(ip_hash,created_at);
