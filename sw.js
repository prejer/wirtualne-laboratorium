/* Service worker Wirtualnego Laboratorium — działa offline po pierwszym wejściu.
   • strona (HTML): najpierw sieć, przy braku sieci kopia z pamięci;
   • pliki z ?v=wersja (silnik, zadania): z pamięci — nowa wersja ma nowy adres, więc nie ma starych plików;
   • reszta (ikony, manifest): z pamięci, w tle odświeżana. */
const CACHE="lab-v0.17";
const CORE=["./","./index.html","./engine.js?v=0.17","./zadania/index.js?v=0.17","./zadania/of73-2-olowek.js?v=0.17","./zadania/of75-2-tarcie.js?v=0.17","./zadania/plac-zabaw.js?v=0.17","./zadania/plac-elektronika.js?v=0.17","./zadania/of65-2-kulka.js?v=0.17","./zadania/of59-2-brzeszczot.js?v=0.17","./zadania/of71-2-rc.js?v=0.17","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 if(r.mode==="navigate"){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return res}).catch(()=>caches.match("./index.html")));return}
 if(new URL(r.url).searchParams.has("v")){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));return}
 e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>m);return m||net}))});
