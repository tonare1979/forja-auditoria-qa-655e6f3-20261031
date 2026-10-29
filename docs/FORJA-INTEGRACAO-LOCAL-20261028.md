# FORJA V11 RC3 — integração Git local

Base real: c9a48e753d495a0fab2f38773ae4cc42d30062e4, importada do bundle do notebook. Branch fix/rc3-integracao-local-20261028. Sem push, merge ou deploy.

Integração: index.html cumulativo (COMPAT, SAT/SUN, peso e validação JSON), features.js integral corrigido, Scout com aliases e renovação isolada da chave de sw.js. Hashes em evidencias/integracao-local-20261028/provenance.json. Todos os testes previamente rastreados da base foram comparados byte a byte e preservados.

## Validação

Nove suítes complementares: perfil integral, COMPAT, SAT/SUN, peso, JSON, parcial, save real, alternativas PT-BR e troca/restauração: exit 0. Bateria nativa candidate: 23/23, exit 0. O modo candidate já exclui remote-base-parity.mjs: não implica paridade da candidata com Worker publicado.

Teste adicional cache-update-local.cjs executa WebKit real em loopback: instala worker com cache anterior e features original, atualiza worker/arquivo, confere SHA-256 do features novo no cache, remoção do cache antigo, preservação de chave sintética de armazenamento e recarga offline. PASS. Não constitui aceite em Safari físico nem atualização de PWA já instalado no iPhone.

Ambiente: Node 24.22.1, Playwright 1.64.0, WebKit 27.2/revisão 2370. Dependências Linux foram baixadas e extraídas em diretório temporário e registradas com ldconfig, sem mudanças no app para contornar testes. A instalação apt padrão falhou por permissões; a extração local resolveu. A primeira bateria usou runtime disponível com dependências ausentes e terminou 15/23. Logs preservados.

As primeiras regressões complementares leram o index da base em vez do cumulativo; depois da cópia explícita e conferência de SHA, as nove passaram. Esses resultados iniciais não são apresentados como defeito do cumulativo. O teste novo de cache foi ajustado para aguardar a ativação e população efetivas antes das asserções; não houve alteração de produção durante sua depuração.

## Comandos

```sh
npm ci --prefix tests --ignore-scripts --no-audit --no-fund
node tests/node_modules/playwright/cli.js install webkit
# Preparar dependências de sistema do WebKit conforme documentação Playwright.
FORJA_QA_MODE=candidate node tests/run-qa-batch.mjs
node tests/integral-profile.cjs
node tests/test-compat-cumulative.mjs
node tests/test-sat-sun-alternatives.cjs
node tests/profile-weight-real.mjs
node tests/qa-json.cjs
node tests/test-partial-real.cjs
node tests/save-real.cjs
node tests/alternatives-ptbr.mjs
node tests/alternative-switch-restore.mjs
node tests/cache-update-local.cjs
git diff --check
git merge-base --is-ancestor c9a48e753d495a0fab2f38773ae4cc42d30062e4 HEAD
```

## Limites e recuperação

Integração local não autoriza publicação. Safari/iPhone físico, aceite visual, mídia real e recuperação remota integrada permanecem gates separados. O teste remoto de leitura já existente na bateria fez consultas anônimas; não houve escrita D1/R2, uso de conta real ou contratação.

Rollback desta integração: preservar a branch e abrir outro checkout no commit-base; não executar reset destrutivo no notebook. Bundle é backup do Git, não de D1/R2 ou segredos. Nenhum script de deploy/backup pessoal foi executado.
