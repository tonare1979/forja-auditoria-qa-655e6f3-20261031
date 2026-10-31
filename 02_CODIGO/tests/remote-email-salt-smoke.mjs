import assert from 'node:assert/strict';
const origin='https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev';
for(const identity of ['qa-synthetic-no-account@example.invalid','qa_synthetic_no_account']){
 const r=await fetch(origin+'/api/auth/salt?username='+encodeURIComponent(identity),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(12000)});
 let j={};try{j=await r.json()}catch{}
 console.log('REMOTE_SALT_STATUS',JSON.stringify({identityType:identity.includes('@')?'email':'username',http:r.status,error:j.error||null,saltFormat:typeof j.salt==='string'&&/^[0-9a-f]{32}$/.test(j.salt)}));
}
const me=await fetch(origin+'/api/auth/me',{signal:AbortSignal.timeout(12000)});
assert.equal(me.status,401,'anonymous account access must be denied');
console.log('REMOTE_ANONYMOUS_ACCESS_REJECTED_PASS');
