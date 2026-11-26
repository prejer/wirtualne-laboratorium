// ---------- LabShell: wspólna rama każdego doświadczenia ----------
// Buduje cały interfejs wokół sceny: górny pasek (Zadania, kamery, Lupa, Pomiar/Nauka, tempo, nowy zestaw, pomoc, Zadanie),
// dolny dock (lewa sekcja: przedmioty do chwytania, prawa: akcje jednorazowe), panel Nauki, komunikaty, ekran startowy.
// Zadanie przekazuje wyłącznie konfigurację — patrz LAB.defineTask i src/ZADANIA.md.
const VERSION="0.7";
const ICONS={
 tape:'<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v8M14 11.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.6 0-4-1.3-5.3-3.4L3.5 14a1.5 1.5 0 0 1 2.6-1.5L8 15"/>',
 lift:'<path d="M12 3v14M8 7l4-4 4 4"/><path d="M6 21h12"/><circle cx="12" cy="18.5" r="1.6"/>',
 stop:'<circle cx="12" cy="12" r="9"/><path d="M9 9h6v6H9z"/>',
 wipe:'<path d="M4 18c3-1 5-4 7-8l5 3c-2 4-5 6-8 7z"/><path d="M11 10l2-5 5 3-2 5"/><path d="M3 21h18"/>',
 slide:'<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/><rect x="8" y="10" width="8" height="4" rx="2"/>',
 slow:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',
 pencil:'<path d="M15 4l5 5L9 20H4v-5z"/><path d="M13 6l5 5"/>',
 mark:'<path d="M5 5l14 14M19 5L5 19"/>',
 pin:'<path d="M12 21V11"/><path d="M8 11h8l-1.5-6h-5z"/><path d="M9 21h6"/>',
 release:'<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 20h14"/>',
 paper:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/>',
 ruler:'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
 grab:'<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v6M14 10.5V7a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-2.6 0-4-1.3-5.3-3.4L4 15a1.5 1.5 0 0 1 2.6-1.5L8 15"/><path d="M2 5l2-2M22 5l-2-2"/>',
 thread:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h10"/><path d="M17 6c3 0 4 2 4 4"/>'};

ICONS.dice='<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="16" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="12" cy="12" r="1.2"/>';
function shellDOM(){const st=$("stage");st.insertAdjacentHTML("beforeend",`
 <div class="top"><button class="pill zad" id="bZad">☰ Zadania</button><span id="views"></span><button class="pill on" id="bPip" title="Lupa: powiększony podgląd miejsca pomiaru">Lupa</button><span class="sp"></span>
  <span id="modes" class="seg" title="Pomiar: jak w laboratorium · Nauka: siły, kąty i odległości na żywo"><button class="pill on" data-m="pomiar">Pomiar</button><button class="pill" data-m="nauka">Nauka</button></span>
  <button class="pill" id="bSpeed" title="Zwolnione tempo (ułatwienie symulacji)">×1</button>
  <button class="pill ico" id="bNew" title="Nowy zestaw pomiarowy — losuje ukryte parametry">${'<svg viewBox="0 0 24 24">'+ICONS.dice+'</svg>'}</button>
  <button class="pill" id="bHelp" title="Sterowanie">?</button><button class="pill" id="bTask">Zadanie</button></div>
 <div id="help"><b>Poruszanie się</b><table>
  <tr><td>obrót</td><td>przeciągnij · dwa palce na touchpadzie · strzałki</td></tr>
  <tr><td>przybliżanie</td><td>szczypanie · kółko myszy · dwuklik (do kursora)</td></tr>
  <tr><td>przesuwanie</td><td>Shift + przeciągnij · Shift + dwa palce · prawy przycisk</td></tr>
  <tr><td>latanie</td><td><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> · <kbd>E</kbd>/<kbd>Spacja</kbd> w górę · <kbd>Q</kbd> w dół · <kbd>Shift</kbd> szybciej</td></tr>
  <tr><td>przedmioty</td><td>złap i przeciągnij · ✋ na pasku pokazuje przedmiot · <kbd>Esc</kbd> odznacza</td></tr></table><button class="btn" id="helpX">OK</button></div>
 <aside id="learn" aria-hidden="true"></aside>
 <div id="dock"><div class="dsec" id="dockMove"></div><div class="dsplit"></div><div class="dsec" id="dockAct"></div></div>
 <div id="hint"></div><div id="status"></div><div id="ver">v${VERSION} · Wirtualne Laboratorium</div>`)}

// ---------- komunikaty ----------
let hintEl=null,hintT=0;function showHint(t,ms){hintEl.textContent=t;hintEl.style.opacity=1;clearTimeout(hintT);hintT=setTimeout(hideHint,ms||8000)}function hideHint(){if(hintEl)hintEl.style.opacity=0}
let flashT=0,flashMsg="";function flash(m){flashMsg=m;flashT=performance.now()}
let lastStatus=null;function status(){let s=T.status?T.status():"";if(flashMsg&&performance.now()-flashT<3500)s+=(s?" · ":"")+"<b style='color:#1e5aa8'>"+esc(flashMsg)+"</b>";if(s===lastStatus)return;lastStatus=s;const el=$("status");el.innerHTML=s;el.style.display=s?"":"none"}

// ---------- dock: przedmioty (lewa sekcja) | akcje (prawa sekcja) ----------
const dockSync=[];
function toolBtn(icon,label,tip){const b=document.createElement("button");b.className="tool";b.title=tip||"";b.innerHTML=`<svg viewBox="0 0 24 24">${ICONS[icon]||ICONS.hand}</svg><span></span>`;b.lastChild.textContent=label;return b}
function buildDock(){const mv=$("dockMove"),ac=$("dockAct");mv.innerHTML="";ac.innerHTML="";
 for(const m of T.movables){const b=toolBtn("grab",m.label,`${m.label}: złap w scenie i przeciągnij (kliknij, żeby pokazać)`);b.classList.add("mv");b.onclick=()=>setMoveTool(m.id);mv.appendChild(b);dockSync.push(()=>b.classList.toggle("active",moveTool===m.id))}
 for(const a of T.actions){const lab=()=>typeof a.label==="function"?a.label():a.label;const b=toolBtn(a.icon,lab(),a.tip);
  b.onclick=()=>{a.run();b.classList.remove("pulse");void b.offsetWidth;b.classList.add("pulse")};ac.appendChild(b);
  if(typeof a.label==="function")dockSync.push(()=>{const t=lab();if(b.lastChild.textContent!==t)b.lastChild.textContent=t})}
 mv.style.display=T.movables.length?"":"none";$("dock").querySelector(".dsplit").style.display=T.movables.length&&T.actions.length?"":"none";
 requestAnimationFrame(()=>{$("status").style.bottom=($("dock").offsetHeight+24)+"px"})}
function syncUI(){dockSync.forEach(f=>f())}

// ---------- tryby: Pomiar / Nauka ----------
let mode="pomiar";
function setMode(m){mode=m;document.querySelectorAll("#modes button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));const L=$("learn");L.classList.toggle("on",m==="nauka"&&!!T.learn);L.setAttribute("aria-hidden",m!=="nauka")}
let learnHTML="";function renderLearn(rows){const h=rows?rows.map(r=>`<div class="lr"><span${r[2]?` style="color:${r[2]}"`:""}>${r[0]}</span><b>${r[1]}</b></div>`).join(""):"";if(h!==learnHTML){learnHTML=h;$("learn").innerHTML=h?`<div class="lh">Nauka · wielkości w układzie</div>${h}`:""}}

// ---------- tempo symulacji ----------
const SPEEDS=[1,0.25];let speed=1;

// ---------- parametry ukryte: losowane z numeru zestawu, z możliwością lokalnego przelosowania ----------
let P={},PSPEC={},prng=Math.random;
function rollParams(spec,r){const o={};for(const k in spec){const s=spec[k];o[k]=s.min+(s.max-s.min)*r()}return o}
const params={get:()=>P,
 reroll(names){for(const k of names){const s=PSPEC[k];if(s)P[k]=s.min+(s.max-s.min)*prng()}},              // nowe losowanie w pełnym zakresie
 jitter(names,rel){for(const k of names){const s=PSPEC[k];if(!s)continue;P[k]=Math.max(s.min,Math.min(s.max,P[k]*(1+rel*(2*prng()-1))))}}}; // niewielka zmiana

// ---------- definicja zadania (jedyny punkt wejścia dla kolejnych symulacji) ----------
function defineTask(cfg){
 const movables=cfg.movables||[];
 const tb=cfg.scene.table||null;
 T={...cfg,draw:cfg.scene.draw,table:tb,light:cfg.scene.light,pip:cfg.lupa||null,
  shadowArea:cfg.scene.shadowArea||(tb?[V(tb.x0,tb.y0,0),V(tb.x1,tb.y0,0),V(tb.x1,tb.y1,0),V(tb.x0,tb.y1,0)]:null),
  camMinZ:cfg.scene.camMinZ??(tb?(tb.floor??-0.75)+0.03:null),
  movables,actions:cfg.actions||[],views:cfg.views,
  grabbables:()=>movables.map(m=>{const g=m.grab();return g?{...g,id:m.id,label:m.label,hint:g.hint||m.hint}:null}).filter(Boolean)};
 run()}

function run(){if(T.light)LIGHT=nrm(T.light);document.title=T.meta.title+" — Wirtualne Laboratorium";
 shellDOM();hintEl=$("hint");
 const SKEY="lab-"+T.id+"-"+seed+"-state";let saved=null;try{saved=JSON.parse(localStorage.getItem(SKEY))}catch(e){}
 PSPEC=T.params||{};prng=rng(seed*13+5);P=rollParams(PSPEC,prng);if(saved&&saved.__params)Object.assign(P,saved.__params);
 T.init({seed,rng,gauss,P,params});if(saved&&T.setState){try{T.setState(saved)}catch(e){}}
 // ekran startowy i treść zadania
 const ov=$("startOv");ov.querySelector(".box").innerHTML=`<div class="kick">${T.meta.kicker}</div><h2>${T.meta.title}</h2><p>${T.meta.desc}</p>${saved?`<p class="resume">Układ czeka tak, jak go zostawiłeś.</p>`:""}
  <div class="row"><button class="btn p big" id="goStart">${saved?"Wróć do układu":"Wejdź do laboratorium"}</button><button class="btn" id="goTask">Treść zadania</button></div><p class="small">Zestaw nr <b>${seed}</b> · <a href="#" id="newS">nowy zestaw</a></p>`;
 $("taskBox").innerHTML=T.taskHtml+(T.hints||[]).map(h=>`<details><summary>${h.title}</summary><div class="small">${h.html}</div></details>`).join("")+`<div class="row"><button class="btn p" id="taskX">Wracam</button></div>`;
 $("goStart").onclick=()=>{ov.classList.remove("on");try{if(!localStorage.getItem("lab-help-seen"))$("help").classList.add("on")}catch(e){}T.start&&T.start(!!saved)};$("goTask").onclick=()=>$("taskOv").classList.add("on");
 const newSet=()=>{location.hash="#"+T.id+"/"+(1000+Math.floor(Math.random()*899000))};
 $("newS").onclick=e=>{e.preventDefault();newSet()};
 $("bNew").onclick=()=>{if(confirm("Nowy zestaw pomiarowy?\nUkryte parametry (np. współczynniki tarcia) zostaną wylosowane od nowa, a układ wróci do stanu początkowego."))newSet()};
 $("bTask").onclick=()=>$("taskOv").classList.add("on");$("taskX").onclick=()=>$("taskOv").classList.remove("on");$("taskOv").addEventListener("click",e=>{if(e.target===$("taskOv"))$("taskOv").classList.remove("on")});
 // górny pasek
 const vb=$("views");vb.innerHTML=T.views.map((v,i)=>`<button class="pill" data-v="${i}">${v.label}</button>`).join("");vb.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>goCam(T.views[+b.dataset.v].cam()));
 document.querySelectorAll("#modes button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));if(!T.learn)$("modes").style.display="none";
 $("bHelp").onclick=()=>$("help").classList.toggle("on");$("helpX").onclick=()=>{$("help").classList.remove("on");try{localStorage.setItem("lab-help-seen","1")}catch(e){}};
 const bp=$("bPip");if(!T.pip)bp.style.display="none";bp.onclick=()=>{pipOn=!pipOn;bp.classList.toggle("on",pipOn)};
 const bs=$("bSpeed");bs.onclick=()=>{speed=SPEEDS[(SPEEDS.indexOf(speed)+1)%SPEEDS.length];bs.textContent=speed===1?"×1":"×¼";bs.classList.toggle("on",speed!==1)};
 $("bZad").onclick=()=>{renderCatalog(window.LAB_TASKS||[]);$("catalog").classList.add("on")};
 // zapis stanu (z parametrami ukrytymi)
 const persist=()=>{if(T.getState)try{localStorage.setItem(SKEY,JSON.stringify({...T.getState(),__params:P}))}catch(e){}};setInterval(persist,2000);document.addEventListener("visibilitychange",persist);window.addEventListener("pagehide",persist);
 buildDock();resize();Object.assign(cam,T.views[0].cam());cam.dist*=2;cam.yaw-=0.6;
 let tPrev=performance.now();function loop(now){let dt=Math.min(0.05,(now-tPrev)/1000);tPrev=now;
  flyStep(dt);T.update(dt*speed);learnRows=null;draw();renderLearn(mode==="nauka"?learnRows:null);status();syncUI();requestAnimationFrame(loop)}
 window.addEventListener("resize",()=>resize());new ResizeObserver(()=>resize()).observe(cv);requestAnimationFrame(loop)}
