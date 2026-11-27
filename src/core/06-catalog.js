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
const STRONY=[["home","Strona główna",""],["zadania","Doświadczenia","#zadania"],["szkoly","Dla szkół","#szkoly"],["o-projekcie","O projekcie","#o-projekcie"],["kontakt","Kontakt","#kontakt"]];
const href=k=>(STRONY.find(x=>x[0]===k)||[,,""])[2]||"#";
function navHTML(cur,page){return`<header class="nav"><div class="wrap navin"><a class="brand" href="#" data-p="home"><img src="icons/icon-192.png" alt="" width="32" height="32"><span>Wirtualne Laboratorium</span></a>
  <nav class="navl" id="navl" aria-label="Menu">${STRONY.map(([k,n])=>`<a href="${href(k)}" data-p="${k}"${page===k?' aria-current="page"':""}>${n}</a>`).join("")}</nav>
  ${cur?'<button class="b b2 navcta" id="catX">Wróć do doświadczenia</button>':page==="zadania"?"":`<a class="b navcta" href="#zadania" data-p="zadania">Otwórz doświadczenia</a>`}
  <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navl"><span></span><span></span><span></span></button></div></header>`}
const footHTML=()=>`<footer class="foot"><div class="wrap footgrid"><div class="fcol1"><b>Wirtualne Laboratorium</b><p>Doświadczenia z fizyki w 3D: zadania z Olimpiady Fizycznej i doświadczenia z podstawy programowej. Mierzysz sam, jak w pracowni.</p></div>
 <div><h4>Serwis</h4>${STRONY.map(([k,n])=>`<a href="${href(k)}" data-p="${k}">${n}</a>`).join("")}</div>
 <div><h4>Źródła</h4><p>Zadania olimpijskie opracowane na podstawie materiałów Komitetu Głównego Olimpiady Fizycznej. Doświadczenia licealne według podstawy programowej z fizyki, zakres rozszerzony (2024).</p></div></div>
 <div class="wrap"><div class="fbot"><span>© ${new Date().getFullYear()} Wirtualne Laboratorium</span><span>Wersja ${VERSION}</span></div></div></footer>`;
function homeHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;const pol=POLECANE.map(id=>tasks.find(t=>t.id===id)).filter(Boolean);
 return`<div class="site">${navHTML(cur,"home")}
 <section class="hero"><div class="wrap heroin"><div class="htx">
  <h1>Fizyka doświadczalna, w której mierzysz sam</h1>
  <p class="lead">Wirtualna pracownia fizyczna w przeglądarce. Odtworzone w 3D zadania z Olimpiady Fizycznej i doświadczenia z matury rozszerzonej — z prawdziwymi przyrządami, prawdziwą fizyką i prawdziwą niepewnością pomiaru.</p>
  <div class="hb"><button class="b" data-go="lo-wahadlo">Otwórz wahadło matematyczne</button><a class="b b2" href="#zadania" data-p="zadania">Wszystkie doświadczenia</a></div>
  <p class="hnote">${tasks.length} doświadczeń: ${nOf} z Olimpiady Fizycznej, ${nLo} z podstawy programowej. Działa na komputerze, bez instalacji.</p></div>
  <figure class="hfig"><img src="img/hero.jpg?v=${VERSION}" alt="Pomiar charakterystyki żarówki: zasilacz, amperomierz, płytka stykowa ze świecącą żarówką i woltomierz" width="1600" height="1075">
   <figcaption><span class="fx">R = U / I</span><span>Żarówka 6 V: opór włókna rośnie z 4 Ω do 38 Ω razem z jego temperaturą. Dla opornika wykres I(U) jest prostą — dla żarówki nie.</span></figcaption></figure></div></section>
 <section class="sec" id="jak"><div class="wrap"><h2>Jak to działa</h2>
  <ol class="steps"><li><h3>Wybierz doświadczenie</h3><p>Na stole leży ten sam sprzęt co w treści zadania: linijki, statyw, multimetr, papier milimetrowy. Każdy zestaw ma lekko inne parametry, jak prawdziwe przyrządy.</p></li>
  <li><h3>Zmierz</h3><p>Przesuwasz, odchylasz, przekładasz przewody i odczytujesz skale. Aplikacja nie liczy za Ciebie — wynik i jego niepewność zależą od Twojego pomiaru.</p></li>
  <li><h3>Sprawdź w trybie Nauka</h3><p>Jednym przełącznikiem zobaczysz siły, promienie i energię, a także ukryte wartości zestawu. Porównasz je ze swoim wynikiem.</p></li></ol></div></section>
 <section class="sec alt"><div class="wrap"><div class="sech2"><h2>Na początek</h2><a class="b b2" href="#zadania" data-p="zadania">Wszystkie doświadczenia (${tasks.length})</a></div>
  <ul class="grid">${pol.map(card).join("")}</ul></div></section>
 <section class="sec"><div class="wrap"><div class="band"><div><h2>Dla szkół i korepetytorów</h2><p>Pracownia fizyczna bez zakupu sprzętu i bez instalacji — na lekcje, kółka olimpijskie i zajęcia online.</p></div><a class="b" href="#szkoly" data-p="szkoly">Zobacz ofertę</a></div></div></section>
 ${footHTML()}</div>`}
function szkolyHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;
 return`<div class="site">${navHTML(cur,"szkoly")}
 <section class="zhead"><div class="wrap"><h1>Dla szkół i korepetytorów</h1><p>Pracownia fizyczna, która działa w przeglądarce na zwykłym komputerze. Bez zakupu sprzętu, bez instalacji i bez przygotowywania stanowisk przed lekcją.</p>
  <div class="hb"><a class="b" href="#kontakt" data-p="kontakt">Umów pokaz</a><a class="b b2" href="#zadania" data-p="zadania">Zobacz doświadczenia</a></div></div></section>
 <section class="sec"><div class="wrap"><h2>Dla kogo</h2><div class="cols3">
  <div class="tile"><h3>Szkoły</h3><p>Doświadczenia wymagane w podstawie programowej, także gdy w pracowni brakuje przyrządów albo czasu na ich rozstawienie. Uczniowie mogą powtórzyć pomiar w domu.</p></div>
  <div class="tile"><h3>Firmy korepetytorskie</h3><p>Zajęcia online z maturzystami i olimpijczykami na tym samym, prawdziwym układzie pomiarowym. Uczeń mierzy, korepetytor widzi ten sam zestaw.</p></div>
  <div class="tile"><h3>Nauczyciele i kółka olimpijskie</h3><p>${nOf} zadań doświadczalnych II etapu Olimpiady Fizycznej, odtworzonych według rozwiązań Komitetu Głównego — do treningu przed zawodami.</p></div></div></div></section>
 <section class="sec alt"><div class="wrap"><h2>Co dostajesz</h2><ul class="feats">
  <li><b>Doświadczenia z podstawy programowej</b><span>${nLo} doświadczenia z zakresu rozszerzonego, każde z odnośnikiem do punktu podstawy. Kolejne w przygotowaniu.</span></li>
  <li><b>Zadania z Olimpiady Fizycznej</b><span>Ten sam sprzęt i ta sama fizyka co w rozwiązaniach Komitetu, łącznie z pułapkami pomiarowymi.</span></li>
  <li><b>Uczeń mierzy sam</b><span>Aplikacja nie podaje wyniku. Odczyty mają rozdzielczość i szum prawdziwych przyrządów, więc liczy się niepewność pomiaru.</span></li>
  <li><b>Tryb Nauka</b><span>Siły, promienie, energia i ukryte parametry zestawu — do omówienia wyników po pomiarze.</span></li>
  <li><b>Wspólny zestaw dla klasy</b><span>Każdy zestaw ma swój kod w adresie strony. Nauczyciel wysyła link i wszyscy mierzą te same przyrządy.</span></li>
  <li><b>Bez instalacji</b><span>Działa w Chrome, Edge, Firefoksie i Safari na komputerach. Wersja na tablety jest w przygotowaniu.</span></li></ul></div></section>
 <section class="sec"><div class="wrap"><h2>Jak zacząć</h2><ol class="steps"><li><h3>Napisz do nas</h3><p>Krótko opisz, dla kogo szukasz pracowni: szkoła, firma korepetytorska, kółko olimpijskie.</p></li>
  <li><h3>Pokaz online</h3><p>Pokażemy wybrane doświadczenia na żywo i odpowiemy na pytania o program i organizację zajęć.</p></li>
  <li><h3>Dostęp dla uczniów</h3><p>Ustalimy zakres doświadczeń i sposób dostępu dopasowany do Twoich zajęć.</p></li></ol></div></section>
 <section class="sec alt"><div class="wrap faqw"><h2>Najczęstsze pytania</h2><div class="faq">
  <details><summary>Czy trzeba coś instalować?</summary><p>Nie. Wystarczy przeglądarka na komputerze. Doświadczenie można też dodać jako aplikację na pulpit.</p></details>
  <details><summary>Czy działa na tabletach i telefonach?</summary><p>Na razie pełna wersja działa na komputerach. Wersja na tablety jest w przygotowaniu; stronę i listę doświadczeń można już przeglądać na telefonie.</p></details>
  <details><summary>Czy każdy uczeń dostaje te same wyniki?</summary><p>Nie, jeśli tego nie chcesz. Każdy zestaw ma lekko inne parametry, jak prawdziwe przyrządy. Gdy klasa ma mierzyć ten sam zestaw, wystarczy wysłać jeden link.</p></details>
  <details><summary>Czy doświadczenia są zgodne z podstawą programową?</summary><p>Tak — doświadczenia licealne odpowiadają wymaganiom doświadczalnym z podstawy programowej z fizyki dla zakresu rozszerzonego (2024). Przy każdym podany jest punkt podstawy.</p></details>
  <details><summary>Skąd pochodzą zadania olimpijskie?</summary><p>To zadania doświadczalne II etapu Olimpiady Fizycznej. Układy odtworzyliśmy według opublikowanych rozwiązań Komitetu Głównego Olimpiady Fizycznej.</p></details></div></div></section>
 <section class="sec"><div class="wrap"><div class="band"><div><h2>Porozmawiajmy o Twoich zajęciach</h2><p>Odpowiemy na pytania i pokażemy doświadczenia na żywo.</p></div><a class="b" href="#kontakt" data-p="kontakt">Przejdź do kontaktu</a></div></div></section>
 ${footHTML()}</div>`}
function oprojHTML(tasks,cur){return`<div class="site">${navHTML(cur,"o-projekcie")}
 <section class="zhead"><div class="wrap"><h1>O projekcie</h1><p>Wirtualne Laboratorium powstało z prostej obserwacji: z fizyki doświadczalnej najwięcej uczy samodzielny pomiar, a do prawdziwej pracowni nie każdy ma dostęp.</p></div></section>
 <section class="sec"><div class="wrap prose"><h2>Po co</h2>
  <p>Zadania doświadczalne z Olimpiady Fizycznej i doświadczenia maturalne trudno ćwiczyć w domu: potrzebny jest sprzęt, czas na rozstawienie układu i ktoś, kto sprawdzi wynik. Symulacje, które pokazują gotową wartość na ekranie, nie uczą pomiaru.</p>
  <p>Tutaj układ wygląda i zachowuje się jak na stole w pracowni. Uczeń sam przesuwa, odchyla, przekłada przewody i odczytuje skale — a wynik zależy od tego, jak dokładnie to zrobi.</p>
  <h2>Zasady</h2><ul class="feats one">
  <li><b>Fizyka jak w rzeczywistości</b><span>Wahadło liczone bez przybliżenia małych kątów, żarówka z nagrzewającym się włóknem, dioda według równania Shockleya, odbicie według wzorów Fresnela. Każde doświadczenie ma testy, które porównują symulację ze wzorami i z wynikami Komitetu.</span></li>
  <li><b>Pomiar należy do ucznia</b><span>Aplikacja nie mierzy za ucznia. Przyrządy mają skończoną rozdzielczość i szum, więc liczy się niepewność pomiaru.</span></li>
  <li><b>Nauka osobno od pomiaru</b><span>Tryb Nauka pokazuje to, czego w pracowni nie widać: siły, promienie, energię i ukryte parametry. Włącza się go dopiero, gdy pomiar jest zrobiony.</span></li></ul>
  <h2>Co dalej</h2><p>Kolejne zadania z Olimpiady Fizycznej i doświadczenia z podstawy programowej, wersja na tablety oraz konta dla uczniów i nauczycieli.</p>
  <div class="hb"><a class="b" href="#zadania" data-p="zadania">Otwórz doświadczenia</a><a class="b b2" href="#kontakt" data-p="kontakt">Napisz do nas</a></div></div></section>
 ${footHTML()}</div>`}
function kontaktHTML(tasks,cur){return`<div class="site">${navHTML(cur,"kontakt")}
 <section class="zhead"><div class="wrap"><h1>Kontakt</h1><p>Pytania o doświadczenia, pokaz dla szkoły albo współpracę z firmą korepetytorską — napisz, odpowiemy.</p></div></section>
 <section class="sec"><div class="wrap kgrid"><form class="kform" id="kform" novalidate>
  <div class="frow2"><label>Imię i nazwisko<input name="imie" autocomplete="name" required></label><label>E-mail<input name="email" type="email" autocomplete="email" required></label></div>
  <div class="frow2"><label>Kim jesteś<select name="kto"><option>Szkoła</option><option>Firma korepetytorska</option><option>Nauczyciel</option><option>Uczeń</option><option>Inne</option></select></label><label><span>Szkoła lub firma <span class="opt">(opcjonalnie)</span></span><input name="org" autocomplete="organization"></label></div>
  <label>Wiadomość<textarea name="msg" rows="6" required></textarea></label>
  <p class="ferr" id="ferr" role="alert" hidden></p>
  <button class="b" type="submit">Wyślij wiadomość</button>
  <p class="fnote">${KONTAKT?"Po kliknięciu otworzy się Twój program pocztowy z gotową wiadomością.":"Formularz uruchomimy wkrótce. Do tego czasu odezwij się przez osobę, która przesłała Ci link."}</p></form>
  <aside class="kside"><div class="tile"><h3>Pokaz dla szkoły lub firmy</h3><p>W wiadomości podaj, ilu uczniów i jakie zajęcia planujesz — przygotujemy pokaz dopasowany do programu.</p></div>
  ${KONTAKT?`<div class="tile"><h3>E-mail</h3><p><a href="mailto:${KONTAKT}">${KONTAKT}</a></p></div>`:""}</aside></div></section>
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
 const h=location.hash.replace(/^#/,""),page=h===""?"home":STRONY.some(x=>x[0]===h)?h:"zadania";
 const R={home:homeHTML,zadania:zadHTML,szkoly:szkolyHTML,"o-projekcie":oprojHTML,kontakt:kontaktHTML};
 c.innerHTML=R[page](tasks,cur);c.scrollTop=0;document.title=(page==="home"?"":STRONY.find(x=>x[0]===page)[1]+" — ")+"Wirtualne Laboratorium";
 c.querySelectorAll(".kcb,.krb,[data-go]").forEach(b=>b.onclick=()=>{const id=b.dataset.id||b.dataset.go;if(cur===id){c.classList.remove("on");return}location.hash="#"+id});
 const go=k=>{history.pushState(null,"",k==="home"?location.pathname+location.search:"#"+k);renderCatalog(tasks)};
 c.querySelectorAll("a[data-p]").forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.p)});
 const bg=$("burger");bg.onclick=()=>{const o=c.querySelector(".nav").classList.toggle("open");bg.setAttribute("aria-expanded",o)};
 const kf=$("kform");if(kf)kf.onsubmit=e=>{e.preventDefault();const f=new FormData(kf),er=$("ferr");const bad=!f.get("imie").trim()?"Podaj imię i nazwisko.":!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.get("email"))?"Podaj poprawny adres e-mail.":!f.get("msg").trim()?"Napisz treść wiadomości.":"";
  er.hidden=!bad;er.textContent=bad;if(bad)return;if(!KONTAKT){er.hidden=false;er.textContent="Formularz nie jest jeszcze aktywny.";return}
  const body=`${f.get("msg")}\n\n— ${f.get("imie")} (${f.get("kto")}${f.get("org")?", "+f.get("org"):""})\n${f.get("email")}`;location.href=`mailto:${KONTAKT}?subject=${encodeURIComponent("Wirtualne Laboratorium — "+f.get("kto"))}&body=${encodeURIComponent(body)}`};
 const x=$("catX");if(x)x.onclick=()=>{if(TASKHASH&&location.hash!==TASKHASH)history.replaceState(null,"",TASKHASH);c.classList.remove("on")};
 if(page!=="zadania")return;
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
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);const isPage=h=>h===""||h==="#"||STRONY.some(x=>"#"+x[0]===h);
 window.addEventListener("hashchange",()=>{if(isPage(location.hash)&&!(route&&tasks.some(t=>t.id===route.id)))renderCatalog(tasks);else location.reload()});window.addEventListener("popstate",()=>{if(isPage(location.hash))renderCatalog(tasks)});
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 TASKHASH=location.hash;const s=document.createElement("script");s.src=t.file+"?v="+VERSION;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);
