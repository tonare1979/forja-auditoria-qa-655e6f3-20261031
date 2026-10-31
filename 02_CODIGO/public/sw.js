// HOMOLOGAÇÃO — V11 CANDIDATA, cache exclusivo
const CACHE='forja73-static-v11-rc3-offline-navigation-no-redirect-20261031';
const FILES=['./features.js','./forja-post.js','./scout-progress.js','./forja-history-records.js','./forja-music-v1.js','./forja-cover-rio-casal-v2.png','./forja-brand-original.png','./forja-cover-rio-v10.webp','./manifest.webmanifest','./forja-icon-rc3-180.png','./forja-icon-rc3-192.png','./forja-icon-rc3-512.png'];
// A navigation fallback must be a direct HTML response, never a cached redirect.
const directHtml=r=>new Response(r.body,{status:200,headers:r.headers});
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(async c=>{
 await c.addAll(FILES);
 const r=await fetch('./index.html');
 if(!r.ok)throw Error('FORJA offline shell unavailable');
 await c.put('./index.html',directHtml(r));
}).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('forja73-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
if(req.mode==='navigate'){e.respondWith(fetch(req).then(res=>{if(res.ok){const clean=directHtml(res);e.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',clean.clone())));return clean}return res}).catch(async()=>{const cached=await caches.match('./index.html');return cached?directHtml(cached):Response.error()}));return}
if(/\/(?:features|forja-post)\.js$/.test(u.pathname)||/\/(?:catalog\.json|manifest\.webmanifest)$/.test(u.pathname)){
 e.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res.ok){const clone=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,clone)))}return res}).catch(()=>caches.match(req)));return;
}
e.respondWith(caches.match(req).then(c=>c||fetch(req)))});

