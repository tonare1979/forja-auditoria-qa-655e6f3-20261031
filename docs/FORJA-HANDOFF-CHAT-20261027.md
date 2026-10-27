# FORJA | RETOMADA OPERACIONAL ENTRE CHATS
Data: 27/10/2026. Este é o documento de entrada para qualquer novo chat, Work, plugin ou outra IA. **Não confundir planejamento com execução.**

## 1. Objetivo do proprietário
Entregar um aplicativo privado de treino que funcione diariamente no iPhone (PWA Safari), com ficha correta, registro simples de carga/repetições, rascunho preservado, histórico/sincronização confiáveis, fotos dos aparelhos e demonstração exata por exercício. Família: até 11 atletas mais 1 administrador. Custo adicional zero. **Não reiniciar arquitetura.**

## 2. Fonte de verdade técnica
- GitHub: `tonare1979/forja-v11-homologaca`.
- Branch **única de integração atual**: `feat/scout-analytics-local-20261027`.
- Último commit de código conferido simultaneamente no notebook e GitHub ANTES deste documento: `da87f0f935bbd891f910ae53d721d0f70f5ace74`. O commit deste documento avançará somente a documentação; **não implica novo deploy**.
- Notebook pessoal: `C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027`.
- Homologação: `https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev/`.
- Worker publicado da candidata de código acima: versão Cloudflare `98efe32f-047a-4a65-b27b-926685b6c142` (100% na última leitura). Comparar o código servido e não inferir a partir do nome da branch.
- **Produção V9.4.2 preservada. Nunca publicar nela sem autorização específica.** D1 e R2 da homologação têm dados; nenhuma migração automática.
- Itens não rastreados `.wrangler/`, `public/thumb-qa*.jpg` e `tests/e2e-local-http-isolated.mjs` não devem ser incluídos nem excluídos sem revisão de origem.
- Referência/decisões e rastreabilidade: Notion central `https://app.notion.com/p/406dae56532e81cb84c6fd101d38cb68`.

## 3. Fonte visual e decisões aprovadas
- Arquivo **original** recuperado da Library ChatGPT: `FORJA_Tela_Treinos_Playlists.png` (produzido no Work). Complementar: `Trilha de Evolução FORJA.png`. Não exigir que o proprietário reenvie.
- Trata-se de **referência visual aprovada, não prova de app implementado**.
- Ficha em estilo adulto, sóbrio, cartão compacto com miniatura correta do aparelho **à esquerda** e informações hierarquizadas à direita, abrir detalhes/cargas sem atrapalhar execução. NÃO mostrar foto gigante ou uma imagem errada; não infantilizar.
- Treinos A, B, CR, C, D, SÁB, DOM juntos, fichas reais sem trocar exercícios com base no mockup.
- FORJA Music: três momentos IGNITION, ENDURANCE, UNBREAKABLE; Deezer, Spotify, Apple Music, YouTube Music; três playlists Deezer já aprovadas. Não inventar links das outras plataformas.
- Scout respeitoso com treinos parciais e padrões de evolução; nunca penalizar atleta por ter treinado pouco.

## 4. Falhas REALMENTE abertas pelo proprietário (capturas de iPhone)
1. Ícones dos serviços Music não correspondiam à referência.
2. Fotos dos equipamentos ausentes ou erradas; a imagem do leg press era frontal, enorme e fora da posição, apesar de mockup lateral aprovado.
3. Vídeo não diretamente ligado ao exercício; resultado genérico em inglês, ou demonstração ausente.
4. Histórico/tabelas desalinhados.
5. Séries/controles desalinhados; dois cronômetros ao mesmo tempo.
6. Resultado pós-correção ainda considerado **infantil, feio e sem foto/vídeo** pelo proprietário. **Não há aceite visual real** apesar de vários deploys.
- O catálogo legado com 303 URLs anatômicas existiu, mas não tem curadoria visual integral; não dizer que 303 vídeos estão integrados ou aprovados.
- Imagens JPEG atualmente mapeadas para parte das fichas e miniatura de leg press extraída da arte do Work: associação e apresentação no aparelho real precisam de prova. Não chamar ausência de mídia de resolvida só porque teste HTTP 200.
- Testes locais 20/20 e bateria 21/21 passaram em rodadas anteriores, mas **não atestaram os problemas de UX apontados**. Gate visual separado é obrigatório.

## 5. Responsabilidades com entregas, NÃO apenas 'equipes' fictícias
- **Design**: GitHub issue #17. Especialista de layout deve recuperar a referência e produzir artefato revisável (Figma/Canva/Work), com comparativo 390/430 px, posições, tipografia, estados, imagem correta. Proprietário valida conceito ANTES de implementação. Chat coordenador NÃO redesenha por improviso.
- **UX e usabilidade**: issue #18. Revisar fluxo iPhone real, abrir ficha, registrar treino, mídias, dois relógios, navegação, persistência e retorno do player, sem aumentar toques; evidências PASS/FAIL.
- **Engenharia, QA e performance**: issue #19. Consome design aprovado, implementa em branch isolada baseada no SHA oficial, testes Safari/WebKit, performance PWA/offline/Scout, screenshot comparativo, proteção de dados.
- Issues são **ordens de trabalho**; NÃO ativam execução autônoma. Conectar ferramentas disponíveis para executar de verdade e exigir links/artefatos. Nunca anunciar equipe trabalhando sem ferramenta/processo real acionado.
- **Coordenador (ChatGPT)**: atribuir especialistas conforme ferramentas disponíveis, recolher retornos diretamente de apps/arquivos, validar evidências, integrar no GitHub, testar, promover homologação somente após gate e reportar estado exato. Não transformar usuário em mensageiro entre Work e chat.
- Work não sincroniza automaticamente toda a sua atividade com outros chats ou repositórios. Registrar handoff persistente, links e SHA, identificar lacunas em vez de inventar estado.

## 6. Regras de mudança e aceite
- Cada pedido: decisão aprovada -> fonte de verdade -> responsável real -> branch/artefato -> QA funcional + visual -> publicação somente homologação -> versão Worker e paridade -> evidência física iPhone -> aceite.
- **Nunca editar produção nem gastar dinheiro**. Backups: bundle Git verificado; D1 export SQL 66.620 bytes restaurado em SQLite 19 tabelas/62 linhas/integrity OK; R2 cópia binária de 68 bytes validada. Não alegar recuperação conjunta Worker+D1+R2+secrets.
- **Não repetir loop de tentativas iguais**, auditorias gerais ou pedir de novo arquivos aprovados. Não marcar como aprovado o que o proprietário reprovou; não fazer deploy só para mostrar movimento.
- O proprietário quer usar seu app como piloto no treino real. Próximo resultado de valor: cartão de exercício conforme mockup aprovado e **mídia realmente presente/correspondente**, testados num iPhone real, não mais um relatório.

## 7. Passos iniciais no novo chat
1. Ler este arquivo + central Notion + issues #17/#18/#19 e ver SHA da branch e versão Worker atuais.
2. Recuperar referência Work pela Library, confirmar com a captura de falha recebida (não pedir reenvio).
3. Definir e executar atribuições reais às ferramentas de design, UX e engenharia disponíveis. Registrar resultados e links no Notion e GitHub; não assumir que os plugins trabalham sozinhos.
4. Só integrar mudanças comprovadas em branch apropriada; comparar screenshots no iPhone, testar funcionalidade, verificar dados e publicar apenas homologação quando critérios passarem.
5. Se não puder fazer etapa física, nomear **essa única limitação**; executar todas as demais sem repassar trabalho de coordenação ao proprietário.

**Status de transferência:** linha de código sincronizada, porém tela de treino NÃO aprovada. O papel do novo chat é realizar integração multidisciplinar e entregar o app utilizável, não recomeçar a discussão.
