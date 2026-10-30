/* FORJA Scout: painel somente leitura. Nenhum envio de dados. */
(function(){'use strict';
const FORJA_COMPAT_ALIASES={"Eleva├º├úo lateral com halteres":"Elevação lateral com halteres","Crucifixo inverso m├íquina":"Crucifixo inverso máquina","Tr├¡ceps corda":"Tríceps corda","Panturrilha em p├®":"Panturrilha em pé","Tr├¡ceps franc├¬s leve":"Tríceps francês leve"};const forjaCompatName=n=>Object.hasOwn(FORJA_COMPAT_ALIASES,n)?FORJA_COMPAT_ALIASES[n]:n;
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
  const id=typeof e.id==='string'?e.id:typeof e.name==='string'?forjaCompatName(e.name):'';
  let best=null;
  for(const v of (Array.isArray(e.sets)?e.sets:[])){
   if(v.kg===null||v.kg===undefined||v.kg===''||v.reps===null||v.reps===undefined||v.reps==='')continue;
   const kg=Number(v.kg),reps=Number(v.reps);
   if(!Number.isFinite(kg)||!Number.isFinite(reps)||kg<0||reps<=0)continue;
   volume+=kg*reps;validSets++;
   best=best===null?kg:Math.max(best,kg);
  }
  if(id&&best!==null){
   if(!byExercise.has(id))byExercise.set(id,new Map());
   const days=byExercise.get(id);
   days.set(s.date,Math.max(days.get(s.date)??best,best));
  }
 }
 let improved=0,stable=0,reduced=0;
 for(const days of byExercise.values()){
  const records=[...days].map(([date,kg])=>({date,kg}));
  records.sort((a,b)=>a.date.localeCompare(b.date));
  if(new Set(records.map(r=>r.date)).size<2)continue;
  const first=records[0].kg,last=records.at(-1).kg;
  if(last>first)improved++;else if(last<first)reduced++;else stable++;
 }
 return {sessions:sessions.length,days:activeDays,partial,volume,validSets,improved,stable,reduced};
}
// Session evidence is separate from the legacy 28-day maximum-load counters.
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validSessionSets(exercise){return (Array.isArray(exercise?.sets)?exercise.sets:[]).filter(v=>v&&['number','string'].includes(typeof v.kg)&&['number','string'].includes(typeof v.reps)&&String(v.kg).trim()!==''&&String(v.reps).trim()!==''&&Number.isFinite(Number(v.kg))&&Number.isFinite(Number(v.reps))&&Number(v.kg)>=0&&Number(v.reps)>0).map(v=>({kg:Number(v.kg),reps:Number(v.reps),note:typeof v.note==='string'?v.note:''}));}
function exerciseKey(exercise){const name=typeof exercise?.name==='string'?forjaCompatName(exercise.name).trim():'';return name?'name:'+name:typeof exercise?.id==='string'&&exercise.id.trim()?'id:'+exercise.id.trim():'';}
function orderedSessions(snapshot,now=new Date()){
 const end=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
 return (Array.isArray(snapshot?.sessions)?snapshot.sessions:[]).map((session,index)=>({session,index})).filter(({session:s})=>s&&Number.isFinite(parseDay(s.date))&&parseDay(s.date)<=end).sort((a,b)=>a.session.date.localeCompare(b.session.date)||String(a.session.finished||'').localeCompare(String(b.session.finished||''))||a.index-b.index);
}
function sessionFeedback(snapshot,now=new Date()){
 const ordered=orderedSessions(snapshot,now);
 if(!ordered.length)return null;
 const current=ordered.at(-1).session,history=ordered.slice(0,-1).map(row=>row.session);
 const exercises=[];
 for(const e of (Array.isArray(current.exercises)?current.exercises:[])){
  const sets=validSessionSets(e);if(!sets.length)continue;
  const key=exerciseKey(e);let previous=null,previousSets=[],previousDate=null;
  let ambiguous=!!key&&(Array.isArray(current.exercises)?current.exercises:[]).filter(x=>exerciseKey(x)===key).length>1;
  if(key&&!ambiguous)for(let i=history.length-1;i>=0&&!previous&&!ambiguous;i--){const candidates=(Array.isArray(history[i].exercises)?history[i].exercises:[]).filter(x=>exerciseKey(x)===key&&validSessionSets(x).length);if(candidates.length>1){ambiguous=true;}else if(candidates.length===1){previous=candidates[0];previousSets=validSessionSets(previous);previousDate=history[i].date;}}
  let trend='reference',interpretation='Primeiro registro comparável: referência para os próximos treinos.';
  if(ambiguous){trend='ambiguous';interpretation='Há registros repetidos deste exercício na sessão atual ou anterior; evidência preservada, sem comparação de tendência.';}
  else if(previous){
   if(sets.length!==previousSets.length){trend='different_sets';interpretation='Quantidade de séries diferente; compare o contexto antes de concluir evolução.';}
   else{
    const loadUp=sets.some((v,i)=>v.kg>previousSets[i].kg),loadDown=sets.some((v,i)=>v.kg<previousSets[i].kg),repsUp=sets.some((v,i)=>v.reps>previousSets[i].reps),repsDown=sets.some((v,i)=>v.reps<previousSets[i].reps);
    if(!loadUp&&!loadDown&&!repsUp&&!repsDown){trend='same';interpretation='Mesma carga e repetições nas séries registradas.';}
    else if(!loadDown&&!repsDown){trend=loadUp?'more_load':'more_reps';interpretation=loadUp?'Mais carga sem menos repetições nas séries registradas.':'Mais repetições com a carga mantida nas séries registradas.';}
    else if(!loadUp&&!repsUp){trend='lower';interpretation='Carga ou repetições menores neste registro; isso não define regressão global.';}
    else{trend='mixed';interpretation=!repsUp&&!repsDown?'Cargas variaram entre séries, com repetições mantidas; sem concluir evolução.':!loadUp&&!loadDown?'Repetições variaram entre séries, com cargas mantidas; sem concluir evolução.':loadUp&&repsDown?'Há séries com mais carga e séries com menos repetições: troca de padrão, sem concluir evolução.':'Cargas e repetições mudaram nas séries registradas; sem concluir evolução.';}
   }
  }
  const describe=list=>list.map((v,i)=>`série ${i+1}: ${v.kg} kg × ${v.reps}`).join('; ');
  exercises.push({name:typeof e?.name==='string'?forjaCompatName(e.name):typeof e?.id==='string'?e.id:'Exercício sem nome',trend,previousDate,sets,previousSets,evidence:previous?`${previousDate} — ${describe(previousSets)} → ${current.date} — ${describe(sets)}`:`${current.date} — ${describe(sets)}`,interpretation});
 }
 const distance=Number(current.distance),minutes=Number(current.minutes);
 const run=current.code==='CR'&&Number.isFinite(distance)&&distance>0&&Number.isFinite(minutes)&&minutes>0?{distance,minutes}:null;
 return {date:current.date,partial:current.status==='partial',validSets:exercises.reduce((n,e)=>n+e.sets.length,0),exercises,run};
}
function renderSessionFeedback(snapshot,now,label='SESSÃO MAIS RECENTE'){
 const f=sessionFeedback(snapshot,now);if(!f)return '';
 const observed=f.exercises.some(e=>e.sets.some(v=>v.note.trim()));
 const focus=observed?'Suas observações ajudam a entender este treino. No próximo, vale observar a execução e como você se sente.':f.exercises.some(e=>['mixed','lower','different_sets','ambiguous'].includes(e.trend))?'Seu registro ajuda a acompanhar o caminho. No próximo treino, vale observar técnica, esforço e contexto das séries que mudaram.':'Cada registro constrói sua referência. Se for útil, acrescente como foi a técnica e o esforço no próximo treino.';
 return `<section class="panel" aria-label="Scout do treino"><div class="kicker">SCOUT | ${escapeHtml(label)}</div><h3>Resumo do treino</h3><p class="small">${f.date}: ${f.partial?'treino parcial reconhecido. Cada série registrada conta.':'treino registrado.'} ${f.validSets} ${f.validSets===1?'série registrada':'séries registradas'} com carga e repetições.${f.run?` Corrida registrada: ${f.run.distance} km em ${f.run.minutes} min.`:''}</p><h3>Comparações concretas</h3>${f.exercises.length?`<ul>${f.exercises.map(e=>`<li><b>${escapeHtml(e.name)}</b><p class="small">${escapeHtml(e.evidence)}</p><p class="small">${escapeHtml(e.interpretation)}</p>${e.sets.filter(v=>v.note.trim()).map(v=>`<p class="small muted">Observação registrada: ${escapeHtml(v.note)}</p>`).join('')}</li>`).join('')}</ul>`:'<p class="small muted">Sem séries de força válidas para comparar nesta sessão. Isso não apaga o treino registrado.</p>'}<h3>Foco no próximo treino</h3><p class="small">${focus}</p><details class="scout-method"><summary>Como esta análise funciona</summary><p class="muted small">Comparação descritiva das séries na ordem registrada, apenas do mesmo exercício. Técnica, esforço, amplitude e recuperação não são inferidos dos números. Observações são relatos seus, sem diagnóstico nem indicação automática de carga. Carga máxima isolada não mede evolução global.</p></details></section>`;
}
function workoutProgress(snapshot,sessionId,now=new Date()){
 const sessions=Array.isArray(snapshot?.sessions)?snapshot.sessions:[];
 const matches=typeof sessionId==='string'&&sessionId.trim()?sessions.filter(s=>s&&s.id===sessionId):[];
 const unavailable='<p class="small muted">Treino sem identificação única disponível: sem comparação. Seus registros permanecem preservados.</p>';
 if(matches.length!==1)return unavailable;
 const ordered=orderedSessions(snapshot,now),index=ordered.findIndex(row=>row.session===matches[0]);
 if(index<0)return '<p class="small muted">Data do treino indisponível para análise: sem comparação. Seus registros permanecem preservados.</p>';
 return renderSessionFeedback({sessions:ordered.slice(0,index+1).map(row=>row.session)},now,'ESTE TREINO');
}
// Longitudinal counters are descriptive, never diagnoses or load recommendations.
function scoutPeriodSummary(snapshot,now=new Date(),days=30){
 if(![30,45,60].includes(days))throw RangeError('Período permitido: 30, 45 ou 60 dias');
 const end=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()),start=end-(days-1)*dayMs;
 const sessions=orderedSessions(snapshot,now).map(r=>r.session).filter(s=>parseDay(s.date)>=start);
 const byDay=new Set(sessions.map(s=>s.date));
 const weekends=sessions.filter(s=>{const d=new Date(parseDay(s.date)).getUTCDay();return d===0||d===6;}).length;
 const distribution={};for(const s of sessions){const code=typeof s.code==='string'&&s.code.trim()?s.code.trim():'não informado';distribution[code]=(distribution[code]||0)+1;}
 // Do not combine different athletes or infer from pictures. Caller must supply a single user's snapshot.
 const weights=(Array.isArray(snapshot?.weights)?snapshot.weights:[]).filter(w=>w&&parseDay(w.date)>=start&&parseDay(w.date)<=end&&typeof w.weight!=='boolean'&&w.weight!==''&&Number.isFinite(Number(w.weight))&&Number(w.weight)>0).sort((a,b)=>a.date.localeCompare(b.date)).map(w=>({date:w.date,kg:Number(w.weight)}));
 return {days,sessions:sessions.length,activeDays:byDay.size,partial:sessions.filter(s=>s.status==='partial').length,weekends,distribution,weights};
}
function renderPeriod(snapshot,now,days){
 const m=scoutPeriodSummary(snapshot,now,days),weight=m.weights.length?` Peso registrado em ${escapeHtml(m.weights.at(-1).date)}: ${m.weights.at(-1).kg} kg (medida informada, sem inferência de composição corporal).`:'';
 const dist=Object.entries(m.distribution).map(([code,n])=>`${escapeHtml(code)}: ${n}`).join('; ');
 const routine=m.sessions&&m.weekends>m.sessions/2?'A maioria dos registros desse período ocorreu nos fins de semana; isso descreve o calendário, não a causa.':'';
 return `<p class="small">${m.sessions} treino(s), ${m.activeDays} dia(s) registrado(s), ${m.partial} treino(s) parcial(is). Distribuição: ${dist||'sem sessões'}. ${routine}${weight}</p>`;
}
function render(snapshot,now=new Date()){
 const f=sessionFeedback(snapshot,now),summary=f?`Registro mais recente: ${f.date}; ${f.validSets} série(s) válida(s) e ${f.exercises.length} exercício(s) de força com dados.${f.partial?' Treino parcial reconhecido.':''}`:'Ainda não há treinos para resumir.';
 return `<section class="panel" aria-label="Resumo Scout"><div class="kicker">SCOUT | EVOLUÇÃO</div><h3>O que foi registrado</h3><p class="small">${summary}</p><details class="scout-method"><summary>Histórico e rotina: 30, 45 e 60 dias</summary><h4>Últimos 30 dias</h4>${renderPeriod(snapshot,now,30)}<h4>Últimos 45 dias</h4>${renderPeriod(snapshot,now,45)}<h4>Últimos 60 dias</h4>${renderPeriod(snapshot,now,60)}<p class="small muted">Dados ausentes não comprovam inatividade. Datas e medidas referem-se apenas aos registros fornecidos.</p></details></section>`+renderSessionFeedback(snapshot,now);
}
window.forjaScoutWorkoutProgress=workoutProgress;window.forjaScoutSessionFeedback=sessionFeedback;window.forjaScoutProgress=render;window.forjaScoutMetrics=scoutProgress;window.forjaScoutPeriodSummary=scoutPeriodSummary;
})();

