const CACHE_NAME="kadai-manager-v26";
const PUBLIC_PATHS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>name.startsWith("kadai-manager-")&&name!==CACHE_NAME).map(name=>caches.delete(name)));
 await self.clients.claim();
})());});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET"||request.headers.has("Authorization"))return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 const allowed=PUBLIC_PATHS.map(path=>new URL(path,self.registration.scope).pathname);
 if(!allowed.includes(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  try{
   const response=await fetch(request,{cache:"no-store"});
   if(response.ok&&response.type==="basic"&&!url.search)await cache.put(request,response.clone()).catch(()=>{});
   return response;
  }catch(error){
   // Only this build's cache may be used. Never fall back to another build.
   const saved=await cache.match(request);if(saved)return saved;
   return new Response("接続できません。通信状態を確認して再読み込みしてください。",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
  }
 })());
});
