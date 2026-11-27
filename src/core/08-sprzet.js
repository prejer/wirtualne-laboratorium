// ---------- biblioteka sprzętu: jeden wygląd każdego przedmiotu dla wszystkich zadań ----------
// Użycie w zadaniu: const S=LAB.sprzet; S.linijka({...}); S.karton({...}) … (rysuje w bieżącym widoku).
// Jednostki: metry. Kierunki: d — wzdłuż przedmiotu, w — w poprzek, n — „do góry” (normalna). Szczegóły: docs/BIBLIOTEKA.md.
const SX=V(1,0,0),SY=V(0,1,0);
const sprzet={
 // Linijka z podziałką mm. o: punkt „0 cm” na krawędzi z podziałką (na powierzchni, na której leży), d: wzdłuż, w: w głąb linijki.
 // n=cross(w,d) to strona z podziałką. przezroczysta: plastik do oglądania przez nią (np. pionowa przy ołówku).
 linijka({o,d=SX,w=V(0,-1,0),L=0.3,W=0.03,h=0.002,przezroczysta=false,kolor}={}){const n=nrm(cross(w,d)),start=-0.006,end=L+0.006;
  const c=add(o,add(mul(d,(start+end)/2),add(mul(w,W/2),mul(n,h/2))));const col=kolor||(przezroczysta?"rgba(235,240,236,.42)":"#e9e7df");
  if(przezroczysta){tapeNow(add(o,mul(n,h-0.0006)),d,w,L,W,{color:"rgba(250,250,244,.72)",labelUp:Math.abs(d.z)>0.9?"d":undefined})}
  else{box(c,mul(d,(end-start)/2),mul(w,W/2),mul(n,h/2),col,{amb:0.55});tapeNow(add(o,mul(n,h-0.0006)),d,w,L,W,{color:"#f7f6f0"})}},
 // Taśma miernicza / krawiecka (miękka, cienka). Parametry jak w linijce.
 miarka({o,d=SX,w=SY,L=1.5,W=0.016}={}){tapeNow(o,d,w,L,W)},
 // Tekturowy karton. c: środek podstawy (na stole), hx/hy/hz: połowy wymiarów; taśma pakowa na górze i zjazdy na ściany.
 karton({c,hx=0.15,hy=0.18,hz=0.225,kolor="#c4955f"}={}){const m=add(c,V(0,0,hz));
  box(m,mul(SX,hx),mul(SY,hy),mul(Z,hz),kolor,{amb:0.62,cols:["#c09366",kolor,kolor,kolor,"#c99c6c",kolor]});
  const t="#d2a872",o={amb:0.62,shadow:false};const z1=c.z+2*hz+0.0006,tw=0.03;
  face([V(m.x-hx-0.0006,m.y-tw,z1),V(m.x+hx+0.0006,m.y-tw,z1),V(m.x+hx+0.0006,m.y+tw,z1),V(m.x-hx-0.0006,m.y+tw,z1)],Z,"#c9a36f",o);
  for(const s of[-1,1]){const x=m.x+s*(hx+0.0006);face([V(x,m.y-tw,c.z+2*hz),V(x,m.y+tw,c.z+2*hz),V(x,m.y+tw,c.z+2*hz-0.06),V(x,m.y-tw,c.z+2*hz-0.06)].reverse(),mul(SX,s),t,o)}},
 // Kawałek taśmy klejącej przyklejony do powierzchni: c środek, n normalna powierzchni, u kierunek długości.
 tasma({c,n=Z,u=SX,dl=0.04,szer=0.026}={}){const v=nrm(cross(n,u)),p=add(c,mul(n,0.0007)),a=mul(u,dl/2),b=mul(v,szer/2);
  face([sub(sub(p,a),b),sub(add(p,a),b),add(add(p,a),b),add(sub(p,a),b)],n,"#ecebdc",{amb:0.7,shadow:false,alpha:0.88})},
 // Nić: łamana przez punkty.
 nic(pts,{grubosc=0.0007,kolor="#2b2b2b"}={}){for(let i=0;i<pts.length-1;i++)line(pts[i],pts[i+1],grubosc,kolor)},
 // Ołówek sześciokątny: P koniec (z pętelką nici), tip grafit.
 olowek(P,tip,{petla=true}={}){const L=len(sub(tip,P)),u=mul(sub(tip,P),1/L);const c1=add(P,mul(u,L-0.022)),c2=add(P,mul(u,L-0.0045));
  cyl(P,c1,0.0040,"#f0bd22",{n:6,rot:0.5,seg:0.03,metal:30,spec:0.35,amb:0.5,capCol:"#e8cfa0"});
  cyl(c1,c2,0.0035,"#e6c493",{n:12,r1:0.0011,caps:false,amb:0.55});cyl(c2,tip,0.0011,"#333",{n:8,r1:0.0002,caps:false,metal:20,spec:0.4});
  if(petla){const w=nrm(cross(u,Z));const lp=[];for(let k=0;k<=10;k++){const t=k/10*2*Math.PI;lp.push(add(add(P,mul(u,0.004)),add(mul(w,0.0046*Math.cos(t)),mul(nrm(cross(u,w)),0.0046*Math.sin(t)))))}for(let k=0;k<10;k++)line(lp[k],lp[k+1],0.0007,"#2b2b2b")}},
 // Kartka (biała), leżąca poziomo: prostokąt [x0,x1]×[y0,y1] na wysokości z.
 kartka({x0,x1,y0,y1,z=0.0003,kolor="#fbfbf7"}={}){quadNow([V(x0,y0,z),V(x1,y0,z),V(x1,y1,z),V(x0,y1,z)],kolor);lineNow(V(x0,y0,z),V(x1,y0,z),0.0004,"rgba(0,0,0,.12)")},
 // Papier milimetrowy: siatka 1 mm / 5 mm / 10 mm, tekstura powtarzana co 1 cm.
 papierMm({x0,x1,y0,y1,z=0.0003}={}){quadNow([V(x0,y0,z),V(x1,y0,z),V(x1,y1,z),V(x0,y1,z)],"#fdfcf6");
  texQuadNow([V(x0,y0,z+0.0001),V(x1,y0,z+0.0001),V(x1,y1,z+0.0001),V(x0,y1,z+0.0001)],[0,0,(x1-x0)/0.01,0,(x1-x0)/0.01,(y1-y0)/0.01,0,(y1-y0)/0.01],"papierMm",512,(g,S)=>{
   g.clearRect(0,0,S,S);const pm=S/10;for(let i=0;i<10;i++){g.fillStyle=i===0?"rgba(214,120,60,.85)":i===5?"rgba(214,120,60,.6)":"rgba(214,120,60,.32)";const w=i===0?4:i===5?2.5:1.5;
    g.fillRect(i*pm-w/2,0,w,S);g.fillRect(0,i*pm-w/2,S,w)}g.fillRect(S-2,0,2,S);g.fillRect(0,S-2,S,2)})},
 // Plastelina: spłaszczona bryłka.
 plastelina({c,r=0.012,kolor="#3f8f4f"}={}){const H=r*0.8;for(let k=0;k<4;k++){const z0=c.z+H*k/4,z1=c.z+H*(k+1)/4;const r0=r*Math.sqrt(1-Math.pow((k/4)*0.9,2)),r1=r*Math.sqrt(1-Math.pow(((k+1)/4)*0.9,2));
  cyl(V(c.x,c.y,z0),V(c.x,c.y,z1),r0,kolor,{r1,n:16,caps:k===3,amb:0.5})}},
 // Nakrętka stalowa M24 (klucz 36 mm, grubość 19 mm, otwór Ø24). c: środek, ax: oś otworu.
 nakretka(c,ax,{trzymana=false}={}){const Rc=0.0208,h=0.019,rh=0.0122;const e1=Z,e2=nrm(cross(ax,Z));const col=trzymana?"#c8b46a":"#8d949c",o={metal:28,spec:0.55,amb:0.35};
  const cor=(i,sg)=>add(c,add(mul(ax,sg*h/2),add(mul(e1,Rc*Math.cos(i*Math.PI/3+Math.PI/6)),mul(e2,Rc*Math.sin(i*Math.PI/3+Math.PI/6)))));
  const hol=(t,sg)=>add(c,add(mul(ax,sg*h/2),add(mul(e1,rh*Math.cos(t)),mul(e2,rh*Math.sin(t)))));
  for(let i=0;i<6;i++){const a0=i*Math.PI/3+Math.PI/6,a1=a0+Math.PI/3,am=(a0+a1)/2;face([cor(i,-1),cor(i+1,-1),cor(i+1,1),cor(i,1)],add(mul(e1,Math.cos(am)),mul(e2,Math.sin(am))),col,o);
   for(const sg of[-1,1]){const pts=[cor(i,sg),cor(i+1,sg),hol(a1,sg),hol(am,sg),hol(a0,sg)];face(sg>0?pts:pts.reverse(),mul(ax,sg),"#a3aab2",o)}
   for(let k=0;k<2;k++){const t0=a0+k*Math.PI/6,t1=t0+Math.PI/6,tm=(t0+t1)/2;face([hol(t0,-1),hol(t1,-1),hol(t1,1),hol(t0,1)],mul(add(mul(e1,Math.cos(tm)),mul(e2,Math.sin(tm))),-1),"#5d636a",{amb:0.5,shadow:false})}}},
 // Statyw oświetleniowy: trójnóg, kolumna teleskopowa z pokrętłem, złącze i poprzeczka wzdłuż osi Y.
 statyw({baza,H=0.6,belka=0.68,belkaY}={}){const by=belkaY??baza.y,blk="#26292e",sm={metal:14,spec:0.35},x=baza.x,y=baza.y;const hub=V(x,y,0.13);
  for(const a of[Math.PI/2+0.35,Math.PI*7/6,Math.PI*11/6-0.35]){const ft=V(x+0.23*Math.cos(a),y+0.2*Math.sin(a),0.008);cyl(hub,ft,0.0065,blk,{n:8,...sm,caps:false});cyl(ft,add(ft,V(0,0,-0.008)),0.011,"#111",{n:8});
   const mid=add(hub,mul(sub(ft,hub),0.55));cyl(V(x,y,0.06),mid,0.0035,blk,{n:6,caps:false})}
  cyl(V(x,y,0.05),V(x,y,0.14),0.017,"#1c1e22",{n:12,...sm});cyl(V(x,y,0.14),V(x,y,0.40),0.0125,blk,{n:12,...sm});
  cyl(V(x,y,0.395),V(x,y,0.425),0.016,"#1c1e22",{n:12});cyl(V(x,y+0.012,0.41),V(x,y+0.04,0.41),0.004,"#1c1e22",{n:6});cyl(V(x,y+0.04,0.41),V(x,y+0.046,0.41),0.012,"#1c1e22",{n:8});
  cyl(V(x,y,0.425),V(x,y,H-0.02),0.0095,"#3a3e44",{n:12,metal:20,spec:0.4});
  box(V(x,y,H),mul(SX,0.018),mul(SY,0.024),mul(Z,0.022),"#1c1e22",sm);cyl(V(x-0.018,y,H),V(x-0.045,y,H),0.004,"#1c1e22",{n:6});cyl(V(x-0.045,y,H),V(x-0.05,y,H),0.016,"#1c1e22",{n:6,r1:0.006});
  cyl(V(x,by-belka/2,H),V(x,by+belka/2,H),0.0125,"#1a1c20",{n:14,seg:0.04,metal:18,spec:0.3,capCol:"#33373d"})},
 // Ścisk stolarski typu F na krawędzi blatu (krawędź y=0, blat z∈[−th,0]). x: położenie wzdłuż krawędzi,
 // zGora: wysokość dolnej powierzchni górnej szczęki (dociska przedmiot leżący na krawędzi).
 scisk({x,zGora=0.0186,th=0.028}={}){const by=0.034,zt=0.026,zb=-0.064,st={metal:24,spec:0.5};
  box(V(x,-0.03,zb),mul(SX,0.008),mul(SY,0.032),mul(Z,0.007),"#34383e",st);cyl(V(x,-0.045,zb+0.007),V(x,-0.045,-th-0.006),0.004,"#9aa1a9",{metal:30,n:8});
  cyl(V(x,-0.045,-th-0.006),V(x,-0.045,-th),0.011,"#1f2226",{n:12});cyl(V(x,-0.045,zb-0.008),V(x,-0.045,zb-0.06),0.011,"#c2342b",{n:10,r1:0.0095});
  cyl(V(x,by,zt+0.03),V(x,by,zb-0.012),0.006,"#a7adb5",{n:8,metal:30});box(V(x,0.012,zt+0.004),mul(SX,0.009),mul(SY,0.026),mul(Z,0.008),"#2a2e33",st);
  cyl(V(x,-0.004,zt-0.004),V(x,-0.004,zGora),0.008,"#1f2226",{n:10});box(V(x,0.017,zb),mul(SX,0.008),mul(SY,0.017),mul(Z,0.007),"#34383e",st)},
 // Paczka chusteczek higienicznych.
 chusteczki({c}={}){box(add(c,V(0,0,0.018)),mul(SX,0.055),mul(SY,0.03),mul(Z,0.018),"#f2f4f7",{cols:["#f2f4f7","#f2f4f7","#f2f4f7","#f2f4f7","#4a8fd6","#f2f4f7"]})},
 // Spinacz kartki (czarny klips z drucianymi uchwytami): c środek klipsa leżącego na blacie.
 klips({c}={}){box(add(c,V(0,0,0.004)),mul(SX,0.012),mul(SY,0.016),mul(Z,0.004),"#22252a",{metal:20,spec:0.3});const o={n:5,metal:40},k="#b9bfc6",x=c.x,y=c.y;
  cyl(V(x+0.008,y-0.012,0.008),V(x+0.026,y-0.012,0.012),0.0008,k,o);cyl(V(x+0.008,y+0.012,0.008),V(x+0.026,y+0.012,0.012),0.0008,k,o);cyl(V(x+0.026,y-0.012,0.012),V(x+0.026,y+0.012,0.012),0.0008,k,o)}
};
