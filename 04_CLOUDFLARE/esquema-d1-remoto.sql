-- SOMENTE ESQUEMA, SEM DADOS. Capturado por SELECT sqlite_master. Nao executar no QA.
CREATE INDEX idx_admin_recovery_time ON admin_recovery_requests(ip_hash,created_at);

CREATE INDEX idx_bootstrap_ip ON bootstrap_requests(ip_hash,created_at);

CREATE INDEX idx_history_date ON snapshot_history(user_id, created_at);

CREATE INDEX idx_media_owner ON media(user_id,created_at);

CREATE INDEX idx_messages_owner ON messages(user_id,created_at);

CREATE INDEX idx_password_reset_ip ON password_reset_requests(ip_hash,created_at);

CREATE INDEX idx_password_reset_user ON password_reset_requests(user_id,created_at);

CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE UNIQUE INDEX idx_single_admin ON users(role) WHERE role='admin';

CREATE UNIQUE INDEX idx_user_email ON users(email) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL;

CREATE TABLE _cf_KV (
        key TEXT PRIMARY KEY,
        value BLOB
      ) WITHOUT ROWID;

CREATE TABLE admin_recovery_requests (
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

CREATE TABLE body_records (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),date TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL,deleted_at INTEGER);

CREATE TABLE bootstrap_requests (
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL,
 display_name TEXT NOT NULL,
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 claim_token_hash TEXT NOT NULL,
 ip_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','claimed')),
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);

CREATE TABLE "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE login_ip_throttle (ip_hash TEXT PRIMARY KEY, failed_count INTEGER NOT NULL DEFAULT 0, window_start INTEGER NOT NULL, blocked_until INTEGER NOT NULL DEFAULT 0);

CREATE TABLE login_throttle (
 username TEXT PRIMARY KEY,
 failed_count INTEGER NOT NULL,
 window_start INTEGER NOT NULL,
 blocked_until INTEGER NOT NULL
);

CREATE TABLE media (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),kind TEXT NOT NULL,view TEXT,date TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',mime TEXT NOT NULL,name TEXT NOT NULL,bytes INTEGER NOT NULL,object_key TEXT,inline_data TEXT,created_at INTEGER NOT NULL,deleted_at INTEGER);

CREATE TABLE messages (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),role TEXT NOT NULL,content TEXT NOT NULL,attachments TEXT NOT NULL DEFAULT '[]',created_at INTEGER NOT NULL);

CREATE TABLE password_reset_requests (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
 token_hash TEXT NOT NULL, ip_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
 used_at INTEGER, attempts INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE qa_recovery_probe (id TEXT PRIMARY KEY, payload TEXT NOT NULL);

CREATE TABLE registration_limits (ip_hash TEXT NOT NULL,created_at INTEGER NOT NULL);

CREATE TABLE reviews (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),date TEXT NOT NULL,status TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL);

CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);

CREATE TABLE snapshot_history (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL,
 payload TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 PRIMARY KEY(user_id, revision)
);

CREATE TABLE snapshots (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL DEFAULT 0,
 payload TEXT NOT NULL,
 updated_at INTEGER NOT NULL
);

CREATE TABLE users (
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','member')),
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL
, status TEXT NOT NULL DEFAULT 'active', email TEXT, recovery_hash TEXT, cpf TEXT);
