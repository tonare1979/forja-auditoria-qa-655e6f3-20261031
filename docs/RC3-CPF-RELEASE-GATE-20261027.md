# FORJA RC3 — gate de compatibilidade CPF
Data: 27/10/2026. Escopo: somente branch isolada. NÃO publicar nem aplicar migração automaticamente.

## Código e ensaio
- Base: 5060272af858751682cb35631173ca63ed0365a0
- Correções: ops/cpf-schema-plan.mjs, ops/cpf-migration-sql.mjs
- Provas: tests/qa-cpf-schema-parity.mjs, tests/qa-cpf-recovery-drill.mjs
- Comandos locais:
  - node tests/qa-cpf-schema-parity.mjs
  - node tests/qa-cpf-recovery-drill.mjs
  - node tests/qa-cpf-migration.mjs
  - node tests/qa-member-public-signup-cpf.mjs
- Saídas observadas: CPF_MISSING_SCHEMA_ADD_PASS; CPF_EXISTING_SCHEMA_REAPPLY_PASS; CPF_SCHEMA_UNEXPECTED_FAIL_CLOSED_PASS; CPF_LOCAL_BACKUP_RESTORE_INTEGRITY_PASS; ADDITIVE_CPF_MIGRATION_LEGACY_UNIQUE_PASS; RC3_GUEST_REGISTRATION_PENDING_CPF_SECURITY_PASS.

## Diagnóstico remoto, apenas metadados
- QA descartável: D1 95d0e047-d840-412f-ab31-565ce3e55726, 19 tabelas, coluna cpf ausente.
- Homologação: D1 402315ff-3833-4060-91b6-8c6bd3884642, 19 tabelas, coluna cpf já existe.
- Gerar SQL de revisão: node ops/cpf-migration-sql.mjs missing (QA) ou existing (homologação).
- Nunca rodar migrations apply em lote nem reexecutar ALTER TABLE sem inspeção do schema.

## Condições obrigatórias antes de qualquer escrita
1. Isolamento de D1 QA e identidades sintéticas comprovado, sem R2 compartilhado.
2. Backup/export e restauração em D1 distinto testados e auditados. Bookmark isolado não equivale a restauração.
3. Correspondência SHA ↔ Worker comprovada, impedindo deploy automático ou alteração em produção.
4. Aprovação explícita da operação remota, janela de execução e plano de recuperação.
5. Snapshot de schema antes/depois, testes reais de pending → aprovação → login, CPF inválido/duplicado e regressão de isolamento.
6. Custos e limites gratuitos verificados; não habilitar cobrança.

## Rollback
- Se falhar a checagem anterior à escrita, abortar sem alterar nada.
- Se houver falha após escrita em ambiente descartável, interromper e utilizar procedimento Cloudflare D1 Time Travel apenas após confirmar bookmark/restore e conta/DB de destino. Não executar restore sobre o laboratório ativo nem produção por padrão.
- Validar dados e identidade do Worker depois da recuperação. Guardar logs e checksums no pacote final, sem segredos.

Status: gate documental, não homologação. iPhone físico, E2E remoto, prova Cloudflare restore e SHA/deploy ainda são bloqueantes.
