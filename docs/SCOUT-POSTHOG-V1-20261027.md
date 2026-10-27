# FORJA Scout Analytics V1 + PostHog: plano de integracao isolada

## Estado real
- Scout: motor deterministico local em `src/scout-analytics.mjs`, com teste sintético `tests/scout-analytics-v1.mjs`.
- PostHog: projeto conectado `Default project` (id 690703), mas sem eventos ingeridos e sem session replay. Nao esta integrado ao FORJA.
- Nenhum envio de dados, criacao de dashboard, alteracao de configuracao, deploy ou habilitacao de gravacao foi feito.

## Contrato de telemetria proposto (somente homologacao QA)
- `forja_qa_app_boot`: `environment`, `build`, `platform`, `standalone`.
- `forja_qa_route_error`: `environment`, `route_id`, `error_code`, `build`.
- `forja_qa_workout_save_result`: `environment`, `status` (success/conflict/error), `elapsed_bucket`, `build`.
- `forja_qa_resume_result`: `environment`, `result` (restored/empty/error), `build`.
- `forja_qa_scout_view`: `environment`, `section_id`, `build`.

## Proibido enviar
CPF, nomes, emails, tokens, cookies, provas de senha, identificadores pessoais, notas livres, peso, altura, biometria, dados de saude, exercicios e seus valores, URLs com dados sensiveis, payloads completos, gravacoes de atletas reais.

## Gate de habilitacao
1. Confirmar custo zero sem assumir franquias; 2. Revisar privacidade e filtros de rede; 3. Validar a instrumentacao somente com contas sinteticas; 4. Verificar recebimento e exclusao de eventos; 5. Aprovar habilitacao na homologacao. Producao fica fora do escopo.

## Limites do motor V1
Entrada ainda e um formato canonico de teste, nao comprovadamente o esquema D1 real. Progressao nao normaliza repeticoes, amplitude, tecnica, RPE ou equipamento; nao fazer inferencia clinica ou recomendacao de carga automaticamente. Treinos parciais contam como esforco e nunca como falha.
