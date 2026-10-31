# Roteiro e critérios de aceitação para o auditor
O auditor deve emitir parecer próprio, citando commit, ambiente, método, evidências e limites. Diferenciar inspeção estática, simulação local, integração remota e teste físico.
## 1. Proveniência e distribuição
- Restaurar bundle; conferir commit/pai, histórico, arquivos e manifesto. Confirmar 43 assets e backend remoto.
- Examinar divergência do GitHub, referências antigas e builds/source maps. Verificar que segredos ou dados pessoais não foram distribuídos.
- Conferir dependências externas, hashes/lockfile, licenças dos assets e vídeos, workflows e permissões. A existência de um link não prova licença.
## 2. Arquitetura e fronteiras
Frontend PWA em public; Worker src/index.js, features.js, bootstrap.js, admin-recovery.js, password-reset.js; D1 DB; R2 PHOTOS; ASSETS. Frontend usa localStorage e cache de assets; API é excluída do cache de Service Worker.
- Mapear cada rota, método e autorização pelo código. Revisar fluxos de cookie __Host-forja_session, SameSite, Secure, HttpOnly e validação de origem.
- Diferenciar funcionalidades opcionais de IA/e-mail das efetivamente configuradas. Usar inventário das URLs para dependências de mídia.
## 3. Identidade, autorização e dados privados
- Login por usuário/e-mail, recuperação, limitação de tentativas/IP, salt/proof, hash servidor, logout, troca de senha e invalidação de sessão offline.
- Cadastro e CPF, aprovação administrativa, transições de status e proteção de administrador único.
- Isolamento entre A/B para todos os registros, mídia, histórico e mensagens; negativas de autorização sem vazamento; caminhos R2 por proprietário.
- Revisar cifragem de dados privados, rotação das chaves e efeitos em backups; não confundir presença do segredo com uso correto.
## 4. Persistência e sincronização
- Falha de armazenamento, quota/segurança do navegador, erro de gravação e mensagens de sucesso somente após persistência.
- OCC por revisão, repetição idempotente, conflito real de duas sessões, atomicidade snapshot/histórico, mesclagem de três vias.
- Fila/outbox por usuário; tentativas, reconexão, troca de conta, logout em voo e resposta tardia.
- Primeira sincronização, Safari versus PWA, registro local existente versus remoto e cópia de recuperação.
Critério: nenhum registro é descartado/sobrescrito sem decisão explícita e recuperação demonstrável.
## 5. Treino, histórico e Scout
- Concluir treino completo/parcial; rascunhos, alternativas/equipamentos, bônus, fim de semana e descanso.
- Edição retroativa com data local, ordenação temporal e isolamento de datas futuras/inválidas.
- Identidade de exercício/série e conservação dos próprios metadados após remoção/substituição.
- Scout: tendências, evidência longitudinal, equipamento, períodos, dados insuficientes; evitar conclusões médicas ou prescrição automática sem base.
## 6. PWA, iPhone e acessibilidade
- Instalação na tela inicial, manifest/start_url, scope, ícones, atualização do SW, caches e assets.
- Lançamento frio offline após fechamento total; sessão e treino preservados; sem resposta de navegação com cadeia de redirecionamento.
- Retorno online, nova versão sem apagar dados e compatibilidade de estado antigo.
- Navegação/scroll/mensagens acessíveis, teclado/leitor de tela, contraste, zoom, controles de arquivo e permissões do navegador.
- Em erros de nuvem, mensagem clara e treino disponível; não tratar Backup/exportação como confirmação de sincronização.
## 7. Dados, infraestrutura e recuperação
- Comparar migrações de origem, esquema remoto e ledger; entender qa_recovery_probe e lacunas numéricas entre 0007 e 0013.
- Verificar bindings QA/produção, flags/data de compatibilidade, headers, routes, workers.dev e ausência de automações de escrita indevidas.
- Planejar e demonstrar recuperação integrada Worker + D1 + R2 + chaves em destino descartável, validando restauração e autorização de acesso.
- Backups de código não equivalem a backup dos dados. R2 vazio/arredondado em faturamento não prova ausência de objetos.
- Revalidar cotas e faturamento no momento da auditoria; alertas não são limite rígido de gasto.
## 8. Entrega de parecer
Para cada achado, registrar ID, severidade justificada, componente e linhas, versão, passos reproduzíveis, resultado esperado/observado, impacto, evidência, mitigação e critério de fechamento.
Apresentar matriz PASS/FAIL/NÃO EXECUTADO/NÃO APLICÁVEL por área. Não agregar 33/36 testes em selo geral de homologação. Identificar separadamente os 3 testes quebrados, a pendência de sync e o acesso externo ainda não concedido.
Parecer final: aprovado, aprovado com ressalvas ou não aprovado, com razão e limites. A preparação deste dossiê não antecipa essa decisão.
