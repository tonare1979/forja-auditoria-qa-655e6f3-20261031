# Escopo, cadeia de custódia e estado atual
## Objetivo
Permitir auditoria independente da versão QA publicada, sem depender do histórico desta conversa e sem pressupor acesso às contas do proprietário. Este é um pacote de insumos e evidências, não uma auditoria de segurança concluída, nem autorização de produção.

## Identificação e cadeia de custódia
1. Pacote da correção obtido da Central do Drive, ID 1vKRlBLO1yMFQEk7b-2dyBOlo2Rg7TlAj. 6972271 bytes, SHA-256 897721a2c21b33e5946d2ace6c27c9001715ff0f1625552c720247033d0d813d.
2. Bundle completo validado por git bundle verify e clonado em pasta isolada. HEAD 655e6f3… e pai c7f15d5… confirmados.
3. Snapshot produzido por git archive do commit, e os 271 arquivos comparados aos respectivos blobs Git. Inventário SHA-256 em 03_GIT.
4. Configuração operacional separada selecionou apenas o QA autorizado. A configuração original wrangler.jsonc permaneceu no commit e aponta para outro laboratório: **não a executar para publicar este QA**.
5. Deploy executado em 30/10/2026 23:10:20 de São Paulo; deployment b0e08deb-944c-4953-adb2-3afee5f872d2. Exit 0.
6. Estado remoto reconferido em 31/10/2026: mesma versão ativa. Os 43 assets públicos e o backend foram comparados; a consulta binária do Worker via conector tem uma resposta truncada preservada e é complementada por hashes dos módulos remotos e sourcemap completo obtido em partes.
7. Antes de fechar o pacote, verificador de integridade e restauração do bundle devem passar. Ver resultado em VALIDACAO_PACOTE.json.

## O que é atual e o que é histórico
- Atual: o commit fixado, configuração específica QA e consultas remotas datadas deste dossiê.
- Histórico: README.md do código, registro mestre de 27/10, índice do Drive e logs anteriores. Preservados integralmente para revisão; não foram reescritos para simular atualidade.
- main do GitHub consultado: b18319c1e1a6cdb77f9822a6efb8029f5683e0b7. Não equivale ao QA publicado.
- O pacote não afirma que esse é o último trabalho existente em todas as máquinas, branches ou bibliotecas. É a última versão QA comprovada nesta execução.

## Limites
Não inclui exportação dos dados pessoais D1, objetos privados R2, valores de segredos, sessões autenticadas, senha da família ou tokens de provedores. Esquema real e metadados foram obtidos sem ler conteúdo pessoal. Não houve varredura completa de segurança, teste de carga, pentest, aprovação LGPD ou avaliação clínica.
Nenhum código de produto foi alterado. Nenhum novo deploy, migração ou escrita D1/R2 ocorreu nesta preparação. Consultas SQL somente SELECT, com rows_written=0 na evidência.

## Custo
A leitura de faturamento antes do deploy mostrava Workers Free, R2 dentro da franquia, custo total/projeção US$ 0,00. Não há comprovação de faturamento atualizada em 31/10; não inferir custo futuro zero de um painel anterior. Nesta preparação foram usados arquivos locais, chamadas de controle da conta e GETs dos assets QA. Não foi contratado plano nem recurso novo.

## Credenciais de laboratório presentes no código
ops/lab-local-tls/localhost.key e localhost.crt fazem parte do commit e são material de teste sintético documentado em docs/FORJA-LABORATORIO-LOCAL-20261028.md. A senha qa_local em ops/lab-local.mjs também é exclusivamente sintética. Nunca usar esse material como credencial de produção ou instalar o certificado como autoridade confiável.
Uma busca limitada por padrões de chaves/tokens no snapshot e no histórico encontrou a chave TLS sintética. Isso não é garantia de ausência de todo segredo ou informação sensível no histórico; o auditor deve repetir sua própria análise antes de redistribuição.
