# FORJA RC3 — Correção P0 cadastro de atleta (26/10/2026)

## Diagnóstico comprovado
A tela do visitante `SOLICITAR UMA CONTA` acionava `POST /api/accounts/register`, mas o roteador da API exigia autenticação antes de invocar o handler. O próprio handler ainda restringia a operação ao administrador. Uma solicitação pública recebia `401` e nunca chegava à fila de aprovação.

**Teste vermelho:** `node tests/qa-member-public-signup-cpf.mjs` retornou `401 !== 400` antes da correção.

## Alteração implementada (branch isolada, NÃO publicada)
- Permite `POST /api/accounts/register` sem login prévio, exclusivamente para criar solicitação `pending`, **nunca** sessão ativa.
- Mantém checagem de origem `Origin`, limite de 5 inscrições por IP/hora, no máximo 20 pendentes, separação 11 atletas + 1 admin e confirmação administrativa.
- Exige CPF válido para inscrições públicas e criação de perfil pelo administrador, sem alterar retroativamente contas existentes; guarda CPF na coluna `users.cpf`.
- Verifica duplicidade de usuário/e-mail/CPF e impõe unicidade de CPF no D1.
- Corrige formulário do visitante e formulário de criação pelo administrador para exibir CPF obrigatório.
- A migração `migrations/0008_member_cpf.sql` é **aditiva** e deve ser aplicada no banco exclusivo da RC3 **antes de ativar este código no Worker**. Não executar sobre produção.
- Não remove treinos, snapshots, fotos, backups, usuários, chaves ou sessões existentes.

## Testes com evidência
- Vermelho reproduzido antes.
- Verde: `RC3_GUEST_REGISTRATION_PENDING_CPF_SECURITY_PASS`.
- Migração SQLite em memória: `ADDITIVE_CPF_MIGRATION_LEGACY_UNIQUE_PASS` (preserva usuários antigos e bloqueia CPF duplicado).
- Validação de sintaxe de JS do Worker, features, navegador e dos 3 scripts embutidos na página: passou.
- Regressão local de 15 arquivos selecionados (excluindo exclusivamente a paridade com a publicação antiga): **15/15 passou**.
- A regressão com paridade de assets remotos **deve reprovar** antes do deploy da alteração, pois o conteúdo novo não foi publicado. Não confundir esse resultado com falha da RC3 atualmente publicada.

## Próximos gates de liberação da alteração
1. Backup verificável do D1 de homologação e identificação exata do Worker RC3 e procedimento de rollback.
2. Migração `0008` aplicada exclusivamente no D1 RC3, com prova de integridade dos registros legados.
3. Deploy somente da branch candidata em ambiente isolado RC3, preservando bindings/segredos e produção V9.4.2.
4. Teste de ponta a ponta no navegador real: cadastro visitante → pendente → aprovação admin → primeiro login, com dados sintéticos. Prova de CPF obrigatório e isolamento entre usuários.
5. Regressão completa, revisão de paridade e documentação das evidências; não sinalizar homologação antes de concluir tudo isso.

Não implantar sem esses gates; zero despesas adicionais e nenhuma escrita direta nas contas reais.
