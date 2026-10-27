/* FORJA Scout: painel somente leitura. Nenhum envio de dados. */
(function(){'use strict';
const dayMs=86400000;
function parseDay(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const t=Date.parse(value+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===value?t:NaN;}
function scoutProgress(snapshot,now=new Date()){
 const end=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()),start=end-27*dayMs;
 const sessions=(Array.isArray(snapshot?.sessions)?snapshot.sessions:[]).filter(s=>s&&parseDay(s.date)>=start&&parseDay(s.date)<=end);
 const activeDays=new Set(sessions.map(s=>s.date)).size;
 const partial=sessions.filter(s=>s.status==='partial').length;
 let volume=0,validSets=0;
 const byExercise=new Map();
 for(const s of sessions)for(const e of (Array.isArray(s.exercises)?s.exercises:[])){
  const id=typeof e.id==='string'?e.id:typeof e.name==='string'?e.name:'';
  let best=null;
  for(const v of (Array.isArray(e.sets)?e.sets:[])){
   if(v.kg===null||v.kg===undefined||v.kg===''||v.reps===null||v.reps===undefined||v.reps==='')continue;
   const kg=Number(v.kg),reps=Number(v.reps);
   if(!Number.isFinite(kg)||!Number.isFinite(reps)||kg<0||reps<=0)continue;
   volume+=kg*reps;validSets++;
   best=best===null?kg:Math.max(best,kg);
  }
  if(id&&best!==null)byExercise.set(id,[...(byExercise.get(id)||[]),{date:s.date,kg:best}]);
 }
 let improved=0,stable=0,reduced=0;
 for(const records of byExercise.values()){
  records.sort((a,b)=>a.date.localeCompare(b.date));
  if(new Set(records.map(r=>r.date)).size<2)continue;
  const first=records[0].kg,last=records.at(-1).kg;
  if(last>first)improved++;else if(last<first)reduced++;else stable++;
 }
 return {sessions:sessions.length,days:activeDays,partial,volume,validSets,improved,stable,reduced};
}
function render(snapshot,now){const m=scoutProgress(snapshot,now);const strength=m.improved+m.stable+m.reduced;const progression=strength?`Em ${strength} exercicio(s) com registros em dias diferentes: ${m.improved} com aumento de carga, ${m.stable} estavel(is) e ${m.reduced} com reducao. Compare tambem repeticoes, tecnica e esforco.`:'Ainda nao ha registros comparaveis suficientes para avaliar cargas.';return `<section class="panel" aria-label="Resumo Scout dos ultimos 28 dias"><div class="kicker" style="margin:0">SCOUT | ULTIMOS 28 DIAS</div><h3>Seu esforco conta</h3><p class="muted small">${m.sessions} treino(s) em ${m.days} dia(s) ativo(s). ${m.partial} treino(s) parcial(is) reconhecido(s).</p><p class="small">Volume registrado: <b>${Math.round(m.volume).toLocaleString('pt-BR')} kg x repeticoes</b>.</p><p class="muted small">${progression}</p><p class="muted small">Informacoes descritivas, sem julgamento ou indicacao automatica de carga.</p></section>`;}
window.forjaScoutProgress=render;window.forjaScoutMetrics=scoutProgress;
})();
