# FORJA V11 | Triagem de linhas históricas sem merge automático

Data: 27/10/2026. Fonte de comparação: GitHub REST compare sobre `fix/rc3-equipment-thumb-contain-20261027`.

| Linha histórica | Situação contra a atual | Commits atrás | Commits à frente | Arquivos no compare | Decisão |
| --- | --- | ---: | ---: | ---: | --- |
| `feat/forja-music-curadoria-20261020` | divergente | 75 | 460 | 300 (limite da API) | Preservar; selecionar arte e funcionalidades apenas por arquivo/teste |
| `feat/ux-gymanalytica-four-tabs-20261020` | divergente | 75 | 415 | 294 | Preservar; revisar exclusivamente melhorias UX não presentes |
| `fix/rc3-consolidada-r4-20261018` | divergente | 75 | 337 | 236 | Preservar como evidência, não reintegrar versão antiga inteira |
| `fix/rc3-html-parity-reconcile-20261027` | compare por nome retorna HTTP 404 | N/V | N/V | N/V | Preservar SHA local `e048c210f2b3b7157712bde5cc5bfb46941230c0`; verificar acesso à ref antes de comparar |

**Cuidado metodológico:** contagens de commits e arquivos representam o intervalo de comparação do GitHub, não são 460 mudanças inéditas ou melhorias aproveitáveis. `files=300` pode representar o limite da API. Não interpretar como quantidade de funcionalidades.

## Ações restritas e verificáveis

1. Nenhum `git merge` dessas branches; nenhum checkout histórico substitui a V11 em uso.
2. Antes de integrar algo: identificar função e decisão aprovada; comparar contra arquivo atual; isolar diferença mínima; testar e registrar SHA; só depois submeter como melhoria.
3. O material não rastreado em worktrees históricas está preservado em `FORJA_BACKUPS/OUTRAS_VERSOES/WORKTREES`; a API de compare não o mostra, portanto este relatório **não conclui a triagem de arquivos exclusivos locais**.
4. Prioridade: referências originais Work, UX de treino iPhone e FORJA Music; mas não promover sem aceite visual e regressão.
5. O item de triagem na Issue #20 segue ABERTO até identificar e decidir sobre os arquivos não rastreados e alterações locais do arquivo histórico.

## Limitações

Comparação baseada em GitHub, não no conteúdo dos arquivos não versionados do notebook. Não houve deploy, alteração de banco, merge ou aprovação de novas funcionalidades.
