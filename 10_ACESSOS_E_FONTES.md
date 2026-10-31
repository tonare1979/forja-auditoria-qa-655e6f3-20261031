# Matriz de acesso — Git, Cloudflare, ZIPs e documentos
## Acesso imediato, independente de contas externas
| Recurso | Entrega | Como acessar |
|---|---|---|
| Código da versão publicada | 02_CODIGO, completo e exato | Abrir localmente |
| Git e histórico | 03_GIT/FORJA_655e6f3.bundle | git clone do bundle, sem senha |
| ZIP da correção | 07_ZIPS/FORJA_C7_OFFLINE_REOPEN_FIX_EVIDENCIAS.zip | Arquivo original, hash conhecido |
| ZIP da versão pai | 07_ZIPS/FORJA_SCOUT_ORIGEM_20261030.zip | Arquivo original, hash conhecido |
| Documentação versionada | 02_CODIGO/docs (79 arquivos), README e workflows | Abrir localmente; conteúdo histórico identificado |
| Cloudflare | 04_CLOUDFLARE | Metadados, configuração, backend, sourcemap, esquema real D1 e ledger, hashes |
| Prova de publicação | 05_EVIDENCIAS_HISTORICAS | Log CLI, antes/depois, HTTP e comparação |
| Resultados reproduzíveis | 06_TESTES | Runner e logs 33 PASS / 3 FAIL |

## Acesso online público
Aplicação QA e health são públicos:
- https://forja-rc3-c7f15d5-offline-qa.renatodesouza79.workers.dev/
- https://forja-rc3-c7f15d5-offline-qa.renatodesouza79.workers.dev/api/health
A área da conta e os dados privados exigem autenticação. Não foi criado usuário remoto de auditoria.

## Acesso online privado — concessão ainda pendente
| Serviço | Destino confirmado | Acesso a solicitar ao proprietário | Situação |
|---|---|---|---|
| GitHub | https://github.com/tonare1979/forja-v11-homologaca | Leitura por identidade GitHub do auditor; confirmar visibilidade privada e escopo suportado | Não concedido; SHA QA ausente na consulta |
| Cloudflare | Conta 275e26e84efd4876e790de718d824df2; Worker forja-rc3-c7f15d5-offline-qa | Membro nominal com leitura limitada aos recursos necessários, se a conta permitir; caso contrário revisão acompanhada | Não concedido |
| D1 | 4e919dd4-cfcc-4827-ac27-05f1e385b4c2 / forja-rc3-9c27784-d1-qa | Somente esquema/metadados inicialmente; dados pessoais apenas sob escopo explícito e minimizado | Esquema entregue; dados não exportados |
| R2 | forja-rc3-9c27784-r2-qa / binding PHOTOS | Leitura de configuração inicialmente; objetos privados apenas se autorizados e necessários | Metadados entregues; objetos não exportados |
| Drive | https://drive.google.com/drive/folders/14aXAFg-wy3IFpQBImNVht2LfBZS5vcz0 | Leitor nominal dos itens selecionados, sem link público | Convites não enviados |
| Notion | https://app.notion.com/p/406dae56532e81cb84c6fd101d38cb68 | Índice de contexto citado no README; acesso/conteúdo atual não verificados | Não incluído como fonte atual |
| Biblioteca do ChatGPT | Originais visuais e demais arquivos não enumerados por ferramenta disponível | Proprietário deve selecionar itens necessários; não presumir acesso cruzado entre apps | Não inventariada |

Painel específico do Worker: https://dash.cloudflare.com/275e26e84efd4876e790de718d824df2/workers/services/view/forja-rc3-c7f15d5-offline-qa/production
O segmento production nesse endereço é o ambiente padrão desse Worker QA; NÃO é autorização para acessar a produção V9.4.2.

## Fontes de origem dos arquivos
- Correção: https://drive.google.com/file/d/1vKRlBLO1yMFQEk7b-2dyBOlo2Rg7TlAj/view
- Pai: https://drive.google.com/file/d/1vlv5M0lPkTLDlZczERjcRdIXe8lZLunK/view
- Índice histórico: https://drive.google.com/file/d/1EMP-bc5-zjJHThz1Ngyky_Sqb-p54Aw7/view
- Pendências de organização: https://github.com/tonare1979/forja-v11-homologaca/issues/20

## Como fechar a concessão
Solicitar nome, organização, e-mail e usuário GitHub do auditor; registrar recursos autorizados, duração e finalidade. Conferir permissões efetivas pelo auditor antes do início. Nenhum token pessoal ou cookie deve ser distribuído no ZIP. Caso um token seja indispensável, fornecer por canal de segredos, somente leitura e com prazo; não permitir escopo de edição/segredos/deploy por conveniência.
Esta matriz prepara o acesso; não substitui a concessão nem prova que os links privados abrem para o destinatário.
