# FORJA RC3 — auditoria pública da versão QA

Código e dossiê publicados pelo proprietário para leitura independente.

## Comece aqui

- **[Código exato do app](https://github.com/tonare1979/forja-auditoria-qa-655e6f3-20261031/tree/codigo-655e6f3)** — branch que preserva o commit original `655e6f3cd80954b144339968afff231d3d38f0c4`.
- **[Snapshot navegável](02_CODIGO/)** — frontend, backend, assets, migrações, testes, ops e workflows do mesmo commit.
- **[Baixar o pacote original de 25 MB](https://github.com/tonare1979/forja-auditoria-qa-655e6f3-20261031/raw/refs/heads/main/downloads/FORJA_AUDITORIA_QA_655e6f3_20261031.zip)** — ZIP completo, sem alteração de conteúdo.
- **[Guia de entrada do dossiê](00_COMECE_AQUI.md)** — evidências, fontes e limites.
- **[Cloudflare](04_CLOUDFLARE/)** — estado capturado, configuração, backend, sourcemap e esquema D1, sem dados pessoais.
- **[Resultados dos testes](06_TESTES/resultados-locais.json)** — 33 PASS e 3 FAIL, sem mascaramento.
- **[Pendências conhecidas](09_PENDENCIAS.md)** e **[critérios da auditoria](12_CRITERIOS_DE_AUDITORIA.md)**.
- **[Documentos versionados](02_CODIGO/docs/)** — 79 documentos, preservados como no commit.
- **[Git e histórico offline](03_GIT/)** e **[ZIPs de origem](07_ZIPS/)**.

## Versão auditada

- Commit: `655e6f3cd80954b144339968afff231d3d38f0c4`.
- Pai: `c7f15d592d35ba16abe1cf2e052100583f42dec1`.
- Worker QA: `forja-rc3-c7f15d5-offline-qa`.
- Versão Cloudflare: `7418ecfd-1a02-47b5-875b-cb4fd1abf42d`, ativa a 100% na consulta incluída.
- [Aplicação QA](https://forja-rc3-c7f15d5-offline-qa.renatodesouza79.workers.dev/).

## Integridade e reprodução

SHA-256 do ZIP original: `4ed84c6b74506bdde8f811cc4bd2e44ce86107bfe32e73a5a9ace8414ec5ac6d` (25.171.340 bytes).

O pacote foi extraído e validado: 324 arquivos conferidos pelo manifesto, 271 arquivos exatos do código, 43/43 assets remotos idênticos, Git restaurado e fsck aprovado. Execute `node VERIFICAR_INTEGRIDADE.cjs` após clonar este repositório para conferir os arquivos originais do dossiê. Os arquivos adicionais README e downloads são a camada desta publicação, fora do manifesto interno original.

Este main é a publicação do dossiê; o SHA do commit desta branch não é o SHA de aplicação. A branch codigo-655e6f3 preserva a identidade Git original do app.

## Limites importantes

Este repositório é material para auditoria, **não um parecer de homologação**. Permanecem 3 testes falhando e a primeira sincronização do iPhone sem diagnóstico comprovado. O dossiê registra as condições observadas em 31/10/2026. Afirmações históricas de SHA ausente no GitHub descrevem a consulta ao repositório de desenvolvimento anterior a esta publicação, e não esta cópia pública.

Não há dados pessoais D1/R2, valores de segredos Cloudflare ou cookies de autenticação no material preparado. A chave TLS de localhost e a senha de laboratório são exclusivamente sintéticas e documentadas. Não usar em produção. A triagem por padrões não equivale a garantia exaustiva sobre o histórico.

Configurações, scripts ops e workflows antigos são evidência para inspeção; não executá-los sem revisar destino e efeitos. Publicar este material não autoriza deploy, migrações, testes destrutivos ou alterações na produção V9.4.2. Não foi concedida licença de código aberto por esta publicação.
