
-- Índice redundante de segurança para bancos criados por versões anteriores.
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin ON users(role) WHERE role='admin';
