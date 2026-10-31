// Compare deployed RC3 against the exact commit under QA, never origin/main.
// Cloudflare's Wrangler publication can use CRLF checkout bytes while Git stores LF.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const origin=process.env.FORJA_QA_ORIGIN||'https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev';
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const hash=b=>createHash('sha256').update(b).digest('hex');
const normalized=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
const paths=['/','/features.js','/sw.js','/videos/catalog.json'];
let failures=0,formatOnly=0;
for(const pathname of paths){
  const resource=pathname==='/'?'public/index.html':'public'+pathname;
  const expected=execFileSync('git',['show',commit+':'+resource],{maxBuffer:8e6});
  const response=await fetch(origin+pathname,{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(25000)});
  const actual=Buffer.from(await response.arrayBuffer());
  const exact=hash(expected)===hash(actual);
  const equivalent=exact||hash(normalized(expected))===hash(normalized(actual));
  if(!exact&&equivalent)formatOnly++;
  if(response.status!==200||!equivalent)failures++;
  console.log('LIVE_COMMIT_PARITY',JSON.stringify({commit:commit.slice(0,12),pathname,http:response.status,contentMatch:equivalent,byteExact:exact,lineEndingsOnly:!exact&&equivalent,sourceSha256:hash(expected),liveSha256:hash(actual)}));
}
assert.equal(failures,0,'RC3 deployed source differs beyond line endings: '+commit);
console.log('RC3_DEPLOYED_COMMIT_CONTENT_PARITY_PASS',JSON.stringify({resources:paths.length,lineEndingsOnly:formatOnly}));
