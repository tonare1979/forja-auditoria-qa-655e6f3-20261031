// HOMOLOGAÇÃO — V11 CANDIDATA, cache exclusivo
const CACHE='forja73-static-v11-integrada-rc3';
const FILES=['./','./features.js','./forja-post.js','./forja-cover-rio-casal-v2.png','./forja-brand-original.png','./forja-cover-rio-v10.webp','./index.html','./manifest.webmanifest','./forja-icon-180-v942.png','./forja-icon-192-v942.png','./forja-icon-512-v942.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('forja73-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
if(req.mode==='navigate'){e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)))}return res}).catch(async()=>await caches.match('./index.html')||Response.error()));return}
e.respondWith(caches.match(req).then(c=>c||fetch(req)))});
