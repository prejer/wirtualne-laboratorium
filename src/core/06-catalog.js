// ---------- strona główna (katalog doświadczeń) ----------
const KONTAKT="";   // adres e-mail do ofert dla szkół i korepetytorów — puste: przycisk pokazuje „wkrótce”
const DZIALY=["mechanika","drgania","optyka","elektryczność"];
const GRUPY={of:{n:"Olimpiada Fizyczna"},lo:{n:"Matura rozszerzona"}};
function progressOf(id){let z=null;try{z=localStorage.getItem("lab-lastseed-"+id)}catch(e){}if(!z)return null;let st=null;try{st=localStorage.getItem("lab-"+id+"-"+z+"-state")}catch(e){}return st?{}:null}
const grupaOf=t=>t.id.startsWith("lo-")?"lo":"of";
// „LXV OF · II etap · 2015/16” → „LXV OF, II etap, 2015/16”; „Liceum · matura rozszerzona · V.8” → „Podstawa programowa, punkt V.8”
function edycja(t){const k=t.kicker||"";if(grupaOf(t)==="lo"){const m=k.match(/([IVX]+\.\d+)\s*$/);return m?"Podstawa programowa, punkt "+m[1]:"Podstawa programowa"}return k.replace(/ · /g,", ")}
function card(t){const p=progressOf(t.id),g=grupaOf(t);
 return`<li class="kc" data-g="${g}" data-dz="${(t.dzial||[]).join(" ")}"><button class="kcb" data-id="${t.id}"><span class="kimg"><img src="img/zadania/${t.id}.jpg?v=${VERSION}" alt="" loading="lazy" width="960" height="600"></span>
  <span class="kbody"><span class="kgr ${g}">${GRUPY[g].n}</span><span class="ktit">${esc(t.title)}</span><span class="kmeta">${esc(edycja(t))}</span><span class="kdesc">${esc(t.desc)}</span>
  <span class="kfoot">${(t.dzial||[]).map(d=>`<i>${d}</i>`).join("")}${p?`<i class="prog">rozpoczęte</i>`:""}</span></span></button></li>`}
const POLECANE=["lo-wahadlo","of56-2-led-cd","of72-2-brewster"];
const norm=x=>String(x||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ł/g,"l");
function row(t){const p=progressOf(t.id),g=grupaOf(t);
 return`<li class="kr" data-g="${g}" data-dz="${(t.dzial||[]).join(" ")}"><button class="krb" data-id="${t.id}"><span class="rimg"><img src="img/zadania/${t.id}.jpg?v=${VERSION}" alt="" loading="lazy" width="960" height="600"></span>
  <span class="rmain"><span class="ktit">${esc(t.title)}</span><span class="kmeta"><span class="kgr ${g}">${GRUPY[g].n}</span>${esc(edycja(t))}</span></span>
  <span class="rdz">${(t.dzial||[]).map(d=>`<i>${d}</i>`).join("")}${p?`<i class="prog">rozpoczęte</i>`:""}</span><span class="rgo">Otwórz</span></button></li>`}
function navHTML(cur,page){return`<header class="nav"><div class="wrap navin"><a class="brand" href="#"><img src="icons/icon-192.png" alt="" width="32" height="32"><span>Wirtualne Laboratorium</span></a>
  <nav class="navl" aria-label="Strony"><a href="#"${page==="home"?' aria-current="page"':""}>Strona główna</a><a href="#zadania"${page==="zad"?' aria-current="page"':""}>Doświadczenia</a><a href="#szkoly" data-home>Dla szkół</a></nav>
  ${cur?'<button class="b b2" id="catX">Wróć do doświadczenia</button>':page==="home"?'<a class="b" href="#zadania">Wszystkie doświadczenia</a>':""}</div></header>`}
const footHTML=()=>`<footer class="foot"><div class="wrap footin"><div><b>Wirtualne Laboratorium</b><p>Zadania olimpijskie opracowane na podstawie materiałów Komitetu Głównego Olimpiady Fizycznej. Doświadczenia licealne według podstawy programowej z fizyki, zakres rozszerzony (2024).</p></div><p class="ver">Wersja ${VERSION}</p></div></footer>`;
function homeHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;const pol=POLECANE.map(id=>tasks.find(t=>t.id===id)).filter(Boolean);
 return`<div class="site">${navHTML(cur,"home")}
 <section class="hero"><div class="wrap heroin"><div class="htx">
  <h1>Fizyka doświadczalna, w której mierzysz sam</h1>
  <p class="lead">Wirtualna pracownia fizyczna w przeglądarce. Odtworzone w 3D zadania z Olimpiady Fizycznej i doświadczenia z matury rozszerzonej — z prawdziwymi przyrządami, prawdziwą fizyką i prawdziwą niepewnością pomiaru.</p>
  <div class="hb"><button class="b" data-go="lo-wahadlo">Otwórz wahadło matematyczne</button><a class="b b2" href="#zadania">Wszystkie doświadczenia</a></div>
  <p class="hnote">${tasks.length} doświadczeń: ${nOf} z Olimpiady Fizycznej, ${nLo} z podstawy programowej. Działa na komputerze, bez instalacji.</p></div>
  <figure class="hfig"><img src="img/hero.jpg?v=${VERSION}" alt="Pomiar charakterystyki żarówki: zasilacz, amperomierz, płytka stykowa ze świecącą żarówką i woltomierz" width="1600" height="1075">
   <figcaption><span class="fx">R = U / I</span><span>Żarówka 6 V: opór włókna rośnie z 4 Ω do 38 Ω razem z jego temperaturą. Dla opornika wykres I(U) jest prostą — dla żarówki nie.</span></figcaption></figure></div></section>
 <section class="sec" id="jak"><div class="wrap"><h2>Jak to działa</h2>
  <ol class="steps"><li><h3>Wybierz doświadczenie</h3><p>Na stole leży ten sam sprzęt co w treści zadania: linijki, statyw, multimetr, papier milimetrowy. Każdy zestaw ma lekko inne parametry, jak prawdziwe przyrządy.</p></li>
  <li><h3>Zmierz</h3><p>Przesuwasz, odchylasz, przekładasz przewody i odczytujesz skale. Aplikacja nie liczy za Ciebie — wynik i jego niepewność zależą od Twojego pomiaru.</p></li>
  <li><h3>Sprawdź w trybie Nauka</h3><p>Jednym przełącznikiem zobaczysz siły, promienie i energię, a także ukryte wartości zestawu. Porównasz je ze swoim wynikiem.</p></li></ol></div></section>
 <section class="sec alt"><div class="wrap"><div class="sech2"><h2>Na początek</h2><a class="b b2" href="#zadania">Wszystkie doświadczenia (${tasks.length})</a></div>
  <ul class="grid">${pol.map(card).join("")}</ul></div></section>
 <section class="sec" id="szkoly"><div class="wrap szk"><div class="szt"><h2>Dla szkół i korepetytorów</h2><p>Pracownia, która nie wymaga sprzętu ani instalacji. Uczniowie wykonują pomiary w domu i na lekcji, a nauczyciel wysyła im link do konkretnego zestawu.</p>
  ${KONTAKT?`<a class="b" href="mailto:${KONTAKT}?subject=Wirtualne%20Laboratorium">Napisz do nas</a>`:`<span class="b b3" aria-disabled="true">Kontakt wkrótce</span>`}</div>
  <ul class="szl"><li><b>Szkoły</b><span>Dostęp dla klas i kółek olimpijskich, także gdy w pracowni brakuje sprzętu.</span></li><li><b>Firmy korepetytorskie</b><span>Doświadczenia do zajęć online z maturzystami i olimpijczykami.</span></li><li><b>Nauczyciele</b><span>Link do konkretnego zestawu: każdy uczeń mierzy te same przyrządy.</span></li></ul></div></section>
 ${footHTML()}</div>`}
let VIEW="kafelki";try{VIEW=localStorage.getItem("lab-widok")||"kafelki"}catch(e){}
function zadHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;
 return`<div class="site">${navHTML(cur,"zad")}
 <section class="zhead"><div class="wrap"><h1>Doświadczenia</h1><p>Zadania doświadczalne II etapu Olimpiady Fizycznej, odtworzone według rozwiązań Komitetu Głównego, oraz doświadczenia wymagane w podstawie programowej z fizyki dla zakresu rozszerzonego.</p>
  <div class="srch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="q" type="search" placeholder="Szukaj po nazwie, przyrządzie lub zjawisku" aria-label="Szukaj doświadczeń" autocomplete="off"></div></div></section>
 <section class="sec alt zlist"><div class="wrap">
  <div class="tools"><div class="seg" role="group" aria-label="Grupa"><button aria-pressed="true" data-g="">Wszystkie <span>${tasks.length}</span></button><button aria-pressed="false" data-g="of">Olimpiada Fizyczna <span>${nOf}</span></button><button aria-pressed="false" data-g="lo">Matura rozszerzona <span>${nLo}</span></button></div>
   <div class="tr"><label class="sortl">Kolejność <select id="sort"><option value="">polecana</option><option value="az">nazwa A–Z</option><option value="rok">najnowsze</option></select></label>
   <div class="vt" role="group" aria-label="Widok"><button data-v="kafelki" aria-pressed="${VIEW==="kafelki"}" title="Kafelki"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg><span>Kafelki</span></button><button data-v="lista" aria-pressed="${VIEW==="lista"}" title="Lista"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></svg><span>Lista</span></button></div></div></div>
  <div class="dz" role="group" aria-label="Dział fizyki"><span>Dział</span>${["",...DZIALY].map(d=>`<button aria-pressed="${d?"false":"true"}" data-d="${d}">${d?d:"każdy"}</button>`).join("")}</div>
  <p class="zcnt" aria-live="polite"></p><ul class="grid" id="zg"></ul><ul class="list" id="zl"></ul>
  <div class="empty" hidden><p>Nie ma doświadczeń pasujących do wyszukiwania.</p><button class="b b2" id="clr">Wyczyść filtry</button></div></div></section>
 ${footHTML()}</div>`}
let TASKHASH="";
const rokOf=t=>{const m=(t.kicker||"").match(/(\d{4})(?:\/\d{2})?\s*$/)||(t.kicker||"").match(/(\d{4})/);return m?+m[1]:(grupaOf(t)==="lo"?2024:0)};
function renderCatalog(tasks){const c=$("catalog");const cur=route&&tasks.some(t=>t.id===route.id)?route.id:null;
 const h=location.hash,page=h==="#zadania"?"zad":(h===""||h==="#")?"home":"zad";
 c.innerHTML=page==="zad"?zadHTML(tasks,cur):homeHTML(tasks,cur);c.scrollTop=0;
 c.querySelectorAll(".kcb,.krb,[data-go]").forEach(b=>b.onclick=()=>{const id=b.dataset.id||b.dataset.go;if(cur===id){c.classList.remove("on");return}location.hash="#"+id});
 c.querySelectorAll("[data-home]").forEach(a=>a.onclick=e=>{e.preventDefault();if(page!=="home"){history.pushState(null,"","#");renderCatalog(tasks);}const el=c.querySelector("#szkoly");if(el)c.scrollTo({top:el.offsetTop-64})});
 c.querySelectorAll('a[href="#"],a[href="#zadania"]').forEach(a=>a.onclick=e=>{e.preventDefault();history.pushState(null,"",a.getAttribute("href")==="#"?location.pathname:"#zadania");renderCatalog(tasks)});
 const x=$("catX");if(x)x.onclick=()=>{if(TASKHASH&&location.hash!==TASKHASH)history.replaceState(null,"",TASKHASH);c.classList.remove("on")};
 if(page!=="zad")return;
 let fg="",fd="",q="",so="";const zg=$("zg"),zl=$("zl"),idx=tasks.map((t,i)=>({t,i,k:norm([t.title,t.desc,t.kicker,(t.tags||[]).join(" "),(t.dzial||[]).join(" "),GRUPY[grupaOf(t)].n].join(" "))}));
 const apply=()=>{const ws=norm(q).split(/\s+/).filter(Boolean).map(w=>w.length>=5?w.slice(0,w.length-2):w);/* rdzeń słowa: „dioda” znajdzie też „diody” */let L=idx.filter(o=>(!fg||grupaOf(o.t)===fg)&&(!fd||(o.t.dzial||[]).includes(fd))&&ws.every(w=>o.k.includes(w)));
  if(so==="az")L=[...L].sort((a,b)=>a.t.title.localeCompare(b.t.title,"pl"));else if(so==="rok")L=[...L].sort((a,b)=>rokOf(b.t)-rokOf(a.t));
  zg.innerHTML=VIEW==="kafelki"?L.map(o=>card(o.t)).join(""):"";zl.innerHTML=VIEW==="lista"?L.map(o=>row(o.t)).join(""):"";zg.hidden=VIEW!=="kafelki";zl.hidden=VIEW!=="lista";
  c.querySelector(".zcnt").textContent=L.length===tasks.length?`${L.length} doświadczeń`:`${L.length} z ${tasks.length} doświadczeń`;c.querySelector(".empty").hidden=L.length>0;
  c.querySelectorAll(".kcb,.krb").forEach(b=>b.onclick=()=>{const id=b.dataset.id;if(cur===id){c.classList.remove("on");return}location.hash="#"+id})};
 $("q").oninput=e=>{q=e.target.value;apply()};$("sort").onchange=e=>{so=e.target.value;apply()};
 c.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{fg=b.dataset.g;c.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 c.querySelectorAll(".dz button").forEach(b=>b.onclick=()=>{fd=b.dataset.d;c.querySelectorAll(".dz button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 c.querySelectorAll(".vt button").forEach(b=>b.onclick=()=>{VIEW=b.dataset.v;try{localStorage.setItem("lab-widok",VIEW)}catch(e){}c.querySelectorAll(".vt button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 $("clr").onclick=()=>{q="";fg="";fd="";$("q").value="";c.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.g===""));c.querySelectorAll(".dz button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.d===""));apply()};
 apply()}
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);const isPage=h=>h===""||h==="#"||h==="#zadania";
 window.addEventListener("hashchange",()=>{if(isPage(location.hash)&&!(route&&tasks.some(t=>t.id===route.id)))renderCatalog(tasks);else location.reload()});window.addEventListener("popstate",()=>{if(isPage(location.hash))renderCatalog(tasks)});
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 TASKHASH=location.hash;const s=document.createElement("script");s.src=t.file+"?v="+VERSION;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);
