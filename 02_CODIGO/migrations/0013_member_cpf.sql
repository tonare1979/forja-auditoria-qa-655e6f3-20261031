-- CPF obrigatorio para novos atletas (cadastro publico pendente ou criacao pelo admin).
-- Compatibilidade: contas antigas sem CPF permanecem intactas; nenhuma limpeza retroativa.
ALTER TABLE users ADD COLUMN cpf TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL;
