# Pendências e falhas que o auditor deve conhecer
## P1 — Sincronização inicial do iPhone não concluída
Relato do proprietário: “Aguardando primeira migração” e “Load failed”. A primeira observação de navegação para Backup/exportação foi feita offline. Não há confirmação de sucesso posterior com internet.
No código, “primeira migração” é um estado da vinculação/sincronização do aparelho; **não prova migração SQL pendente**. cloudFirstUpload/cloudFirstDownload e cloudSync estão em public/index.html; cloudMessage redesenha a tela Perfil/Nuvem, que também contém backupPanel.
Reproduzir em contexto sintético separado: conexão real, health, sessão/cookie, vínculo local da conta, GET/PUT state, transporte e exibição da mensagem. Não extrair cookies do proprietário nem substituir o treino local por dados remotos para “testar”.
Critério de fechamento: primeira sincronização e reconexão bidirecional autenticadas demonstradas, com revisão e conjunto de registros conferidos e sem duplicação/perda.

## P2 — Três testes locais falharam na preparação
| Teste | Falha observada | Interpretação limitada |
|---|---|---|
| qa-admin-people-status.mjs | AssertionError: fxLoadUsers not found | O teste tenta extrair trecho por expressão regular até function evolution(), cuja posição mudou. A função existe no código; a falha impede a prova automatizada dessa área. Não prova que a administração funciona. |
| save-real.cjs | ReferenceError: forjaSelectedEquipment is not defined | O VM do teste não fornece função chamada por finish(). Não prova falha ou sucesso do salvamento real; cobertura precisa ser restaurada. |
| scout-history-integrity.mjs | Espera CACHE com sufixo history | Novo cache offline-navigation-no-redirect não casa com o texto esperado. O teste para nessa asserção, portanto as verificações posteriores nele não foram executadas. |
Os logs integrais, stdout, stderr, horários e exit codes estão em 06_TESTES/resultados-locais.json. Não foram editados para obter PASS. Os 33 PASS não eliminam essas lacunas. A bateria é uma seleção explícita, não todos os testes do repositório.

## P3 — Divergência entre Git distribuído e GitHub oficial
GET do commit 655e6f3… no repositório tonare1979/forja-v11-homologaca retornou 422 “No commit found”. main consultado aponta para b18319c…. O bundle local contém o histórico completo da versão QA. É necessário reconciliar a referência oficial antes de assumir CI e revisão remota da versão publicada. Nenhum push ou merge foi realizado por esta preparação.

## P4 — Índices e documentos operacionais desatualizados
Índice do Drive 00_COMECE_AQUI_FORJA.md ainda trata 9c27784… como referência e publicação como pendente. O README do snapshot remete a versões antigas e a outros recursos. Dossiê mantém essas fontes como histórico e identifica a versão QA separadamente.
Issue #20 segue aberta, com itens de organização, originais visuais e recuperação conjunta. Este pedido atual autoriza preparar os insumos para auditoria, mas não comprova que aqueles itens foram fechados.

## P5 — Recuperação conjunta não demonstrada nesta execução
Código/histórico são restauráveis pelo bundle. Não foram fornecidos backups reais D1/R2/chaves nem demonstrada recuperação conjunta desses elementos. O esquema remoto inclui qa_recovery_probe; sua origem e necessidade devem ser rastreadas pelo auditor. Nenhuma tabela foi removida.

## P6 — Evidência física e visual limitada
O proprietário confirmou abertura offline da PWA no iPhone e treino preservado. Não há captura instrumental de WebKit físico, modelo do aparelho, iOS, gravação ou checklist assinado nesta execução.
Originais visuais citados na Issue #20 não foram recuperados da Biblioteca do app. IDs documentados: file_000000000d14820ea336a790892e7ec9 e file_00000000f3e8820e833c233c5656f1ed. Os assets efetivamente publicados estão completos no snapshot. Ausência dos originais de referência limita auditoria de fidelidade visual.

## P7 — Acessos nominativos e dados sintéticos remotos ainda não provisionados
Nenhum e-mail/organização do auditor foi informado até a preparação. Não há convite ao GitHub/Drive/Cloudflare, conta de teste remota ou autorização de escrita/teste de carga. Consultar matriz de acesso. URLs privadas não equivalem a concessão de acesso.

## P8 — Serviços opcionais e URLs externas
O QA tem ASSETS, DB, PHOTOS e três secret_text; não há binding AI ou segredos RESEND_API_KEY/FORJA_RESET_FROM nas leituras. O código tem funcionalidades condicionais a esses recursos. Não considerar e-mail de recuperação ou IA habilitados sem demonstrar configuração e uso. Arquivo de URLs referenciadas cobre fontes externas; disponibilidade, licenças e integridade de mídia remota não foram integralmente testadas.
