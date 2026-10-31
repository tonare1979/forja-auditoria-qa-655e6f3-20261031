# FORJA RC3 — histórico de treinos com gravação atômica
Data: 26/10/2026. Destino: branch de homologação `fix/rc3-self-signup-cpf-20261026`.

## Defeito reproduzido (vermelho antes)
A rotina original `putState` atualizava a revisão e o payload na tabela `snapshots`, depois executava `INSERT OR IGNORE` na tabela `snapshot_history`. Se a chave (user_id,revision) já estivesse ocupada, a gravação do histórico seria ignorada, mas a nova versão do treino seria confirmada com HTTP 200 **sem uma cópia íntegra da revisão anterior**.

`node tests/qa-atomic-snapshot-history.mjs` antes da correção: falha em `history collision must fail closed: 200 !== 500`. **Nenhum registro real envolvido.**

## Correção
A revisão anterior é arquivada por `INSERT INTO ... SELECT ... WHERE revision=?`, a revisão é atualizada com OCC e a retenção de 15 versões é aplicada num **único `db.batch([...])` transacional**. O `INSERT` não usa `OR IGNORE`: uma colisão falha e desfaz todas as operações do lote. O handler retorna sucesso apenas se o histórico e o snapshot foram efetivamente gravados. Operações concorrentes obsoletas seguem retornando 409, preservando treinos de ambos os dispositivos.

Sem mudança de migração, D1 remoto, Worker ativo ou produção. Documentação de garantia de transação: https://developers.cloudflare.com/d1/worker-api/d1-database/#batch

## Provas após correção (verde)
- `ATOMIC_HISTORY_COLLISION_ROLLBACK_PASS`: falha de histórico reverte também a revisão e preserva conteúdo anterior.
- `ATOMIC_HISTORY_SUCCESS_AND_STALE_409_PASS`: retomada válida atualiza e arquiva corretamente; versão obsoleta não sobrescreve.
- `ATOMIC_HISTORY_RETENTION_15_AND_INTEGRITY_PASS`: 21 revisões sem corrupção; somente 15 versões históricas mais recentes.
- `AUTHENTICATED_OCC_REAL_WORKER_HANDLER_DISPOSABLE_D1_PASS`: fluxo de duas sessões e merges seguros; adaptador de testes atualizado para a semântica transacional.
- Regressão da candidata: **20/20 PASS**, `tests/run-qa-batch.mjs`, modo `candidate`, paridade remota excluída explicitamente enquanto nova correção não estiver publicada.

## Escopo e pendências
Testes com Worker real e SQLite/adapter descartável: não comprovam a execução transacional no D1 remoto. Não executar `putState` autenticado sobre dados de pessoas. Uma futura publicação apenas na RC3 isolada requer autorização expressa. Produção V9.4.2 permanece intocada. Snapshot de backup existente não foi alterado.
