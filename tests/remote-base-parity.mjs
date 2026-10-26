import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const origin='https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev';
const hash=b=>createHash('sha256').update(b).digest('hex');
const paths=['/','/features.js','/sw.js','/videos/catalog.json'];
for(const pathname of paths){
  const resource=pathname==='/'?'public/index.html':'public'+pathname;
  const base=execFileSync('git',['show','origin/main:'+resource],{maxBuffer:5e6});
  const response=await fetch(origin+pathname,{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(25000)});
  const live=Buffer.from(await response.arrayBuffer());
  const eq=hash(live)===hash(base);
  console.log('LIVE_BASE_PARITY',JSON.stringify({pathname,http:response.status,match:eq,baseSha256:hash(base),liveSha256:hash(live)}));
  if(!eq)process.exitCode=2;
}
