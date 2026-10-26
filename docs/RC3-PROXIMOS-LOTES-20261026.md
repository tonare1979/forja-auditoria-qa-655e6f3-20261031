# FORJA V11 RC3 — Plano de execucao por lotes (26/10/2026)

## Referencia verificavel
- A bateria automatizada tem 15 testes, ultimo resultado 15/15; **somente** cobre o escopo desses testes, sem atestar homologacao total.
- Codigo de QA: branch `test/rc3-parity-auth-occ-20261026`, commit base `507bca8`.
- Status rapido no notebook: `node ops/forja-status.mjs`, sem rodar testes outra vez.
- RC3 isolada; producao V9.4.2 NUNCA substituir sem aprovacao expressa.
- Zero despesas adicionais, sem Work quando as ferramentas existentes resolvem.

## LOTE 1 — P0 seguranca, integridade, sincronizacao
- Prova pendente: duas sessoes **autenticadas** realmente conectadas ao **D1 remoto** de homologacao devem provocar 409 de revisao concorrente, com dados antigos e locais conservados, conciliacao explicita e estado final reproduzivel.
- Teste local com handler real e D1 em memoria esta **aprovado**, mas NAO substitui a prova no ambiente remoto. O impedimento de escrita anterior ocorreu por controle de seguranca: nao contornar nem inserir sessoes diretamente no D1.
- Buscar via fluxo legitimo de login e conta QA dedicada; nao usar tonare79, nao resetar conta alheia, nao tocar snapshots existentes.
- Em paralelo: auditar salvamento/recarga offline, 409, backup JSON, conflitos de perfil e historico sem writes remotos perigosos.
- Critério de saida: registros preservados, logs HTTP, revisoes antes/depois, evidencias e rollback; nunca aprovar sem teste real.

## LOTE 2 — P0 cadastro, aprovacao e acesso (foco antes de 11 atletas)
- **Distinguir dois fluxos no codigo:** `/api/bootstrap/*` e somente para criar o primeiro **administrador** quando ainda nao ha usuario; novos atletas nao usam bootstrap. `/api/accounts/register` exige sessao admin e cria `pending`; `/api/admin/users` aprova ativa. Verificar UX do proprio fluxo efetivamente disponivel na RC3.
- Testar limite 11 atletas+1 admin, bloqueio sem perda de treinos, sessao revogada, recovery e mensagens claras na interface WebKit, incluindo navegacao ate Cadastro/Administracao.
- Confirmar CPF e campos exigidos pelo proprietario sem inventar novos campos/politicas; usar somente dados sinteticos no QA.
- Criar provas executaveis locais e E2E remoto apenas com identidades de teste autorizadas.

## LOTE 3 — P1 recuperacao, disponibilidade e custos
- Auditar restore coordenado Worker + D1 + R2 + bindings/segredos, usando copias e escopo de laboratorio. Nao ler/exibir segredos; restaurar em alvo descartavel e comprovar igualdade.
- Confirmar consumo/permissoes Cloudflare pelos painéis/conta real; nao alegar US$ 0 faturado sem verificacao.
- Checkpoint versionado, instrucoes de rollback e matriz de riscos.

## LOTE 4 — P1 iPhone e interacoes fisicas
- Roteiro curto de aparelho real: autenticacao, PWA home screen, rede offline/online, salvar treino parcial, dados de peso, fotos/PDF, video, sincronizar iPhone/PC e erros visiveis.
- Nao marcar WebKit simulado como Safari fisico. Coletar apenas o minimo indispensavel do proprietario quando for realizar teste fisico.

## LOTE 5 — P2 UX, Scout, catalogo e musica
- "Um exercicio conta": treinos parciais, linguagem respeitosa, nenhuma cobranca compulsoria.
- Perfil/historico, fim de semana e medalhas, navegação do cadastro, notificacoes; validar com capturas e testes automatizados.
- Manter videos pendentes em fila especifica (sem substituicao silenciosa por outro exercicio); FORJA Music em fila propria.

## Politica de governanca
- Corrigir e testar em blocos, preferencialmente testando vermelho antes e verde depois.
- Um item, uma prova. Documentar base, commit, D1/Worker e o que foi real versus simulado.
- Se uma etapa estiver bloqueada, prosseguir outras frentes sem perder rastreabilidade.
- Work e auditorias externas sao ferramentas opcionais; gastar creditos apenas quando houver ganho claro e escopo limitado.
- Nada de deploy na producao, alteracao no login real do proprietario ou custos pagos sem autorizacao.
