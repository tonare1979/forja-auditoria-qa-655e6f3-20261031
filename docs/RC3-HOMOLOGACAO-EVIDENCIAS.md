# FORJA V11 RC3 — Handoff de homologação (14/10/2026)

## Escopo imutável
Uso privado pessoal/familiar, 11 atletas + 1 administrador, sem comercialização. Meta de custo adicional R$ 0 / US$ 0; usar somente limites gratuitos, monitorando consumo. Worker de produção `autumn-heart-0f30` NÃO PODE SER ALTERADO. Preview: `forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev`. Dados e fotos de família não devem ser usados em testes destrutivos; jamais solicitar senha, token ou chave global.

## Verificações com evidência
- WebKit móvel e file chooser: GitHub Actions 38495348081, aprovado.
- Catálogo feminino: 303 vídeos indexados, 2 URLs MP4 com HTTP 200; GitHub Actions 38494867014, aprovado.
- Carregamento catálogo/player: GitHub Actions 38496861452, aprovado.
- Upload PDF no navegador com endpoint simulado + exigência de autenticação em `/api/media`: GitHub Actions 38498502438, aprovado. NÃO comprova upload autenticado em R2/D1.
- Persistência local de peso offline após reload: GitHub Actions 38499484021, aprovado.
- Reconexão com PUT `/api/state` simulado: GitHub Actions 38500585469, aprovado. NÃO comprova escrita D1 real.
- Tela Evolução offline no WebKit: GitHub Actions 38501323434, aprovado.

## Pendências bloqueantes para liberação
1. **Anexo E2E autenticado real** — conta de teste explicitamente autorizada em laboratório isolado, upload foto/PDF, metadados e download, isolamento entre usuários, exclusão de dados sintéticos após execução. Nenhuma prova E2E real até o momento.
2. **Sync E2E D1** — conta de teste isolada; registrar peso offline, reconectar, conferir revisão e peso em GET `/api/state` após reload/segundo contexto; testar 409 sem perda local. Nenhuma prova E2E real até o momento.
3. **Vídeos sem equivalência técnica** — 19 de 23 exercícios mapeados. Sem vídeo exato verificado: Leg press 45, Abdominal máquina, Desenvolvimento máquina, Hip thrust máquina. Não substituir silenciosamente por movimento diferente; fallback informa ausência. Validar licença de redistribuição/uso do acervo e critérios de biomecânica antes da aprovação final.
4. **Homologação no iPhone físico** — seleção de foto/arquivo, envio privado, vídeo reproduzível, offline e retorno de rede; WebKit em CI não é equivalente a Safari no aparelho real.

## Regras de liberação
Não publicar produção; não assumir testes simulados como E2E; não tocar registros reais; não autorizar gasto/upgrade; documentar consumos e limites Cloudflare Workers, D1 e R2 antes de liberar 12 contas. Tratar falhas como bloqueio de homologação, não como perda de dados confirmada.
