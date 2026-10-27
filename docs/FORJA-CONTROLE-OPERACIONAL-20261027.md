# FORJA | Controle operacional e organização | 27/10/2026

## Fonte de verdade
- Repositório: tonare1979/forja-v11-homologaca.
- Branch de correções vigente: fix/rc3-equipment-thumb-contain-20261027.
- Commit de código publicado no Worker de homologação: 93faf8d715dfdc473005f422225d86805ba53228.
- Commit de automação QA no GitHub: e3500fc00ed1c6c0be7324515a4586bc88e72131 (não requer deploy do app).
- Homologação: https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev/
- Worker Cloudflare ativo após deploy: b181c14c-8c8a-43a5-88e0-6395722b1f74.
- Produção V9.4.2: preservada; nenhum deploy sem autorização explícita.
- D1 lab: forja-v11-rc3-laboratorio; R2 lab: forja-v11-rc3-fotos-lab.
- Backup antes do deploy: C:\Users\renat\FORJA_BACKUPS\D1_RC3_PREDEPLOY_20261027.sql (66.620 bytes).
- Referência aprovada do Work: FORJA_Tela_Treinos_Playlists.png; complemento Trilha de Evolução FORJA.png.
- Hub de decisões: https://app.notion.com/p/406dae56532e81cb84c6fd101d38cb68.
- Handoff anterior: docs/FORJA-HANDOFF-CHAT-20261027.md. Seu trecho de branch/versão é histórico e precisa ser lido com este controle, não substituí-lo.

## Responsabilidades e comprovação
- Design, issue #17: referência aprovada existente; arquivo Figma improvisado foi rejeitado; fidelidade visual continua aberta. Não houve aceite da tela.
- UX, issue #18: usabilidade iPhone, telas e estrutura, cronômetros, histórico, navegação. Abertos, mas melhorias visuais não bloqueiam todos os testes técnicos.
- Engenharia/QA, issue #19: miniatura sem recorte, demonstração automática, estado sem vídeo, nomes alternativos em pt-BR, restauração de séries; mudanças no commit 93faf8d, testes PASS. Catálogo HTTP 200 não comprova cada mídia.
- Coordenação: confirmar artefatos por SHA, registrar quem realmente executou e teste real; não chamar issue de delegação executada.
- Plugins: GitHub = versionamento/issue; Cloudflare = Worker/D1/R2; Desktop Commander = teste/arquivos notebook pessoal; Notion = decisões; Figma = artefato provisório rejeitado, não implementação aceita; Work = origem da arte aprovada (sem sincronização automática entre chats).

## Critério diário de teste (mínimo uma rodada)
1. Registrar SHA GitHub e versão Worker e testar paridade de assets antes de avaliar tela.
2. Rodar QA automatizado no notebook contra branch atual e salvar relatório (sem confundir com teste físico).
3. Edge/Windows: navegação e captura desktop, com evidência identificando navegador.
4. Safari/iPhone: navegação, gravação parcial, retorno de app externo, vídeo, histórico e sync, com evidência física real.
5. Qualquer divergência = status FAIL/BLOQUEADO, sem dizer que homologação está aprovada.
6. Registrar data, SHA, ambiente, navegador, PASS/FAIL, logs, screenshots e dono da pendência.

## Organização de pastas
- Fonte ativa única: C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027. O histórico no GitHub é imutável.
- Pastas paralelas FORJA_RC3_* e repositórios de fases antigas: primeiro inventariar hashes, branches, arquivos exclusivos, backups e dependências; depois classificar ativo / evidência / arquivar em OUTRAS_VERSOES / candidato à exclusão.
- Não mover/excluir automaticamente até checar links de testes, ferramentas e provas de restauração. Nenhum dado essencial no computador corporativo h1988-cc.
- Arquivos não rastreados .wrangler, thumb-qa e teste e2e-local-http-isolated ficam intocados até triagem.
- Material aprovado do Work deve ter cópia estável e caminho explícito no inventário, nunca depender da memória do chat.

## Estado da rodada
- QA diário executado na branch atual: 20/20 PASS, relatório em C:\Users\renat\FORJA_PLAYWRIGHT_QA\reports.
- Os 20 testes não comprovam Safari físico, qualidade visual ou fluxo remoto autenticado integral.
- O script de status ainda informa “candidata não publicada” por comparar SHA após commit de QA; ajustar essa lógica para diferenciar commit de código e commit apenas operacional.
- Pendentes: inventário físico de todas as pastas, referências Work consolidadas em repositório com licença/controle, testes Edge e Safari físicos, validação do vídeo real, gates UX.
