/* LXXV OF, zawody II stopnia, część doświadczalna (15.02.2026) — tarcie wstążki o rurkę.
   Układ wzorcowy wg rozwiązania Komitetu: wahadło (wstążka + nakrętka) przywiązane do poprzeczki statywu,
   odchylone o y przez rurkę zamocowaną ściskami przy krawędzi stołu. Wahadło kołysze się wzdłuż rurki (x).
   Sterowanie w scenie: przeciągnij nakrętkę (wychylenie x) i węzeł na poprzeczce (y). */
(()=>{
const{V,add,sub,mul,dot,cross,len,nrm,Z,fmt,num}=LAB;
const G=9.81,MNUT=0.090,RT=0.010,LT=0.50,WRIB=0.006,BARL=0.68,POLEY=-0.30,FLOOR=-0.75,TAPE0=-0.55,TUBEY=0.0045,TUBEZ=0.0093;let tubeX=0.04,tapeOnBar=false;
let MUS,MUK,scratches,dirtPh,gauss;
let dirty=true,turns=0;
const VIEW0=()=>({t:V(0.03,-0.05,0.2),yaw:Math.PI-0.6,pitch:0.22,dist:1.45});
const st={H:0.60,ya:-0.034,Lr:0.66};
let rib={on:false,s:0,v:0,stuck:true,held:false,muNow:0.2};
let knotHeld=false;

function muFactor(s){let f=1;for(const c of scratches){const d=(s-c.s)/c.w;f*=1+(c.f-1)*Math.exp(-d*d)}
 if(dirty)f*=1+0.25*Math.sin(s*37+dirtPh[0])+0.12*Math.sin(s*91+dirtPh[1]);return f}
const frame=()=>({C:V(tubeX,TUBEY,TUBEZ),u:V(1,0,0),n0:V(0,-1,0),v:V(0,0,1)});
const SIG=-1; // wstążka po zewnętrznej stronie rurki (+y)
const anchor=()=>V(0,st.ya,st.H);
function geom(s){const F=frame(),A=anchor();const Cs=add(F.C,mul(F.u,s));const n=mul(F.n0,SIG);const D=add(Cs,mul(n,RT));
 const a=sub(A,Cs);const an=dot(a,n),av=dot(a,F.v),d=Math.hypot(an,av);if(d<=RT*1.0001)return null;
 const base=Math.atan2(av,an),off=Math.acos(RT/d);let best=null;
 for(const th of[base+off,base-off]){const tp=[RT*Math.cos(th),RT*Math.sin(th)];const dir=[tp[0]-an,tp[1]-av];const L=Math.hypot(dir[0],dir[1]);const tg=[Math.sin(th),-Math.cos(th)];
  if((dir[0]*tg[0]+dir[1]*tg[1])/L>0.999){let w=th;while(w<0)w+=2*Math.PI;while(w>=2*Math.PI)w-=2*Math.PI;best={th,w}}}
 if(!best)return null;const alpha=best.w;if(alpha>1.5*Math.PI||alpha<1e-5)return null;
 const Q=add(Cs,add(mul(n,RT*Math.cos(best.th)),mul(F.v,RT*Math.sin(best.th))));const AQ=len(sub(A,Q));const hang=st.Lr-AQ-RT*alpha;
 return{F,Cs,n,D,Q,alpha,AQ,hang,nut:add(D,mul(Z,-hang)),e1:nrm(sub(A,Q)),th:best.th}}
const seq=()=>-tubeX; // położenie równowagi: pod zaczepem (x = 0)
function nutPos(){if(rib.on){const g=geom(rib.s);if(g)return g.nut}const A=anchor();return V(A.x,A.y,A.z-st.Lr)}
function lean(){const s=seq();if(geom(s)){rib={on:true,s,v:0,stuck:true,held:false,muNow:MUS*muFactor(s)};return true}return false}
function autoLen(){if(rib.on){const g=geom(rib.s);if(g)st.Lr-=g.hang-0.045}else st.Lr=st.H-TUBEZ+0.045}
function setYa(v){st.ya=Math.max(-0.25,Math.min(0.06,v));autoLen()}
function U(s){const g=geom(s);return g?MNUT*G*g.nut.z:null}
function step(dt){if(!rib.on){lean();return}
 if(Math.abs(rib.s)>LT/2-0.003){rib.on=false;return}
 const g=geom(rib.s);if(!g){rib.on=false;return}
 if(rib.held||knotHeld){rib.v=0;return}
 const h=1e-5,u1=U(rib.s+h),u0=U(rib.s-h);if(u1===null||u0===null){rib.on=false;return}
 const Q=-(u1-u0)/(2*h),T=MNUT*G;const Rv=add(mul(g.e1,T),mul(Z,-T));const N=len(sub(Rv,mul(g.F.u,dot(Rv,g.F.u))));
 const g1=geom(rib.s+h),g0=geom(rib.s-h);const dn=mul(sub(g1.nut,g0.nut),1/(2*h));const meff=MNUT*Math.max(0.3,dot(dn,dn));const mf=muFactor(rib.s);
 if(rib.stuck){if(Math.abs(Q)>rib.muNow*N){rib.stuck=false;rib.v=0}else return}
 const fk=MUK*mf*N,sv=rib.v!==0?Math.sign(rib.v):Math.sign(Q);const acc=(Q-sv*fk)/meff-0.008*rib.v;const vn=rib.v+acc*dt;
 if(rib.v!==0&&Math.sign(vn)!==Math.sign(rib.v)){rib.v=0;rib.stuck=true;rib.muNow=MUS*mf*(1+0.025*gauss());turns++;return}
 rib.s+=0.5*(rib.v+vn)*dt;rib.v=vn}
function release(){if(!rib.on)return;rib.held=false;rib.stuck=true;rib.v=0;rib.muNow=MUS*muFactor(rib.s)*(1+0.025*gauss())}
const tapeOf=x=>(x-TAPE0)*100;

// ---------- rysowanie ----------
const TX0=-0.7,TX1=0.8,TY0=-0.8,TTH=0.028;
const X=V(1,0,0),Y=V(0,1,0);
const S=LAB.sprzet;
function draw(D){const F=frame(),A=anchor(),cp=D.camPos;
 // stół z podłogą rysuje silnik (scene.table); tu tylko sprzęt z biblioteki + to, co specyficzne dla zadania
 if(!tapeOnBar)S.miarka({o:V(TAPE0,-0.019,0),d:X,w:Y,L:1.5,W:0.016});
 else S.miarka({o:V(-0.008,POLEY-BARL/2,st.H+0.0122),d:Y,w:X,L:BARL,W:0.016});
 S.statyw({baza:V(0,POLEY,0),H:st.H,belka:BARL});
 for(const s of[-0.19,0.19])S.scisk({x:0.04+s,zGora:TUBEZ+RT,th:TTH});
 // rurka aluminiowa z rysami i zabrudzeniem (specyficzne dla zadania)
 const e1=add(F.C,mul(F.u,-LT/2)),e2=add(F.C,mul(F.u,LT/2));
 D.cyl(e1,e2,RT,dirty?"#b3ab9c":"#ccd3da",{n:20,seg:0.025,metal:dirty?12:45,spec:dirty?0.25:0.7,capCol:"#6f757c"});
 const vis=s0=>{const p=add(F.C,mul(F.u,s0));let d=sub(cp,p);d=nrm(sub(d,mul(F.u,dot(d,F.u))));return{p,d}};
 for(const sc of scratches)for(let j=-3;j<=3;j++){const{p,d}=vis(sc.s+j*sc.w/3);const q=add(p,mul(d,RT*1.02)),w=nrm(cross(F.u,d));D.line(add(q,add(mul(w,0.004),mul(F.u,-0.002))),add(q,add(mul(w,-0.004),mul(F.u,0.002))),0.0005,"rgba(40,40,40,.55)")}
 if(dirty)for(let j=0;j<16;j++){const s0=-0.23+j*0.031+0.006*Math.sin(j*2.3+dirtPh[0]);const{p,d}=vis(s0);const w=nrm(cross(F.u,d)),q=add(p,add(mul(d,RT*1.02),mul(w,0.003*Math.sin(j*1.9))));D.line(add(q,mul(F.u,-0.004)),add(q,mul(F.u,0.004)),0.004,"rgba(110,85,50,.30)")}
 // wstążka (szerokość wzdłuż osi rurki) i węzeł na poprzeczce
 const col="#ef7417",np=nutPos(),ri={dz:-0.0005};
 const loop=[];for(let i=0;i<=16;i++){const th=i/16*2*Math.PI;loop.push(add(A,V(0.0132*Math.sin(th),0,0.0132*Math.cos(th))))}
 D.band(loop.map(p=>add(p,V(0,0,0))),Y,WRIB,col,{amb:0.5});
 D.box(add(A,V(0,0,-0.016)),mul(X,0.005),mul(Y,0.0045),mul(Z,0.005),knotHeld?"#ffd23f":"#d8630f");
 const A0=add(A,V(0,0,-0.016)),top=add(np,V(0,0,0.0125));
 if(rib.on){const g=geom(rib.s);if(g){const arc=[];for(let i=0;i<=12;i++){const th=g.th*(1-i/12);arc.push(add(g.Cs,add(mul(g.n,(RT+0.0006)*Math.cos(th)),mul(F.v,(RT+0.0006)*Math.sin(th)))))}
  D.band([A0,g.Q],X,WRIB,col,{amb:0.5});D.band(arc,X,WRIB,col,{amb:0.5});D.band([arc[arc.length-1],top],X,WRIB,col,{amb:0.5})}}
 else D.band([A0,top],X,WRIB,col,{amb:0.5});
 const tl=[];for(let i=0;i<=10;i++){const th=i/10*2*Math.PI;tl.push(add(add(np,V(0,0,0.0185)),V(0,0.0062*Math.sin(th),0.0062*Math.cos(th))))}D.band(tl,X,WRIB,col,{amb:0.5});
 S.nakretka(np,Y,{trzymana:rib.held});
 S.chusteczki({c:V(0.5,-0.55,0)});
}
// podpisy uchwytów w widoku głównym

LAB.defineTask({id:"of75-2-tarcie",
 meta:{kicker:"LXXV Olimpiada Fizyczna · zawody II stopnia · część doświadczalna · 15.02.2026",title:"Tarcie wstążki o rurkę",
  desc:"Wyznacz współczynniki tarcia statycznego i kinetycznego między aluminiową rurką a wstążką, mając statyw, ściski, rurkę, wstążkę, nakrętkę i miarkę krawiecką.",start:"Wejdź do laboratorium"},
 taskHtml:`<h2>Treść zadania</h2><p><b>Masz:</b> statyw z poprzeczką, dwa ściski stolarskie, rurkę aluminiową (50 cm, Ø 2 cm), wstążkę (ok. 1 m, 6 mm), stalową nakrętkę M24 (90 g), miarkę krawiecką (150 cm), chusteczki.</p>
 <p><b>Wyznacz współczynnik tarcia statycznego i kinetycznego między rurką a wstążką.</b></p>
 <ul class="small"><li>Dokładnie wyczyść rurkę — zabrudzenia mocno zmieniają wynik.</li><li>Rurka może być miejscami porysowana — używaj nieporysowanych fragmentów.</li><li>Przy małym kącie owinięcia α nacisk wstążki na walec ≈ wypadkowa wektorów obu sił naciągu.</li><li>(1+x)<sup>a</sup> ≈ 1+ax, sin x ≈ x, cos x ≈ 1, tg x ≈ x dla |x| ≪ 1.</li></ul>`,
 hints:[{title:"Podpowiedź: układ z rozwiązania",html:"Wahadło (wstążka + nakrętka) przywiązane do poprzeczki; rurka zamocowana ściskami przy krawędzi stołu odpycha wstążkę tuż nad nakrętką o y. Wahadło wychyla się wzdłuż rurki o x. Tarcie statyczne: największe x, przy którym puszczone wahadło stoi. Kinetyczne: zanik amplitudy kolejnych wahnięć. y zmieniasz, przesuwając miejsce przywiązania wzdłuż poprzeczki."},{title:"Podpowiedź: teoria",html:"Spoczynek: mg·x/L ≤ f<sub>s</sub>·mg·y/L ⇒ x<sub>gr</sub> = f<sub>s</sub>·y — f<sub>s</sub> to nachylenie prostej x<sub>gr</sub>(y). Ruch: mg(A₁² − A₂²)/2L = f<sub>k</sub>(mg·y/L)(A₁ + A₂) ⇒ ΔA = A₁ − A₂ = 2f<sub>k</sub>·y, stały spadek na półokres. Licząc n półokresów do zatrzymania z A₁: ΔA ≈ A₁/n, a f<sub>k</sub> to połowa nachylenia ΔA(y). Ani m, ani L nie są potrzebne."}],
 // ukryte parametry — losowane z numeru zestawu
 params:{fs:{min:0.16,max:0.32},kRatio:{min:0.72,max:0.90}},
 scene:{table:{x0:TX0,x1:TX1,y0:TY0,y1:0,th:TTH,floor:FLOOR},draw},
 views:[{label:"3D",cam:()=>({t:V(0.03,-0.05,0.2),yaw:Math.PI-0.6,pitch:0.22,dist:1.45})},{label:"Przód",cam:()=>({t:V(0.02,0,0.2),yaw:Math.PI,pitch:0.04,dist:1.35})},{label:"Bok",cam:()=>({t:V(0,-0.12,0.28),yaw:-Math.PI/2,pitch:0.08,dist:1.35})},{label:"Góra",cam:()=>({t:V(0,-0.15,0),yaw:Math.PI,pitch:1.56,dist:1.5})}],
 movables:[
  {id:"nut",label:"Nakrętka",hint:"odchyl wzdłuż rurki i puść",grab:()=>rib.on?{p:nutPos(),r:0.019,axis:V(1,0,0),onStart:()=>{rib.held=true;rib.v=0;0},onMove:ds=>{rib.s=Math.max(-LT/2+0.02,Math.min(LT/2-0.02,rib.s+ds))},onEnd:release}:null},
  {id:"knot",label:"Węzeł na poprzeczce",hint:"przesuwaj wzdłuż poprzeczki",grab:()=>({p:anchor(),r:0.02,axis:V(0,1,0),onStart:()=>{knotHeld=true;0},onMove:ds=>setYa(st.ya+ds),onEnd:()=>{knotHeld=false;release()}})}],
 actions:[
  {icon:"tape",label:()=>tapeOnBar?"Miarka na stół":"Miarka na poprzeczkę",tip:"Jedna miarka krawiecka: na stole (odczyt x pod nakrętką) albo przyklejona do poprzeczki (odczyt położenia węzła)",run:()=>{tapeOnBar=!tapeOnBar}},
  {icon:"lift",label:"Unieś i opuść nakrętkę",tip:"Podnosisz wahadło i ostrożnie opuszczasz — staje w najniższym położeniu",run:()=>{if(!rib.on)return;rib.s=seq()+0.0004*gauss();rib.v=0;rib.held=false;rib.stuck=true;rib.muNow=MUS*muFactor(rib.s)}},
  {icon:"stop",label:"Zatrzymaj ręką",tip:"Łapiesz nakrętkę w miejscu i puszczasz",run:()=>{if(!rib.on)return;rib.v=0;release()}},
  {icon:"wipe",label:"Przetrzyj rurkę",tip:"Chusteczką",run:()=>{dirty=false;LAB.flash("Przetarte.")}},
  {icon:"slide",label:"Przesuń rurkę w ściskach",tip:"Luzujesz ściski i przesuwasz rurkę — wstążka trafia na inny fragment",run:()=>{const opts=[0.04,0.085,-0.005];const i=(opts.indexOf(tubeX)+1)%opts.length,nx=opts[i];if(rib.on)rib.s+=tubeX-nx;tubeX=nx;release()}}],
 init(env){gauss=env.gauss;MUS=env.P.fs;MUK=MUS*env.P.kRatio;const R0=env.rng(env.seed);
  // rysy: większość z dala od środka; jedna blisko miejsca kołysania (trzeba ją ominąć)
  scratches=[-0.2,-0.075,0.15,0.21].map(s0=>({s:s0+(R0()-0.5)*0.03,w:0.008+R0()*0.008,f:1.3+R0()*0.35}));dirtPh=[R0()*6,R0()*6];lean();autoLen()},
 getState:()=>({ya:st.ya,H:st.H,s:rib.s,dirty,tubeX,tapeOnBar}),
 setState(o){if(isFinite(o.tubeX))tubeX=o.tubeX;tapeOnBar=!!o.tapeOnBar;if(isFinite(o.ya))st.ya=o.ya;if(isFinite(o.H))st.H=o.H;dirty=!!o.dirty;lean();autoLen();if(isFinite(o.s))rib.s=o.s;release()},
 start(resumed){LAB.goCam(VIEW0(),1800);if(!resumed)setTimeout(()=>LAB.showHint("Złap nakrętkę, odchyl ją wzdłuż rurki i puść.",9000),1900)},
 update(dt){const n=Math.ceil(dt/0.0008);for(let i=0;i<n;i++)step(dt/n)},
 status(){return rib.held?"trzymasz nakrętkę":knotHeld?"przesuwasz węzeł":""},
 learn(D,c,viz){if(!rib.on)return;const g=geom(rib.s);if(!g)return;const np=nutPos(),A=anchor(),T=MNUT*G,F=g.F;
  const Rv=add(mul(g.e1,T),mul(Z,-T)),Nv=sub(Rv,mul(F.u,dot(Rv,F.u))),N=len(Nv);
  const h=1e-5,Q=-(U(rib.s+h)-U(rib.s-h))/(2*h);const fr=rib.stuck||rib.held?-Q:-Math.sign(rib.v)*MUK*muFactor(rib.s)*N;
  const Sw=0.07,Sc=0.35,cp=add(g.Cs,mul(nrm(Nv),RT+0.004));
  viz.arrow(c,D,np,V(0,0,-T*Sw),"#1d4ed8","mg");viz.arrow(c,D,add(np,V(0,0,0.02)),V(0,0,T*Sw),"#7c3aed","F_n");
  viz.arrow(c,D,cp,mul(nrm(Nv),-N*Sc),"#059669","N (×5)");if(Math.abs(fr)>1e-4)viz.arrow(c,D,cp,mul(F.u,fr*Sc),"#dc2626","T (×5)");
  viz.line(c,D,A,V(A.x,A.y,np.z),"rgba(0,0,0,.4)",true);viz.dim(c,D,V(np.x,A.y,np.z-0.03),V(np.x,np.y,np.z-0.03),"y","#333");
  if(Math.abs(np.x)>0.003)viz.dim(c,D,V(0,np.y+0.03,np.z),V(np.x,np.y+0.03,np.z),"x","#333");
  const lim=rib.muNow*N;
  viz.panel(c,[["y (odchylenie przez rurkę)",fmt(Math.abs(np.y-A.y)*100,1)+" cm"],["x (wychylenie wzdłuż rurki)",fmt(np.x*100,1)+" cm"],["kąt owinięcia α",fmt(g.alpha*180/Math.PI,1)+"°"],
   ["nacisk N",fmt(N*1000,0)+" mN"],["siła zwrotna wzdłuż rurki",fmt(Math.abs(Q)*1000,1)+" mN","#dc2626"],["max tarcie statyczne f_s·N",fmt(lim*1000,1)+" mN"],
   ["f_s, f_k (w tym miejscu)",fmt(MUS*muFactor(rib.s),3)+", "+fmt(MUK*muFactor(rib.s),3)],["stan",rib.held?"trzymasz":rib.stuck?"spoczynek":"ruch"]])},
});
window.OF75_TEST={st,get rib(){return rib},geom,seq,step,muFactor,autoLen,get MUS(){return MUS},get MUK(){return MUK},setDirty:v=>{dirty=v},release};
})();
