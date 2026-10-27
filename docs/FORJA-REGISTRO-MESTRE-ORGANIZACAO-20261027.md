# FORJA V11 | REGISTRO MESTRE DE ORGANIZAÇÃO
Data-base: 27/10/2026. Status: inventário preliminar verificado; não confundir plano com execução.

## Política de endereço único (decisão de organização, 27/10/2026)
**Fonte operacional única:** repositório GitHub `tonare1979/forja-v11-homologaca`, contendo código, documentação vigente, decisões, auditorias e manifestos de referências. O documento mestre é o índice inicial; documentação anterior permanece histórica até reconciliação. Branch em uso e branch em evolução partilham a mesma linha V11.
**Backup separado:** `C:\Users\renat\FORJA_BACKUPS` no notebook pessoal, com manifestos e recuperação testada; backup não é local de desenvolvimento nem fonte para editar. O backup local não substitui a necessidade de verificar segurança e recuperabilidade de dados D1/R2.
**Notion:** uma página de navegação e acompanhamento com links para os itens canônicos no GitHub, nunca cópia concorrente de especificações, decisões ou versões. Mudanças substantivas só têm validade no registro canônico com data, SHA e autoria.
**Biblioteca e Work:** fontes de materiais originais, não destinos de novas cópias operacionais. Importar a auditoria original de 35 critérios e artes aprovadas para o repositório apenas com origem, integridade e nomenclatura conferidas; depois substituir atalhos por links para a cópia canônica, preservando originais até conferência.
**Pastas legadas:** inventariar conteúdo exclusivo, dependências e hash, arquivar em OUTRAS_VERSOES somente depois da verificação, e não excluir sem recuperação validada. Não guardar arquivos essenciais no computador corporativo.
**Regra contra dispersão:** antes de criar qualquer pasta, documento, quadro, prompt ou cópia, verificar o registro mestre e atualizar o existente; não criar um segundo hub.

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
