/* LIX OF, II etap (2009/10) — Drgania brzeszczotu.
   Brzeszczot przyciśnięty klockiem i ściskiem do krawędzi stołu; na wolnym końcu leży spinacz.
   Fizyka: belka wspornikowa, 1. postać drgań (β₁L = 1,875), ugięcie statyczne pod własnym ciężarem, tłumienie (dobroć Q),
   podatność zamocowania (L_eff = L + δ), masa spinacza obniża częstość. Spinacz odrywa się, gdy przyspieszenie w dół > g.
   Uczeń mierzy L i amplitudę, przy której spinacz przestaje podskakiwać — sam liczy f = (1/2π)·√(g/a). */
(()=>{const{V,add,sub,mul,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const g=9.81,E=2.0e11,RHO=7850,BW=0.0125,BLEN=0.30,BX=-0.012,YC=-0.003,FLOOR=-0.75;   // brzeszczot 300×12,5 mm, oś w x=BX, krawędź klocka y=YC
const TB={x0:-0.5,x1:0.5,y0:-0.62,y1:0,th:0.028,floor:FLOOR};
const BETA=1.8751,SIG=0.7341,PHI1=2.7242;
const phi=xi=>(Math.cosh(BETA*xi)-Math.cos(BETA*xi)-SIG*(Math.sinh(BETA*xi)-Math.sin(BETA*xi)))/PHI1;   // postać drgań, φ(1)=1
const st={L:0.26,clipD:0.016,sound:true};
let simT=0,tAir=-1,tRel=0,lastDet=0,q=0,qd=0,held=false,clip={on:true,z:0,v:0,air:false},aEnv=0,lastClick=0,tJump=0;
function mech(){const h=P.h,L=st.L,Le=L+P.delta,A=BW*h,I=BW*h*h*h/12,mB=RHO*A*L;
 const f0=BETA*BETA/(2*Math.PI)*Math.sqrt(E*I/(RHO*A))/(Le*Le);const xi=Math.max(0,Math.min(1,(L-st.clipD)/L)),ph=phi(xi);
 const f=f0/Math.sqrt(1+P.mc*ph*ph/(0.2427*mB));const sag=x=>{const w=RHO*A*g;return w*x*x*(6*L*L-4*L*x+x*x)/(24*E*I)};return{f,w:2*Math.PI*f,ph,xi,sag,L,mB,acrit:g/Math.pow(2*Math.PI*f,2)/ph}}
// położenie powierzchni brzeszczotu w odległości x od klocka (z: górna powierzchnia)
const surf=(x,M)=>-M.sag(x)+q*phi(x/M.L)+0.0;
let actx=null;function click(vol){if(!st.sound)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const n=Math.floor(actx.sampleRate*0.006),b=actx.createBuffer(1,n,actx.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(n*0.18));const s=actx.createBufferSource(),gn=actx.createGain();gn.gain.value=Math.min(0.6,0.08+vol*2);s.buffer=b;s.connect(gn).connect(actx.destination);s.start()}catch(e){}}
function step(dt){simT+=dt;const M=mech();
 if(!held){const acc=-M.w*M.w*q-(M.w/P.Q)*qd;qd+=acc*dt;q+=qd*dt}
 const amp=Math.hypot(q,qd/M.w);aEnv=amp;
 // spinacz na x = L − clipD
 const x=st.L-st.clipD,zb=surf(x,M),vb=qd*M.ph,ab=(held?0:(-M.w*M.w*q-(M.w/P.Q)*qd))*M.ph;
 if(!clip.air){clip.z=zb;clip.v=vb;if(ab<-g){clip.air=true;lastDet=aEnv*M.ph;tAir=simT}}
 else{clip.v-=g*dt;clip.z+=clip.v*dt;if(clip.z<=zb){const rel=vb-clip.v;clip.z=zb;clip.v=vb;clip.air=false;tJump=0.15;const now=performance.now();if(rel>0.004&&now-lastClick>12){click(rel);lastClick=now}}}
 tJump=Math.max(0,tJump-dt)}
function bladePts(M){const pts=[],n=36,y0=YC-(BLEN-st.L);pts.push([y0,0]);pts.push([YC,0]);for(let i=1;i<=n;i++){const x=st.L*i/n;pts.push([YC+x,surf(x,M)])}return pts}
function draw(D){const M=mech(),hh=Math.max(P.h/2,0.00035),top=2*hh;
 // klocek (podkładka) na brzeszczocie i ścisk
 D.box(V(0.012,-0.06,top+0.02),V(0.04,0,0),V(0,0.057,0),V(0,0,0.02),"#b98a55",{amb:0.55,cols:["#a97c4a","#a97c4a","#c39563","#c39563","#c99b68","#a07548"]});
 S.scisk({x:0.03,zGora:top+0.04,th:0.028});
 // brzeszczot: odcinki (góra z = powierzchnia + 0)
 const pts=bladePts(M);for(let i=0;i<pts.length-1;i++){const[y0,z0]=pts[i],[y1,z1]=pts[i+1];const c=V(BX,(y0+y1)/2,(z0+z1)/2+hh),dy=(y1-y0)/2,dz=(z1-z0)/2;
  const l=Math.hypot(dy,dz);D.box(c,V(BW/2,0,0),V(0,dy,dz),V(0,-dz/l*hh,dy/l*hh),"#4d76b3",{metal:30,spec:0.55,amb:0.45})}
 // zęby — ciemny pasek przy krawędzi
 for(let i=0;i<pts.length-1;i++){const[y0,z0]=pts[i],[y1,z1]=pts[i+1];D.stripNow(V(BX+BW/2-0.0012,y0,z0+top+0.00005),V(BX+BW/2-0.0012,y1,z1+top+0.00005),0.0022,"#3d4650",3)}
 // „rozmycie” — to, co widzi oko przy szybkich drganiach: pasmo między skrajnymi położeniami
 if(!held&&aEnv>0.0006&&M.f>3){const n=24;for(let i=0;i<n;i++){const x0=st.L*i/n,x1=st.L*(i+1)/n,a0=aEnv*phi(x0/st.L),a1=aEnv*phi(x1/st.L);
  const s0=-M.sag(x0),s1=-M.sag(x1);D.quadNow([V(BX+0.0001,YC+x0,s0-a0),V(BX+0.0001,YC+x1,s1-a1),V(BX+0.0001,YC+x1,s1+a1+top),V(BX+0.0001,YC+x0,s0+a0+top)],"rgba(77,118,179,.22)")}}
 // spinacz
 const yc=YC+st.L-st.clipD,cz=clip.z+top+0.0004,w="#c7ccd2",o={n:5,metal:50,spec:0.7,caps:false};
 for(const[a,b]of[[[-0.004,-0.014],[-0.004,0.012]],[[0.004,-0.014],[0.004,0.012]],[[-0.0025,-0.009],[-0.0025,0.008]],[[0.0025,-0.009],[0.0025,0.008]]])D.cyl(V(BX+a[0],yc+a[1],cz),V(BX+b[0],yc+b[1],cz),0.0004,w,o);
 D.cyl(V(BX-0.004,yc+0.012,cz),V(BX+0.004,yc+0.012,cz),0.0004,w,o);D.cyl(V(BX-0.004,yc-0.014,cz),V(BX-0.0025,yc-0.009,cz),0.0004,w,o);D.cyl(V(BX+0.004,yc-0.014,cz),V(BX+0.0025,yc-0.009,cz),0.0004,w,o);
 // pudło na podłodze z szablonem z papieru milimetrowego (płaszczyzna x = −0.035, za brzeszczotem)
 S.karton({c:V(-0.14,0.2,FLOOR),hx:0.105,hy:0.13,hz:(-0.09-FLOOR)/2});
 const xs=-0.0345;S.papierMmNa([V(xs,0.08,0.045),V(xs,0.32,0.045),V(xs,0.32,-0.105),V(xs,0.08,-0.105)],0.24,0.15,2);
 S.tasma({c:V(xs+0.0003,0.11,-0.09),n:V(1,0,0),u:Z,dl:0.04,szer:0.02});S.tasma({c:V(xs+0.0003,0.29,-0.09),n:V(1,0,0),u:Z,dl:0.04,szer:0.02});
 // linijka na stole (do L)
 S.linijka({o:V(0.04,-0.30,0),d:V(0,1,0),w:V(1,0,0),L:0.30});
 if(TR.ruler)S.linijka({o:V(BX-BW/2,YC,top+0.0004),d:V(0,1,0),w:V(1,0,0),L:0.30,W:0.03})}   // w pokazie: linijka przyłożona do brzeszczotu, zero przy krawędzi klocka
// ---------- pokaz rozwiązania ----------
const TR={rows:[],seq:null,ruler:false};const F=(v,d)=>LAB.fmt(v,d);
function pluck(){held=false;q=-0.04;qd=0;clip.air=false;tRel=simT;tAir=-1;lastDet=0}
const quiet=()=>tAir>tRel&&simT-tAir>1.0;           // spinacz ucichł na co najmniej 1 s
function record(){const a=lastDet,f=Math.sqrt(g/a)/(2*Math.PI);TR.rows.push({L:st.L,a,f})}
const fitLog=()=>{const P=TR.rows.map(r=>[Math.log(r.L),Math.log(r.f)]);const n=P.length;if(n<2)return null;const mx=P.reduce((s,p)=>s+p[0],0)/n,my=P.reduce((s,p)=>s+p[1],0)/n;
 let sxy=0,sxx=0;for(const[x,y]of P){sxy+=(x-mx)*(y-my);sxx+=(x-mx)**2}const a=sxy/sxx;return{a,b:my-a*mx}};
const camSide=d=>({t:V(0,0.13,-0.01),yaw:Math.PI/2-0.02,pitch:0.04,dist:d||0.45});
const camEnd=()=>({t:V(-0.02,YC+st.L-0.01,-0.012),yaw:Math.PI/2-0.05,pitch:0.04,dist:0.16});
const DL=[0.24,0.21,0.18,0.15,0.12];
const TOURDEF={exit(){q=0;qd=0;TR.ruler=false},
 table:{cols:["L [cm]","a [mm]","f [Hz]","ln(L/m)","ln(f/Hz)"],rows:()=>TR.rows.map(r=>[F(r.L*100,1),F(r.a*1000,2),F(r.f,2),F(Math.log(r.L),3),F(Math.log(r.f),3)])},
 plot:()=>{const f=fitLog();return{pts:TR.rows.map(r=>[Math.log(r.L),Math.log(r.f)]),fit:f,xl:"ln(L / 1 m)",yl:"ln(f / 1 Hz)"}},
 steps:[
 {title:"Układ pomiarowy",cam:()=>({t:V(0,0.08,-0.02),yaw:2.2,pitch:0.38,dist:0.75}),min:7,enter(){TR.rows=[];TR.ruler=false;q=0;qd=0;held=false;st.L=0.27;st.clipD=0.016},
  text:`<p>Stalowy brzeszczot jest dociśnięty do krawędzi stołu drewnianym klockiem i ściskiem. Wystaje poza stół na długość <span class="fx">L</span> — to drga.</p><p>Na wolnym końcu leży zwykły spinacz biurowy, a za końcem stoi pudło z przyklejonym papierem milimetrowym: na nim odczytamy amplitudę drgań.</p>`},
 {title:"Długość części drgającej",cam:()=>({t:V(BX+0.01,YC+st.L*0.5,0.0),yaw:0.3,pitch:1.1,dist:0.55}),min:7,enter(){q=0;qd=0;TR.ruler=true},
  text:()=>`<p>Linijką mierzymy odległość od krawędzi klocka do końca brzeszczotu.</p><span class="tres">L = ${F(st.L*100,1)} cm</span><p>Hipoteza z zadania: <span class="fx">f = A·L<sup>γ</sup></span>. Żeby ją sprawdzić, potrzebujemy częstości dla kilku długości.</p>`},
 {title:"Wzbudzamy drgania",cam:()=>camSide(0.45),min:5,nauka:true,enter(){TR.ruler=false;pluck()},
  text:`<p>Odginamy koniec o około 4 cm i puszczamy. Spinacz zaczyna podskakiwać — słychać grzechotanie.</p><p>Dlaczego? Spinacz leży na brzeszczocie swobodnie. Gdy brzeszczot spada w dół z przyspieszeniem większym niż <span class="fx">g</span>, „ucieka” spod spinacza i spinacz na chwilę się odrywa.</p><p>Strzałki w trybie Nauka: fioletowa to przyspieszenie brzeszczotu, czerwona to <span class="fx">g</span>.</p>`},
 {title:"Amplituda maleje",cam:camEnd,min:4,max:60,nauka:true,until:quiet,
  text:()=>`<p>Drgania są tłumione, więc amplituda maleje. Maleje też największe przyspieszenie <span class="fx">a<sub>max</sub> = (2πf)²·A</span>.</p><p>Obserwujemy koniec brzeszczotu na tle papieru milimetrowego i czekamy na chwilę, w której spinacz przestaje podskakiwać.</p><span class="tres">amplituda przy spinaczu: ${F(aEnv*mech().ph*1000,1)} mm · spinacz ${clip.air||simT-tAir<0.15?"podskakuje":"leży"}</span>`},
 {title:"Odczyt i obliczenie f",cam:camEnd,min:9,enter(){record()},
  text:()=>{const r=TR.rows[TR.rows.length-1]||{a:1,f:0};return`<p>Spinacz ucichł, gdy amplituda na papierze wynosiła</p><span class="tres">a = ${F(r.a*1000,2)} mm</span><p>W tej chwili największe przyspieszenie brzeszczotu jest równe dokładnie <span class="fx">g</span>:</p><p><span class="fx">(2πf)²·a = g  ⇒  f = (1/2π)·√(g/a)</span></p><span class="tres">f = ${F(r.f,2)} Hz</span><p>Częstość zmierzyliśmy bez stopera — samą linijką.</p>`}},
 {title:"Kolejne długości",cam:()=>camSide(0.55),speed:3,min:3,max:400,
  enter(){TR.seq={i:0,ph:"set",t:0}},
  until(){const S=TR.seq;if(!S)return true;if(S.i>=DL.length)return true;
   if(S.ph==="set"){st.L=DL[S.i];q=0;qd=0;S.ph="go";S.t=simT}
   else if(S.ph==="go"&&simT-S.t>0.4){pluck();S.ph="wait"}
   else if(S.ph==="wait"&&quiet()){record();S.i++;S.ph="set"}
   return false},
  text:()=>{const S=TR.seq||{i:0};return`<p>Powtarzamy to samo dla krótszych brzeszczotów: wsuwamy go głębiej pod klocek, odginamy, puszczamy i czekamy, aż spinacz ucichnie.</p><span class="tres">L = ${F(st.L*100,1)} cm · pomiar ${Math.min(S.i+1,DL.length)} z ${DL.length}</span><p>Krótszy brzeszczot drga szybciej, więc spinacz ucicha przy mniejszej amplitudzie.</p>`}},
 {title:"Wykres logarytmiczny",cam:()=>({t:V(0,0.08,-0.02),yaw:2.2,pitch:0.38,dist:0.75}),min:10,enter(){q=0;qd=0},
  text:()=>{const f=fitLog();return`<p>Logarytmujemy hipotezę: <span class="fx">ln f = ln A + γ·ln L</span>. Jeśli jest prawdziwa, punkty (ln L, ln f) leżą na prostej, a jej nachylenie to <span class="fx">γ</span>.</p>${f?`<span class="tres">γ = ${F(f.a,2)}</span>`:""}<p>Punkty układają się na prostej — hipoteza się potwierdza. Teoria sprężystej belki zamocowanej jednym końcem daje <span class="fx">γ = −2</span>.</p>`}},
 {title:"Skąd odchylenie od −2",cam:()=>({t:V(0.02,-0.04,0.02),yaw:-0.5,pitch:0.45,dist:0.35}),min:8,
  text:`<p>Wynik zwykle wychodzi trochę różny od −2, i tak jest też w rozwiązaniu Komitetu. Powody:</p><p>• zamocowanie nie jest idealnie sztywne — brzeszczot ugina się też trochę pod klockiem, więc „efektywna” długość jest większa od zmierzonej,<br>• spinacz dokłada masę na końcu i obniża częstość,<br>• amplitudę odczytujemy z dokładnością do około pół milimetra.</p><p>Przy samodzielnym pomiarze warto zrobić kilka odczytów dla każdej długości i oszacować niepewność γ z rozrzutu punktów.</p>`}
]};
LAB.defineTask({id:"of59-2-brzeszczot",tour:TOURDEF,
 meta:{kicker:"LIX OF · II etap · 2009/10",title:"Drgania brzeszczotu",desc:"Brzeszczot w ścisku przy krawędzi stołu, spinacz na końcu, papier milimetrowy. Sprawdź hipotezę f = A·L^γ."},
 taskHtml:`<h2>Drgania brzeszczotu</h2><p>Hipoteza: częstość drgań brzeszczotu zamocowanego jednym końcem zależy od długości części drgającej L jak <b>f = A·L<sup>γ</sup></b>.</p>
 <p><b>Masz:</b> stalowy brzeszczot, ścisk stolarski z klockiem, papier milimetrowy (szablon za końcem brzeszczotu), spinacz biurowy, linijkę.</p>
 <p><b>Zweryfikuj hipotezę</b> i wyznacz γ.</p><p class="muted">Odegnij koniec brzeszczotu i puść. Słuchaj spinacza — póki podskakuje, słychać grzechotanie. Uwaga: krawędź brzeszczotu jest ostra.</p>`,
 hints:["Leżący spinacz odrywa się, gdy przyspieszenie brzeszczotu w dół przekracza g.","Dla drgań harmonicznych a_max = (2πf)²·a, więc w chwili, gdy spinacz przestaje podskakiwać: f = (1/2π)·√(g/a).","Wykreśl ln f od ln L — jeśli punkty leżą na prostej, jej nachylenie to γ."],
 params:{h:{min:0.00043,max:0.00048},delta:{min:0.004,max:0.010},Q:{min:60,max:95},mc:{min:0.00045,max:0.0006}},
 scene:{table:TB,draw,light:V(0.4,-0.3,1)},
 views:[{label:"Z boku",cam:()=>({t:V(0,0.13,-0.01),yaw:Math.PI/2-0.02,pitch:0.04,dist:0.45})},{label:"3D",cam:()=>({t:V(0,0.08,-0.02),yaw:2.2,pitch:0.35,dist:0.75})},
  {label:"Koniec",cam:()=>({t:V(-0.01,YC+st.L,-0.01),yaw:Math.PI/2-0.02,pitch:0.03,dist:0.13})},{label:"Ścisk",cam:()=>({t:V(0.02,-0.04,0.02),yaw:-0.5,pitch:0.45,dist:0.35})}],
 movables:[
  {id:"tip",label:"Koniec brzeszczotu",hint:"odegnij i puść",grab:()=>({p:V(BX,YC+st.L-0.003,surf(st.L-0.003,mech())),r:0.012,axis:Z,onStart:()=>{held=true;qd=0},onMove:ds=>{q=Math.max(-0.04,Math.min(0.04,q+ds))},onEnd:()=>{held=false;qd=0}})},
  {id:"blade",label:"Brzeszczot w ścisku",hint:"wysuń lub wsuń — zmienia L",grab:()=>({p:V(BX,-0.12,0.001),r:0.014,axis:V(0,1,0),onStart:()=>{q=0;qd=0},onMove:ds=>{st.L=Math.max(0.10,Math.min(0.29,st.L+ds))}})},
  {id:"clip",label:"Spinacz",hint:"przesuń wzdłuż brzeszczotu",grab:()=>({p:V(BX,YC+st.L-st.clipD,surf(st.L-st.clipD,mech())+0.002),r:0.01,axis:V(0,-1,0),onMove:ds=>{st.clipD=Math.max(0.014,Math.min(0.08,st.clipD+ds))}})}],
 actions:[
  {icon:"release",label:"Szarpnij koniec",tip:"Odegnij koniec o 2 cm i puść",run:()=>{held=false;q=-0.02;qd=0}},
  {icon:"stop",label:"Uspokój",tip:"Przytrzymaj brzeszczot palcem",run:()=>{q=0;qd=0}},
  {icon:"slow",label:()=>st.sound?"Dźwięk: wł.":"Dźwięk: wył.",tip:"Stukot spinacza",run:()=>{st.sound=!st.sound}}],
 learn(D,c,viz){const M=mech();viz.panel(c,[["L",LAB.fmt(st.L*100,1)+" cm"],["f (prawdziwa)",LAB.fmt(M.f,2)+" Hz"],["amplituda przy spinaczu",LAB.fmt(aEnv*M.ph*1000,1)+" mm"],
   ["próg oderwania g/(2πf)²",LAB.fmt(g/Math.pow(2*Math.PI*M.f,2)*1000,2)+" mm"],["spinacz",clip.air||tJump>0?"podskakuje":"leży"],["ugięcie statyczne końca",LAB.fmt(M.sag(st.L)*1000,1)+" mm"]]);
  const yc=YC+st.L-st.clipD,p=V(BX,yc,surf(st.L-st.clipD,M)+0.004);const ab=-M.w*M.w*q*M.ph;viz.arrow(c,D,p,V(0,0,Math.max(-0.05,Math.min(0.05,ab/g*0.02))),"#8e44ad","a brzeszczotu");viz.arrow(c,D,add(p,V(0,0.006,0)),V(0,0,-0.02),"#c0392b","g")},
 init(env){P=env.P;gauss=env.gauss||gauss;window.OF59_TEST={st,P:()=>P,mech,step,set:(a,b)=>{q=a;qd=b;held=false},clip:()=>clip,amp:()=>aEnv,lastDet:()=>lastDet}},
 update(dt){const n=Math.ceil(dt/0.0004);for(let i=0;i<n;i++)step(dt/n)},
 status(){return held?"trzymasz odgięty koniec":aEnv>0.0005?(clip.air||tJump>0?"drga — spinacz podskakuje":"drga"):""},
 getState:()=>({...st,q:Math.round(q*1e5),cz:Math.round(clip.z*1e5)}),setState(o){st.L=o.L??st.L;st.clipD=o.clipD??st.clipD;st.sound=o.sound??st.sound}});
})();
