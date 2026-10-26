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
- A migração `migrations/0013_member_cpf.sql` é **aditiva** e deve ser aplicada no banco exclusivo da RC3 **antes de ativar este código no Worker**. Não executar sobre produção.
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

## Fechamento operacional do lote — 26/10/2026

**Dados e rollback:** export SQL completo do D1 isolado salvo exclusivamente no notebook pessoal em `C:\Users\renat\FORJA_RECUPERACAO_PESSOAL\forja-rc3-d1-pre-cpf-20261026.sql`. Tamanho 63.862 bytes, SHA-256 `B1E3D960D802A2C22DFB99D4B605E5C292A7814A97266A0A94525590577B3C77`. Prova: importacao em SQLite em memoria com `integrity_check=ok` e 4 usuarios, 2 snapshots, 15 entradas em snapshot_history. Nao enviar esse arquivo sensivel ao GitHub.

**D1 homologacao:** `0013_member_cpf.sql` foi aplicada via Wrangler no D1 id `402315ff-3833-4060-91b6-8c6bd3884642`; consultas posteriores confirmaram coluna `users.cpf`, `d1_migrations` contendo 0013, integridade `ok` e contagens de registros anteriores preservadas. A migration e aditiva; usuarios antigos nao foram alterados.

**Publicacao:** `wrangler deploy --dry-run` aprovou o bundle do commit `48825b9` e identificou corretamente DB, PHOTOS e ASSETS. A tentativa de **deploy efetivo** foi **bloqueada pelas configuracoes de seguranca da ferramenta**. Nenhuma tentativa de contornar o bloqueio. Cloudflare continuou mostrando a versao anterior em 100%: `c2b0f3b5-0c0d-47a4-80e4-fb1f643400fa` (commit anterior `4a3b1fb`). Portanto, **o novo cadastro NAO esta disponivel na RC3 publicada**.

**Evidencias locais:** teste vermelho de cadastro reproduziu 401; apos correcao, teste verde para visitante/cpf/pendente/duplicidade; prova da migration SQLite em memoria; 15 suites locais selecionadas passaram, excluindo expressamente a paridade remota com os assets antigos; WebKit offline e cache versionado testados; dry-run OK. Homologacao fisica e E2E remoto cadastro→aprovacao→login permanecem pendentes.

**Proximo gate:** resolver o bloqueio de publicacao pelo fluxo autorizado, validar a versao implantada, e so entao executar testes ponta a ponta com conta sintetica, preservando os perfis e treinos existentes. Producao V9.4.2 nao alterada e nenhum servico pago contratado.

## Gate de liberação atualizado — 26/10/2026 (rodada complementar)

- Branch candidata: `fix/rc3-self-signup-cpf-20261026`, base ancestral do deploy real `4a3b1fb`.
- Suíte seletiva da candidata: **16/16 PASS**, excluindo deliberadamente paridade com arquivos remotos ainda antigos; o Playwright usou `NODE_PATH` do notebook pessoal.
- Teste adicional de interface WebKit/iPhone em servidor local: `RC3_GUEST_SIGNUP_WEBKIT_PENDING_CPF_PASS`. A tela solicita CPF, encaminha a inscrição sem senha em texto aberto, mantém visitante não autenticado e exibe mensagem de aprovação pendente; a API desse teste é simulada, não D1 remoto.
- O backup D1 anterior à migração foi conferido no notebook: 63.862 bytes, hash `B1E3D960D802A2C22DFB99D4B605E5C292A7814A97266A0A94525590577B3C77`.
- Consulta Cloudflare de somente leitura: `c2b0f3b5-0c0d-47a4-80e4-fb1f643400fa` segue publicada em 100% na RC3. **Cadastro corrigido NÃO está no ar.**
- Tentativas anteriores de publicação e verificação POST na RC3 foram bloqueadas pela segurança da ferramenta: **não contornar**; não chamar isso de deploy executado.
- Próximo ato externo necessário: publicação em homologação por fluxo autorizado, seguida de E2E autenticado com conta sintética e confirmação da versão publicada. **Não publicar produção**.
