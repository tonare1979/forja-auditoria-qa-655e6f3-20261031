# Séries e descanso — correção local

Base: f00b3c62a87328ce0997869ef57b891f2d88629f, laboratório autenticado descendente de 23e875edece5cec90d84a8dd9fd016cf779984a6 e c9a48e7. Sem publicação.

Relato do proprietário no notebook: preencher carga/reps e marcar checkbox não produzia descanso perceptível. Reprodução independente em WebKit: auto=false, autoRest=idle; checkbox manual iniciava rest.phase=running, porém visibleTimer=false. Duas causas: updateInput não implementava conclusão automática, e CSS #restDock display:none!important anulava o fallback existente.

Correção limitada a public/index.html e chave CACHE de public/sw.js. Ao confirmar alteração (evento change, ao sair do campo), valores efetivamente preenchidos, carga finita >=0 e reps finitas >0 concluem a série. Digitação input isolada não conclui antecipadamente; placeholders não contam. O início do descanso exige transição não concluída -> concluída e save() bem-sucedido. Editar série já concluída não reinicia o descanso. Falha de gravação restaura o marcador anterior e não inicia cronômetro; os valores em andamento permanecem em memória. Campo inválido confirmado retira a conclusão.

Reativado restDock existente somente quando o contador principal sai da tela. Atualização em scroll passivo evita esperar o tick do contador para alternar a visibilidade. Não há segundo contador simultâneo. Cache renovado para forja73-static-v11-rc3-series-rest-20261028; lista de recursos/regras do SW intactas.

Teste novo: node tests/series-rest-webkit.cjs. Vermelho exit 1 na base; verde verifica formulário/login real do Worker via SQLite local, digitação/commit, marcador, descanso automático/manual, visibilidade de um contador, edição sem reinício, vazio/zero reps/carga negativa, zero kg explícito, quota injetada somente em Storage.setItem, retry e recarga. Regressões anteriores e bateria nativa candidate também executadas; logs no pacote de entrega identificam o SHA final.

Limites: WebKit automatizado Linux e dependências locais; nova correção ainda requer contraprova do proprietário em Windows. Safari físico, backend Cloudflare e dispositivos remotos não foram homologados. Nenhuma alteração em src/, D1/R2 remotos, conta real, push, merge ou deploy.

## Retificação aprovada pelo proprietário: contador único

Substitui a apresentação anterior de painel principal mais fallback. Há exatamente um elemento de contador (restDisplay), dentro de um painel compacto fixo acima da navegação, sempre presente durante treinos de séries. Removidos o painel principal, o segundo valor restDockTime, a lógica de alternância por visibilidade e o listener de scroll. Dois controles: iniciar/pausar/continuar e cancelar. Padding inferior reserva espaço para alcançar o final da ficha. A marcação automática de séries permanece intacta. Chave do cache: forja73-static-v11-rc3-single-rest-20261028.

Teste single-rest-webkit.cjs: vermelho na versão anterior (segundo contador ainda existia no DOM); verde em 390 e 430 px. Verifica unicidade no DOM, visibilidade mesmo parado, posição fixa, encaixe horizontal/altura compacta, separação da navegação, iniciar/pausar, pausa e tempo restante após recarga, continuar/cancelar e ausência fora da tela de treino. O teste anterior de séries preserva todas as asserções funcionais, apenas tolerando a remoção do elemento duplicado ao contar elementos visíveis.
