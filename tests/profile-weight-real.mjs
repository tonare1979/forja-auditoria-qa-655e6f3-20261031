import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(process.argv[2]||'public/index.html','utf8');
const start=source.indexOf('function progresso(){');
const end=source.indexOf('\nfunction nutricao(){',start);
assert(start>=0&&end>start,'Real progresso() not found');
const helperStart=source.indexOf('function forjaWeightSummary(');
const helper=helperStart<0?'':source.slice(helperStart,start);
let checks=0;
for(const [label,profile,weights,initial,current,target,delta] of [
 ['A',{initialWeight:62,targetWeight:74},[{date:'2026-10-01',weight:65}],62,65,74,'+3'],
 ['B',{initialWeight:81,targetWeight:77},[{date:'2026-10-01',weight:79}],81,79,77,'-2'],
 ['A sem registros',{initialWeight:62,targetWeight:74},[],62,null,74,null],
 ['B sem registros',{initialWeight:81,targetWeight:77},[],81,null,77,null],
 ['legado com pesos',{},[{date:'2026-09-01',weight:76},{date:'2026-10-01',weight:73}],76,73,null,'-3'],
 ['legado vazio',{},[],null,null,null,null]
]){
 const storage=JSON.stringify({profile,weights,sessions:[]});
 for(let reload=0;reload<2;reload++){
  const state=JSON.parse(storage);let html='';
  const ctx={state,window:{},layout(x){html=x},fmt:v=>String(v).replace('.',','),dateBR:x=>x,button:()=>'',esc:String};vm.createContext(ctx);
  vm.runInContext(helper+source.slice(start,end),ctx);vm.runInContext('progresso()',ctx);
  assert(html.includes('INICIAL</div><div class="stat">'+(initial===null?'Não informado':initial+' kg')),label+' initial incorrect');checks++;
  assert(html.includes('ATUAL</div><div class="stat">'+(current===null?'Sem registro':current+' kg')),label+' current incorrect');checks++;
  assert(html.includes('META</div><div class="stat">'+(target===null?'Não informada':target+' kg')),label+' target incorrect');checks++;
  if(delta!==null){assert(html.includes('Variação desde o início: <b>'+delta+' kg'),label+' variation incorrect');checks++}
 }
}
console.log('PROFILE_REAL_PROGRESS_PASS checks='+checks+' reloads=2 profiles=2 legacy=2');
