/* LXXII OF, II etap (2022/23) — Kąt Brewstera dla krzemu.
   Pionowa płytka krzemowa (powierzchnia w płaszczyźnie y = 0) na rolce taśmy, dioda na baterii świeci poziomo, papier milimetrowy.
   Fizyka: zespolone wzory Fresnela (n + ik krzemu dla 660 i 460 nm), niespolaryzowane światło diody, polaryzator z ukrytym kątem osi.
   Odblask liczony dla RZECZYWISTEGO położenia oka (kamery); przez polaryzator — tylko gdy promień odblask→oko przechodzi przez folię. */
(()=>{const{V,add,sub,mul,dot,len,nrm,cross,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const TB={x0:-0.5,x1:0.5,y0:-0.4,y1:0.3},H0=0.026,WH=0.015,DPOL=0.13;
const DIODY=[{n:"czerwona",kol:"#e3261c",nk:"nR",k:0.016,lam:660},{n:"niebieska",kol:"#2d6bff",nk:"nB",k:0.09,lam:460}];
const st={x:0.09,y:0.06,psi:0,dioda:0};
const LEDp=()=>V(-st.x,-st.y,H0);const C0=V(0,0,H0);
const eyeDir=()=>nrm(V(st.x,-st.y,0));                                   // kierunek odbicia od środka płytki
const polC=()=>add(C0,mul(eyeDir(),DPOL));
// --- liczby zespolone i Fresnel ---
const cx=(a,b)=>({a,b}),cadd=(p,q)=>cx(p.a+q.a,p.b+q.b),csub=(p,q)=>cx(p.a-q.a,p.b-q.b),cmul=(p,q)=>cx(p.a*q.a-p.b*q.b,p.a*q.b+p.b*q.a),
 cdiv=(p,q)=>{const d=q.a*q.a+q.b*q.b;return cx((p.a*q.a+p.b*q.b)/d,(p.b*q.a-p.a*q.b)/d)},cabs2=p=>p.a*p.a+p.b*p.b,
 csqrt=p=>{const r=Math.hypot(p.a,p.b),a=Math.sqrt((r+p.a)/2),b=Math.sign(p.b||1)*Math.sqrt(Math.max(0,(r-p.a)/2));return cx(a,b)};
function fresnel(ci){const d=DIODY[st.dioda],N=cx(P[d.nk],d.k),si2=1-ci*ci,N2=cmul(N,N),ct=csqrt(csub(cx(1,0),cdiv(cx(si2,0),N2))),Ci=cx(ci,0);
 const rs=cdiv(csub(Ci,cmul(N,ct)),cadd(Ci,cmul(N,ct))),rp=cdiv(csub(cmul(N,Ci),ct),cadd(cmul(N,Ci),ct));return{Rs:cabs2(rs),Rp:cabs2(rp)}}
// odblask widziany z punktu E
function glint(E){const L=LEDp(),M=V(L.x,-L.y,L.z),d=sub(E,M);if(Math.abs(d.y)<1e-9||M.y*E.y>0)return null;const t=-M.y/d.y,Pp=add(M,mul(d,t));
 if(Math.abs(Pp.x)>WH||Math.abs(Pp.z-H0)>WH||E.y>=0)return null;const uin=nrm(sub(Pp,L)),ci=Math.abs(uin.y),F=fresnel(ci);
 // czy promień odblask→oko przechodzi przez polaryzator (prostokąt 5×3 cm prostopadły do kierunku odbicia)
 const pc=polC(),pn=eyeDir(),rd=nrm(sub(E,Pp)),den=dot(rd,pn);let through=false,chi=0;
 if(den>1e-6){const s=dot(sub(pc,Pp),pn)/den;if(s>0&&s<len(sub(E,Pp))){const q=add(Pp,mul(rd,s)),h=nrm(cross(Z,pn)),r=sub(q,pc),u=dot(r,h),v=r.z;
   const c=Math.cos(st.psi),sn=Math.sin(st.psi),lu=u*c+v*sn,lv=-u*sn+v*c;if(Math.abs(lu)<0.025&&Math.abs(lv)<0.015)through=true}}
 const axis=st.psi+P.beta*Math.PI/180;chi=axis-Math.PI/2;                 // kąt osi przepuszczania od kierunku s (pionowego)
 const I=through?(F.Rs*Math.cos(chi)**2+F.Rp*Math.sin(chi)**2)*(1-P.leak)+P.leak*(F.Rs+F.Rp)/2:(F.Rs+F.Rp)/2;
 return{Pp,I,F,through,ang:Math.acos(ci)}}
function draw(D){const d=DIODY[st.dioda],L=LEDp(),dir=nrm(sub(C0,L));
 S.papierMm({x0:-0.23,x1:0.23,y0:-0.22,y1:0.0});
 // rolka taśmy z płytką krzemową
 D.cyl(V(0,0.032,0),V(0,0.032,0.019),0.032,"#e9e3cf",{n:28,amb:0.6,spec:0.3,capCol:"#ece6d2"});D.cyl(V(0,0.032,0.0192),V(0,0.032,0.0194),0.019,"#b98f5e",{n:24,amb:0.6,shadow:false});
 D.box(V(0,-0.0005,H0),V(WH,0,0),V(0,0.0005,0),V(0,0,WH),"#2a3340",{metal:70,spec:0.95,amb:0.25,cols:["#9aa3ad","#9aa3ad","#9aa3ad","#3b4656","#9aa3ad","#9aa3ad"]});
 // dioda przyklejona do baterii, świeci poziomo w stronę płytki
 const bc=add(L,mul(dir,-0.035)),side=nrm(cross(Z,dir));D.box(V(bc.x,bc.y,0.011),mul(dir,0.031),mul(side,0.0325),V(0,0,0.011),"#d23a2a",{amb:0.5,spec:0.3,cols:["#d23a2a","#d23a2a","#d23a2a","#d23a2a","#c0392b","#d23a2a"]});
 S.tasma({c:V(bc.x+dir.x*0.02,bc.y+dir.y*0.02,0.0222),n:Z,u:dir,dl:0.03,szer:0.02});
 const o={n:16,amb:1,spec:0.5,alpha:0.9};D.cyl(add(L,mul(dir,-0.009)),add(L,mul(dir,-0.0035)),0.0025,d.kol,o);D.cyl(add(L,mul(dir,-0.0035)),L,0.0025,d.kol,{...o,r1:0.0008});
 D.cyl(add(L,mul(dir,-0.006)),add(L,mul(dir,0.01)),0.007,d.kol,{n:16,r1:0.002,alpha:0.2,amb:1,shadow:false,caps:false});
 // odblask (dla bieżącego położenia oka)
 const g=glint(D.camPos);if(g){const cam=D.camPos,f=nrm(sub(cam,g.Pp)),h=nrm(cross(Z,f)),v=cross(f,h),k=[[1,0.0035],[0.45,0.009]];
  for(const[a,r]of k){const al=Math.min(1,g.I*a*(g.through?2.4:1.6));if(al<0.003)continue;const c=add(g.Pp,mul(f,0.0004)),pts=[];for(let i=0;i<16;i++){const t=i/16*2*Math.PI;pts.push(add(c,add(mul(h,r*Math.cos(t)),mul(v,r*Math.sin(t)))))}D.quadNow(pts,
   `rgba(${d.kol==="#e3261c"?"255,70,50":"80,140,255"},${al.toFixed(3)})`)}}
 // polaryzator trzymany na linii odbicia
 const pc=polC(),pn=eyeDir(),h=nrm(cross(Z,pn)),c=Math.cos(st.psi),sn=Math.sin(st.psi),eu=add(mul(h,c),mul(Z,sn)),ev=add(mul(h,-sn),mul(Z,c));
 const pp=(u,v)=>add(pc,add(mul(eu,u),mul(ev,v)));D.quadNow([pp(-0.025,-0.015),pp(0.025,-0.015),pp(0.025,0.015),pp(-0.025,0.015)],"rgba(55,58,64,.5)");
 for(const[a,b]of[[[-0.025,-0.015],[0.025,-0.015]],[[0.025,-0.015],[0.025,0.015]],[[0.025,0.015],[-0.025,0.015]],[[-0.025,0.015],[-0.025,-0.015]]])D.lineNow(pp(...a),pp(...b),0.0005,"#2a2d33");
 // kartka papieru milimetrowego obok polaryzatora (w jego płaszczyźnie) — odniesienie poziomu/pionu do pomiaru kąta krawędzi
 const bb=add(pc,mul(h,0.055));S.papierMmNa([add(bb,add(mul(h,-0.02),V(0,0,0.02))),add(bb,add(mul(h,0.02),V(0,0,0.02))),add(bb,add(mul(h,0.02),V(0,0,-0.02))),add(bb,add(mul(h,-0.02),V(0,0,-0.02)))].map(q=>add(q,mul(pn,0.0005))),0.04,0.04,1)}
LAB.defineTask({id:"of72-2-brewster",
 meta:{kicker:"LXXII OF · II etap · 2022/23",title:"Kąt Brewstera dla krzemu",desc:"Płytka krzemowa, polaryzator, diody czerwona i niebieska, papier milimetrowy. Wyznacz n krzemu i oś polaryzatora."},
 taskHtml:`<h2>Kąt Brewstera dla krzemu</h2><p><b>Masz:</b> płytkę krzemową o płaskiej powierzchni (przyklejoną do rolki taśmy), polaryzator liniowy, czerwoną i niebieską diodę zasilaną z baterii, papier milimetrowy.</p>
 <p><b>Wyznacz</b> kąt między osią polaryzacji polaryzatora a jego dłuższą krawędzią oraz współczynniki załamania krzemu dla światła czerwonego i niebieskiego.</p>
 <p class="muted">Wskazówka: pod kątem Brewstera światło odbite jest spolaryzowane liniowo — promienie odbity i załamany są wtedy prostopadłe, a polaryzacja odbitego jest równoległa do powierzchni. Patrz na odblask przez polaryzator (widok „Oko”) i przesuwaj diodę, aż odblask zgaśnie.</p>`,
 hints:["Pod kątem Brewstera n = tg α.","Płytka stoi równolegle do linii papieru, więc tg α = x/y: x — odległość diody wzdłuż płytki od punktu odbicia, y — odległość od płytki. Zrób kilka par (x, y) i dopasuj prostą x = n·y.","Gdy odblask zgaśnie, światło odbite jest spolaryzowane pionowo, więc oś polaryzatora jest pozioma. Zmierz nachylenie jego dłuższej krawędzi do poziomu."],
 params:{nR:{min:3.78,max:3.90},nB:{min:4.45,max:4.70},beta:{min:25,max:31},leak:{min:0.002,max:0.006}},
 scene:{table:TB,draw,light:V(0.3,-0.55,1)},
 views:[{label:"Oko",cam:()=>{const u=eyeDir();return{t:C0,yaw:Math.atan2(u.x,-u.y),pitch:0.0,dist:0.34}}},{label:"Z góry",cam:()=>({t:V(0,-0.09,0),yaw:0,pitch:1.56,dist:0.42})},
  {label:"3D",cam:()=>({t:V(0,-0.06,0.02),yaw:0.3,pitch:0.5,dist:0.5})},{label:"Polaryzator",cam:()=>{const u=eyeDir();return{t:add(polC(),mul(nrm(cross(Z,u)),0.03)),yaw:Math.atan2(u.x,-u.y),pitch:0.0,dist:0.14}}}],
 movables:[
  {id:"dx",label:"Dioda wzdłuż płytki",hint:"zmienia x",grab:()=>({p:add(LEDp(),V(0,0,0.012)),r:0.012,axis:V(-1,0,0),onMove:ds=>{st.x=Math.max(0.01,Math.min(0.21,st.x+ds))}})},
  {id:"dy",label:"Dioda od płytki",hint:"zmienia y",grab:()=>({p:add(LEDp(),V(0,-0.03,0.0)),r:0.012,axis:V(0,-1,0),onMove:ds=>{st.y=Math.max(0.02,Math.min(0.2,st.y+ds))}})},
  {id:"pol",label:"Obrót polaryzatora",hint:"obróć folię",grab:()=>{const pc=polC(),pn=eyeDir(),h=nrm(cross(Z,pn));return{p:add(pc,add(mul(h,0.025*Math.cos(st.psi)),V(0,0,0.025*Math.sin(st.psi)))),r:0.01,axis:Z,onMove:ds=>{st.psi=Math.max(-Math.PI/2,Math.min(Math.PI/2,st.psi+ds*12))}}}}],
 actions:[{icon:"pencil",label:()=>"Dioda: "+DIODY[st.dioda].n,tip:"Zamień diodę",run:()=>{st.dioda=(st.dioda+1)%2}},
  {icon:"slide",label:"Polaryzator poziomo",tip:"Ustaw dłuższą krawędź poziomo",run:()=>{st.psi=0}}],
 learn(D,c,viz){const g=glint(D.camPos),L=LEDp(),d=DIODY[st.dioda],nB=P[d.nk],aB=Math.atan(nB);
  viz.panel(c,[["tg α = x/y",LAB.fmt(st.x/st.y,3)],["α",LAB.fmt(Math.atan2(st.x,st.y)*180/Math.PI,1)+"°"],["kąt Brewstera (ukryte)",LAB.fmt(aB*180/Math.PI,1)+"°  (n = "+LAB.fmt(nB,2)+")"],
   ["R_s, R_p",g?LAB.fmt(g.F.Rs,3)+", "+LAB.fmt(g.F.Rp,4):"—"],["oś polaryzatora od krawędzi (ukryte)",LAB.fmt(P.beta,1)+"°"],["odblask widoczny",g?(g.through?"przez polaryzator":"bez polaryzatora"):"nie"]]);
  const R=add(C0,mul(eyeDir(),0.11));viz.line(c,D,L,C0,"rgba(230,120,40,.9)");viz.line(c,D,C0,R,"rgba(230,120,40,.9)");viz.line(c,D,C0,add(C0,V(0,-0.06,0)),"#777",true);
  if(g){const s=0.012*Math.sqrt(g.F.Rs),p=0.012*Math.sqrt(g.F.Rp)*4,m=add(C0,mul(eyeDir(),0.06)),h=nrm(cross(Z,eyeDir()));viz.arrow(c,D,m,V(0,0,s),"#8e44ad","E_s");viz.arrow(c,D,m,mul(h,p),"#16a085","E_p ×4")}
  viz.dim(c,D,V(-st.x,-0.002,0),V(0,-0.002,0),"x","#555");viz.dim(c,D,V(-st.x,-st.y,0),V(-st.x,0,0),"y","#555")},
 init(env){P=env.P;gauss=env.gauss||gauss;window.OF72_TEST={st,P:()=>P,glint,fresnel,eyeDir,C0,polC}},
 update(){},status(){return""},getState:()=>({...st}),setState(o){Object.assign(st,o)}});
})();
