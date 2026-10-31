# Laboratório autenticado local — FORJA RC3

Aplicativo preservado no conteúdo do commit 23e875edece5cec90d84a8dd9fd016cf779984a6. O harness ops/lab-local.mjs usa o handler real src/index.js e as migrações originais em SQLite do Node; o adaptador implementa prepare/bind/first/all/run e batch transacional. Não é emulação integral de Cloudflare D1/R2 nem prova do Worker remoto.

Escuta somente 127.0.0.1, endereço https://localhost:8790. O certificado autoassinado e a chave distribuídos em ops/lab-local-tls são exclusivamente sintéticos, públicos no pacote, não confiáveis e nunca devem ser usados em produção ou instalados como autoridade certificadora. HTTPS permite manter o cookie __Host-... Secure/HttpOnly original sem reescrevê-lo. O teste ignora a confiança do certificado apenas no contexto local do WebKit; o aplicativo não ignora certificados.

Banco e configuração são criados em ~/FORJA_LAB_SINTETICO_20261028. Somente dados sintéticos; não importar backups pessoais. Credenciais qa_local / ForjaLocal!2026; segunda conta sintética qa_outro tem mesma senha de laboratório. Não há bindings ou credenciais Cloudflare, nem chamadas de deploy. Migrações são aplicadas somente no arquivo SQLite deste harness, nunca em D1 remoto.

O teste tests/lab-local-webkit.cjs verifica formulário real, rejeição anônima, cookie real, Treinos visível, recarga, duas revisões de snapshot pelo handler, isolamento da segunda conta, rejeição de origem externa e persistência de snapshot/sessão após fechar e reabrir SQLite. Saída: REAL_WORKER_SQLITE_LOGIN_WORKOUT_RELOAD_PASS; SQLITE_REVISION_BATCH_AND_ACCOUNT_ISOLATION_PASS; SQLITE_RESTART_AND_ANONYMOUS_REJECTION_PASS. Produção public/ e src/ sem alterações.

Executar: node ops/lab-local.mjs (Node 24.20+ com node:sqlite). Teste: node tests/lab-local-webkit.cjs após preparar Playwright/WebKit conforme testes do projeto. O launcher Windows do pacote usa somente node; não exige npm/PowerShell scripts. Encerrar com Ctrl+C. Reiniciar mantém apenas o laboratório sintético. Não publicar esse harness.

Limites: não testa R2, ambiente remoto, Safari físico ou paridade integral D1; objetos de mídia usam fallback SQLite do código existente. O usuário deverá aceitar o aviso do certificado apenas para o endereço localhost deste laboratório. Não altera o servidor estático de porta 8788 nem a cópia Git existente no notebook.
