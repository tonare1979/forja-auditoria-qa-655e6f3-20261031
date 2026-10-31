# FORJA RC3 — dossiê de auditoria externa
Data de preparação: 31/10/2026, America/Sao_Paulo. Distribuição privada ao proprietário e auditores por ele designados.

## Versão que este pacote audita
Commit Git **655e6f3cd80954b144339968afff231d3d38f0c4**. Pai: c7f15d592d35ba16abe1cf2e052100583f42dec1.
Worker exclusivo: **forja-rc3-c7f15d5-offline-qa**.
Versão Cloudflare: **7418ecfd-1a02-47b5-875b-cb4fd1abf42d**, 100% na consulta de 31/10/2026.
QA: https://forja-rc3-c7f15d5-offline-qa.renatodesouza79.workers.dev/
Produção V9.4.2 está fora do escopo e não foi alterada nesta preparação.

## Leitura em ordem
1. [Estado e escopo](01_ESCOPO_E_ESTADO.md): fontes de verdade e limites.
2. [Acessos e fontes](10_ACESSOS_E_FONTES.md): Git, Cloudflare, ZIPs, documentos, credenciais e pendências de concessão.
3. [Pendências e falhas](09_PENDENCIAS.md): começar por aqui antes de concluir liberação.
4. [Reprodução](11_REPRODUCAO.md): restaurar Git, conferir integridade e repetir testes locais.
5. [Critérios de auditoria](12_CRITERIOS_DE_AUDITORIA.md): verificações funcionais, dados, privacidade, segurança e operação.

## Conteúdo organizado
| Local | Conteúdo | Estado |
|---|---|---|
| 02_CODIGO | 271 arquivos exatos do commit, incluindo frontend, backend, assets, testes, SQL, ops, workflows e 79 arquivos docs | Atual para a versão auditada; READMEs internos têm afirmações históricas |
| 03_GIT | Bundle com histórico completo, log, commit, diff, inventário SHA-256 e consultas GitHub | Restaurável sem acesso ao GitHub |
| 04_CLOUDFLARE | Configuração usada, estado remoto atual, backend e sourcemap publicados, esquema D1, ledger de migrações, hashes e paridade de assets | Consulta atual, sem registros pessoais ou valores de segredos |
| 05_EVIDENCIAS_HISTORICAS | Logs originais RED/GREEN e regressões, estados antes/depois e log de deploy | Evidências da entrega, não nova execução de tudo que aparece nelas |
| 06_TESTES | Runner local explícito, resultados completos e inventário de todos os testes | 36 executados: 33 PASS e 3 FAIL |
| 07_ZIPS | ZIP da correção e ZIP da versão pai, ambos com hashes conhecidos verificados | Originais preservados |
| 08_DOCUMENTOS | Índice antigo do Drive preservado e Issue #20, referências de URLs externas | Contexto histórico, não autoridade sobre a versão atual |
| MANIFEST_SHA256.json | Hash de todos os arquivos do pacote, exceto o próprio manifesto | Integridade |
| VERIFICAR_INTEGRIDADE.cjs | Verificador independente sem dependências | Não acessa rede |

## Resultado de preparação, não parecer de aprovação
- Todos os **43 assets públicos** comparados com o commit são idênticos.
- Backend publicado: 50474 bytes, SHA-256 d609da7d763910f93c21e4e80f5c6c8d7c8b7b8c62b1985fd56e63dfcf61ed5b, igual ao compilado usado como referência.
- Sourcemap remoto completo: SHA-256 fdb4a7085cecf3deab8ccc157746f5082b05020cc3b72dd2a978ce50703a6ee7.
- Testes locais: **33/36 passaram; 3 falharam**. Os resultados estão integralmente incluídos, sem correção do produto ou testes nesta preparação.
- Proprietário confirmou em conversa fechamento total e reabertura offline da PWA no iPhone, com sessão e treino preservados. Não foi capturado vídeo ou log do aparelho.
- Sincronização inicial no iPhone permanece com relato “Aguardando primeira migração” / “Load failed”, sem causa raiz demonstrada.
- O SHA publicado não foi localizado no GitHub oficial pela API; o pacote inclui Git autossuficiente. Não chamar main do GitHub de “mesma versão” sem comparação.
- Acesso ao painel Cloudflare, repositório privado e documentos privados para uma pessoa externa **ainda precisa de concessão nominativa**. Nenhum convite foi enviado.

Abra 00_COMECE_AQUI.html se preferir um índice visual. Nenhum arquivo marcado como histórico deve substituir este índice na identificação da versão.
