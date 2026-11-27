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
function renderCatalog(tasks){const c=$("catalog");const cur=route&&tasks.some(t=>t.id===route.id)?route.id:null;const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;
 c.innerHTML=`<div class="site">
 <header class="nav"><div class="wrap navin"><a class="brand" href="./"><img src="icons/icon-192.png" alt="" width="32" height="32"><span>Wirtualne Laboratorium</span></a>
  <nav class="navl" aria-label="Sekcje"><a href="#jak" data-scroll>Jak to działa</a><a href="#dosw" data-scroll>Doświadczenia</a><a href="#szkoly" data-scroll>Dla szkół</a></nav>
  ${cur?'<button class="b b2" id="catX">Wróć do doświadczenia</button>':'<a class="b" href="#dosw" data-scroll>Zacznij</a>'}</div></header>
 <section class="hero"><div class="wrap heroin"><div class="htx">
  <h1>Fizyka doświadczalna, w której mierzysz sam</h1>
  <p class="lead">Wirtualna pracownia fizyczna w przeglądarce. Odtworzone w 3D zadania z Olimpiady Fizycznej i doświadczenia z matury rozszerzonej — z prawdziwymi przyrządami, prawdziwą fizyką i prawdziwą niepewnością pomiaru.</p>
  <div class="hb"><button class="b" data-go="lo-wahadlo">Otwórz wahadło matematyczne</button><a class="b b2" href="#dosw" data-scroll>Przeglądaj doświadczenia</a></div>
  <p class="hnote">${tasks.length} doświadczeń: ${nOf} z Olimpiady Fizycznej, ${nLo} z podstawy programowej. Działa na komputerze, bez instalacji.</p></div>
  <figure class="hfig"><img src="img/hero.jpg?v=${VERSION}" alt="Pomiar charakterystyki żarówki: zasilacz, amperomierz, płytka stykowa ze świecącą żarówką i woltomierz" width="1600" height="1075">
   <figcaption><span class="fx">R = U / I</span><span>Żarówka 6 V: opór włókna rośnie z 4 Ω do 38 Ω razem z jego temperaturą. Dla opornika wykres I(U) jest prostą — dla żarówki nie.</span></figcaption></figure></div></section>
 <section class="sec" id="jak"><div class="wrap"><h2>Jak to działa</h2>
  <ol class="steps"><li><h3>Wybierz doświadczenie</h3><p>Na stole leży ten sam sprzęt co w treści zadania: linijki, statyw, multimetr, papier milimetrowy. Każdy zestaw ma lekko inne parametry, jak prawdziwe przyrządy.</p></li>
  <li><h3>Zmierz</h3><p>Przesuwasz, odchylasz, przekładasz przewody i odczytujesz skale. Aplikacja nie liczy za Ciebie — wynik i jego niepewność zależą od Twojego pomiaru.</p></li>
  <li><h3>Sprawdź w trybie Nauka</h3><p>Jednym przełącznikiem zobaczysz siły, promienie i energię, a także ukryte wartości zestawu. Porównasz je ze swoim wynikiem.</p></li></ol></div></section>
 <section class="sec alt" id="dosw"><div class="wrap"><div class="sech"><h2>Doświadczenia</h2><p>Zadania doświadczalne II etapu Olimpiady Fizycznej, odtworzone według rozwiązań Komitetu Głównego, oraz doświadczenia wymagane w podstawie programowej z fizyki dla zakresu rozszerzonego.</p></div>
  <div class="tools"><div class="seg" role="group" aria-label="Grupa"><button aria-pressed="true" data-g="">Wszystkie <span>${tasks.length}</span></button><button aria-pressed="false" data-g="of">Olimpiada Fizyczna <span>${nOf}</span></button><button aria-pressed="false" data-g="lo">Matura rozszerzona <span>${nLo}</span></button></div>
   <div class="dz" role="group" aria-label="Dział fizyki"><span>Dział</span>${["",...DZIALY].map(d=>`<button aria-pressed="${d?"false":"true"}" data-d="${d}">${d?d:"każdy"}</button>`).join("")}</div></div>
  <ul class="grid">${tasks.map(card).join("")}</ul><p class="empty" hidden>Brak doświadczeń dla tego wyboru.</p></div></section>
 <section class="sec" id="szkoly"><div class="wrap szk"><div class="szt"><h2>Dla szkół i korepetytorów</h2><p>Pracownia, która nie wymaga sprzętu ani instalacji. Uczniowie wykonują pomiary w domu i na lekcji, a nauczyciel wysyła im link do konkretnego zestawu.</p>
  ${KONTAKT?`<a class="b" href="mailto:${KONTAKT}?subject=Wirtualne%20Laboratorium">Napisz do nas</a>`:`<span class="b b3" aria-disabled="true">Kontakt wkrótce</span>`}</div>
  <ul class="szl"><li><b>Szkoły</b><span>Dostęp dla klas i kółek olimpijskich, także gdy w pracowni brakuje sprzętu.</span></li><li><b>Firmy korepetytorskie</b><span>Doświadczenia do zajęć online z maturzystami i olimpijczykami.</span></li><li><b>Nauczyciele</b><span>Link do konkretnego zestawu: każdy uczeń mierzy te same przyrządy.</span></li></ul></div></section>
 <footer class="foot"><div class="wrap footin"><div><b>Wirtualne Laboratorium</b><p>Zadania olimpijskie opracowane na podstawie materiałów Komitetu Głównego Olimpiady Fizycznej. Doświadczenia licealne według podstawy programowej z fizyki, zakres rozszerzony (2024).</p></div><p class="ver">Wersja ${VERSION}</p></div></footer></div>`;
 c.querySelectorAll(".kcb,[data-go]").forEach(b=>b.onclick=()=>{const id=b.dataset.id||b.dataset.go;if(cur===id){c.classList.remove("on");return}location.hash="#"+id});
 c.querySelectorAll("[data-scroll]").forEach(a=>a.onclick=e=>{e.preventDefault();const el=c.querySelector(a.getAttribute("href"));if(el)c.scrollTo({top:el.offsetTop-64,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
 let fg="",fd="";const apply=()=>{let n=0;c.querySelectorAll(".kc").forEach(k=>{const on=(!fg||k.dataset.g===fg)&&(!fd||k.dataset.dz.split(" ").includes(fd));k.hidden=!on;n+=on});c.querySelector(".empty").hidden=n>0};
 c.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{fg=b.dataset.g;c.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 c.querySelectorAll(".dz button").forEach(b=>b.onclick=()=>{fd=b.dataset.d;c.querySelectorAll(".dz button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 const x=$("catX");if(x)x.onclick=()=>c.classList.remove("on")}
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);window.addEventListener("hashchange",()=>location.reload());
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 const s=document.createElement("script");s.src=t.file+"?v="+VERSION;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);
