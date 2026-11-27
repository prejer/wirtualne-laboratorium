// ---------- aplikacja instalowana (PWA) ----------
// Na wejściu proponujemy instalację: osobne okno ma więcej zasobów niż karta/okienko z innej aplikacji,
// działa na pełnym ekranie i offline. Chrome/Edge/Android: systemowe okno instalacji; iPhone/iPad: instrukcja.
let installEvt=null;
const standalone=()=>matchMedia("(display-mode: standalone)").matches||matchMedia("(display-mode: window-controls-overlay)").matches||navigator.standalone===true;
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;showInstall()});
addEventListener("appinstalled",()=>{installEvt=null;hideInstall();try{localStorage.setItem("lab-installed","1")}catch(e){}});
function installDismissed(){try{return Date.now()-(+localStorage.getItem("lab-install-later")||0)<3*864e5}catch(e){return false}}
function hideInstall(){const b=document.getElementById("install");if(b)b.remove()}
function showInstall(){if(standalone()||installDismissed()||document.getElementById("install"))return;if(!installEvt&&!isIOS())return;
 const b=document.createElement("div");b.id="install";
 b.innerHTML=`<img src="icons/icon-192.png" alt=""><div class="it"><b>Zainstaluj laboratorium</b><span>${isIOS()&&!installEvt?"W Safari: <b>Udostępnij</b> → <b>Do ekranu początkowego</b>. ":""}Własne okno, pełny ekran, działa offline — płynniej i stabilniej niż w karcie przeglądarki.</span></div>
  <div class="ib">${installEvt?'<button class="btn p" id="instGo">Zainstaluj</button>':""}<button class="btn" id="instLater">Nie teraz</button></div>`;
 document.body.appendChild(b);
 if(installEvt)b.querySelector("#instGo").onclick=async()=>{const e=installEvt;installEvt=null;hideInstall();e.prompt();try{await e.userChoice}catch(_){}};
 b.querySelector("#instLater").onclick=()=>{try{localStorage.setItem("lab-install-later",String(Date.now()))}catch(e){}hideInstall()}}
setTimeout(showInstall,600); // iOS nie ma zdarzenia instalacji — pokazujemy instrukcję
