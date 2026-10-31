# Reprodução independente
## Requisitos e integridade
Ambiente usado: Windows, Node.js v24.20.0, Git 2.56.0.windows.2, npm 11.19.0. A bateria básica não instala pacotes nem usa credenciais. O runner usa testes sintéticos e SQLite em memória.
No diretório extraído, executar:
```text
node VERIFICAR_INTEGRIDADE.cjs
git clone -c core.autocrlf=false 03_GIT/FORJA_655e6f3.bundle auditoria-git
git -C auditoria-git rev-parse HEAD
git -C auditoria-git fsck --full
```
Esperado HEAD: 655e6f3cd80954b144339968afff231d3d38f0c4. O clone é detached HEAD por preservar o bundle original. O verificador cobre os arquivos distribuídos, não autentica o proprietário nem substitui assinatura digital.
Conferir o SHA-256 do ZIP externo informado junto da entrega antes de extrair.

## Repetir a bateria básica
O runner usa uma lista fixa de 36 testes:
```text
node 06_TESTES/executar-local.cjs
```
Resultado de referência: 33 PASS / 3 FAIL, saída do runner 1. Não esperar exit 0 enquanto os três testes permanecerem como no commit. O arquivo resultados-locais.json será substituído pela nova execução; preserve antes uma cópia da evidência original fora do pacote verificado.
qa-json.cjs grava fixtures sintéticas em 02_CODIGO/fixtures. Execute em cópia descartável do pacote. Compare o snapshot novamente depois. O pacote entregue foi recomposto após a bateria para manter os arquivos exatos.
Não executar automaticamente run-qa-batch.mjs: há testes com caminhos locais, dependências e origem remota de laboratório antigo. Não executar workflows/ops históricos sem inspeção.

## Navegador e WebKit — incluídos, não executados nesta bateria
tests/package.json e package-lock.json fixam Playwright 1.64.0. Em clone descartável, revisar os testes específicos, instalar com npm ci em tests e instalar WebKit se necessário. Essas instalações exigem internet e download de binários.
Os scripts em ops/lab-local.mjs usam dados sintéticos, SQLite e HTTPS localhost; a documentação completa está em 02_CODIGO/docs/FORJA-LABORATORIO-LOCAL-20261028.md. O material TLS é de teste, sem confiança pública. Não instalar a chave/certificado como CA. Não habilitar acesso externo ao servidor local.
Playwright/WebKit simulado não equivale a Safari/PWA física. Não apontar FORJA_QA_ORIGIN para a produção ou reaproveitar usuários reais.

## Build e deploy
O backend é JavaScript sem dependências npm de execução. src/index.js é a entrada. Configuração efetivamente usada: 04_CLOUDFLARE/config-publicacao-qa.json. A original 02_CODIGO/wrangler.jsonc aponta para outro laboratório.
Para inspeção de build em clone isolado, disponibilizar Wrangler **4.156.0** e copiar a configuração QA para a raiz desse clone; caminhos src/public são relativos à configuração:
```text
wrangler deploy --config wrangler.qa-authorized.json --dry-run --outdir audit-build --keep-vars
```
O modo dry-run não publica. Configuração identifica DB e PHOTOS já existentes. Nenhuma migração deve ser aplicada no QA como parte da auditoria.
O comando real do deploy está nos logs como evidência histórica, não como instrução para repetir publicação.

## REST e banco
Consultar health é leitura pública. GET /api/auth/me sem sessão deve negar autenticação; não demonstra login válido.
Esquema real em 04_CLOUDFLARE/esquema-d1-remoto.sql é material de inspeção, não script para aplicar ao banco vivo. Inclui estruturas internas/operacionais que não são todas migrações do produto.
Para verificar isolamento, OCC, mídia privada e recuperação, usar identidades e dataset sintéticos num ambiente descartável autorizado. Não usar registros pessoais ou substituir o estado do iPhone.

## Controle de alterações
Qualquer correção deve resultar em commit novo, testes apropriados e nova evidência. Não modificar arquivos dentro do ZIP de referência e continuar chamando-o de 655e6f3. Publicação adicional e acesso à produção ficam fora deste pacote.
