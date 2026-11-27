// ---------- strona główna (katalog doświadczeń) ----------
const KONTAKT="";   // adres e-mail do ofert dla szkół i korepetytorów — puste: przycisk pokazuje „wkrótce”
const DZIALY=["mechanika","drgania","optyka","elektryczność"];
function progressOf(id){let z=null;try{z=localStorage.getItem("lab-lastseed-"+id)}catch(e){}if(!z)return null;let st=null;try{st=localStorage.getItem("lab-"+id+"-"+z+"-state")}catch(e){}return st?{}:null}
const grupaOf=t=>t.id.startsWith("lo-")?"lo":"of";
function edycja(t){return(t.kicker||"").replace(/ · /g,", ")}
function card(t){const p=progressOf(t.id),g=grupaOf(t);
 return`<button class="lcard ${g}" data-id="${t.id}" data-dz="${(t.dzial||[]).join(" ")}"><span class="limg"><img src="img/zadania/${t.id}.jpg?v=${VERSION}" alt="" loading="lazy"></span>
  <span class="lmeta">${esc(edycja(t))}</span><span class="ltitle">${esc(t.title)}</span><span class="ldesc">${esc(t.desc)}</span>
  <span class="ldz">${(t.dzial||[]).map(d=>`<i>${d}</i>`).join("")}${p?`<i class="prog">zaczęte</i>`:""}</span></button>`}
function renderCatalog(tasks){const c=$("catalog");const cur=route&&tasks.some(t=>t.id===route.id)?route.id:null;const of=tasks.filter(t=>grupaOf(t)==="of"),lo=tasks.filter(t=>grupaOf(t)==="lo");
 c.innerHTML=`<div class="land">
 <nav class="lnav"><a class="brand" href="#"><img src="icons/icon-192.png" alt=""><span>Wirtualne Laboratorium</span></a>
  <span class="lnavl"><a href="#sek-of" data-scroll>Olimpiada</a><a href="#sek-lo" data-scroll>Matura</a><a href="#sek-b2b" data-scroll>Dla szkół</a>${cur?'<button class="lbtn ghost" id="catX">Wróć do doświadczenia</button>':""}</span></nav>
 <header class="hero"><div class="htxt"><h1>Doświadczenia z fizyki, w których mierzysz sam</h1>
  <p>Zadania doświadczalne z Olimpiady Fizycznej i doświadczenia z podstawy programowej — w 3D, z prawdziwymi przyrządami. Linijka, stoper i multimetr pokazują to, co pokazałyby na stole. Wynik zależy od Twojego pomiaru.</p>
  <div class="hcta"><button class="lbtn" data-go="${(of[0]||tasks[0]).id}">Otwórz doświadczenie z płytą CD</button><a class="lbtn ghost" href="#sek-of" data-scroll>Zobacz wszystkie</a></div></div>
  <figure class="hfig"><img src="img/hero.jpg?v=${VERSION}" alt="Zasilacz, amperomierz, płytka stykowa ze świecącą żarówką i woltomierz na stole"><figcaption><span class="lcd">6,00 V</span><span class="lcd">153,4 mA</span><span class="cap">Żarówka 6 V: opór włókna rośnie z temperaturą — z 4 Ω na zimno do 38 Ω przy pełnym świeceniu.</span></figcaption></figure></header>
 <section class="feat"><div><h3>Mierzysz sam</h3><p>Aplikacja nie podaje wyniku. Odczytujesz skalę, liczysz wahnięcia, przekładasz przewody — jak w pracowni.</p></div>
  <div><h3>Tryb Nauka</h3><p>Jednym przełącznikiem widać siły, promienie, energię i ukryte wartości układu. Pomiar i nauka są osobno.</p></div>
  <div><h3>Każdy zestaw inny</h3><p>Parametry są losowane jak w prawdziwym zestawie. Kod zestawu jest w adresie strony — można go wysłać nauczycielowi.</p></div></section>
 <div class="filt" role="group" aria-label="Dział fizyki"><button class="on" data-f="">Wszystkie działy</button>${DZIALY.map(d=>`<button data-f="${d}">${d[0].toUpperCase()+d.slice(1)}</button>`).join("")}</div>
 <section class="sek" id="sek-of"><div class="sekh"><h2>Olimpiada Fizyczna</h2><p>Zadania doświadczalne II etapu. Układ odtworzony według rozwiązań Komitetu Głównego: ten sam sprzęt, ta sama fizyka, te same pułapki.</p></div>
  <div class="lgrid">${of.map(card).join("")}</div></section>
 <section class="sek" id="sek-lo"><div class="sekh"><h2>Matura rozszerzona</h2><p>Doświadczenia wymagane w podstawie programowej z fizyki (2024). Do nauki przed maturą i do pokazania na lekcji, gdy w szkole brakuje sprzętu.</p></div>
  <div class="lgrid">${lo.map(card).join("")}</div></section>
 <section class="b2b" id="sek-b2b"><div><h2>Dla szkół i korepetytorów</h2><p>Stanowiska działają w przeglądarce na zwykłym komputerze — bez zakupu sprzętu i bez instalacji. Przygotowujemy licencje dla szkół, firm korepetytorskich i nauczycieli prowadzących kółka olimpijskie.</p></div>
  ${KONTAKT?`<a class="lbtn" href="mailto:${KONTAKT}?subject=Wirtualne%20Laboratorium%20%E2%80%94%20licencja">Napisz do nas</a>`:`<span class="lbtn off" aria-disabled="true">Formularz kontaktowy wkrótce</span>`}</section>
 <footer class="lfoot"><p>Zadania olimpijskie opracowane na podstawie materiałów Komitetu Głównego Olimpiady Fizycznej. Podstawa programowa z fizyki, zakres rozszerzony (2024).</p><p>Wersja ${VERSION}</p></footer></div>`;
 c.querySelectorAll(".lcard[data-id],[data-go]").forEach(b=>b.onclick=()=>{const id=b.dataset.id||b.dataset.go;if(cur===id){c.classList.remove("on");return}location.hash="#"+id});
 c.querySelectorAll("[data-scroll]").forEach(a=>a.onclick=e=>{e.preventDefault();const el=c.querySelector(a.getAttribute("href"));if(el)el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
 c.querySelector(".brand").onclick=e=>{e.preventDefault();c.scrollTo({top:0})};
 c.querySelectorAll(".filt button").forEach(b=>b.onclick=()=>{c.querySelectorAll(".filt button").forEach(x=>x.classList.toggle("on",x===b));const f=b.dataset.f;
  c.querySelectorAll(".lcard").forEach(k=>k.hidden=!!f&&!k.dataset.dz.split(" ").includes(f));c.querySelectorAll(".sek").forEach(s=>s.hidden=![...s.querySelectorAll(".lcard")].some(k=>!k.hidden))});
 const x=$("catX");if(x)x.onclick=()=>c.classList.remove("on")}
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);window.addEventListener("hashchange",()=>location.reload());
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 const s=document.createElement("script");s.src=t.file+"?v="+VERSION;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);
