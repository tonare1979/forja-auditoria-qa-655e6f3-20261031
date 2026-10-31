# FORJA — publicação autorizada no Worker QA

Publicado em 30/10/2026 às 23:10:20, horário de São Paulo (2026-10-31T02:10:20.121022Z).

- Commit: `655e6f3cd80954b144339968afff231d3d38f0c4`.
- Worker: `forja-rc3-c7f15d5-offline-qa`.
- URL: https://forja-rc3-c7f15d5-offline-qa.renatodesouza79.workers.dev/
- Versão ativa em 100%: `7418ecfd-1a02-47b5-875b-cb4fd1abf42d`.
- Deployment: `b0e08deb-944c-4953-adb2-3afee5f872d2`.
- Resultado do publicador: `DEPLOY_EXIT=0`.

## Verificações anteriores

ZIP com 6972271 bytes e SHA-256 `897721a2c21b33e5946d2ace6c27c9001715ff0f1625552c720247033d0d813d`, igual ao esperado. Bundle restaurado em pasta temporária isolada. `git rev-parse HEAD HEAD^` confirmou o SHA autorizado e o pai direto `c7f15d592d35ba16abe1cf2e052100583f42dec1`. Checkout inicialmente limpo. Diff: somente `public/sw.js` e `tests/sw-offline-redirect-regression.cjs`, 31 inserções e 4 remoções; `git diff --check` sem erros.

Testes executados nesta sessão: `node tests/sw-offline-redirect-regression.cjs`, `node tests/ios-pwa-assets-contract.mjs`, `node tests/qa-offline-session.mjs` e `node --check public/sw.js`. Saídas PASS para navegação offline, contrato PWA e sessão; validação sintática sem erro. A reprodução RED é evidência incluída no pacote, não foi repetida nesta publicação.

A configuração versionada do pacote apontava para outro laboratório. Foi mantida intacta e criada configuração operacional separada `wrangler.qa-authorized.json`, com código-fonte e diretório public originais do commit e os identificadores do QA existente. Não há rotas de produção nem migrações na configuração usada. Data de compatibilidade mantida em 2026-10-10; mesmos headers e regra run_worker_first `/api/*`.

`wrangler whoami` confirmou conta `275e26e84efd4876e790de718d824df2`. Wrangler 4.156.0. Simulação `wrangler deploy --config wrangler.qa-authorized.json --dry-run --outdir qa-build --keep-vars` terminou com exit 0 e mostrou somente os recursos QA esperados.

Antes de publicar, foram reconferidos o SHA, a ausência de alterações rastreadas em src/public e o destino da configuração.

## Publicação e confirmação remota

Comando efetivo, executado no checkout temporário isolado:

```powershell
npm exec --offline -- wrangler deploy --config wrangler.qa-authorized.json --keep-vars --message 'FORJA QA authorized SHA 655e6f3cd80954b144339968afff231d3d38f0c4; no migrations'
```

O publicador encontrou apenas um asset novo/modificado: `/sw.js`. Upload e ativação concluídos com exit 0. A API Cloudflare confirmou o deployment e a versão ativa a 100%.

GETs posteriores, sem autenticação ou escrita de registros: `/sw.js`, `/`, `/manifest.webmanifest` e `/api/health`, todos HTTP 200, sem redirecionamento. Health respondeu `{"ok":true,"app":"FORJA","api":1}`. `/sw.js` servido com `Cache-Control: no-store` e conteúdo idêntico byte a byte ao arquivo autorizado; SHA-256 `0734eea330e4e89c566b6b10fcf9aa94593d3a28f24dd54d7ef2a90a89e78d1b`.

Comparação das respostas API antes/depois:

- Bindings idênticos: ASSETS, DB e PHOTOS, além dos três segredos.
- Mesmos nomes/tipos de segredos; nenhum segredo foi definido, substituído ou removido. Valores não foram lidos ou expostos. Wrangler preserva segredos no deploy.
- ETag do script backend idêntico: `002260f0f40ce11f632779561727e558a9511c91f8af97c57ef3048ee8c9fa9f`.
- Runtime e configuração dos assets idênticos, incluindo headers e roteamento.
- D1 preservado: `4e919dd4-cfcc-4827-ac27-05f1e385b4c2`, `forja-rc3-9c27784-d1-qa`, 16 tabelas e 200704 bytes antes/depois.
- R2 preservado: `forja-rc3-9c27784-r2-qa`, mesma data de criação, localização ENAM e classe Standard.

Não foram executados comandos SQL, migrações, gravações/remoções D1/R2, reinstalação da PWA ou limpeza de dados. Não foi realizada comparação de cada registro ou objeto; a evidência de preservação consiste em manter os recursos existentes, backend idêntico, metadados e ausência dessas operações. Nenhuma operação foi direcionada à produção V9.4.2.

## Custo e limite do aceite

Antes da publicação, o painel autenticado mostrava Workers Free ativo, R2 Paid com uso dentro da franquia, custo total US$ 0,00 e projeção US$ 0,00. R2: 429 operações classe B de 10 milhões incluídas e 133 classe A de 1 milhão incluídas, sem uso faturável. O deploy reutilizou os recursos existentes, não alterou planos e não executou operações de dados D1/R2. Nenhum serviço pago foi contratado.

A tentativa de nova leitura do painel após o deploy falhou por indisponibilidade da conexão com o navegador. Portanto não há comprovação de faturamento atualizada após o deploy nem garantia de cobrança futura; a evidência de custo é a leitura prévia e o escopo das operações realizadas.

O teste físico no iPhone permanece pendente. Com internet, abrir a PWA QA para receber a atualização e aguardar o carregamento; depois fechar completamente, desligar a internet e reabrir. Conferir sessão e série disponíveis, sem erro de redirecionamento. Não reinstalar nem apagar dados. Os testes automatizados não substituem esse aceite.

## Arquivos de evidência

- `cloudflare-antes.json` e `cloudflare-depois.json`: leituras remotas.
- `comparacao-deploy.json`: bindings, segredos, backend, runtime e versão ativa.
- `config-publicacao-qa.json`: configuração efetivamente usada, sem valores secretos.
- `deploy-qa.log`: saída do publicador.
- `http-pos-deploy.json`: respostas HTTP e hashes posteriores.
