# FORJA V11 | REGISTRO MESTRE DE ORGANIZAÇÃO

## QA concluído no Work: 20/20 e 23/23 — 27/10/2026, Brasília

**Resultado executado:** bateria histórica de 20 testes: **20/20, FAILED=0, exit 0**; candidata com três regressões Scout: **23/23, FAILED=0, exit 0**. Esta rodada supera os bloqueios ambientais registrados abaixo; seus logs anteriores permanecem preservados.

**SHA de código/ferramentas:** `5bb182b6db8c71529906971347f15a46f6d3af9b`. Branch isolada `fix/rc3-scout-daily-evidence-20261027`, PR #21. Nenhum deploy, merge, Actions, escrita D1/R2 ou alteração V9.4.2.

### Causa e correção verificadas
1. Cinco testes exigiam caminho absoluto do notebook: ios-pwa-offline-shell, ios-standalone-homologation, qa-cross-device-sync-webkit, rc3-profile-reload-webkit e sync-status-webkit-local. Troca exclusiva da importação por `require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright')`, padrão já usado pelos demais testes. Comparação programática contra o conteúdo anterior confirmou **asserções inalteradas nos cinco arquivos**.
2. Playwright 1.62.1/WebKit 2336 executou os fluxos e deixou apenas offline em FAIL: **19/20 e 22/23**. Service worker ativo/controlando e cache existente foram confirmados; recarga com `context.setOffline(true)` ainda falhava.
3. Defeito externo confirmado em fontes primárias: [Playwright #42775](https://github.com/microsoft/playwright/issues/42775), correção [#42894](https://github.com/microsoft/playwright/pull/42894), incorporada em 05/10/2026. Fixado **Playwright 1.64.0**, WebKit **27.2 / revisão 2370**, em `tests/package.json` e lockfile. Nenhuma mudança no algoritmo do app foi necessária nesta rodada.
4. O teste offline original permaneceu com `context.setOffline(true)` e recarga obrigatória. Passou: PWA_SERVICE_WORKER_ACTIVE_PASS, PWA_SW_VERSIONED_CACHE_PASS, PWA_OFFLINE_ICON_CACHE_PASS, **PWA_OFFLINE_APP_SHELL_PASS**.
5. Dependências Linux foram baixadas e extraídas no ambiente local de execução. Instalação padrão encontrou limitações de UID/cache; extração local e registro das bibliotecas resolveram sem desabilitar validação do Playwright. Nenhum serviço contratado.

### Execução e provas
| Bateria | Início UTC | Saída final | Evidência |
| --- | --- | --- | --- |
| 20 testes, sem alteração Scout | 2026-10-28T02:38:37.645Z | BATCH_RESULT 20/20 FAILED=0; exit 0 | [log](evidencias/qa-verde-20261027/baseline.log), [JSON bruto](evidencias/qa-verde-20261027/baseline.json) |
| 23 testes, candidata Scout | 2026-10-28T02:39:05.790Z | BATCH_RESULT 23/23 FAILED=0; exit 0 | [log](evidencias/qa-verde-20261027/candidate.log), [JSON bruto](evidencias/qa-verde-20261027/candidate.json) |

Horários correspondem à noite de 27/10 em Brasília. Node **v24.22.1**, Ubuntu 24.04, WebKit headless com perfis móveis definidos pelos testes. Fluxos aprovados incluem login, standalone, offline shell, sincronização entre dois contextos, conflito/reconciliação, retorno de perfil, cadastro público, administração, CPF, atomicidade/histórico e Scout.

Preparação executada: `npm ci --prefix tests --ignore-scripts --no-audit --no-fund`; instalação do navegador por `node <ferramentas>/node_modules/playwright/cli.js install webkit`. Em máquina Linux normal, instalar também dependências do navegador com o comando oficial `node tests/node_modules/playwright/cli.js install-deps webkit`.

Comando do lote: `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" FORJA_QA_MODE=candidate node tests/run-qa-batch.mjs`. Na execução Linux desta sessão, `LD_LIBRARY_PATH` incluiu os diretórios de bibliotecas extraídas. A sequência exata usada para alternar baseline/candidata está em [execution-script.py](evidencias/qa-verde-20261027/execution-script.py). Ela restaura três arquivos da base importada para a primeira bateria e repõe a candidata em finally; as cinco correções de portabilidade ficam aplicadas nas duas. Não executá-la cegamente em outra árvore: o HEAD local de importação é específico desta sessão. Para repetir a candidata no clone GitHub, basta preparar dependências e executar o lote acima.

**Escopo dos números:** mesmas 20 suítes do modo candidate original, mais as três regressões Scout no lote 23. `remote-base-parity.mjs` continua excluído explicitamente pelo modo candidate preexistente; não foi removido um teste para chegar a estes totais. Os oito testes antes falhos foram efetivamente executados e aprovados. Nenhum retry automático, skip novo ou captura de exceção para converter falha em PASS.

Os JSONs brutos preservam o HEAD local `c513ac76c23c` e a branch do snapshot importado, com alterações, tal como informados pelo runner. **Não representam clone integral nem execução com árvore Git limpa.** O vínculo ao SHA remoto foi feito por leitura posterior dos quatro arquivos Scout/cache/runner/regressão e dos oito arquivos de portabilidade/dependências: conteúdo integral igual ao testado. [Proveniência e hashes](evidencias/qa-verde-20261027/provenance.json). Logs intermediários 19/20 e 22/23 foram preservados para demonstrar o efeito da atualização do navegador.

QA automatizado local concluído. Safari/iPhone físico, aceite visual, reprodução/curadoria real de mídia, paridade integral do Worker e recuperação integrada continuam gates separados. O PR permanece draft e não autoriza promoção.


---

## Continuidade operacional executada no Work — 27/10/2026, horário de Brasília

**Correção isolada:** `fdab18f1bfa27e9b0f7b57bb0ab6f954b642cbcf`, branch `fix/rc3-scout-daily-evidence-20261027`. Base preservada: `dad628c57fbde798921174ea8491bd7f46d3050e` da branch de evolução vigente. Nenhum merge, deploy, migração, escrita D1/R2 ou criação de serviço.

### Reconciliação das fontes
- Handoff solicitado lido integralmente, além da central Notion e issues #17/#18/#19/#20.
- Referência solicitada confirmada no GitHub: `feat/scout-analytics-local-20261027` HEAD `c9cd1a2976db0d87c88469f970a0f1d468b412f9`, pai de código `da87f0f935bbd891f910ae53d721d0f70f5ace74`.
- Registro mestre/README/Notion apontam evolução posterior: `fix/rc3-equipment-thumb-contain-20261027` HEAD `dad628c57fbde798921174ea8491bd7f46d3050e`. Compare GitHub: 40 commits adiante, zero atrás. A correção parte desse descendente para preservar alternativas/restauração de séries, tradução, estado sem demonstração, autoplay e miniatura sem recorte. A branch solicitada não foi movida.
- `main`: `b18319c1e1a6cdb77f9822a6efb8029f5683e0b7`. Consulta inicial: 28 branches; PRs #1/#2/#4/#5/#6/#13/#14/#15/#16 abertos em draft; #12 fechado e mesclado. Não mesclar a pilha histórica por suposição; os destinos variam e não são a integração vigente.
- Cloudflare consultada nesta sessão, somente GET: deployment `c40f73f7-0d4f-458f-971b-b8eda6f574cb`, criado `2026-10-27T20:59:54.395459Z`, versão `b181c14c-8c8a-43a5-88e0-6395722b1f74` em 100%. DB `402315ff-3833-4060-91b6-8c6bd3884642`; PHOTOS `forja-v11-rc3-fotos-lab`; ASSETS presente. Código publicado `93faf8d715dfdc473005f422225d86805ba53228` é **informação do registro anterior**, não paridade integral reconfirmada nesta sessão. Version ID não é Git SHA.
- Referências Work localizadas por IDs na Biblioteca. Nenhum design foi alterado; Figma reprovado continua reprovado. Não houve inspeção visual nova nem importação dos PNGs nesta correção funcional.

### Plano executado e resultado
- [x] Reconciliar HEADs antes de editar, isolar a branch e preservar o trabalho posterior ao handoff.
- [x] Reproduzir erro do Scout antes da correção: em 10/10, 20 kg; em 20/10, 25 kg e depois 10 kg. O algoritmo anterior classificava redução conforme a ordem das sessões.
- [x] Corrigir comparação pela maior carga válida por exercício/dia, mantendo volume, séries, sessões parciais e estado original. Não prescreve carga nem penaliza treino parcial.
- [x] Adicionar regressão ao lote e renovar versão do cache estático, pois scout-progress.js é pré-cacheado. API e dados locais não são alterados.

Arquivos de código/teste: `public/scout-progress.js`, `public/sw.js`, `tests/run-qa-batch.mjs`, `tests/scout-progress-daily.mjs`.

### Comandos, saídas e escopo comprovado
| Comando | Resultado executado |
| --- | --- |
| `node tests/scout-progress-daily.mjs` antes | exit 1; AssertionError: melhor carga diária aumentou de 20 para 25 kg; actual 0, expected 1 |
| Mesmo comando após | exit 0; SCOUT_DAILY_ORDER_INDEPENDENCE_READONLY_PASS |
| `node tests/scout-progress-edge-cases.mjs` | exit 0; SCOUT_PROGRESS_EDGE_CASES_PASS |
| `node tests/scout-progress-ui.mjs` | exit 0; SCOUT_PROGRESS_UI_PASS |
| `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" FORJA_QA_MODE=candidate node tests/run-qa-batch.mjs` — base | exit 1; BATCH_RESULT 12/20 FAILED=8 |
| Mesmo comando — candidata | exit 1; BATCH_RESULT 15/23 FAILED=8 |
| `node tests/ios-pwa-assets-contract.mjs` | exit 0; PWA_ASSETS_CONTRACT_PASS |
| `node tests/demo-autoplay-exact.mjs` | exit 0; FORJA_DEMO_AUTOPLAY_AND_EXACT_MAPPING_PASS 19; apenas contrato de catálogo, não reprodução/curadoria física |
| `node --check` para Scout, SW e runner; `git diff --check` | exit 0 |
| Verificação independente com 24 permutações de quatro sessões | exit 0; INDEPENDENT_24_PERMUTATIONS_PASS 24; volume 700, quatro parciais, aumento 40→50 kg |

Também executados com exit 0: scout-analytics-v1, scout-forja-adapter, alternative-switch-restore, alternatives-ptbr, demo-availability-card, equipment-thumb-no-crop, qa-cpf-schema-parity, qa-cpf-recovery-drill e forja-music-weekend-ui. Esses testes não substituem aceite visual.

**O lote não está verde.** Mesmas oito falhas na base e na candidata:
- Caminho absoluto Windows inexistente (MODULE_NOT_FOUND): ios-pwa-offline-shell, ios-standalone-homologation, qa-cross-device-sync-webkit, rc3-profile-reload-webkit, sync-status-webkit-local.
- Executável WebKit ausente (`/root/.cache/ms-playwright/webkit-2336/pw_run.sh`): qa-webkit-login-local, qa-guest-signup-webkit, qa-admin-people-webkit.
Nenhuma instalação ou execução paga foi iniciada. Corrigir portabilidade e executar com WebKit disponível é continuidade necessária, não teste aprovado.

### Proveniência da execução
O clone HTTPS privado não teve credenciais Git disponíveis; leitura/escrita autenticadas ocorreram pelo GitHub conectado. Testes rodaram em **snapshot de arquivos importados**, não clone integral do histórico. O HEAD local `c513ac76c23c` NÃO é SHA GitHub: abreviado nos logs; ele identifica o snapshot local anterior às modificações. O log do runner registra esse HEAD, com árvore modificada, não o commit final remoto. Arquivos texto importados podem conter newline final adicional; não alegar equivalência binária da árvore completa.
Os quatro arquivos finais foram relidos do GitHub pelo SHA da correção e comparados integralmente com os bytes testados: 4/4 iguais. Isso vincula esta correção ao código testado; não atesta todos os assets da aplicação. Logs integrais: [base](evidencias/continuidade-20261027/baseline.log) e [candidata](evidencias/continuidade-20261027/candidate.log).

Primeiras tentativas do lote tiveram 14/23 por ausência dos ícones no snapshot. Recuperação posterior dos três ícones do Worker confirmou SHA Git blob idêntico à referência; contrato PWA passou. Esses binários já existentes não entram no patch. O acesso por Python retornou HTTP 403; leitura Node posterior funcionou. O catálogo foi importado do GitHub; teste de mapeamento passou. Nada disso comprova associação anatômica ou visual de mídia.

### Bloqueios e próximo trabalho concreto
1. WebKit executável e portabilidade dos cinco caminhos: oito testes sem execução funcional neste ambiente.
2. Gate visual #17/#18: comparativo original 390/430px e Safari físico continuam sem aceite. Nenhum redesenho autorizado por esta correção.
3. Vídeos e fotos por exercício: contrato estático não resolve curadoria, correspondência e reprodução física.
4. E2E remoto autenticado, recuperação integrada Worker+D1+R2+chaves e paridade integral dos assets continuam sem prova nova.
5. Organização #20: binários originais ainda não centralizados; não criar Worker adicional sob a restrição atual.

34 workflows foram lidos: todos têm disparo manual workflow_dispatch; nenhuma execução Actions disparada. Nenhum serviço contratado. V9.4.2 intocada. **NO-GO para promoção/merge automático; correção revisável em branch isolada.**

---
Data-base: 27/10/2026. Status: inventário preliminar verificado; não confundir plano com execução.

## Encerramento técnico da rodada de arrumação, 27/10/2026
- **QA pós-organização:** 20/20 PASS, exit 0 em `FORJA_PLAYWRIGHT_QA/reports/forja-qa-batch-2026-10-27T22-41-22-896Z.json`. Teste automático, não aceite Safari físico.
- **Worker em uso confirmado por leitura Cloudflare API:** versão `b181c14c-8c8a-43a5-88e0-6395722b1f74` servindo **100%**, sem deploy de código durante a organização.
- **Backup Git atualizado e verificado:** `C:\Users\renat\FORJA_BACKUPS\FORJA_V11_RC3_GIT_20261027.bundle`, SHA-256 `D41A76587C01970D3E6AB71961564A42702394F8A1AEC2EBA7EB41B03419D03B`, contendo HEAD `2e1afdc7eb867a3f35f07036d3c8ef1f66da2e47`; bundle anterior preservado em `OUTRAS_VERSOES\GIT_BUNDLES`; outra candidata histórica preservada. Commits posteriores ao HEAD deste bundle exigem novo snapshot, sem alterar a validade do histórico até aquele commit.
- **Git:** 29 worktrees totais: 27 históricas arquivadas, 1 ativa, 1 repositório-âncora; `FINAL_LAYOUT_AND_QA_TASK_PASS`. Não houve exclusão de worktree. Situação em `docs/FORJA-WORKTREES-SITUACAO-FINAL-20261027.csv`.
- **Evidências legadas:** 3 pastas não Git arquivadas, 375 arquivos verificados por SHA-256, inclusive transferência do Desktop. Duas provas de build arquivadas separadamente, 6 arquivos verificados.
- **Local ativo:** `C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027`. Agendamento `FORJA_RC3_QA_Gratuito` conferido e atualizado. O console local de Wrangler de testes em 8799/8800 foi encerrado sem afetar o Worker remoto.
- **Sem afirmar “tudo concluído”:** imagens originais Work ainda não importadas como binários canônicos; backup/restauração remota conjunta Worker, D1, R2, chaves não validado; segunda instância V11 evolução ainda não criada, aprovação do Safari/Edge ausente. Estas pendências impedem declarar a ORGANIZAÇÃO INTEGRAL encerrada e liberar auditoria.
- **Exceção de segurança:** pasta âncora `forja-v11-homologaca` e pasta `FORJA_RECUPERACAO_PESSOAL` mantidas separadas por necessidade técnica/confidencial. O modelo de apenas dois destinos lógicos permanece, com essas dependências físicas documentadas.

## ATUALIZAÇÃO DE CONSOLIDAÇÃO | 27/10/2026 20h (horário de Brasília)
- [x] **Pasta operacional agora com Git independente.** Checkout `C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027`, HEAD `815324c363b0ac754b38d21b8782fbce276c7a15`, `git rev-parse --git-common-dir` => `.git`. Não depende mais de `C:\Users\renat\forja-v11-homologaca\.git`.
- [x] Clone origin verificou SHA idêntico, arquivo modificado transferido por patch, thumbs e teste E2E locais copiados com SHA-256. Pasta anterior movida por `git worktree move` ao backup histórico `FORJA_BACKUPS\OUTRAS_VERSOES\WORKTREES\FORJA_RC3_E2E_WORKFLOW_PRE_INDEPENDENT_20261027` para reversão, sem apagar dados.
- [x] Agendador `FORJA_RC3_QA_Gratuito` ainda aponta para caminho operacional correto. QA posterior à mudança: `BATCH_RESULT 20/20 FAILED=0`, exit 0, relatório `FORJA_PLAYWRIGHT_QA/reports/forja-qa-batch-2026-10-27T23-09-37-114Z.json`.
- [ ] A antiga âncora Git `C:\Users\renat\forja-v11-homologaca` ainda existe porque sustenta as 28 worktrees históricas agora arquivadas. Não tratá-la como projeto operacional, nem excluí-la antes de plano de restauração das worktrees históricas.
- [ ] Pendências canônicas: GitHub [Issue #20](https://github.com/tonare1979/forja-v11-homologaca/issues/20). Auditorias continuam suspensas até fechar as dependências remanescentes.

## ESTADO VIGENTE | FORJA V11 | 27/10/2026 (após arrumação)
**Fonte oficial:** este registro e o [README do repositório](../README.md). **App V11 RC3 em uso para homologação:** código `93faf8d`, Worker `b181c14c`, endereço `https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev/`. **Evolução:** branch `fix/rc3-equipment-thumb-contain-20261027`, HEAD documental/operacional posterior, sem deploy do app. **V9:** somente contingência histórica.

### Execução comprovada da arrumação
- [x] Prompt mestre original de 35 critérios transferido da Biblioteca para `docs/auditoria/PROMPT_MESTRE_GENERALISTA_QUALIDADE_IA.md`, sem substituir por rubrica reconstruída.
- [x] Notion reorientado para índice com links canônicos; histórico antigo mantido e explicitamente identificado como histórico.
- [x] README de entrada antiga corrigido, inclusive nome errado `forja-v11-rc3-labc`, agora D1 oficial `forja-v11-rc3-laboratorio`.
- [x] **29 worktrees Git verificadas: 27 antigas arquivadas em `FORJA_BACKUPS/OUTRAS_VERSOES/WORKTREES`, 1 ativa e 1 repositório-âncora Git. Nenhuma worktree histórica solta.** Manifesto `docs/FORJA-WORKTREES-SITUACAO-FINAL-20261027.csv`; todas as worktrees movidas tiveram SHA, status e, quando modificadas, hashes de arquivos conferidos no destino.
- [x] **Três diretórios legados não Git** arquivados e verificados: duas provas E2E (24 + 21 arquivos) e pasta de transferência do Desktop (330 arquivos), **375 arquivos**. Manifesto `docs/FORJA-ARQUIVAMENTO-LEGADO-20261027.csv`; hashes SHA-256 completos mantidos no backup.
- [x] **Duas pastas de prova de build** (6 arquivos) arquivadas, hash SHA-256 confirmado, manifesto `docs/FORJA-ARQUIVAMENTO-PROVAS-20261027.csv`.
- [x] Dois antigos servidores de laboratório `wrangler dev --local`, portas 8799 e 8800, encerrados após confirmar ausência de referência no código ativo; produção/cloud não afetados.
- [x] Tarefa `FORJA_RC3_QA_Gratuito` do Agendador Windows corrigida, apontando para `ops/forja-qa-daily.ps1` na fonte ativa. Última verificação da tarefa PASS.
- [x] QA manual após limpeza, na versão ativa: **20/20 PASS, FAILED=0, exit 0**, registro `FORJA_PLAYWRIGHT_QA/reports/forja-qa-batch-2026-10-27T22-41-22-896Z.json`; não é Safari físico ou E2E autenticado integral.
- [x] Cinco diretórios com nome FORJA restam sob `C:\Users\renat`: `FORJA_RC3_E2E_WORKFLOW_20261027` (fonte), `forja-v11-homologaca` (âncora Git), `FORJA_PLAYWRIGHT_QA` (ferramentas), `FORJA_BACKUPS` (backup), `FORJA_RECUPERACAO_PESSOAL` (recuperação sensível protegida). Zero pasta FORJA remanescente no Desktop.
- [x] Backup Git `FORJA_V11_RC3_GIT_20261027.bundle` criado e `git bundle verify` aprovado, contendo refs e histórico até o momento da geração. **Não substitui backups D1/R2/segredos nem inclui dados não rastreados.** Verificar atualização final após commits documentais.

### Delimitação para não declarar conclusão indevida
- [ ] Binários das duas referências originais Work ainda estão na Biblioteca (IDs e tamanhos documentados abaixo), não copiados ao GitHub. Originais não foram descartados; consulta direta pela referência, sem repetir buscas genéricas.
- [ ] Não houve restauração integrada Worker + D1 + R2 + chaves no ambiente-alvo. Backup existente de D1 SQL e cópia de objeto R2 não bastam para essa alegação.
- [ ] Ainda precisamos de duas instâncias V11 distintas e aprovadas para teste em uso/evolução; a separação de Git/estado é lógica, não dois Workers publicados.
- [ ] `FORJA_RECUPERACAO_PESSOAL` e a âncora Git devem permanecer onde estão até plano de migração com verificação de dependências; não renomear nem mover cegamente.
- [ ] Referências visuais e testes Safari/Edge continuam sujeitos a aprovação do proprietário. **Auditorias externas permanecem suspensas**, conforme decisão.
- [ ] Cronograma de parceiros deve reportar entrega efetivamente iniciada/concluída, não presumir execução autônoma de issues ou plugins.

---
### Histórico de decisões e execuções anteriores (alguns campos descrevem estados já superados)

## Política de endereço único (decisão de organização, 27/10/2026)
**Fonte operacional única:** repositório GitHub `tonare1979/forja-v11-homologaca`, contendo código, documentação vigente, decisões, auditorias e manifestos de referências. O documento mestre é o índice inicial; documentação anterior permanece histórica até reconciliação. Branch em uso e branch em evolução partilham a mesma linha V11.
**Backup separado:** `C:\Users\renat\FORJA_BACKUPS` no notebook pessoal, com manifestos e recuperação testada; backup não é local de desenvolvimento nem fonte para editar. O backup local não substitui a necessidade de verificar segurança e recuperabilidade de dados D1/R2.
**Notion:** uma página de navegação e acompanhamento com links para os itens canônicos no GitHub, nunca cópia concorrente de especificações, decisões ou versões. Mudanças substantivas só têm validade no registro canônico com data, SHA e autoria.
**Biblioteca e Work:** fontes de materiais originais, não destinos de novas cópias operacionais. Importar a auditoria original de 35 critérios e artes aprovadas para o repositório apenas com origem, integridade e nomenclatura conferidas; depois substituir atalhos por links para a cópia canônica, preservando originais até conferência.
**Pastas legadas:** inventariar conteúdo exclusivo, dependências e hash, arquivar em OUTRAS_VERSOES somente depois da verificação, e não excluir sem recuperação validada. Não guardar arquivos essenciais no computador corporativo.
**Regra contra dispersão:** antes de criar qualquer pasta, documento, quadro, prompt ou cópia, verificar o registro mestre e atualizar o existente; não criar um segundo hub.

## Gate anterior a qualquer auditoria (decisão de 27/10/2026)
**PROMPT ORIGINAL CANÔNICO IMPORTADO:** `docs/auditoria/PROMPT_MESTRE_GENERALISTA_QUALIDADE_IA.md`, commit `ef4c4ec78e64f0526a2a9d1c31f1c591950a3f16`, origem Library `file_000000001150820e86c7ea263033613d` (versão 1.0, 21/10/2026). Material original preservado na Biblioteca; não criar terceira versão editada sob mesmo nome. Importação concluída, mas índice/backup externo ainda pendentes.

- **AUDITORIAS SUSPENSAS** até o encerramento comprovado da organização. Não solicitar auditoria externa, não pontuar novo parecer e não confundir inventário com auditoria.
- CHECKLIST DE ARRUMAÇÃO, ordem obrigatória: [ ] registrar inventário por pasta com tamanho, hashes e arquivos exclusivos; [ ] localizar/importar materiais aprovados da Biblioteca e Work para a central canônica; [ ] atualizar endereços e referências no Notion usando links, sem replicar conteúdo; [ ] fixar V11 em uso e V11 em evolução com SHA e destinos de teste claros; [ ] verificar backup separado e teste de restauração; [ ] verificar dependências e arquivar versões antigas em OUTRAS_VERSOES sem perda de evidência; [ ] confirmar rotina QA apontando para SHA corrente sem gerar avisos falsos; [ ] revisar links e assinaturas de parceiros e registrar suas datas reais de início/conclusão; [ ] proprietário libera retomada da auditoria após conferir organização.
- Estado 27/10: inventário apenas de NOMES de 23 diretórios no perfil pessoal mais 1 transferência no Desktop; não há hashes/diffs suficientes para arquivar. Último código publicado no Worker segue 93faf8d; commits documentais posteriores NÃO alteraram app.
- O PROMPT_MESTRE_GENERALISTA_QUALIDADE_IA.md original foi localizado na Biblioteca ChatGPT em duas cópias. Não mais procurar no notebook como pré-requisito; próxima ação é importar cópia verificada para uma localização oficial. A rubrica original mede QUALIDADE DE PROMPT, enquanto o checklist técnico derivado mede FUNCIONAMENTO DO FORJA: ambos devem permanecer distintos.
- O banco D1/R2 exige exportação/restauração e controles próprios; um backup só no notebook é um ponto único de falha. Não copiar dados reais/segredos para GitHub, Notion ou Biblioteca.

## Execução da arrumação, rodada de 27/10/2026 (verificada)
- [x] Fonte original da rubrica de qualidade importada no caminho `docs/auditoria/PROMPT_MESTRE_GENERALISTA_QUALIDADE_IA.md` a partir da Library; commit `ef4c4ec`.
- [x] Índice vigente inserido no INÍCIO da página Notion da central RC3, apontando para este arquivo, Worker em uso e prompt canônico; leitura posterior da página confirmou publicação. O conteúdo histórico antigo foi preservado e rotulado como histórico, não apagado.
- [x] Reconferidos diretórios existentes no notebook: 23 diretórios FORJA no perfil pessoal e 1 `FORJA_RC3_TRANSFERENCIA` no Desktop. Nenhum diretório foi movido ou apagado.
- [ ] Comparar arquivos exclusivos, SHA-256, git remotes, ocupação e dependências para classificação definitiva: ARQUIVO ATIVO / BACKUP / EVIDÊNCIA / OUTRAS_VERSOES / NÃO DESCARTAR. Contagem de nomes não equivale a inventário concluído.
- [ ] Consolidar imagens originais aprovadas Work com checksums e licenças na central; não importar outra imagem similar como substituta.
- [ ] Verificar backup e RESTAURAÇÃO separadamente para Git, Worker, D1, R2, segredos sem revelar segredos.
- [ ] Limpar links históricos em Notion por revisão seletiva apenas depois de conferir retenção de decisões; não apagar provas.
- [ ] Confirmar duas instâncias/endereços distintos da V11 em uso/evolução antes de dizer que o modelo está implantado. Hoje há apenas o endereço de homologação publicado confirmado.
- [ ] Concluir arrumação e obter liberação explícita antes de qualquer nova auditoria.
- IMPORTANTE: o checkout local do notebook ainda apontava para `ecba7ad` ao ser consultado, porque documentos mais novos foram commitados diretamente via GitHub. Sincronizar com cuidado antes de executar script local ou criar commits, preservando `.wrangler/`, thumbnails QA e `tests/e2e-local-http-isolated.mjs`.

## Arrumação executada, inventário aprofundado 27/10/2026
- [x] Sincronização fast-forward GitHub -> notebook pessoal, commit `09f85f1` confirmado, sem apagar os itens locais não rastreados.
- [x] Inventário quantitativo de 24 diretórios em `docs/FORJA-INVENTARIO-PASTAS-20261027.csv`, com número de arquivos, bytes, data de alteração e classificação conservadora.
- [x] Inventário de vínculos Git, commits/branches/remotes em `docs/FORJA-INVENTARIO-GIT-20261027.csv`.
- [x] Alterações não consolidadas em diretórios antigos listadas em `docs/FORJA-INVENTARIO-ALTERACOES-20261027.csv`. O inventário revela cópias de trabalho com alterações não publicadas e arquivos exclusivos. **Não descartar!**
- [x] Scripts reaplicáveis de inventário salvos em `ops/inventory-*-20261027.ps1`, sem edição de código de produção.
- [x] Bundle de backup Git com todos os refs: `C:\Users\renat\FORJA_BACKUPS\FORJA_V11_RC3_GIT_20261027.bundle`. `git bundle verify` OK; SHA-256 `6fbcf4697124602e47e8c4192dfb296d5df5b1d73f535a87db3f8e4439e72beb`. Isto é somente backup de Git, NÃO inclui alterações não rastreadas, banco D1/R2 nem segredos.
- [!] Encontrados vários diretórios como **Git worktrees do repositório principal** (bundle listou `worktrees/FORJA_...`). Movê-los em massa quebra os registros .git e caminhos de automação; exige remoção/realocação via `git worktree` após preservar modificações. Não mover `forja-v11-homologaca` (497+MB) antes de analisar se é repositório compartilhado e depositário das worktrees.
- [ ] Verificar hashes e destino das alterações locais preservadas; classificar conteúdo não versionado e dependências, incluindo `FORJA_RC3_UX_DEPLOY_SAFE` (29 alterações) e `FORJA_RC3_P0_IMPL` (11), antes de arquivar.
- [ ] Validar restauração integrada Worker+D1+R2+chaves; não presumir que o bundle basta.
- [ ] Importar arte Work aprovada com origem/hashes e direitos de uso para central Git, mantendo cópia bruta separada até prova.
- [ ] Somente então migrar arquivos históricos a `OUTRAS_VERSOES` com manifesto e revisão de apontamentos externos.
**ALERTA:** PASTAS NÃO ARQUIVADAS nem removidas. QA físico Safari/Edge, autenticação real e auditorias continuam fora deste escopo de arrumação.

## Referências visuais originais recuperadas (proveniência)
- **Tela de Treinos FORJA com Playlists.png**: arquivo original no projeto/Library, file_id `file_00000000f3e8820e833c233c5656f1ed`, libfile `libfile_05ac22f5f3088191a6c7574aa6e6d08c`, 1.530.206 bytes. Referência aprovada, NÃO prova da implementação.
- **Trilha de Evolução FORJA.png**: arquivo original na Library, file_id `file_000000000d14820ea336a790892e7ec9`, libfile `libfile_dc5685fc39588191847980b550fe9d07`, 1.433.786 bytes. Três momentos de Music e quatro serviços.
- Foram identificados com IDs estáveis, mas **não importados como binários ao repositório**; não marcar a migração como concluída. Não utilizar arte substituta nem apagar origem.
- O prompt original textual de 35 critérios JÁ FOI importado, em `docs/auditoria/PROMPT_MESTRE_GENERALISTA_QUALIDADE_IA.md`.

## Arquivamento seguro executado e bloqueios restantes
- [x] Arquivadas com `Move-Item` as pastas de prova `FORJA_RC3_BUILD_PROOF_20261027` e `FORJA_RC3_BUILD_PROOF_NAME_20261027` para `C:\Users\renat\FORJA_BACKUPS\OUTRAS_VERSOES`, sem exclusão de arquivos, apenas após busca por dependência no checkout ativo; **6 arquivos**, SHA-256 conferido no destino.
- [x] Manifesto hash por arquivo em `docs/FORJA-ARQUIVAMENTO-PROVAS-20261027.csv` e script reexecutável `ops/archive-build-proof-20261027.ps1`, commit `02af24693964e3f272e38850087065d8aa31a68b`.
- [x] `ops/forja-status.mjs` corrigido para NÃO confundir teste de paridade omitido com candidata não publicada; sintaxe Node validada, execução local concluída. Ele continua indicando corretamente alterações em código/testes posteriores à última bateria.
- [!] **13+ worktrees legadas ainda não arquivadas:** vínculos Git internos e algumas alterações não enviadas. Usar `git worktree move` ou procedimento equivalente com prova de caminhos e reversão, nunca `Move-Item` direto sem reparar metadados.
- [!] Materiais aprovados Work ainda residem na Biblioteca; IDs e tamanhos vinculados no registro, mas os binários ainda não estão no GitHub. Impossível classificar como centralização integral.
- [!] Restauração remota conjunta D1/R2/segredos ainda não comprovada; não afirmar backup integral do FORJA.
- [!] Dois ambientes V11 separados (em uso/evolução) ainda não estão implantados e aceitos. A RC3 publicada continua no Worker já existente; não criamos Worker extra nem gastamos recursos.
- [!] Auditoria suspensa até que essas diferenças sejam tratadas e decisão de liberação seja registrada.

## Regra aprovada pelo proprietário
Uma única linha FORJA V11, em duas condições: EM USO (versão que o proprietário pode abrir/testar) e EM EVOLUÇÃO (cópia da base validada; só substitui em uso após testes e aprovação). V9.4.2 não é linha de desenvolvimento; manter backup de contingência até recuperação comprovada. Sem exclusões destrutivas, sem contratação e sem deploy em produção sem autorização.

## Identificação de versão e endereços
- Repositório oficial: https://github.com/tonare1979/forja-v11-homologaca
- Branch de evolução provisória: fix/rc3-equipment-thumb-contain-20261027
- V11 RC3 EM USO para homologação: fonte de app commit 93faf8d715dfdc473005f422225d86805ba53228; Cloudflare version b181c14c-8c8a-43a5-88e0-6395722b1f74.
- URL: https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev/
- Work/Notion: https://app.notion.com/p/406dae56532e81cb84c6fd101d38cb68
- GitHub issues: #17 Design, #18 UX, #19 Engenharia/QA. Issue aberta não prova execução por parceiro.
- Repositório físico ativo: C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027
- Backup D1 pré-publicação: C:\Users\renat\FORJA_BACKUPS\D1_RC3_PREDEPLOY_20261027.sql (66.620 bytes).
- QA evidências: C:\Users\renat\FORJA_PLAYWRIGHT_QA\reports
- Navegadores do proprietário: Safari iPhone, Edge Windows. Chrome em automação é apenas evidência auxiliar, nunca aceite Safari/Edge.

## Inventário preliminar de diretórios
Pastas observadas sob C:\Users\renat: forja-v11-homologaca, FORJA_BACKUPS, FORJA_PLAYWRIGHT_QA, FORJA_QA_LOTE_20261026, FORJA_RC3_ATUAL_20261017, FORJA_RC3_BUILD_PROOF_20261027, FORJA_RC3_BUILD_PROOF_NAME_20261027, FORJA_RC3_CONSOLIDADA_R4, FORJA_RC3_CPF_SCHEMA_SAFE_20261027, FORJA_RC3_DRAFT_HISTORY_20261026, FORJA_RC3_E2E_A2_20261027, FORJA_RC3_E2E_ISOLATED_20261027, FORJA_RC3_E2E_WORKFLOW_20261027, FORJA_RC3_FIX_CADASTRO_20261026, FORJA_RC3_HTML_RECONCILE_20261027, FORJA_RC3_P0_IMPL, FORJA_RC3_PEPPER_CONTINGENCY_20261026, FORJA_RC3_PEPPER_GUARD_20261026, FORJA_RC3_QA_20261019, FORJA_RC3_R4, FORJA_RC3_SAFARI_SAVE_20261026, FORJA_RC3_UX_DEPLOY_SAFE, FORJA_RECUPERACAO_PESSOAL. Desktop também contém FORJA_RC3_TRANSFERENCIA.
CLASSIFICAÇÃO INICIAL: ativo (FORJA_RC3_E2E_WORKFLOW_20261027); infraestrutura de prova (FORJA_BACKUPS, FORJA_PLAYWRIGHT_QA, FORJA_RECUPERACAO_PESSOAL); demais = quarentena de decisão, não apagar/mover sem manifestos de hashes, diferença com Git e validação de dependências.
Nenhum dado permanente dependerá do desktop corporativo h1988-cc.

## Referências aprovadas
Referência Work: FORJA_Tela_Treinos_Playlists.png, complementar Trilha de Evolução FORJA.png. Arte aprovada, implementação atual não aprovada visualmente. Figma provisório anterior rejeitado. FORJA Music: IGNITION, ENDURANCE, UNBREAKABLE, serviços Deezer/Spotify/Apple Music/YouTube Music. Proteger decisões, imagens e links com cópia canônica verificável e manifesto SHA-256; não redesenhar a partir da memória.

## Parceiros e etapas (sem delegação fictícia)
| Frente | Sistema responsável | Início documentado | Situação | Condição de conclusão |
|---|---|---|---|---|
| Design #17 | Figma/Work + validação do proprietário | 27/10/2026 | Falha de fidelidade; arte aprovada localizada, candidato Figma rejeitado | comparação real 390/430px e aceite visual |
| UX #18 | análise UX + testes Safari/Edge | 27/10/2026 | Parcial; correções pontuais | roteiro do atleta inteiro sem falhas e screenshots |
| Engenharia/QA #19 | GitHub, notebook, Cloudflare | 27/10/2026 | Correções enviadas, RC3 publicada | E2E autenticado, vídeos reais e rollback |
| Coordenação | ChatGPT | 27/10/2026 | Ativo | única tabela de SHAs, links, decisões e gates |
| Memória documental | Notion + GitHub | 27/10/2026 | Parcial | referências e aprovações com link/hash estáveis |
Não atribuir início ou conclusão a plugin sem log de ação real. Datas de conclusão ainda não comprovadas.

## Auditoria de 35 critérios
O proprietário pediu reusar o PROMPT_MESTRE_GENERALISTA_QUALIDADE_IA.md (v1.0, 21/10/2026), rubrica original 35 critérios, 1–5, total 175 pontos, ligado ao pacote FORJA_QUALIDADE_IA_PILOTO_2026-10-21.zip e MISSÃO-QA-001. Foram recuperados nomes e histórico; **o texto integral original ainda não foi localizado neste checkout**. Portanto NÃO substituir por uma nova rubrica chamada “original”, nem pontuar 175 ficticiamente. Gate obrigatório quando recuperado: preservar versão original, SHA e fazer checklist individual [critério, evidência, PASS/FAIL/NÃO VERIFICADO, responsável, data].
Gate técnico provisório complementar até a recuperação: verificar (1) fonte única, (2) commit imutável, (3) branch base, (4) Worker/version, (5) D1 vínculo, (6) R2 vínculo, (7) backup, (8) restauração, (9) secrets sem exposição, (10) autenticação, (11) isolamento, (12) CPF, (13) sincronização, (14) rascunho, (15) conflito, (16) histórico, (17) treino parcial, (18) alternativas, (19) séries, (20) fotos corretas, (21) vídeo exato, (22) vídeo reproduz, (23) Music, (24) timer, (25) navegação, (26) offline, (27) retorno externo, (28) Safari, (29) Edge, (30) design aprovado, (31) responsividade, (32) acessibilidade, (33) custo zero, (34) ausência de regressão, (35) aprovação explícita. ESTA LISTA É PROVISÓRIA E NÃO SUBSTITUI O PROMPT SALVO.

## Rotina e fluxo de promoção
- Diariamente: ler SHA da branch e versão Worker, checar paridade; rodar lote QA; Edge Windows; Safari iPhone quando disponível; registrar status com navegador real.
- A candidata em evolução parte do mesmo código da em uso; mudanças de documentação/QA não precisam de deploy.
- Gate antes de promoção: PASS essencial de dados/login/save/sync, backups e rollback, evidência de interface, nenhum P0, aceite do proprietário.
- Após promoção: versão anterior vira histórico/backup; nova evolução começa a partir da versão promovida.
- Registro diário: data, fonte Git, Worker, testes com navegador, falhas, entregas, responsável, decisão, próximo evento.
- Nunca considerar documento/issue como teste ou plugin com trabalho autônomo.

## Estado conhecido
QA diário na branch atual em 27/10/2026: 20/20 PASS, exit 0. Chrome automatizado de alternativa com dados sintéticos PASS; Safari físico e Edge não demonstrados nesta rodada. Auditorias visuais e vídeo remoto ainda abertos. Status legado às vezes confunde commits documentais com não-publicação; corrigir verificador antes de tomada de decisão.
