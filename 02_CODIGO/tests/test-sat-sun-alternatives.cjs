const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync(process.argv[2]||'public/index.html','utf8');
function extract(prefix,end){let i=s.indexOf(prefix);assert(i>=0,`source missing ${prefix}`);let j=s.indexOf(end,i+prefix.length);assert(j>=0,`end missing ${end}`);return s.slice(i,j)}
const wk=extract('const wk=', ';const WEEKEND_ACTIVITIES=')+';';
const alt=extract('const ALTERNATIVES=', '\nfunction changeAlternative')+'\n';
const fns=[extract('function changeAlternative(', '\nfunction musicPanel'),extract('function alternativesPicker(', '\nfunction load'),extract('function getEx(', 'function next()'),extract('function treino()', '\nfunction ')];
// Actual production functions, extracted verbatim. No reimplementation of alternativesPicker/changeAlternative/treino/getEx.
const context={structuredClone,Date,console,window:{},state:{exerciseChoices:{},drafts:{},extraExercises:{},sessions:[],weights:[]},sel:'A',tab:'treino'};
vm.createContext(context);
vm.runInContext(wk+alt+fns.join('\n')+ `
function esc(s){return String(s??'')};
function fmt(n){return String(n)};
function forjaAlternativeLabel(s){return s};
function initDraft(code){return state.drafts[code]??=( {entries:{}})};
function save(){return true};
function forjaDemoAction(){return ''};
function forjaEquipmentPhoto(){return ''};
function alternativesPickerStub(){return ''};
function restPanel(){return ''};
function musicPanel(){return ''};
function bonusPanel(){return ''};
function layout(s){lastMarkup=s};
function button(s){return s};
function next(){return 'A'};
function $(){return null};
function initDummy(){return null};
let lastMarkup='';
`,context);
let count=0;
function check(ok,label){assert(ok,label);count++;console.log('PASS',label)}
for(const code of ['SAT','SUN']){
  const before=JSON.stringify(context.state);
  const result=vm.runInContext(`alternativesPicker(${JSON.stringify(code)},0,wk[${JSON.stringify(code)}].ex[0][0])`,context);
  check(result==='',code+' picker absent');
  context.sel=code;
  const old=JSON.stringify(context.state);context.changeAlternative({dataset:{alternative:'0'},value:'another'});
  check(JSON.stringify(context.state)===old,code+' handler leaves state untouched');
}
for(const code of ['A','B','C','D']){
 const original=vm.runInContext(`wk[${JSON.stringify(code)}].ex[0][0]`,context);
 const available=vm.runInContext(`ALTERNATIVES[${JSON.stringify(original)}]`,context);
 assert(available?.length,`no alternative for ${code}`);
 const picker=vm.runInContext(`alternativesPicker(${JSON.stringify(code)},0,${JSON.stringify(original)})`,context);
 check(picker.includes('<select')&&picker.includes(available[0]),code+' picker visible and includes alternative');
 context.sel=code;context.state.drafts[code]={entries:{'0-0':{kg:20,reps:12,done:true}}};
 context.changeAlternative({dataset:{alternative:'0'},value:available[0]});
 check(context.state.exerciseChoices[code][0]===available[0],code+' selection retained');
 const selected=context.state.drafts[code].entries;
 selected['0-0']={kg:13,reps:10,done:true};
 context.changeAlternative({dataset:{alternative:'0'},value:original});
 check(context.state.drafts[code].entries['0-0'].kg===20,code+' original entries restored');
 context.changeAlternative({dataset:{alternative:'0'},value:available[0]});
 check(context.state.drafts[code].entries['0-0'].kg===13,code+' alternative entries restored');
}
// Actual treino() render invocation, not a mock, with dependent UI functions stubbed above.
for(const code of ['SAT','SUN','A','B','C','D']){
 context.sel=code;
 try{context.treino();}catch(e){throw new Error('render '+code+': '+e.message)}
 const html=vm.runInContext("lastMarkup",context);
 check(!html.includes('ALTERNATIVA AO EXERCÍCIO')===['SAT','SUN'].includes(code),code+' rendered UI selector state');
}
console.log('RESULT',count+'/'+count+' PASS');
