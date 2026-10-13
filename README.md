# FORJA RC3 — homologação isolada

Código para repositório **privado**, não para produção.

Worker: `forja-v11-rc3-preview-isolada`
D1: `forja-v11-rc3-labc`
R2: `forja-v11-rc3-fotos-lab`

Antes de publicação, configurar **exclusivamente no novo Worker** os segredos FORJA_AUTH_PEPPER e FORJA_SETUP_KEY via interface segura da Cloudflare, sem enviar valores ao GitHub ou chat. Não ativar deploy automático sem checar billing e bindings. Não rodar migrations apply automaticamente: schema de laboratório foi criado manualmente e não possui registro d1_migrations. Nenhum teste remoto foi executado nesta preparação.
