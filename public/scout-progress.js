/* FORJA Scout: painel somente leitura, sem rede ou alteracao de estado. */
(function(){'use strict';
function scoutProgress(snapshot, now=new Date()) {
 const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
 const min=end.getTime()-27*86400000;
 const sessions=(Array.isArray(snapshot?.sessions)?snapshot.sessions:[]).filter(s=>s&&typeof s.date==='string'&&Number.isFinite(Date.parse(s.date+'T00:00:00Z'))&&Date.parse(s.date+'T00:00:00Z')>=min&&Date.parse(s.date+'T00:00:00Z')<=end.getTime());
 const days=new Set(sessions.map(s=>s.date)).size;
 const partial=sessions.filter(s=>s.status==='partial').length;
 let volume=0;
 for(const s of sessions)for(const e of (Array.isArray(s.exercises)?s.exercises:[]))for(const v of (Array.isArray(e.sets)?e.sets:[])){const kg=Number(v.kg),reps=Number(v.reps);if(Number.isFinite(kg)&&Number.isFinite(reps)&&kg>=0&&reps>0)volume+=kg*reps;}
 return {sessions:sessions.length,days,partial,volume};
}
function render(snapshot,now){const m=scoutProgress(snapshot,now);return `<section class="panel" aria-label="Resumo Scout dos ultimos 28 dias"><div class="kicker" style="margin:0">SCOUT | ULTIMOS 28 DIAS</div><h3>Seu esforco conta</h3><p class="muted small">${m.sessions} treino(s) em ${m.days} dia(s) ativo(s). ${m.partial} treino(s) parcial(is) reconhecido(s).</p><p class="small">Volume registrado: <b>${Math.round(m.volume).toLocaleString('pt-BR')} kg × repeticoes</b>.</p><p class="muted small">Indicadores descritivos. Comparacoes de desempenho exigem contexto e historico suficiente.</p></section>`;}
window.forjaScoutProgress=render;window.forjaScoutMetrics=scoutProgress;
})();
