import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const m=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));const sw=fs.readFileSync('public/sw.js','utf8');const html=fs.readFileSync('public/index.html','utf8');
const ck=(name,ok)=>{assert(ok,name);console.log(name+'_PASS')};
ck('PWA_STANDALONE_SCOPE',m.display==='standalone'&&m.scope==='./'&&m.start_url==='./');
ck('PWA_APPLE_STANDALONE_META',html.includes('apple-mobile-web-app-capable')&&html.includes('apple-touch-icon'));
ck('PWA_MANIFEST_ICON_FILES_EXIST',m.icons.every(i=>fs.existsSync('public/'+i.src.replace('./',''))));
for(const x of m.icons){const b=fs.readFileSync('public/'+x.src.replace('./',''));ck('PWA_ICON_'+x.sizes.replace('x','_')+'_PNG',b.subarray(1,4).toString()==='PNG'&&b.readUInt32BE(16)===Number(x.sizes.split('x')[0])&&b.readUInt32BE(20)===Number(x.sizes.split('x')[1]));}
const mApple=html.match(/rel="apple-touch-icon" href="\.\/(.+?)"/);ck('PWA_APPLE_ICON_EXISTS',!!mApple&&fs.existsSync('public/'+mApple[1]));
ck('PWA_SERVICE_WORKER_REGISTERED',html.includes("navigator.serviceWorker.register('./sw.js')"));
ck('PWA_OFFLINE_CACHE_RC3_ICONS',m.icons.every(i=>sw.includes("'"+i.src+"'"))&&sw.includes("'./"+mApple?.[1]+"'"));
ck('PWA_SW_FETCH_AUTH_NOT_CACHED',sw.includes("u.pathname.startsWith('/api/')"));
console.log('PWA_ASSETS_CONTRACT_PASS');
