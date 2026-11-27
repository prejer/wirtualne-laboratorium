/* LXXI OF, II etap (2021/22) — Obwód RC: opór i dwie pojemności (czarna skrzynka o trzech wyprowadzeniach).
   Wnętrze (ukryte): 1 —C1— X —C2— 3, opornik R między X a 2. Woltomierz ma opór wewnętrzny 1 MΩ.
   Fizyka: pełna analiza obwodu (węzły 1,2,3,X), kondensatory jako stany, bateria z oporem wewnętrznym,
   całkowanie niejawne (sztywny układ: ładowanie z baterii w mikrosekundach, rozładowanie w minutach). */
(()=>{const{V,add,mul,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const RW=1e6,RB=0.6,RLEAK=8e10;const TB={x0:-0.5,x1:0.5,y0:-0.35,y1:0.35};
const BOX=V(0,0.06,0),TERM=[V(-0.036,0.045,0.042),V(0,0.045,0.042),V(0.036,0.045,0.042)];   // zaciski 1,2,3 (względem BOX)
const MET=V(0.24,-0.09,0),BAT=V(-0.24,-0.04,0),STP=V(0.06,-0.16,0);
const ZAK=[{n:"OFF"},{n:"200 mV",max:0.1999,f:v=>(v*1000).toFixed(1)},{n:"2 V",max:1.999,f:v=>v.toFixed(3)},{n:"20 V",max:19.99,f:v=>v.toFixed(2)}];
// przewody: miernik V(+), COM(−), bateria +, bateria −; wartość: 0 = odłączony, 1..3 = zacisk
const st={mV:0,mC:0,bP:0,bM:0,zak:3,U1:0,U2:0,t:0,run:false,odczyt:""};let tDisp=0;
const term=i=>add(add(BOX,TERM[i-1]),V(0,0,0));
function elements(){const E=[];const UB=P.UB;
 if(st.mV&&st.mC&&st.mV!==st.mC)E.push({a:st.mV,b:st.mC,E:0,R:RW,meter:true});
 if(st.bP&&st.bM&&st.bP!==st.bM)E.push({a:st.bP,b:st.bM,E:UB,R:RB});   // źródło: Va − Vb = E przy zerowym prądzie
 return E}
// potencjały przy danych U1,U2 (V3 = 0): V1 = U1+U2, VX = U2, V2 z prawa Kirchhoffa w węźle 2
function solveV(U1,U2,E){const V={1:U1+U2,3:0,X:U2};let G=1/P.R,Isum=V.X/P.R;
 for(const e of E){if(e.a===2&&e.b!==2){G+=1/e.R;Isum+=(V[e.b]+e.E)/e.R}else if(e.b===2&&e.a!==2){G+=1/e.R;Isum+=(V[e.a]-e.E)/e.R}}V[2]=Isum/G;return V}
// prądy wypływające z zacisków 1 i 3 do elementów zewnętrznych (+ upływność kondensatorów)
function outCur(U1,U2,E){const V=solveV(U1,U2,E);let o1=0,o3=0;for(const e of E){const i=(V[e.a]-V[e.b]-e.E)/e.R;if(e.a===1)o1+=i;if(e.b===1)o1-=i;if(e.a===3)o3+=i;if(e.b===3)o3-=i}return{o1,o3,V}}
function deriv(U1,U2,E){const{o1,o3}=outCur(U1,U2,E);return[-o1/P.C1-U1/(RLEAK*P.C1),o3/P.C2-U2/(RLEAK*P.C2)]}
function step(dt){const E=elements();// niejawny Euler: układ liniowy → macierz z różnic
 const f0=deriv(0,0,E),fa=deriv(1,0,E),fb=deriv(0,1,E);const M=[[fa[0]-f0[0],fb[0]-f0[0]],[fa[1]-f0[1],fb[1]-f0[1]]];
 const A=[[1-dt*M[0][0],-dt*M[0][1]],[-dt*M[1][0],1-dt*M[1][1]]],r=[st.U1+dt*f0[0],st.U2+dt*f0[1]],det=A[0][0]*A[1][1]-A[0][1]*A[1][0];
 st.U1=(r[0]*A[1][1]-A[0][1]*r[1])/det;st.U2=(A[0][0]*r[1]-r[0]*A[1][0])/det;if(st.run)st.t+=dt}
function meterV(){const E=elements();if(!(st.mV&&st.mC))return null;if(st.mV===st.mC)return 0;const V=solveV(st.U1,st.U2,E);return V[st.mV]-V[st.mC]}
function reading(){const z=ZAK[st.zak];if(!z.max)return"";const v=meterV();if(v==null)return z.f(0);const x=v+gauss()*0.00008;return Math.abs(x)>z.max?(x<0?"-1.":"1."):z.f(x)}
function leadEnd(i,free){return i?term(i):free}
function draw(D){// czarna skrzynka z trzema zaciskami
 D.box(add(BOX,V(0,0,0.02)),V(0.065,0,0),V(0,0.045,0),V(0,0,0.02),"#1d1f23",{amb:0.45,spec:0.35});
 for(let i=1;i<=3;i++){const p=term(i);D.cyl(add(p,V(0,0,-0.0015)),add(p,V(0,0,0.004)),0.0055,"#c9a44a",{n:14,metal:45,spec:0.7});D.cyl(add(p,V(0,0,0.004)),add(p,V(0,0,0.012)),0.0022,"#d9b65a",{n:10,metal:45,spec:0.7});
  S.napis([add(p,V(-0.007,-0.009,0.0)),add(p,V(0.007,-0.009,0.0)),add(p,V(0.007,-0.023,0.0)),add(p,V(-0.007,-0.023,0.0))].map(q=>V(q.x,q.y,0.0402)),String(i))}
 // miernik, bateria, stoper
 S.multimetr({c:MET,odczyt:st.odczyt,pokretlo:(st.zak-2)*0.6});S.bateriaPlaska({c:BAT});S.stoper({c:STP,czas:st.t,biegnie:st.run});
 const g=S.gniazdaMultimetru(MET),bl=S.blaszkiBaterii(BAT);const top=(i,o)=>add(term(i),V(o[0],o[1],0.011));
 const lead=(a,i,free,col,typA,kFree,bok,o)=>S.przewod({a,kA:Z,b:i?top(i,o):free,kB:i?LAB.nrm(V(o[0]*90,o[1]*90,1)):kFree,wtykA:typA,wtykB:"krokodyl",kolor:col,luz:i?0.35:0.2,bok});
 lead(g.v,st.mV,V(0.14,0.02,0.004),"#c0271d","banan",V(1,0.3,0),0.4,[0.0025,-0.0025]);lead(g.com,st.mC,V(0.13,-0.04,0.004),"#1b1d21","banan",V(1,-0.2,0),-0.4,[0.0025,0.0025]);
 lead(bl.plus,st.bP,V(-0.14,0.03,0.004),"#c0271d","krokodyl",V(-1,0.2,0),-0.3,[-0.0025,-0.0025]);lead(bl.minus,st.bM,V(-0.13,-0.05,0.004),"#1b1d21","krokodyl",V(-1,-0.3,0),0.3,[-0.0025,0.0025])}
const cyc=k=>()=>{st[k]=(st[k]+1)%4};const nm=i=>i?"zacisk "+i:"odłączony";
LAB.defineTask({id:"of71-2-rc",
 meta:{kicker:"LXXI OF · II etap · 2021/22",title:"Obwód RC: opór i dwie pojemności",desc:"Czarna skrzynka z trzema wyprowadzeniami, woltomierz 1 MΩ, stoper, bateria 4,5 V. Wyznacz R, C₁ i C₂."},
 taskHtml:`<h2>Obwód RC — czarna skrzynka</h2><p>W skrzynce są opornik R i dwa kondensatory C₁, C₂ połączone tak: zacisk <b>1</b> — C₁ — węzeł — C₂ — zacisk <b>3</b>; opornik R łączy węzeł z zaciskiem <b>2</b>.</p>
 <p><b>Masz:</b> woltomierz o oporze wewnętrznym 1 MΩ (multimetr), stoper, baterię 4,5 V, przewody z krokodylkami.</p><p><b>Wyznacz</b> opór R oraz pojemności C₁ i C₂.</p>
 <p class="muted">Napięcie na kondensatorze w obwodzie RC maleje jak U = U₀·e^(−t/RC). Rzeczywisty woltomierz to idealny woltomierz z równoległym opornikiem 1 MΩ. Podłączasz przewody przyciskami na pasku; stoper uruchamiasz sam.</p>`,
 hints:["Naładuj kondensatory, przykładając baterię do zacisków 1 i 3. Suma napięć na C₁ i C₂ jest wtedy równa napięciu baterii.","Woltomierz na zaciskach 1–2 rozładowuje C₁ przez R + R_w i pokazuje tylko część napięcia: U* = U·R_w/(R + R_w).","ln U* od t to prosta o nachyleniu −1/((R+R_w)C). Z U₁*(0) + U₂*(0) i napięcia baterii: R = R_w·(U_B/(U₁*(0)+U₂*(0)) − 1)."],
 params:{R:{min:9.7e6,max:10.3e6},C1:{min:4.3e-6,max:5.1e-6},C2:{min:6.2e-6,max:7.4e-6},UB:{min:4.6,max:4.95}},
 scene:{table:TB,draw,light:V(0.3,-0.5,1)},
 views:[{label:"Stół",cam:()=>({t:V(0,-0.02,0.02),yaw:0.15,pitch:0.85,dist:0.75})},{label:"Miernik i stoper",cam:()=>({t:V(0.16,-0.12,0.02),yaw:-0.1,pitch:0.95,dist:0.36})},
  {label:"Skrzynka",cam:()=>({t:add(BOX,V(0,0,0.04)),yaw:0.2,pitch:0.7,dist:0.3})}],
 movables:[],
 actions:[
  {icon:"thread",label:()=>"V(+) → "+nm(st.mV),tip:"Czerwony przewód woltomierza: przełóż na następny zacisk",run:cyc("mV")},
  {icon:"thread",label:()=>"COM(−) → "+nm(st.mC),tip:"Czarny przewód woltomierza",run:cyc("mC")},
  {icon:"tape",label:()=>"Bateria + → "+nm(st.bP),tip:"Krokodylek z plusa baterii",run:cyc("bP")},
  {icon:"tape",label:()=>"Bateria − → "+nm(st.bM),tip:"Krokodylek z minusa baterii",run:cyc("bM")},
  {icon:"slide",label:()=>"Zakres: "+ZAK[st.zak].n,tip:"Pokrętło multimetru",run:()=>{st.zak=(st.zak+1)%ZAK.length;st.odczyt=reading()}},
  {icon:"slow",label:()=>st.run?"Stoper: stop":"Stoper: start",tip:"Start / stop stopera",run:()=>{st.run=!st.run}},
  {icon:"wipe",label:"Stoper: zeruj",tip:"Wyzeruj stoper",run:()=>{st.t=0}}],
 learn(D,c,viz){viz.panel(c,[["U na C₁",LAB.fmt(st.U1,4)+" V"],["U na C₂",LAB.fmt(st.U2,4)+" V"],["miernik pokazuje",meterV()==null?"—":LAB.fmt(meterV()*1000,1)+" mV"],
  ["τ₁ = (R+R_w)C₁",LAB.fmt((P.R+RW)*P.C1,1)+" s"],["τ₂ = (R+R_w)C₂",LAB.fmt((P.R+RW)*P.C2,1)+" s"],["R, C₁, C₂ (ukryte)",LAB.fmt(P.R/1e6,2)+" MΩ, "+LAB.fmt(P.C1*1e6,2)+", "+LAB.fmt(P.C2*1e6,2)+" µF"]]);
  // schemat wnętrza nad skrzynką
  const o=add(BOX,V(0,0.0,0.07)),pts={1:add(o,V(-0.05,0,0)),X:add(o,V(0,0,0)),3:add(o,V(0.05,0,0)),2:add(o,V(0,0,-0.03))};
  viz.line(c,D,pts[1],pts.X,"#8e44ad");viz.line(c,D,pts.X,pts[3],"#8e44ad");viz.line(c,D,pts.X,pts[2],"#2471a3");
  for(const[k,txt,col]of[[1,"1",""],[2,"2",""],[3,"3",""]]){const q=D.P2(pts[k]);if(q)viz.tag(c,q.x,q.y,txt,"#111")}
  const a=D.P2(add(o,V(-0.025,0,0))),b=D.P2(add(o,V(0.025,0,0))),r=D.P2(add(o,V(0,0,-0.015)));if(a)viz.tag(c,a.x,a.y-14,"C₁ "+LAB.fmt(st.U1,2)+" V","#8e44ad");if(b)viz.tag(c,b.x,b.y-14,"C₂ "+LAB.fmt(st.U2,2)+" V","#8e44ad");if(r)viz.tag(c,r.x+22,r.y,"R","#2471a3")},
 init(env){P=env.P;gauss=env.gauss||gauss;window.OF71_TEST={st,P:()=>P,step,meterV,RW}},
 update(dt){const n=Math.max(1,Math.ceil(dt/0.02));for(let i=0;i<n;i++)step(dt/n);tDisp+=dt;if(tDisp>0.4){tDisp=0;st.odczyt=reading()}},
 status(){return st.bP&&st.bM&&st.bP!==st.bM?"bateria podłączona — kondensatory się ładują":""},
 getState:()=>({...st,U1:Math.round(st.U1*1e4),U2:Math.round(st.U2*1e4),t:Math.floor(st.t*100)}),
 setState(o){for(const k of["mV","mC","bP","bM","zak"])if(o[k]!=null)st[k]=o[k]}});
})();
