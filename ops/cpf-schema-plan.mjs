// Planejamento conservador da compatibilidade CPF. Não abre conexão remota.
export function cpfSchemaPlan(columns) {
  const names = new Set(columns.map(c => typeof c === 'string' ? c : c.name));
  if (!names.has('id') || !names.has('username')) throw new Error('USERS_SCHEMA_UNEXPECTED');
  return [
    ...(!names.has('cpf') ? ['ALTER TABLE users ADD COLUMN cpf TEXT'] : []),
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL'
  ];
}
