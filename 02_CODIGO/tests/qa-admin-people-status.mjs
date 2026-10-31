import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const file=new URL('../public/features.js',import.meta.url);
const src=readFileSync(file,'utf8');
const code=src.match(/function fxUserStatus\(status\)\{[\s\S]*?(?=\nfunction evolution\()/)?.[0];
assert(code,'fxLoadUsers not found');
const list=[
 {id:'qa-pending',username:'qa_pending',displayName:'Atleta Pendente',role:'member',status:'pending'},
 {id:'qa-active',username:'qa_active',displayName:'Atleta Ativo',role:'member',status:'active'},
 {id:'qa-blocked',username:'qa_blocked',displayName:'Atleta Bloqueado',role:'member',status:'blocked'},
 {id:'qa-admin',username:'qa_admin',displayName:'Admin QA',role:'admin',status:'active'},
];
const element={innerHTML:''};
const calls=[];const messages=[];
const context=vm.createContext({fx:{users:[]},tab:'nuvem',$:id=>id==='adminUsers'?element:null,
 esc:x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),
 api:async url=>{calls.push(url);return {users:list}},fxMessage:t=>messages.push(t)});
await vm.runInContext(code+'\nfxLoadUsers()',context);
assert.deepEqual(calls,['/api/admin/users']);
assert.equal(messages.length,0);
const row=id=>element.innerHTML.match(new RegExp('<div class="person-row"[^>]*data-user-status="[^"]+"[^>]*data-username="'+id+'"[\\s\\S]*?(?=<div class="person-row"|$)'))?.[0];
for(const u of list)assert(row(u.username),'missing row for '+u.username);
assert.match(row('qa_pending'),/APROVAR/);
assert.doesNotMatch(row('qa_active'),/APROVAR|ATIVAR/,'active user must not have approve control');
assert.match(row('qa_active'),/BLOQUEAR/);
assert.match(row('qa_blocked'),/REATIVAR/);
assert.doesNotMatch(row('qa_blocked'),/BLOQUEAR/);
assert.doesNotMatch(row('qa_admin'),/data-fx="approve"|data-fx="block"/);
console.log('ADMIN_PEOPLE_STATUS_ACTIONS_PASS');

const writes=[];
let confirmations=0;
context.cloud={user:{role:'admin'}};
context.confirm=()=>{confirmations++;return true};
context.api=async(path,method,payload)=>{
 if(method==='POST'){
  writes.push({...payload});
  const target=list.find(u=>u.id===payload.id);
  assert(target);
  target.status=payload.status;
  return {ok:true};
 }
 assert.equal(path,'/api/admin/users');
 return {users:list.map(u=>({...u}))};
};
await vm.runInContext("fxChangeUserStatus({dataset:{id:'qa-active',expectedStatus:'pending'}},'approve')",context);
assert.equal(writes.length,0,'stale approval must not send an update');
assert(messages.some(x=>x.includes('Lista atualizada')),'stale action should show feedback');
await vm.runInContext("fxChangeUserStatus({dataset:{id:'qa-pending',expectedStatus:'pending'}},'approve')",context);
assert.equal(writes.length,1);assert.equal(writes[0].status,'active');
assert.equal(list[0].status,'active');
await vm.runInContext("fxChangeUserStatus({dataset:{id:'qa-active',expectedStatus:'active'}},'block')",context);
assert.equal(writes.length,2);assert.equal(writes[1].status,'blocked');assert.equal(confirmations,1);
await vm.runInContext("fxChangeUserStatus({dataset:{id:'qa-blocked',expectedStatus:'blocked'}},'approve')",context);
assert.equal(writes.length,3);assert.equal(writes[2].status,'active');
await assert.rejects(vm.runInContext("fxChangeUserStatus({dataset:{id:'qa-admin',expectedStatus:'active'}},'block')",context),/protegida/);
assert.equal(writes.length,3,'admin must never be updated');
console.log('ADMIN_PEOPLE_STALE_AND_TRANSITIONS_PASS');
