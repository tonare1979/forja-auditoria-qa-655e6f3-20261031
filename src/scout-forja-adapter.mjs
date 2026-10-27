import {scoutAnalytics} from './scout-analytics.mjs';
// Read-only adapter for FORJA's actual snapshot shape. No network calls.
export function analyzeForjaSnapshot(snapshot,options){
 if(!snapshot||!Array.isArray(snapshot.sessions)||!Array.isArray(snapshot.weights)) throw TypeError('Invalid FORJA snapshot');
 const weightByDay=new Map(snapshot.weights.filter(w=>w&&typeof w.date==='string'&&Number(w.weight)>0).map(w=>[w.date,Number(w.weight)]));
 const rows=snapshot.sessions.filter(s=>s&&typeof s.date==='string').map(s=>({
  date:s.date,partial:s.status==='partial',
  exercises:(Array.isArray(s.exercises)?s.exercises:[]).map(e=>({id:String(e.id||e.name||'').trim(),sets:Array.isArray(e.sets)?e.sets:[]})),
  runs:[],weightKg:weightByDay.get(s.date)
 }));
 const result=scoutAnalytics(rows,options);
 const dates=[...weightByDay.keys()].filter(d=>d<=result.period.end&&d>=result.period.start).sort();
 result.latestWeightKg=dates.length?weightByDay.get(dates.at(-1)):null;
 result.runningDataStatus='not_mapped';
 return result;
}
