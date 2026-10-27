# FORJA V11 | REGISTRO MESTRE DE ORGANIZAÇÃO
Data-base: 27/10/2026. Status: inventário preliminar verificado; não confundir plano com execução.

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
