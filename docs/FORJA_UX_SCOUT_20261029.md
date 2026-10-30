# FORJA — organização e retorno ao atleta

Base imutável: bdac1a3d2657d9680459e37d91933cd0717e274b.
Branch local: fix/rc3-organizacao-scout-20261029.

## Direção do proprietário

Aplicativo motivador, sem cobrança insistente. Reconhecer os limites e o esforço real de cada pessoa. Cada treino deve produzir uma leitura compreensível dos resultados e do que observar depois. Informação detalhada deve ficar disponível sem obrigar o atleta a ler um relatório longo para continuar usando o aplicativo.

O último lettering proposto para FORJA foi rejeitado. Não aplicar essa marca. A capa e os arquivos de imagem existentes permanecem preservados. A opção visual 2 é apenas referência de composição em discussão, sem aprovação do lettering.

## Implementação local desta branch

- Barra: Início, Treino, Evolução e Perfil. Revisão da ficha é uma rota interna vinculada ao Treino. Rotina e diário continuam acessíveis pelo Perfil.
- Início: preserva saudação e ficha seguinte; conta dias registrados na semana, sem meta ou sequência inventada. Remove a cobrança de "cumprir o combinado". Peso e meta usam dados individuais, sem números padrão.
- Evolução: abre inicialmente Scout e resultados; Fotos e medidas têm acesso separado. A subárea escolhida é mantida durante a sessão de uso. Backup, CSV e restauração ficam no Perfil.
- Orientações existentes continuam sendo respostas automáticas. Renomear a área não cria revisão humana, interpretação de arquivos nem importação automática de uma ficha anexada.
- Scout: mantém cálculos descritivos anteriores e adiciona evidência da sessão por exercício, carga e repetições. Histórico do mesmo exercício é consultado; alternativas diferentes não são unificadas arbitrariamente.
- Análise específica pode ser aberta no resumo após salvar e nos detalhes do histórico. Ela fica recolhida nesses contextos; a Evolução mantém a análise visível.
- Nenhum novo serviço, modelo pago ou envio de dados foi acrescentado. O Scout roda localmente, sem modificar registros.
- Cache estático recebe uma chave nova; instalação/renovação efetiva ainda depende de teste em navegador.

## Critérios de interpretação

Uma série registrada é reconhecida. Treino parcial não recebe julgamento de fracasso. Carga maior com menos repetições não constitui, por si só, evolução. Variações entre séries, quantidade diferente ou identidade ambígua não justificam uma conclusão única. Primeira sessão é referência, sem inventar uma tendência.

Técnica, amplitude, esforço e recuperação não são deduzidos de carga e repetições. Observações são relatos do atleta. Duas sessões iguais não bastam para diagnosticar estagnação. Não há prescrição automática de quilos ou interpretação clínica.

## Verificação e limites

Os comandos e saídas reais estão nos logs do pacote. A suíte de organização executa o arquivo features.js integral em Node VM, com DOM e dependências controlados. As suítes Scout executam o módulo real com dados sintéticos. A verificação local não equivale a Safari físico, upload real, sincronização em nuvem ou validação visual das telas.

Este incremento não é uma alegação de Scout profissional completo. Análise longitudinal aprofundada, esforço estruturado, contexto de recuperação e sugestões personalizadas exigem dados adequados e validação específica. Não prometer esses resultados na interface antes da implementação.

## Continuidade

Não substitui a candidata bdac1a3d nem as evidências anteriores. O comando PowerShell entregue antes continua verificando aquela candidata. Esta branch precisa de verificação em navegador e avaliação do proprietário antes de ser considerada para integração/publicação. Nenhum deploy, push, merge, limpeza remota ou alteração dos logins familiares foi realizado.
