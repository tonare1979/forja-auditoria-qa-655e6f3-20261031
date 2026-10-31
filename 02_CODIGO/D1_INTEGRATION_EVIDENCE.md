# FORJA RC3 | Integração isolada do construtor D1

Base: `bdac1a3d2657d9680459e37d91933cd0717e274b`.

O construtor `limpeza/cleanup-batch.cjs` **não pertencia à árvore Git de base**: foi entregue em um pacote de auditoria externo. Sua inclusão é versionamento de artefato de QA, não prova de que a aplicação em produção o utiliza.

Origem: `FORJA_RC3_D1_RUNTIME_E_RECUPERACAO_LOCAL_20261029(1).zip`, arquivo `d1-runtime-proof/cleanup-batch-d1.cjs`. SHA256: `71d0793d0aac61514354582b4c97c25b0965994628891ec1db2653e15168ce6f`.

Diferença funcional do original: `CREATE TEMP TABLE` (D1 SQLITE_AUTH) substituído por `CREATE TABLE`, com guarda criada/removida no batch atômico. Há também ajuste no comentário.

Regressão SQLite inicial na cópia corrigida: 7 PASS, 1 FAIL porque o teste legado exigia literalmente `CREATE TEMP TABLE`. A asserção legada foi ajustada para exigir `CREATE TABLE` e `DROP TABLE` da guarda e rejeitar `CREATE TEMP TABLE`, sem relaxar demais os testes de rollback e preservação de dados. Ver logs vermelho e verde no pacote de entrega.

O pacote recebido registra D1 vermelho (exit 1) → verde (5/5, exit 0) sob Miniflare offline, com limites de verificação explicitados. Esse ensaio **não foi reexecutado nesta integração**, pois o runtime Miniflare não foi instalado no ambiente executor.

Sem deploy, escrita remota, alteração da candidata original ou intervenção na V9.4.2. Rollback remoto e iPhone físico continuam pendentes.
