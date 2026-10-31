# FORJA | Revisão do executor de auditoria sem notebook

Data: 27/10/2026. Escopo: inspeção estática do workflow versionado `.github/workflows/qa-e2e-local-descartavel.yml` na branch de evolução; nenhuma execução e nenhum deploy.

## Confirmado no código
- `workflow_dispatch` habilitado no YAML, de disparo manual; `permissions: contents: read`; `runs-on: ubuntu-latest`, `timeout-minutes: 12`.
- Worker local em `127.0.0.1:8799`, banco D1 com `--local --persist-to /tmp/forja-rc3-e2e-only`, chaves sintéticas somente de desenvolvimento.
- Fluxos planejados: bootstrap de admin, conta pendente/rejeição, limite de atletas, acesso anônimo a mídia, upload/list/download/delete de PDF, controle de revisão/idempotência no estado.
- GitHub conectado à conversa possui leitura dos workflows e logs de runs conhecidos, **mas não disponibiliza uma operação para iniciar `workflow_dispatch`**. Não declarar E2E executado.

## Riscos específicos antes de disparar
1. O workflow espera `/api/accounts/register` público retornar 401 (`PUBLIC_SIGNUP_NOT_BLOCKED`). A regra de produto mais recente permite solicitação pública de cadastro CPF para aprovação; verificar comportamento esperado e ajustar o teste à versão atual antes de qualquer execução. Não remover a proteção de aprovação.
2. Não há referência a `actions/setup-node` nem versão explícita de Node. O script usa `File`, fetch e FormData globais; fixar versão de Node evita divergência do runner.
3. O teste pressupõe endpoints de mídia e banco local. Verificar bindings do Wrangler e configuração atual antes da execução. A revisão não confirma que todos esses endpoints atendam à assinatura usada.
4. Os testes criam registros descartáveis e excluem arquivos **apenas no processo local por desenho**, nunca converter a URL-base para o Worker remoto.
5. A existência do YAML não demonstra execução, custo efetivo zero ou cobertura física de Safari.

## Decisão operacional
**Executável em princípio, NÃO VALIDADO em execução nesta rodada.** Não abrir novo serviço nem instalar software no notebook. Priorizar alinhar a expectativa de cadastro e verificar o ambiente de execução, depois disparar em runner isolado por mecanismo autorizado e colher logs. Nenhuma alteração na V9.4.2 ou RC3 remota.
