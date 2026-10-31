-- Owner approval via authenticated Cloudflare/D1 connection; no public self-enrollment.
CREATE TABLE IF NOT EXISTS bootstrap_requests (
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
CREATE INDEX IF NOT EXISTS idx_bootstrap_ip ON bootstrap_requests(ip_hash,created_at);
