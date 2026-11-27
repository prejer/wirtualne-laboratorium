/* Liceum (podstawa programowa, zakres rozszerzony, V.8 a, b, e) — Wahadło matematyczne: wyznaczanie przyspieszenia ziemskiego.
   Fizyka: pełne równanie θ'' = −(g/L)·sinθ − b·θ' (bez przybliżenia małych kątów — przy dużych wychyleniach okres rośnie),
   L liczone do środka kulki; ukryte: przesunięcie zaczepu (węzeł), tłumienie. Uczeń sam mierzy L taśmą i czas stoperem. */
(()=>{const{V,add,sub,mul,len,nrm,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const g=9.81,FLOOR=-0.75,TB={x0:-0.6,x1:0.6,y0:-0.6,y1:0,th:0.028,floor:FLOOR};
const H=0.72,PIV=V(0,0.11,H),RB=0.012;                     // zaczep nici, promień kulki
const st={L:0.80,th:0,om:0,held:false,t:0,run:false,maxTh:0};let tHalf=[],lastSign=0,tSim=0;
const Lc=()=>st.L+RB+P.knot;                              // długość do środka kulki (z ukrytym przesunięciem węzła)
const bob=()=>add(PIV,V(Lc()*Math.sin(st.th),0,-Lc()*Math.cos(st.th)));
function step(dt){if(st.run)st.t+=dt;tSim+=dt;if(st.held)return;const L=Lc();
 // RK4 dla θ'' = −(g/L)sinθ − bθ' − c·θ'|θ'| (opór powietrza)
 const f=(th,om)=>-(g/L)*Math.sin(th)-P.b*om-P.c*om*Math.abs(om)*L;const k1t=st.om,k1o=f(st.th,st.om),k2t=st.om+k1o*dt/2,k2o=f(st.th+k1t*dt/2,st.om+k1o*dt/2),
  k3t=st.om+k2o*dt/2,k3o=f(st.th+k2t*dt/2,st.om+k2o*dt/2),k4t=st.om+k3o*dt,k4o=f(st.th+k3t*dt,st.om+k3o*dt);
 const th0=st.th;st.th+=dt/6*(k1t+2*k2t+2*k3t+k4t);st.om+=dt/6*(k1o+2*k2o+2*k3o+k4o);
 const s=Math.sign(st.th);if(s!==0&&lastSign!==0&&s!==lastSign)tHalf.push(tSim-dt*Math.abs(st.th)/(Math.abs(st.th-th0)||1));if(s)lastSign=s;if(tHalf.length>8)tHalf.shift()}
function periodMeas(){if(tHalf.length<3)return null;return 2*(tHalf[tHalf.length-1]-tHalf[0])/(tHalf.length-1)}
function draw(D){S.statyw({baza:V(0,-0.27,0),H,belka:0.42,belkaY:-0.08});
 // zacisk na końcu poprzeczki i nić
 D.box(add(PIV,V(0,0,-0.004)),V(0.01,0,0),V(0,0.008,0),V(0,0,0.008),"#26292e",{metal:15});const b=bob(),top=add(PIV,V(0,0,-0.012));
 S.nic([top,add(b,mul(nrm(sub(top,b)),RB))],{grubosc:0.0006,kolor:"#efefe6"});D.sphere(b,RB,"#c4cad1",{metal:70,spec:0.9,amb:0.35,nl:22,n:36});
 // taśma miernicza zwisająca z poprzeczki (zero na krawędzi zacisku), stoper i kątomierz-tektura za nicią
 S.miarka({o:add(PIV,V(0.014,0.003,-0.012)),d:V(0,0,-1),w:V(1,0,0),L:1.4,W:0.016});
 S.stoper({c:V(0.16,-0.07,0),czas:st.t,biegnie:st.run});
 // kątomierz kartonowy przyklejony za zaczepem (do oceny amplitudy)
 const kc=add(PIV,V(0,0.012,-0.012));for(let a=-40;a<=40;a+=5){const r0=a%10?0.085:0.075,u=V(Math.sin(a*Math.PI/180),0,-Math.cos(a*Math.PI/180));D.lineNow(add(kc,mul(u,r0)),add(kc,mul(u,0.095)),0.0006,"#333")}
 D.quadNow([add(kc,V(-0.07,0.0005,0)),add(kc,V(0.07,0.0005,0)),add(kc,V(0.07,0.0005,-0.1)),add(kc,V(-0.07,0.0005,-0.1))],"rgba(240,232,214,.85)")}
LAB.defineTask({id:"lo-wahadlo",
 meta:{kicker:"Liceum · matura rozszerzona · V.8",title:"Wahadło matematyczne — wyznaczanie g",desc:"Statyw, nić, stalowa kulka, taśma miernicza i stoper. Zbadaj T(L) i wyznacz przyspieszenie ziemskie."},
 taskHtml:`<h2>Wahadło matematyczne</h2><p><b>Masz:</b> statyw z poprzeczką, nić, stalową kulkę (średnica 24 mm), taśmę mierniczą, stoper i kątomierz z tektury.</p>
 <p><b>Zadania:</b> 1) Pokaż, że okres małych drgań nie zależy od amplitudy. 2) Zbadaj zależność okresu od długości wahadła. 3) Wyznacz przyspieszenie ziemskie g.</p>
 <p class="muted">Odchyl kulkę i puść. Mierz czas kilkunastu pełnych wahnięć, a nie jednego — błąd refleksu rozłoży się na wszystkie. Długość wahadła to odległość od zaczepu do środka kulki.</p>`,
 hints:["Dla małych wychyleń T = 2π√(L/g). Zmierz czas np. 20 wahnięć i podziel przez 20.","Wykres T² od L to prosta T² = (4π²/g)·L. Z nachylenia a: g = 4π²/a. Prosta nie musi przechodzić przez zero — przesunięcie zdradza błąd pomiaru długości.","Przy wychyleniu 30° okres jest dłuższy o ok. 1,7 %, przy 60° — o 7 %. Sprawdź to sam."],
 params:{knot:{min:-0.004,max:0.006},b:{min:0.004,max:0.009},c:{min:0.01,max:0.02}},
 scene:{table:TB,draw,light:V(0.3,0.5,1)},
 views:[{label:"Z boku",cam:()=>({t:V(0,0.11,0.06),yaw:Math.PI,pitch:0.04,dist:2.0})},{label:"3D",cam:()=>({t:V(0,0,0.1),yaw:2.6,pitch:0.3,dist:1.9})},
  {label:"Kulka",cam:()=>({t:add(PIV,V(0,0,-Lc())),yaw:Math.PI,pitch:0.05,dist:0.35})},{label:"Zaczep",cam:()=>({t:add(PIV,V(0,0,-0.04)),yaw:Math.PI-0.25,pitch:0.15,dist:0.25})},
  {label:"Stoper",cam:()=>({t:V(0.16,-0.07,0.01),yaw:0.0,pitch:1.1,dist:0.2})}],
 movables:[
  {id:"bob",label:"Kulka",hint:"odchyl i puść",grab:()=>({p:bob(),r:0.02,axis:V(Math.cos(st.th),0,Math.sin(st.th)),onStart:()=>{st.held=true;st.om=0},onMove:ds=>{st.th=Math.max(-1.3,Math.min(1.3,st.th+ds/Lc()))},onEnd:()=>{st.held=false;st.om=0;tHalf=[];lastSign=0}})},
  {id:"len",label:"Długość nici",hint:"przeciągnij nić przez zacisk",grab:()=>({p:add(PIV,V(0,0,-0.03)),r:0.012,axis:Z,onStart:()=>{st.th=0;st.om=0},onMove:ds=>{st.L=Math.max(0.15,Math.min(1.35,st.L-ds*2))}})}],
 actions:[
  {icon:"release",label:"Odchyl o 10° i puść",tip:"Małe wychylenie",run:()=>{st.held=false;st.th=10*Math.PI/180;st.om=0;tHalf=[];lastSign=0}},
  {icon:"stop",label:"Zatrzymaj kulkę",tip:"Złap kulkę ręką",run:()=>{st.th=0;st.om=0;tHalf=[]}},
  {icon:"slow",label:()=>st.run?"Stoper: stop":"Stoper: start",tip:"Start / stop stopera",run:()=>{st.run=!st.run}},
  {icon:"wipe",label:"Stoper: zeruj",tip:"Wyzeruj stoper",run:()=>{st.t=0}}],
 learn(D,c,viz){const L=Lc(),T0=2*Math.PI*Math.sqrt(L/g),A=Math.max(Math.abs(st.th),Math.hypot(st.th,st.om*Math.sqrt(L/g)));const k=Math.sin(A/2),Tn=T0*(1+k*k/4+9*k**4/64);const Tm=periodMeas();
  const v=st.om*L,h=L*(1-Math.cos(st.th)),Ek=v*v/2,Ep=g*h,Et=Ek+Ep||1;
  viz.panel(c,[["L (do środka kulki)",LAB.fmt(L*100,1)+" cm"],["amplituda",LAB.fmt(A*180/Math.PI,1)+"°"],["T = 2π√(L/g)",LAB.fmt(T0,3)+" s"],["T dla tej amplitudy",LAB.fmt(Tn,3)+" s"],
   ["T z ruchu (ostatnie wahnięcia)",Tm?LAB.fmt(Tm,3)+" s":"—"],["energia: kinetyczna / potencjalna",Math.round(100*Ek/Et)+"% / "+Math.round(100*Ep/Et)+"%"]]);
  const b=bob(),m=0.07,Tn2=m*(Math.cos(st.th)+st.om*st.om*L/g);viz.arrow(c,D,b,V(0,0,-m),"#c0392b","mg");viz.arrow(c,D,b,mul(nrm(sub(PIV,b)),Tn2),"#2471a3","N");
  const tg=V(Math.cos(st.th),0,Math.sin(st.th));viz.arrow(c,D,b,mul(tg,-m*Math.sin(st.th)),"#8e44ad","mg·sinθ");viz.line(c,D,PIV,add(PIV,V(0,0,-L)),"rgba(0,0,0,.35)",true)},
 init(env){P=env.P;gauss=env.gauss||gauss;window.LOW_TEST={st,P:()=>P,step,Lc,periodMeas,reset:()=>{tHalf=[];lastSign=0;tSim=0}}},
 update(dt){const n=Math.max(1,Math.ceil(dt/0.002));for(let i=0;i<n;i++)step(dt/n)},
 status(){return st.held?"trzymasz kulkę":Math.abs(st.th)+Math.abs(st.om)>0.003?"waha się":""},
 getState:()=>({L:st.L,th:Math.round(st.th*1e4),t:Math.floor(st.t*100),run:st.run}),setState(o){if(o.L)st.L=o.L}});
})();
