import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('public/index.html','utf8');
const cut=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a);assert(a>=0&&b>a,'missing '+start);return html.slice(a,b)};
const statusSource=cut('function cloudStatus(){','async function api(');
const syncSource=cut('async function cloudSync(){',"window.addEventListener('online'");
async function trial({remote,fetchError,initialRevision=34,remoteRevision=initialRevision,baseline}={}){
 const local={sessions:[{id:'one',date:'2026-10-15'}],weights:[{date:'2026-10-15',weight:63}],journal:[]};
 const cloud={user:{username:'qa'},revision:initialRevision,linked:true,dirty:false,conflict:false,working:false,message:'Nuvem atualizada.',lastSync:'2026-10-25T10:00:24.000Z',available:true,verified:false};
 let calls=0;
 const ctx={cloud,state:structuredClone(local),navigator:{onLine:true},tab:'nuvem',
  cmSave(){return true},nuvem(){},flushReviewOutbox:async()=>{},cloudSchedule(){},validForjaData:()=>true,
  cloudCompareLocal:()=>true,cloudBaselineRead:()=>baseline===undefined?structuredClone(local):baseline,emptyState:()=>({sessions:[],weights:[],journal:[]}),cloudLocalReplace(data,revision){ctx.state=structuredClone(data);cloud.revision=revision;cloud.verified=true;cloud.lastSync=new Date().toISOString()},console,
  api:async()=>{calls++;if(fetchError)throw Error('rede indisponível');return {revision:remoteRevision,data:remote===undefined?structuredClone(local):remote}},
  setTimeout,clearTimeout};
 vm.createContext(ctx);vm.runInContext(statusSource+syncSource,ctx);
 const before=ctx.cloudStatus();
 await ctx.cloudSync();
 return {before,after:ctx.cloudStatus(),lastSync:cloud.lastSync,verified:cloud.verified,conflict:cloud.conflict,message:cloud.message,state:ctx.state,calls};
}
const healthy=await trial();
assert(!healthy.before.includes('🟢'),'cannot be green before fresh remote verification');
assert(healthy.after.includes('🟢'),'same revision verified remotely must be green');
assert.notEqual(healthy.lastSync,'2026-10-25T10:00:24.000Z','must refresh check time');
console.log('FRESH_VERIFIED_TIMESTAMP_PASS');
const divergence=await trial({remote:{sessions:[{id:'changed'}],weights:[{date:'2026-10-15',weight:63}],journal:[]}});
assert(divergence.conflict,'same revision different data cannot be silently accepted');
assert(!divergence.after.includes('🟢'),'divergence must not be green');
assert.equal(divergence.state.sessions[0].id,'one','local workout must be preserved');
console.log('REVISION_EQUAL_DIVERGENCE_BLOCK_PASS');
const offline=await trial({fetchError:true});
assert(!offline.after.includes('🟢'),'API failure cannot be green');
console.log('NETWORK_FAILURE_NOT_GREEN_PASS');
const ahead=await trial({remoteRevision:35,baseline:null});
assert(ahead.conflict&&ahead.state.sessions[0].id==='one'&&!ahead.after.includes('🟢'));
console.log('UNVERIFIED_REMOTE_AHEAD_PRESERVES_LOCAL_PASS');
const rollback=await trial({remoteRevision:33});
assert(rollback.conflict&&rollback.state.sessions[0].id==='one'&&!rollback.after.includes('🟢'));
console.log('REMOTE_REVISION_ROLLBACK_BLOCK_PASS');
