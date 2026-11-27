/* LXV OF, II etap (2015/16) — Tarcie toczne kulki.
   Kulka stacza się po desce z gumą ustawionej na pudle, spada ze stołu na papier milimetrowy z kalką.
   Fizyka: a = g(sinα − (k/r)cosα)/(1+I/mr²) na równi, rzut ukośny po zjeździe, odbicie i toczenie po stole.
   Uczeń sam mierzy: l (start → koniec deski), h (koniec deski → stół), d (ślad), tgα (wysokość podkładki / długość). */
(()=>{const{V,add,sub,mul,dot,len,nrm,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const g=9.81,HB=0.25,BX0=-0.36,BX1=0,BY=0.11;             // pudło: x∈[BX0,BX1], wysokość HB
const LB=0.46,TH=0.012,RUB=0.002,BW=0.05,OV=0.016,SUP=0.40; // deska: długość, grubość, guma, szerokość, wysunięcie za krawędź, rozstaw podparć
const TB={x0:-0.55,x1:0.85,y0:-0.4,y1:0.4};
const st={dz:0.03,s:0.33,papX:0.03,kalka:true,linX:0.20,ball:"rest",marks:[]};let B=null,fly=null,msg="";
// geometria deski: krawędź pudła (x=0, z=HB) jest punktem podparcia, drugi koniec na plastelinie o wysokości dz w x=−SUP
function geo(){const al=Math.atan2(st.dz,SUP),u=V(-Math.cos(al),0,Math.sin(al)),n=V(Math.sin(al),0,Math.cos(al));   // u: w górę deski, n: normalna
 const piv=V(0,0,HB),endB=add(piv,mul(u,-OV)),topEnd=add(endB,mul(n,TH+RUB));return{al,u,n,piv,endB,topEnd}}
const r=()=>P.r;
function ballOnBoard(s){const G=geo();return add(add(G.topEnd,mul(G.u,s)),mul(G.n,r()))}   // s: odległość punktu styku od końca deski (wzdłuż)
function release(){if(B)return;const G=geo();const kk=P.k*(1+0.08*gauss()),v0=Math.max(0,0.004*gauss());
 const a=g*(Math.sin(G.al)-(kk/r())*Math.cos(G.al))/(1+P.beta);
 if(a<=0){msg="Za mały kąt — kulka nie rusza (tarcie toczne)";LAB.flash&&LAB.flash(msg);return}
 B={ph:"ramp",s:st.s,v:v0,a,kk};st.ball="ramp"}
function step(dt){if(!B)return;const G=geo();
 if(B.ph==="ramp"){B.v+=B.a*dt;B.s-=B.v*dt;if(B.s<=0){const p=ballOnBoard(0),v=mul(G.u,-B.v);B={ph:"fly",p,v,t:0};}st.ball=B.ph;return}
 if(B.ph==="fly"){B.v=add(B.v,V(0,0,-g*dt));B.p=add(B.p,mul(B.v,dt));
  if(B.p.z<=r()){const f=(r()-B.p.z)/Math.max(1e-6,-B.v.z);const hit=add(B.p,mul(B.v,-f));B.p=V(hit.x,hit.y,r());
   if(st.kalka&&hit.x>st.papX&&hit.x<st.papX+0.21)st.marks.push({x:hit.x,y:hit.y});B.v=V(B.v.x*0.75,0,-B.v.z*0.3);B.ph="bounce";B.n=0}st.ball=B.ph;return}
 if(B.ph==="bounce"){B.v=add(B.v,V(0,0,-g*dt));B.p=add(B.p,mul(B.v,dt));if(B.p.z<=r()){B.p=V(B.p.x,B.p.y,r());B.v=V(B.v.x,0,-B.v.z*0.3);if(++B.n>3||Math.abs(B.v.z)<0.05)B.ph="roll"}}
 else if(B.ph==="roll"){const vx=Math.max(0,B.v.x-0.25*dt);B.v=V(vx,0,0);B.p=add(B.p,mul(B.v,dt));if(vx<=0)B.ph="stop"}
 if(B.p.x>TB.x1-0.04){B.p=V(TB.x1-0.04,B.p.y,r());B.v=V(0,0,0);B.ph="stop";LAB.flash&&LAB.flash("Kulka zatrzymała się na książce przy krawędzi stołu")}
 st.ball=B.ph}
function ballPos(){return B?(B.ph==="ramp"?ballOnBoard(B.s):B.p):ballOnBoard(st.s)}
function draw(D){const G=geo();
 S.karton({c:V((BX0+BX1)/2,0,0),hx:(BX1-BX0)/2,hy:BY,hz:HB/2});
 // podkładka z plasteliny pod górnym końcem deski
 const sp=V(-SUP,0,HB);D.cyl(sp,add(sp,V(0,0,Math.max(0.002,st.dz-0.0005))),0.014,"#3f8f4f",{n:16,r1:0.011,amb:0.5,spec:0.15});
 // deska z gumą
 const c0=add(G.endB,mul(G.u,LB/2)),c=add(c0,mul(G.n,TH/2));D.box(c,mul(G.u,LB/2),V(0,BW/2,0),mul(G.n,TH/2),"#c9a06a",{amb:0.55,cols:["#b58c58","#b58c58","#c9a06a","#c9a06a","#c9a06a","#a8834f"]});
 const rc=add(c0,mul(G.n,TH+RUB/2));D.box(rc,mul(G.u,LB/2),V(0,BW/2-0.003,0),mul(G.n,RUB/2),"#2b2d31",{amb:0.45,spec:0.1});
 // pasek papieru milimetrowego przyklejony wzdłuż boku deski (od jej końca)
 const t0=add(G.topEnd,V(0,-BW/2+0.0005,0)),a=add(t0,mul(G.n,-0.0001)),pts=[add(a,V(0,0,0)),add(a,mul(G.u,0.42)),add(add(a,mul(G.u,0.42)),mul(G.n,-0.012)),add(a,mul(G.n,-0.012))];
 S.papierMmNa(pts.map(p=>add(p,V(0,-0.0002,0))),0.42,0.012,2);
 // papier milimetrowy z kalką na stole
 const px=st.papX;S.papierMm({x0:px,x1:px+0.21,y0:-0.07,y1:0.07});
 for(const m of st.marks)if(!st.kalka)D.stripNow(V(m.x-0.0007,m.y,0),V(m.x+0.0007,m.y,0),0.0016,"rgba(25,25,60,.85)",3);
 if(st.kalka)S.kartka({x0:px+0.005,x1:px+0.205,y0:-0.06,y1:0.06,kolor:"#1d2333",warstwa:3});
 else S.kartka({x0:px+0.02,x1:px+0.22,y0:0.09,y1:0.21,kolor:"#1d2333",warstwa:1});
 // linijki: pionowa przezroczysta (do h) i pozioma na stole (do d)
 S.linijka({o:V(st.linX,-0.03,0),d:Z,w:V(1,0,0),L:0.30,przezroczysta:true});
 S.linijka({o:V(0.0,-0.09,0),L:0.30});
 // kulka stalowa
 D.sphere(ballPos(),r(),"#c7ccd2",{metal:70,spec:0.9,amb:0.35});
 S.chusteczki({c:V(0.55,0.25,0)})}
LAB.defineTask({id:"of65-2-kulka",
 meta:{kicker:"LXV OF · II etap · 2015/16",title:"Tarcie toczne kulki",desc:"Deska z gumą na pudle, stalowa kulka, papier milimetrowy, kalka, plastelina."},
 taskHtml:`<h2>Tarcie toczne kulki</h2><p>Kulka tocząca się bez poślizgu doznaje oporu toczenia: siły F<sub>T</sub> = R·k/r przeciwnej do ruchu (R — reakcja podłoża, r — promień kulki, k — współczynnik tarcia tocznego).</p>
 <p><b>Masz:</b> stalową kulkę, deskę pokrytą gumą, kartonowe pudło, papier milimetrowy, kalkę, plastelinę, linijki.</p>
 <p><b>Wyznacz:</b> współczynnik tarcia tocznego k kulki o gumę oraz stosunek I/(mr²).</p>
 <p class="muted">Kulka stacza się z deski i spada na stół — ślad zostaje na papierze pod kalką. Podnieś kalkę, żeby go zobaczyć. Sam zmierz l, h, d i nachylenie deski.</p>`,
 hints:["Prędkość kulki na końcu deski wyznaczysz z zasięgu rzutu: v² = g·d² / (2cos²α·(h − d·tgα)).","Na równi: a = g(sinα − (k/r)cosα)/(1 + I/mr²), a v² = 2al. Wykreśl v²/(2gl·cosα) od tgα — prosta y = p(x − q).","Z prostej: I/(mr²) = 1/p − 1, k = q·r. Promień kulki: zmierz jej średnicę linijką albo obwód paskiem papieru."],
 params:{k:{min:7e-5,max:1.3e-4},beta:{min:0.395,max:0.405},r:{min:0.0066,max:0.0069}},
 scene:{table:TB,draw,light:V(0.3,-0.55,1)},
 views:[{label:"Z boku",cam:()=>({t:V(0.02,0,0.17),yaw:0,pitch:0.16,dist:0.75})},{label:"3D",cam:()=>({t:V(-0.02,0,0.14),yaw:0.7,pitch:0.4,dist:1.1})},
  {label:"Start",cam:()=>({t:ballOnBoard(st.s),yaw:0.35,pitch:0.45,dist:0.2})},{label:"Kalka",cam:()=>({t:V(st.papX+0.1,0,0),yaw:0,pitch:1.45,dist:0.32})},
  {label:"Koniec deski",cam:()=>({t:add(geo().topEnd,V(0.01,0,-0.01)),yaw:0.05,pitch:0.08,dist:0.14})}],
 movables:[
  {id:"ball",label:"Kulka",hint:"ustaw miejsce startu na desce",grab:()=>({p:ballOnBoard(st.s),r:0.014,axis:geo().u,onStart:()=>{B=null;st.ball="rest"},onMove:ds=>{st.s=Math.max(0.02,Math.min(LB-OV-0.02,st.s+ds))}})},
  {id:"plast",label:"Plastelina",hint:"dociśnij lub dołóż — zmienia nachylenie",grab:()=>({p:V(-SUP,-0.014,HB+st.dz/2),r:0.015,axis:Z,onMove:ds=>{st.dz=Math.max(0.004,Math.min(0.07,st.dz+ds));if(!B)st.ball="rest"}})},
  {id:"paper",label:"Papier z kalką",hint:"przesuń tam, gdzie spada kulka",grab:()=>({p:V(st.papX+0.19,0.05,0.001),r:0.014,axis:V(1,0,0),onMove:ds=>{st.papX=Math.max(0,Math.min(0.55,st.papX+ds))}})},
  {id:"ruler",label:"Linijka pionowa",hint:"przyłóż do końca deski lub do śladu",grab:()=>({p:V(st.linX+0.015,-0.03,0.2),r:0.015,axis:V(1,0,0),onMove:ds=>{st.linX=Math.max(0.0005,Math.min(0.6,st.linX+ds))}})}],
 actions:[
  {icon:"release",label:"Puść kulkę",tip:"Puść kulkę z bieżącego miejsca na desce",run:()=>{B=null;release()}},
  {icon:"hand",label:"Weź kulkę",tip:"Odłóż kulkę z powrotem na start",run:()=>{B=null;st.ball="rest"}},
  {icon:"paper",label:()=>st.kalka?"Podnieś kalkę":"Połóż kalkę",tip:"Pod kalką są ślady uderzeń",run:()=>{st.kalka=!st.kalka}},
  {icon:"wipe",label:"Nowa kartka",tip:"Wymień papier milimetrowy (usuwa ślady)",run:()=>{st.marks=[]}}],
 learn(D,c,viz){const G=geo(),R=r();viz.panel(c,[["α",LAB.fmt(G.al*180/Math.PI,2)+"°"],["tg α",LAB.fmt(Math.tan(G.al),4)],["k/r (ukryte)",LAB.fmt(P.k/R,4)],["I/(mr²) (ukryte)",LAB.fmt(P.beta,3)],
   ["a na równi",LAB.fmt(g*(Math.sin(G.al)-(P.k/R)*Math.cos(G.al))/(1+P.beta),3)+" m/s²"],["h końca deski",LAB.fmt(G.topEnd.z*1000,1)+" mm"]]);
  const p=ballPos();
  if(!B||B.ph==="ramp"){const mg=V(0,0,-0.06),Np=mul(G.n,0.06*Math.cos(G.al)),Ft=mul(G.u,0.06*(P.k/R)*Math.cos(G.al)*25);viz.arrow(c,D,p,mg,"#c0392b","mg");viz.arrow(c,D,p,Np,"#2471a3","N");viz.arrow(c,D,add(p,mul(G.n,-R)),Ft,"#8e44ad","F_T ×25")}
  // przewidywany tor lotu
  const ac=g*(Math.sin(G.al)-(P.k/R)*Math.cos(G.al))/(1+P.beta);if(ac>0){const v=Math.sqrt(2*ac*st.s),p0=ballOnBoard(0),vv=mul(G.u,-v);let q=p0,pts=[];for(let i=0;i<80&&q.z>R;i++){const t=i*0.005;q=add(add(p0,mul(vv,t)),V(0,0,-g*t*t/2));pts.push(q)}
   for(let i=0;i<pts.length-1;i+=2)viz.line(c,D,pts[i],pts[i+1],"rgba(30,90,168,.8)")}}
 ,init(env){P=env.P;gauss=env.gauss||gauss;window.OF65_TEST={take:()=>{B=null},st,P:()=>P,release,step,geo,ballOnBoard,B:()=>B,r}},
 update(dt){const n=Math.ceil(dt/0.0005);for(let i=0;i<n;i++)step(dt/n)},
 status(){return B&&B.ph==="ramp"?"kulka się stacza…":B&&B.ph==="fly"?"lot":B&&B.ph==="stop"?"kulka leży na stole — weź ją":""},
 getState:()=>({...st,bp:B?[B.ph,ballPos().x,ballPos().z]:0}),setState(o){Object.assign(st,o);delete st.bp;B=null}});
})();
