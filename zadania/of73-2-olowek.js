/* LXXIII OF, zawody II stopnia, część doświadczalna (18.02.2024) — współczynnik tarcia statycznego wkładu ołówka o papier.
   Układ wzorcowy wg rozwiązania: nić przyklejona do pionowej ściany pudła na wysokości y, drugi koniec do niezatemperowanego końca
   ołówka (P); grafit opiera się o kartkę. Kartkę ciągnie się powoli od pudła aż do zerwania tarcia. W granicy:
   f = 1/(ctg β − 2 tg α), ctg β = √(L² − x_P²)/x_P, tg α = y_P/√(d² − y_P²).
   Oś x: od ściany pudła, z: w górę, y: wzdłuż ściany (płaszczyzna ołówka y = 0). */
(()=>{
const{V,add,sub,mul,dot,len,nrm,cross,Z,fmt,num}=LAB;
const D_P=0.176,BOXH=0.45,PAPW=0.297,LOPTS=[0.357,0.338,0.32];
let f0,kappa,phases,gauss,PR;
function syncParams(){f0=PR.f0;kappa=PR.kappa;phases=[[260,PR.ph1,0.55],[610,PR.ph2,0.35],[1350,PR.ph3,0.25]]}
const VIEWS0=()=>({t:V(0.12,0,0.09),yaw:-0.06,pitch:0.07,dist:0.5});
const st={zA:0.405,Li:0,off:0,r:0.06,Xt:0.2,mark:null,held:false,stuck:true,laid:false,lay:0.012};
let dots=[],slide=null,firstUse=0,lastSlip=null,trail=[],paperT=-1,simT=0;const FK=0.8;
const Lc=()=>LOPTS[st.Li];
const A=()=>V(0,0,st.zA);
function noiseP(p){let s=0;for(const[k,ph,a]of phases)s+=a*Math.sin(p*k+ph);return s}
const angF=tanA=>Math.max(0.55,Math.min(1.8,1+kappa*(tanA-0.34)));
function fLoc(tanA,paperPos){return f0*angF(tanA)*(1+0.07*noiseP(paperPos))}
const fTrue=tanA=>f0*angF(tanA);
// geometria dla położenia końcówki Xt
function cfg(Xt){const L=Lc(),zA=st.zA;const dx=Xt,dz=-zA,Dd=Math.hypot(dx,dz);if(Dd>L+D_P-1e-6||Dd<Math.abs(L-D_P)+1e-6)return null;
 const a=(L*L-D_P*D_P+Dd*Dd)/(2*Dd),h=Math.sqrt(Math.max(0,L*L-a*a));const bx=a*dx/Dd,bz=zA+a*dz/Dd;const px=-dz/Dd,pz=dx/Dd;
 const c=[[bx+h*px,bz+h*pz],[bx-h*px,bz-h*pz]].filter(p=>p[0]>0.002&&p[0]<Xt&&p[1]>0.003).sort((p,q)=>q[1]-p[1]);if(!c.length)return null;
 const[Px,Pz]=c[0];const sa=Pz/D_P,ca=(Xt-Px)/D_P,sb=Px/L,cb=(zA-Pz)/L;const c2=ca*cb-sa*sb;if(c2<=0.02)return null;
 const N=ca/(2*c2),T=N*sb,R=1-N*cb; // w jednostkach mg
 return{P:V(Px,0,Pz),tip:V(Xt,0,0),tanA:sa/ca,ctgB:cb/sb,ratio:R>1e-4?T/R:Infinity,R,N,T,alpha:Math.atan2(sa,ca),beta:Math.atan2(sb,cb)}}
function startX(){const L=Lc(),px=0.022;const pz=st.zA-Math.sqrt(L*L-px*px);if(pz<=0.003||pz>=D_P)return null;return px+Math.sqrt(D_P*D_P-pz*pz)}
function newTrial(msg){const x=startX();if(x==null){LAB.flash("Przy tej wysokości zaczepu nie da się oprzeć ołówka — przesuń zaczep.");return}
 st.Xt=x;st.held=false;st.laid=false;st.off=Math.max(st.Xt-0.297,Math.min(st.Xt-0.05,st.off));st.stuck=true;slide=null;lastSlip=null;if(msg)LAB.flash(msg)}
// Fizyka tarcia (ołówek jest lekki — jego bezwładność pomijamy):
// • przylganie: końcówka jedzie razem z kartką, dopóki potrzebne tarcie |T/R| ≤ f_s (lokalne, zależne od miejsca na kartce);
// • zerwanie: tarcie spada do kinetycznego f_k = 0,8·f_s, końcówka szybko cofa się do położenia, w którym |T/R| = f_k
//   (widoczny skok), i dopóki kartka jedzie — ślizga się tam ciągle, a kreska grafitu rośnie;
// • gdy kartka stanie lub zawróci, prędkość względna znika → przylganie w miejscu, w którym końcówka jest.
const fsAt=X=>{const c=cfg(X);return c?fLoc(c.tanA,X-st.off):0};
// w poślizgu grafit „uśrednia” papier, więc tarcie kinetyczne liczymy bez lokalnych nierówności kartki
function gK(X,sign,k){const c=cfg(X);if(!c||!isFinite(c.ratio))return NaN;return c.ratio*sign-k*fTrue(c.tanA)}
// położenie, w którym potrzebne tarcie |T/R| = k·f_s (szukane w obie strony od bieżącego, potem bisekcja)
function eqX(sign,k){k=k??FK;const x0=st.Xt,g0=gK(x0,sign,k);if(!isFinite(g0))return x0;const dir=g0>0?-sign:sign;let a=x0,ga=g0,b=x0,gb=g0;
 for(let i=0;i<300;i++){b=a+dir*0.0005;gb=gK(b,sign,k);if(!isFinite(gb))return a;if((gb>0)!==(g0>0))break;a=b;ga=gb}if((gb>0)===(g0>0))return a;
 for(let i=0;i<30;i++){const m=(a+b)/2,gm=gK(m,sign,k);if(!isFinite(gm))break;if((gm>0)===(ga>0)){a=m;ga=gm}else{b=m;gb=gm}}return(a+b)/2}
function checkSlip(){if(st.held||slide||st.laid)return;const c=cfg(st.Xt);if(!c)return;
 const lim=fsAt(st.Xt);if(c.ratio>lim||c.ratio<-lim){const sign=c.ratio>0?1:-1;lastSlip={xp:c.P.x,yp:c.P.z};st.stuck=false;slide={sign,target:eqX(sign,FK)}}}
function stick(){if(slide){dots.push(st.Xt-st.off);if(dots.length>200)dots.shift()}slide=null;st.stuck=true}
const paperMoving=()=>simT-paperT<0.25; // kartka „stoi”, gdy od 0,25 s nie drgnęła (ręka nigdy nie ciągnie idealnie płynnie)
function step(dt){simT+=dt;if(!slide||st.laid||st.held)return;slide.target=eqX(slide.sign,FK);
 const x0=st.Xt,d=slide.target-st.Xt;st.Xt+=d*Math.min(1,dt*30);if(Math.abs(d)<2e-5)st.Xt=slide.target;addTrail(x0-st.off,st.Xt-st.off);
 if(!paperMoving()){stick();checkSlip()}}
// ślad grafitu na kartce: suma przedziałów (współrzędne kartki) — nic się nie „zmazuje”
function addTrail(a,b){if(Math.abs(a-b)<1e-5)return;let lo=Math.min(a,b),hi=Math.max(a,b);
 for(let i=trail.length-1;i>=0;i--){const t=trail[i];if(t[0]<=hi+2e-4&&t[1]>=lo-2e-4){lo=Math.min(lo,t[0]);hi=Math.max(hi,t[1]);trail.splice(i,1)}}
 trail.push([lo,hi]);if(trail.length>400)trail.shift()}
function paperRange(){const lo=Math.max(-0.019,st.Xt-0.297),hi=st.Xt-0.05;return[lo,hi]}
function movePaper(ds){if(st.laid){st.off=Math.max(-0.019,Math.min(0.28,st.off+ds));return}
 // kartka nie wchodzi pod pudło i nie wysuwa się spod końcówki ołówka
 let[lo,hi]=paperRange();let no=st.off+ds;
 if(!slide&&!st.held){if(ds>0&&st.Xt-st.off<0.05){LAB.flash("Koniec kartki — przesuń ją z powrotem albo wymień.");return}no=Math.max(-0.019,no)} // końcówka jedzie z kartką: ogranicza tylko pudło i koniec kartki
 else if(ds>0)no=Math.min(no,Math.max(st.off,hi));else no=Math.max(no,Math.min(st.off,lo));const d=no-st.off;if(!d)return;
 if(!slide&&!st.held&&!cfg(st.Xt+d)){st.off=no;paperT=simT;addTrail(st.Xt-st.off+d,st.Xt-st.off);return} // dalej się nie da — kartka ślizga się pod końcówką
 st.off=no;paperT=simT;
 if(st.held){st.Xt+=d;return}
 if(slide){if(Math.sign(d)!==slide.sign){stick();st.Xt+=d;checkSlip();return}addTrail(st.Xt-st.off+d,st.Xt-st.off);return} // kartka jedzie pod ślizgającą się końcówką
 st.Xt+=d;checkSlip()}

// ---------- rysowanie ----------
const X=V(1,0,0),Y=V(0,1,0);
// Scena: wyłącznie przedmioty z biblioteki LAB.sprzet (wspólny wygląd dla wszystkich zadań)
const S=LAB.sprzet;
function draw(D){const c=cfg(st.Xt);const P=c?c.P:V(0.03,0,0.02),tip=V(st.Xt,0,0);
 const o=st.off,p0=0.02+o,p1=p0+PAPW;
 S.kartka({x0:p0,x1:p1,y0:-0.105,y1:0.105});                                        // kartka A4 (ciągnięta)
 S.papierMm({x0:0.30,x1:0.51,y0:0.13,y1:0.33,z:0.0002});                            // papier milimetrowy z zestawu
 for(const x of dots)D.stripNow(V(x+o-0.0005,0,0.00055),V(x+o+0.0005,0,0.00055),0.0009,"rgba(30,30,35,.85)");   // ślad grafitu
 for(const[t0,t1]of trail)D.stripNow(V(t0+o,0,0.0005),V(Math.max(t1,t0+0.0004)+o,0,0.0005),0.0005,"rgba(50,50,55,.8)");
 if(st.mark!=null){const mx=st.mark+o;D.lineNow(V(mx-0.003,0.014,0.0006),V(mx+0.003,0.020,0.0006),0.0006,"#555");D.lineNow(V(mx-0.003,0.020,0.0006),V(mx+0.003,0.014,0.0006),0.0006,"#555")}
 S.linijka({o:V(0,-0.016,0),d:X,w:V(0,-1,0),L:0.60,W:0.03});                        // linijka pozioma 60 cm
 S.karton({c:V(-0.15,0,0),hx:0.15,hy:0.18,hz:BOXH/2});                               // karton (ściana x = 0)
 S.tasma({c:V(0,0,st.zA),n:X,u:Y,dl:0.04,szer:0.026});                               // taśma z zaczepem nici
 if(st.laid){const y0=-0.058,a0=st.lay,Pl=V(a0+D_P,y0,0.004),tl=V(a0,y0,0.004);S.olowek(Pl,tl);const e=V(a0+D_P+Lc(),y0,0.0007);
  S.nic([add(Pl,V(0.004,0,-0.003)),e]);S.tasma({c:V(e.x+0.003,y0,0.0002),n:Z,u:X,dl:0.018,szer:0.018})}
 else{S.nic([A(),P]);S.olowek(P,tip)}
 S.klips({c:V(p1+0.008,-0.0875,0)});                                                  // klips do ciągnięcia kartki
 S.linijka({o:V(st.r,-0.008,0),d:Z,w:X,L:0.20,W:0.03,przezroczysta:true});           // linijka pionowa (przezroczysta)
}

LAB.defineTask({id:"of73-2-olowek",
 meta:{kicker:"LXXIII Olimpiada Fizyczna · zawody II stopnia · część doświadczalna · 18.02.2024",title:"Tarcie ołówka o papier",
  desc:"Wyznacz współczynnik tarcia statycznego wkładu ołówka o papier, mając ołówek, kartkę, linijkę, tekturowe pudło, nić, taśmę klejącą i nożyczki.",start:"Wejdź do laboratorium"},
 taskHtml:`<h2>Treść zadania</h2><p><b>Masz:</b> ołówek, kartkę papieru, równy poziomy blat, linijkę, tekturowe pudło, nić, taśmę klejącą, nożyczki, papier milimetrowy.</p>
 <p><b>Wyznacz współczynnik tarcia statycznego wkładu ołówka o papier.</b></p>
 <ul class="small"><li>Używaj dostarczonego ołówka i czystej białej kartki; nie trzyj ołówkiem o papier milimetrowy.</li><li>Nie wolno niszczyć ołówka (zdejmować obudowy, wyjmować wkładu, temperować).</li></ul>`,
 hints:[{title:"Podpowiedź: układ z rozwiązania",html:"Nić przyklejona do pudła na wysokości y, drugi koniec do niezatemperowanego końca ołówka (P); grafit opiera się o kartkę. Kartkę powoli odsuwa się od pudła; w chwili poślizgu zatrzymuje się ją, ołówek przykłada z powrotem do znacznika i mierzy x<sub>P</sub> (odległość P od ściany) oraz y<sub>P</sub> (wysokość P). Druga seria z inną długością nici zmienia kąt nachylenia ołówka."},{title:"Podpowiedź: teoria",html:"T = R/(ctg β − 2 tg α) ⇒ f = 1/(ctg β − 2 tg α), gdzie ctg β = √(L² − x<sub>P</sub>²)/x<sub>P</sub>, tg α = y<sub>P</sub>/√(d² − y<sub>P</sub>²). Wystarczą x<sub>P</sub>, y<sub>P</sub>, d, L. Wyznaczanie β z cos β = (y − y<sub>P</sub>)/L jest niedokładne przy małym β — sinus jest wtedy czulszy."}],
 // ukryte parametry — losowane z numeru zestawu (realistyczne granice); „Wymień kartkę” lekko je zmienia
 params:{f0:{min:0.20,max:0.30},kappa:{min:3,max:5.5},ph1:{min:0,max:6.283},ph2:{min:0,max:6.283},ph3:{min:0,max:6.283}},
 scene:{light:V(0.35,-0.5,1),table:{x0:-0.6,x1:0.85,y0:-0.42,y1:0.38},draw},
 views:[{label:"Z boku",cam:()=>({t:V(0.12,0,0.09),yaw:-0.06,pitch:0.07,dist:0.5})},{label:"3D",cam:()=>({t:V(0.06,0,0.12),yaw:0.75,pitch:0.38,dist:0.8})},{label:"Z góry",cam:()=>({t:V(0.15,0,0),yaw:0,pitch:1.56,dist:0.7})},{label:"Styk",cam:()=>({t:V(st.Xt,0,0.01),yaw:-0.4,pitch:0.25,dist:0.12})}],
 movables:[
  {id:"paper",label:"Kartka",hint:"ciągnij powoli od pudła",grab:()=>({p:V(0.02+st.off+PAPW+0.008,-0.0875,0.004),r:0.012,axis:V(1,0,0),onMove:movePaper})},
  {id:"ruler",label:"Linijka pionowa",hint:"dosuń do końca ołówka",grab:()=>({p:V(st.r+0.015,-0.008,0.1),r:0.015,axis:V(1,0,0),onMove:ds=>{st.r=Math.max(0,Math.min(0.26,st.r+ds))}})},
  {id:"anchor",label:"Zaczep nici",hint:"przyklej wyżej lub niżej",grab:()=>({p:A(),r:0.012,axis:V(0,0,1),onStart:()=>{st.held=false},onMove:ds=>{const L=Lc();st.zA=Math.max(L+0.015,Math.min(Math.min(BOXH-0.01,L+0.12),st.zA+ds));if(!slide)checkSlip()}})}],
 actions:[
  {icon:"pencil",label:"Oprzyj ołówek",tip:"Opierasz grafit o kartkę tuż przy pudle",run:()=>{newTrial();slide=null}},
  {icon:"mark",label:"Zaznacz styk",tip:"Stawiasz krzyżyk na kartce obok końcówki",run:()=>{if(st.laid)return;st.mark=st.Xt-st.off;LAB.flash("Krzyżyk postawiony.")}},
  {icon:"pin",label:"Przytrzymaj przy znaczniku",tip:"Przykładasz końcówkę do krzyżyka i trzymasz",run:()=>{if(st.laid)return;if(st.mark==null){LAB.flash("Na kartce nie ma znacznika.");return}const X0=st.mark+st.off;if(!cfg(X0)){LAB.flash("Ołówek nie sięga do znacznika.");return}st.Xt=X0;st.held=true;slide=null}},
  {icon:"release",label:"Puść ołówek",tip:"Zabierasz rękę",run:()=>{if(!st.held)return;st.held=false;checkSlip()}},
  {icon:"paper",label:"Wymień kartkę",tip:"Czysta kartka — bez śladów i znaczników; każda kartka ma nieco inną powierzchnię",run:()=>{trail=[];dots=[];st.mark=null;st.off=0;LAB.params.jitter(["f0"],0.04);LAB.params.reroll(["ph1","ph2","ph3"]);syncParams();newTrial()}},
  {icon:"thread",label:"Zawiąż nową nić",tip:"Nić innej długości — zmienia się geometria",run:()=>{st.Li=(st.Li+1)%LOPTS.length;const L=Lc();st.zA=Math.max(L+0.02,Math.min(L+0.06,st.zA));newTrial("Nowa nić, inna długość.")}},
  {icon:"ruler",label:()=>st.laid?"Zawieś ołówek":"Połóż przy linijce",tip:"Zdejmujesz ołówek z nicią i kładziesz przy linijce, żeby zmierzyć d i L",run:()=>{if(st.laid){st.laid=false;newTrial();return}st.laid=true;st.held=false;slide=null;st.lay=0.006+Math.random()*0.02;LAB.goCam({t:V(0.3,-0.05,0),yaw:0,pitch:1.2,dist:0.55},900)}}],
 learn(D,c,viz){if(st.laid)return;const k=cfg(st.Xt);if(!k)return;const P=k.P,tip=k.tip,u=mul(sub(tip,P),1/D_P),G=add(P,mul(u,D_P/2)),S=0.045,a=A();
  const sgn=slide?slide.sign:1,R=k.R,T=slide?sgn*FK*fLoc(k.tanA,st.Xt-st.off)*R:k.ratio*R;
  viz.line(c,D,V(0,0,0),V(0.3,0,0),"rgba(0,0,0,.25)",true);
  viz.arrow(c,D,G,V(0,0,-S),"#1d4ed8","mg");viz.arrow(c,D,P,mul(nrm(sub(a,P)),k.N*S),"#7c3aed","N");
  viz.arrow(c,D,tip,V(0,0,R*S),"#059669","R");viz.arrow(c,D,tip,V(T*S*5,0,0),"#dc2626","T (×5)");
  viz.arc(c,D,tip,V(-1,0,0),V(0,0,1),k.alpha,0.028,"α","#b45309");viz.line(c,D,P,add(P,V(0,0,0.06)),"rgba(0,0,0,.35)",true);
  viz.arc(c,D,P,Z,V(-1,0,0),k.beta,0.035,"β","#7c3aed");
  viz.dim(c,D,V(0,0,P.z+0.012),V(P.x,0,P.z+0.012),"x_P","#333");viz.dim(c,D,V(P.x,0,0),V(P.x,0,P.z),"y_P","#333");
  const fs=fsAt(st.Xt);
  viz.panel(c,[["α (ołówek–kartka)",fmt(k.alpha*180/Math.PI,1)+"°"],["β (nić–pion)",fmt(k.beta*180/Math.PI,1)+"°"],["x_P, y_P",fmt(P.x*100,1)+" cm, "+fmt(P.z*100,1)+" cm"],
   ["N, R, T  (× mg)",fmt(k.N,2)+", "+fmt(R,2)+", "+fmt(Math.abs(T),3)],["T/R potrzebne",fmt(Math.abs(k.ratio),3),"#dc2626"],["f_s w tym miejscu kartki",fmt(fs,3)],["stan",slide?"poślizg (f_k = "+fmt(FK*fs,3)+")":st.held?"trzymany ręką":"spoczynek"]])},
 init(env){gauss=env.gauss;PR=env.P;syncParams();newTrial()},
 getState:()=>({...st,trail,dots}),
 setState(o){if(Array.isArray(o.trail))trail=o.trail;if(Array.isArray(o.dots))dots=o.dots;const{trail:_t,dots:_d,__params:_p,...rest}=o;Object.assign(st,rest);st.laid=false;slide=null;syncParams();if(!cfg(st.Xt))newTrial()},
 start(resumed){LAB.goCam(VIEWS0(),1800);if(!resumed)setTimeout(()=>LAB.showHint("Złap kartkę i ciągnij ją powoli w prawo. Obserwuj końcówkę — sam zdecyduj, kiedy przestać.",9000),1900)},
 update(dt){const n=Math.ceil(dt/0.002);for(let i=0;i<n;i++)step(dt/n)},
 status(){return st.laid?"ołówek zdjęty — leży przy linijce":st.held?"trzymasz końcówkę przy znaczniku":""}});
window.OF73_TEST={st,cfg,fLoc,fTrue,get f0(){return f0},checkSlip,newTrial,step,get slide(){return slide},movePaper,eqX,get trail(){return trail}};
})();
