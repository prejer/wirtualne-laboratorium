// ---------- katalog zadań ----------
function progressOf(id){let z=null;try{z=localStorage.getItem("lab-lastseed-"+id)}catch(e){}if(!z)return null;let st=null;try{st=localStorage.getItem("lab-"+id+"-"+z+"-state")}catch(e){}return st?{}:null}
function renderCatalog(tasks){const c=$("catalog");const cur=route&&route.id;
 c.innerHTML=`<div class="cat"><div class="cathead"><div><div class="kick">Wirtualne Laboratorium · Olimpiada Fizyczna</div><h1>Zadania doświadczalne w 3D</h1><p>Gotowy układ z rozwiązania Komitetu. Obracasz go i mierzysz jak w prawdziwym laboratorium. W trybie Nauka widzisz siły, kąty i odległości. Układ poczeka, aż wrócisz.</p></div>${cur?'<button class="btn" id="catX">Zamknij ✕</button>':""}</div>
 <div class="cards">${tasks.map(t=>{const p=progressOf(t.id);return`<button class="tcard" data-id="${t.id}"><div class="tsvg">${t.svg||""}</div><div class="tbody"><div class="kick">${t.kicker}</div><b>${t.title}</b><span>${t.desc}</span><div class="tags">${(t.tags||[]).map(g=>`<i>${g}</i>`).join("")}${p?`<i class="prog">w toku</i>`:""}</div></div></button>`}).join("")}
 <div class="tcard soon"><div class="tbody"><b>Kolejne zadania</b><span>Wrzucaj PDF-y z zadaniami i rozwiązaniami — każde staje się kolejnym stanowiskiem.</span></div></div></div></div>`;
 c.querySelectorAll(".tcard[data-id]").forEach(b=>b.onclick=()=>{if(cur===b.dataset.id){c.classList.remove("on");return}location.hash="#"+b.dataset.id});
 const x=$("catX");if(x)x.onclick=()=>c.classList.remove("on")}
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);window.addEventListener("hashchange",()=>location.reload());
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 const s=document.createElement("script");s.src=t.file+"?v="+VERSION;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);
