# FORJA V11 | PROTOCOLO DE AUDITORIA INTEGRADA v1.0
Emissão: 27/10/2026. Status: protocolo proposto, NÃO auditoria realizada nem aprovação de release.
Responsável pelas decisões: proprietário. Auditor externo: independente, sem escrita/deploy por padrão.

## Base histórica e lições extraídas
Fontes examinadas: AUDITORIA_EXTERNA_INDEPENDENTE_RC3_RODADA3_2026-10-18.md; RESPOSTA_AUDITORIA_EXTERNA_RC3_RODADA2.md; RC3_AUDITORIA_CONSOLIDADA_20261019.md; RC3-P0-GATE-20261019.md, da transferência de 18–19/10; handoff e controle operacional de 27/10.
- Rodada 2: 43/47 testes e 25/25 principais, mas 4 gates bloqueados. Ganho: riscos LGPD, exclusão com FK, CPF, migrações, manifesto e preview desatualizado. Lacuna: prova física, gravação HTTP real e mídia.
- Rodada 3: auditoria adversarial detalhada, com matriz por módulo e obrigação de separar código, Worker e aparelho. Ganho: evidência por achado, isolamento, custo, backups, regressões. Risco: escopo enorme sem prioridades de entrega e sem observador único de versão.
- Consolidação Gemini/Copilot/Lovable: corrigiu falsos positivos (merge posicional P0 sem reprodução; E2E D1 existente; limite de atletas tinha proteção SQL). Ganho: contraditório com provas. Lacuna: declarar vídeo aprovado por flag/catálogo e aceitar parecer sem teste do iPhone.
- Gate P0: colisões OCC reais, idempotência, quota simulada, preparação de recuperação, WebKit emulado; importante distinguir sucesso de laboratório de Safari físico.
- Falha estrutural de 27/10: testes e branches corretos não garantem que Worker sirva a mesma versão. Confirmar código servido, binding e SHA antes de validar. Capturas do proprietário revelaram visual regredido apesar de testes verdes. Cronogramas e parceiros precisam de responsável real e recibo de entrega.
- Histórico NÃO prova estado presente: resultados 2026-10-16 a 2026-10-19 são referências a reproduzir na V11 atual.

## 35 controles (RUBRICA NOVA, derivada de lições; NÃO é reprodução textual do prompt histórico de 35 critérios)
Cada item exige 0=sem prova, 1=alegação, 2=artefato estático, 3=teste local reproduzível, 4=teste remoto/browser real, 5=teste ambiente alvo e evidência independente; N/A só com justificativa. Pontuação é indicador, nunca substitui bloqueantes P0/P1.

### Governança e release [01–07]
01 Versão única, commit/branch/Worker identificados; 02 Paridade entre GitHub, assets HTTP, Worker e versão em uso; 03 Duas linhas V11 em uso/evolução sem divergência inesperada; 04 Build reproduzível, hashes e dependências; 05 D1/R2/segredos de lab separados de produção; 06 Custos gratuitos e limites atuais com evidência, sem prometer US$0 futuro; 07 Backup, restauração verificável e rollback com risco controlado.

### Privacidade e segurança [08–14]
08 CPF, consentimento e cadastros completos; 09 Isolamento 11 atletas+1 admin e autenticação de todas as rotas; 10 Cookies, CSRF/CORS, CSP e rate limit; 11 Cifra, gestão de chaves e falhas sem vazamento; 12 D1/R2 sem exposição de dados entre atletas e sem credenciais em relatórios; 13 Exclusão/correção e cascatas FK on/off, idempotência; 14 Cadastro/aprovação/login/logout/reset com erros adversariais.

### Treinos e dados [15–22]
15 Fichas e exercícios aprovados por dia A/B/CR/C/D/SÁB/DOM; 16 Alternativas e seus rascunhos isolados sem sobrescrita; 17 Séries, cargas, repetições e auto-check coerentes; 18 Treino parcial reconhecido sem punição; 19 Persistência local após fechar/abrir, offline e quota; 20 Sincronização 2 dispositivos, 409/OCC, merge e idempotência; 21 Histórico, Scout, métricas e proveniência dos dados; 22 Falha pós-PUT, reinício, backup e recuperação sem falso sucesso.

### Conteúdo e experiência [23–30]
23 Fotos certas de equipamentos, thumbnail adequada e direitos; 24 Mapa exercício -> vídeo exato, pessoa/equipamento reais e <=30s; 25 Reprodução automática inline/loop no Safari, tratamento de falha e disponibilidade real; 26 FORJA Music e quatro serviços, links corretos; 27 Fidelidade às referências aprovadas do Work, com comparativo 390/430; 28 Navegação, descanso, botões, contraste e toque na academia; 29 Safari iPhone físico, PWA, retorno de apps, cache e teclado; 30 Edge Windows e acessibilidade/responsividade.

### Evidência e entrega [31–35]
31 Auditoria externa independente + contraprova de falso positivo; 32 Matriz por achado com gravidade, reprodução, hash, evidência e dono; 33 Testes negativos demonstram ausência de efeitos colaterais e limpeza QA; 34 Checklist de regressão pós-correção, QA diário, não confundir teste e entrega; 35 Aceite explícito do proprietário e promoção segura, sem pendência P0.

## Gate de aprovação não negociável
- P0: perda de treino, acesso indevido, dados sensíveis vazados, cobrança não autorizada, modificação de produção, conflito silencioso. Um P0 aberto = NO-GO.
- P1 impeditivo: não conseguir registrar/retomar treino, login inviável, mídia essencial quebrada onde requisito crítico, tela impossível de usar no iPhone. Exige correção ou renúncia explícita de requisito pelo proprietário; avaliador não decide sozinho.
- P2: ajustes cosméticos e refinamentos que não impedem uso; rastrear, sem travar necessariamente o ciclo diário.
- PASS em código não é PASS no Worker; PASS no Worker não é PASS no Safari; aceite visual não se infere de teste automático.
- Scores: máximo 175 em escala 1–5 apenas como síntese, nunca como liberação automática. Não usar “aprovado com ressalvas” para ocultar P0/P1.

## Template obrigatório para CADA achado
ID; critério 01–35; requisito e fonte aprovada; observado; data; branch SHA; versão Worker; dispositivo+navegador; dados sintéticos; passos para reproduzir; resultado esperado vs real; request/resposta expurgada; screenshot/log com hash; causa confirmada ou hipótese; severidade; impacto; correção mínima; responsável; teste antes FAIL e depois PASS; impacto no histórico; estado PASS/FAIL/BLOQUEADO/NÃO TESTADO; data de rechecagem; parecer do proprietário.

## Fluxo para auditoria interna/externa
Fase 0 Escopo: congelar SHAs e capturar backups; mapear fontes de verdade. Nenhum auditor altera produção, D1 real ou dados reais.
Fase 1 Reconhecimento read-only: código, Worker, endpoints, proveniência, evidências prévias e contradições.
Fase 2 Testes: código + HTTP lab autenticado com massa sintética + Safari/Edge, respeitando permissões e cobertura.
Fase 3 Contraditório: classificar confirmado/hipótese/falso positivo/insuficiente, com prova de refutação; não repetir auditorias inteiras desnecessariamente.
Fase 4 Correção: issue, dono e branch, testes da falha antes/depois e riscos de regressão; trabalho de plugin exige chamada real e artefato.
Fase 5 Gate: P0/P1 + score + testes físicos + custo + backup + aprovação; publicação só na V11 em evolução e promoção para em uso conforme decisão.
Fase 6 Acompanhamento: registro diário de SHA, navegador, Worker, entregas, pendências, data de início, última evidência, data de conclusão real.

## Encomenda padrão ao auditor externo (prompt reutilizável)
Você é auditor independente da FORJA V11. Examine a versão informada, não a mais conveniente. Leia este protocolo e as decisões do proprietário. Para os controles 01–35, devolva matriz com evidência reproduzível; não presuma acesso, execução, aprovação ou falha. Relate falsos positivos históricos e hipóteses não reproduzidas. Não altere nada; apenas testes não destrutivos e massa sintética em laboratório autorizado. Nunca usar produção V9, segredos ou dados reais. Compare código, Worker, Safari físico e Edge separadamente. Exija aderência às referências aprovadas do Work; não redesenhe por conta própria. Para cada problema, informe menor correção, risco, teste antes/depois, dono e prioridade. Termine com GO/NO-GO fundamentado, P0/P1/P2 abertos, pendências que não bloqueiam, trilha de evidências, etapas para homologar e itens não executados. Sem pontuação inventada, sem “aprovado” sem prova.

## Registro da rodada-base
Código publicado V11 RC3 93faf8d715dfdc473005f422225d86805ba53228; Worker b181c14c-8c8a-43a5-88e0-6395722b1f74, URL https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev/. Git HEAD documental ao iniciar a auditoria do protocolo a6138597ad9ff639b34c2abfa21d222241a2ee37. Fontes antigas são históricas, não última versão.
