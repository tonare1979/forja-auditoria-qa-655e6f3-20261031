// FORJA Scout Analytics V1: local, deterministic, no external services.
const valid = x => Number.isFinite(Number(x)) && Number(x) >= 0;
const average = a => a.length ? a.reduce((s,n)=>s+n,0)/a.length : null;
export function scoutAnalytics(records, {today='2026-10-27', windowDays=28}={}) {
  if (!Array.isArray(records)) throw TypeError('records must be an array');
  const end = Date.parse(today+'T00:00:00Z');
  if (!Number.isFinite(end)||!Number.isInteger(windowDays)||windowDays<1) throw RangeError('invalid window');
  const start=end-(windowDays-1)*86400000;
  const sessions=records.filter(r=>r && /^\d{4}-\d\d-\d\d$/.test(r.date||'') && Date.parse(r.date+'T00:00:00Z')>=start && Date.parse(r.date+'T00:00:00Z')<=end);
  const days=new Set(sessions.map(r=>r.date));
  const partial=sessions.filter(s=>s.partial===true).length;
  const exercises=sessions.flatMap(s=>Array.isArray(s.exercises)?s.exercises:[]);
  let volume=0, volumeSets=0;
  for(const e of exercises) for(const set of (Array.isArray(e.sets)?e.sets:[])) {
    if(valid(set.kg)&&valid(set.reps)&&Number(set.reps)>0){volume+=Number(set.kg)*Number(set.reps);volumeSets++;}
  }
  const byExercise=new Map();
  for(const s of sessions) for(const e of (Array.isArray(s.exercises)?s.exercises:[])) {
    if(!e.id) continue;
    const best=(Array.isArray(e.sets)?e.sets:[]).filter(z=>valid(z.kg)&&valid(z.reps)&&Number(z.reps)>0).reduce((m,z)=>Math.max(m,Number(z.kg)),-1);
    if(best>=0) byExercise.set(e.id,[...(byExercise.get(e.id)||[]),{date:s.date,kg:best}]);
  }
  const progression=[];
  for(const [id,list] of byExercise){list.sort((a,b)=>a.date.localeCompare(b.date));if(list.length>=2){const deltaKg=list.at(-1).kg-list[0].kg;progression.push({id,firstKg:list[0].kg,lastKg:list.at(-1).kg,deltaKg,trend:deltaKg>0?'evolucao':deltaKg<0?'reducao':'estavel'});}}
  const runs=sessions.flatMap(s=>(Array.isArray(s.runs)?s.runs:[])).filter(r=>valid(r.km)&&Number(r.km)>0);
  const weights=sessions.map(s=>Number(s.weightKg)).filter(x=>Number.isFinite(x)&&x>0);
  return {period:{start:new Date(start).toISOString().slice(0,10),end:today},sessions:sessions.length,activeDays:days.size,partialSessions:partial,effortRecognized:sessions.length>0,volumeKgReps:volume,validStrengthSets:volumeSets,exerciseProgression:progression,runCount:runs.length,averageRunKm:average(runs.map(r=>Number(r.km))),latestWeightKg:weights.at(-1)??null,interpretation:sessions.length===0?'sem_dados':'dados_insuficientes_para_conclusoes_clinicas'};
}
