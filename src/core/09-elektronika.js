// ---------- biblioteka sprzętu: elektronika (mierniki, zasilacz, przewody, elementy) ----------
// Wszystko stoi na blacie (z=0) i jest ustawione „frontem” do −y (do osoby przy stole). Szczegóły: docs/BIBLIOTEKA.md.
const RASTER=0.00254;   // raster płytki stykowej i nóżek elementów: 0,1 cala
// wyświetlacz LCD/LED: prostokąt pts=[lewy-górny, prawy-górny, prawy-dolny, lewy-dolny], tekst rysowany do tekstury
function wyswietlacz(pts,tekst,{tlo="#b7c2a3",kolor="#1d2420",swieci=false,w,h}={}){
 w=w??len(sub(pts[1],pts[0]));h=h??len(sub(pts[3],pts[0]));quadNow(pts,tlo,2);if(tekst==null||tekst==="")return;
 texQuadNow(pts,[0,0,1,0,1,1,0,1],"dyn:"+tekst+"|"+kolor+"|"+(w/h).toFixed(2),256,(g,S)=>{g.clearRect(0,0,S,S);const a=w/h;g.save();g.scale(1/a,1);const W=S*a;
  let fs=S*0.74;g.font=`700 ${Math.round(fs)}px "DejaVu Sans Mono","Consolas",monospace`;const tw=g.measureText(tekst).width;if(tw>W*0.86){fs*=W*0.86/tw;g.font=`700 ${Math.round(fs)}px "DejaVu Sans Mono","Consolas",monospace`}g.textAlign="right";g.textBaseline="middle";
  if(swieci){g.shadowColor=kolor;g.shadowBlur=S*0.06}g.fillStyle=kolor;g.fillText(tekst,W-S*0.12,S*0.56);g.restore()})}
const nozka=(a,b,kol="#c9ced4")=>cyl(a,b,0.00025,kol,{n:5,caps:false,metal:40,spec:0.5,shadow:false});
Object.assign(sprzet,{
 RASTER,
 // Multimetr cyfrowy (typu 830): c środek podstawy. odczyt: tekst na LCD ("" = wyłączony), pokretlo: kąt pokrętła [rad].
 // Gniazda (do przewodów): multimetr.gniazda(c) → {com, v, a10}, wtyki wchodzą pionowo.
 multimetr({c,odczyt="",pokretlo=0}={}){const H=0.032,top=c.z+H;
  box(add(c,V(0,0,H/2)),mul(SX,0.039),mul(SY,0.072),mul(Z,H/2),"#e6b422",{amb:0.5,spec:0.2});
  box(add(c,V(0,0,H+0.0008)),mul(SX,0.033),mul(SY,0.066),mul(Z,0.0008),"#2a2e34",{amb:0.5,shadow:false});
  const z=top+0.0017;wyswietlacz([V(c.x-0.026,c.y+0.062,z),V(c.x+0.026,c.y+0.062,z),V(c.x+0.026,c.y+0.032,z),V(c.x-0.026,c.y+0.032,z)],odczyt);
  const k=V(c.x,c.y+0.002,z);cyl(k,add(k,V(0,0,0.006)),0.019,"#1c1f23",{n:24,amb:0.45,spec:0.3});const kt=add(k,V(0,0,0.0062));
  cyl(add(kt,V(0.0075*Math.sin(pokretlo),-0.0075*Math.cos(pokretlo),0)),add(kt,V(-0.0075*Math.sin(pokretlo),0.0075*Math.cos(pokretlo),0)),0.0028,"#33373d",{n:6,amb:0.5});
  cyl(add(kt,V(0.012*Math.sin(pokretlo),-0.012*Math.cos(pokretlo),0.0001)),add(kt,V(0.016*Math.sin(pokretlo),-0.016*Math.cos(pokretlo),0.0001)),0.0009,"#f2f2f2",{n:5,amb:0.9,caps:false,shadow:false});
  for(let i=0;i<12;i++){const t=i/12*2*Math.PI;stripNow(add(k,V(0.021*Math.sin(t),-0.021*Math.cos(t),0)),add(k,V(0.024*Math.sin(t),-0.024*Math.cos(t),0)),0.0006,"#d9dde2",3)}
  const g=sprzet.gniazdaMultimetru(c);for(const[n,p]of Object.entries(g)){cyl(p,add(p,V(0,0,-0.0001)),0.0042,n==="v"?"#b8231b":"#15171a",{n:14,amb:0.6,shadow:false});cyl(add(p,V(0,0,-0.0002)),add(p,V(0,0,-0.0003)),0.0022,"#060708",{n:10,shadow:false})}},
 gniazdaMultimetru(c){const z=c.z+0.0348;return{a10:V(c.x-0.022,c.y-0.052,z),com:V(c.x,c.y-0.052,z),v:V(c.x+0.022,c.y-0.052,z)}},
 // Zasilacz laboratoryjny: c środek podstawy, U i I — teksty na wyświetlaczach. Zaciski: zasilacz.zaciski(c) → {plus, minus} (wtyk wchodzi w −y).
 // Pokrętła: zasilacz.pokretla(c) → {U, I} (punkty do chwytania).
 zasilacz({c,U="0.00",I="0.000",kU=0,kI=0}={}){const hx=0.105,hy=0.13,hz=0.07,f=c.y-hy;
  box(add(c,V(0,0,hz)),mul(SX,hx),mul(SY,hy),mul(Z,hz),"#c9ccd1",{amb:0.5,spec:0.25,cols:["#c9ccd1","#c9ccd1","#c9ccd1","#30343a","#d3d6da","#c9ccd1"]});
  const y=f-0.0004;wyswietlacz([V(c.x-0.088,y,c.z+0.124),V(c.x-0.012,y,c.z+0.124),V(c.x-0.012,y,c.z+0.096),V(c.x-0.088,y,c.z+0.096)],U,{tlo:"#140b0a",kolor:"#ff3b2f",swieci:true});
  wyswietlacz([V(c.x+0.012,y,c.z+0.124),V(c.x+0.088,y,c.z+0.124),V(c.x+0.088,y,c.z+0.096),V(c.x+0.012,y,c.z+0.096)],I,{tlo:"#0a120b",kolor:"#3cff6a",swieci:true});
  const kp=sprzet.pokretlaZasilacza(c);for(const[k,a]of[[kp.U,kU],[kp.I,kI]]){cyl(V(k.x,f,k.z),V(k.x,f-0.016,k.z),0.012,"#1b1d21",{n:20,amb:0.45,spec:0.35});
   const u=V(Math.sin(a),0,Math.cos(a));box(add(V(k.x,f-0.0163,k.z),mul(u,0.0075)),mul(u,0.003),mul(SX.x?V(-u.z,0,u.x):SX,0.0007),mul(SY,0.0003),"#f2f2f2",{amb:0.95,shadow:false})}
  const zc=sprzet.zaciskiZasilacza(c);for(const[n,p]of Object.entries(zc)){const col=n==="plus"?"#c0271d":"#16181b";cyl(V(p.x,f,p.z),V(p.x,f-0.008,p.z),0.0075,col,{n:16,amb:0.55,spec:0.4});
   cyl(V(p.x,f-0.008,p.z),V(p.x,f-0.0082,p.z),0.0021,"#050505",{n:10,shadow:false})}
  for(const[x,col,pl]of[[0.082,"#c0271d",1],[0.056,"#222",0]]){stripNow(V(c.x+x-0.004,y,c.z+0.052),V(c.x+x+0.004,y,c.z+0.052),0.0011,col,3);if(pl)stripNow(V(c.x+x,y,c.z+0.048),V(c.x+x,y,c.z+0.056),0.0011,col,3)}},
 pokretlaZasilacza(c){return{U:V(c.x-0.05,c.y-0.13,c.z+0.06),I:V(c.x+0.02,c.y-0.13,c.z+0.06)}},
 zaciskiZasilacza(c){return{plus:V(c.x+0.082,c.y-0.13-0.008,c.z+0.035),minus:V(c.x+0.056,c.y-0.13-0.008,c.z+0.035)}},
 // Przewód z wtykami: a, b — końce wtyków (w gnieździe / na zacisku), kA, kB — kierunek, w którym wtyk wychodzi z gniazda.
 // wtyk: "banan" (mierniki, zasilacz), "krokodyl" (zacisk na blaszce), "pin" (płytka stykowa). Przewód leży na stole i sam się układa.
 przewod({a,b,kA=Z,kB=Z,kolor="#c0271d",wtykA="banan",wtykB="banan",luz=0.25,bok=0.4}={}){
  const wt=(p,k,typ)=>{if(typ==="pin"){cyl(p,add(p,mul(k,0.006)),0.00032,"#c9ced4",{n:5,metal:40,caps:false});cyl(add(p,mul(k,0.006)),add(p,mul(k,0.014)),0.0011,"#222",{n:8});return add(p,mul(k,0.014))}
   if(typ==="krokodyl"){const s=nrm(cross(k,Z).x||cross(k,Z).y?cross(k,Z):SX);box(add(p,mul(k,0.012)),mul(k,0.013),mul(s,0.0035),mul(nrm(cross(k,s)),0.004),"#b8bdc3",{metal:40,spec:0.6});
    box(add(p,mul(k,0.03)),mul(k,0.008),mul(s,0.0045),mul(nrm(cross(k,s)),0.0048),kolor,{amb:0.5,spec:0.3});return add(p,mul(k,0.038))}
   cyl(p,add(p,mul(k,0.004)),0.0017,"#b9bec4",{n:8,metal:40,spec:0.6,caps:false});cyl(add(p,mul(k,0.004)),add(p,mul(k,0.026)),0.0042,kolor,{n:12,amb:0.5,spec:0.35,r1:0.0034});return add(p,mul(k,0.026))};
  const A=wt(a,kA,wtykA),B=wt(b,kB,wtykB),d=len(sub(B,A)),reach=Math.max(0.03,d*luz+0.03);
  const C1=add(A,mul(kA,reach)),C2=add(B,mul(kB,reach));const side=mul(nrm(cross(sub(B,A),Z)),d*bok*0.25);
  const pts=[];const N=Math.max(12,Math.round(d/0.01));for(let i=0;i<=N;i++){const t=i/N,u=1-t;let p=add(add(mul(A,u*u*u),mul(C1,3*u*u*t)),add(mul(C2,3*u*t*t),mul(B,t*t*t)));
   p=add(p,mul(side,Math.sin(Math.PI*t)));const zf=p.z-(reach*1.2+d*0.6)*Math.sin(Math.PI*t);p=V(p.x,p.y,i===0||i===N?p.z:Math.max(0.0018,Math.min(p.z,zf)));pts.push(p)}
  for(let i=0;i<N;i++)cyl(pts[i],pts[i+1],0.0016,kolor,{n:8,amb:0.5,spec:0.3,seg:1})},
 // Płytka stykowa (30 kolumn × 2×5 rzędów + szyny). dziura(c,kol,rz): rz 0–4 = a–e (bliżej), 5–9 = f–j.
 plytkaStykowa({c}={}){const hx=0.0425,hy=0.0285,h=0.0085,z=c.z+h;box(add(c,V(0,0,h/2)),mul(SX,hx),mul(SY,hy),mul(Z,h/2),"#f1f0ea",{amb:0.6,spec:0.15});
  const area=(y0,y1,nx)=>{const x0=c.x-15*RASTER,x1=x0+nx*RASTER,ny=Math.round((y1-y0)/RASTER);
   texQuadNow([V(x0,y0,z),V(x1,y0,z),V(x1,y1,z),V(x0,y1,z)],[0,0,nx,0,nx,ny,0,ny],"dziurka",64,(g,S)=>{g.clearRect(0,0,S,S);g.fillStyle="rgba(40,40,40,.85)";g.fillRect(S*0.32,S*0.32,S*0.36,S*0.36)})};
  const d0=sprzet.dziura(c,0,0),d9=sprzet.dziura(c,0,9);area(d0.y-RASTER/2,d0.y+4.5*RASTER,30);area(d9.y-4.5*RASTER,d9.y+RASTER/2,30);
  quadNow([V(c.x-hx+0.002,c.y-0.0012,z),V(c.x+hx-0.002,c.y-0.0012,z),V(c.x+hx-0.002,c.y+0.0012,z),V(c.x-hx+0.002,c.y+0.0012,z)],"#d6d4cc",2);
  for(const[s,col]of[[-1,"#2f62c6"],[1,"#d0352b"]]){const y=c.y+s*(hy-0.0035);stripNow(V(c.x-hx+0.004,y,z),V(c.x+hx-0.004,y,z),0.0006,col,2);
   const yy=c.y+s*(hy-0.0075);stripNow(V(c.x-hx+0.004,yy,z),V(c.x+hx-0.004,yy,z),0.0006,s<0?"#d0352b":"#2f62c6",2)}},
 dziura(c,kol,rz){const y=rz<5?c.y-0.0035-(4-rz)*RASTER:c.y+0.0035+(rz-5)*RASTER;return V(c.x+(kol-14.5)*RASTER,y,c.z+0.0085)},
 // Opornik osiowy: a, b — punkty, gdzie nóżki wchodzą w płytkę/stół; paski: kolory pasków (np. 330 Ω: pomarańcz, pomarańcz, brąz, złoty).
 opornik({a,b,paski=["#e07b1f","#e07b1f","#7a4a1f","#c9a64a"],h=0.004}={}){const m=mul(add(a,b),0.5),u=nrm(sub(b,a)),L=0.0063,top=add(m,V(0,0,h));
  const e1=add(top,mul(u,-L/2)),e2=add(top,mul(u,L/2));nozka(a,add(a,V(0,0,h)));nozka(b,add(b,V(0,0,h)));nozka(add(a,V(0,0,h)),e1);nozka(e2,add(b,V(0,0,h)));
  cyl(add(e1,mul(u,0.0004)),add(e2,mul(u,-0.0004)),0.0012,"#d9c79a",{n:12,amb:0.55,spec:0.25});cyl(e1,add(e1,mul(u,0.0012)),0.00135,"#d9c79a",{n:12,r1:0.0013});cyl(add(e2,mul(u,-0.0012)),e2,0.0013,"#d9c79a",{n:12,r1:0.00135});
  paski.forEach((col,i)=>{const t=i<3?-0.0021+i*0.0011:0.0021;cyl(add(top,mul(u,t-0.00035)),add(top,mul(u,t+0.00035)),0.00128,col,{n:12,caps:false,amb:0.55})})},
 // Dioda LED 5 mm stojąca na nóżkach: a — anoda (dłuższa nóżka), k — katoda. swieci: 0–1 (jasność).
 led({a,k,kolor="#e3261c",swieci=0,h=0.012}={}){const m=mul(add(a,k),0.5),top=add(m,V(0,0,h));nozka(a,add(a,V(0,0,h)));nozka(k,add(k,V(0,0,h)));
  const lit=Math.max(0,Math.min(1,swieci)),o={n:16,amb:0.45+0.55*lit,spec:0.5,alpha:0.85};
  cyl(top,add(top,V(0,0,0.001)),0.0029,kolor,{...o,n:16});cyl(add(top,V(0,0,0.001)),add(top,V(0,0,0.0065)),0.0025,kolor,o);
  cyl(add(top,V(0,0,0.0065)),add(top,V(0,0,0.0083)),0.0025,kolor,{...o,r1:0.0008});
  if(lit>0.02){const g=add(top,V(0,0,0.005));cyl(add(g,V(0,0,-0.006)),add(g,V(0,0,0.007)),0.0075*(0.6+0.6*lit),kolor,{n:16,r1:0.002,alpha:0.18*lit,amb:1,shadow:false,caps:false})}},
 // Kondensator elektrolityczny stojący: c — środek między nóżkami (na płytce/stole).
 kondensator({c,r=0.004,h=0.011,kolor="#24477e"}={}){const z0=c.z+0.003;nozka(add(c,V(-0.001,0,0)),add(c,V(-0.001,0,0.003)));nozka(add(c,V(0.0015,0,0)),add(c,V(0.0015,0,0.003)));
  cyl(V(c.x,c.y,z0),V(c.x,c.y,z0+h),r,kolor,{n:18,amb:0.5,spec:0.45,capCol:"#b9bfc6"});box(V(c.x,c.y-r*0.97,z0+h/2),mul(SX,0.0012),mul(SY,0.0005),mul(Z,h/2-0.0006),"#b9c6d6",{amb:0.6,shadow:false})},
 // Tranzystor w obudowie TO-92: c — środkowa nóżka.
 tranzystor({c,h=0.006}={}){for(const dx of[-RASTER,0,RASTER])nozka(add(c,V(dx,0,0)),add(c,V(dx,0,h)));const b=add(c,V(0,0,h));
  box(add(b,V(0,-0.0004,0.0026)),mul(SX,0.0024),mul(SY,0.0006),mul(Z,0.0026),"#1d1f22",{amb:0.45});cyl(add(b,V(0,0.0002,0)),add(b,V(0,0.0002,0.0052)),0.0023,"#1d1f22",{n:14,amb:0.45,spec:0.35})},
 // Bateria płaska 4,5 V (3R12): c środek podstawy; blaszki: bateriaPlaska.blaszki(c) → {plus (krótka), minus (długa)}.
 bateriaPlaska({c}={}){const hz=0.0325;box(add(c,V(0,0,hz)),mul(SX,0.031),mul(SY,0.011),mul(Z,hz),"#d23a2a",{amb:0.5,spec:0.3,cols:["#d23a2a","#d23a2a","#d23a2a","#d23a2a","#2a2c30","#d23a2a"]});
  stripNow(V(c.x-0.0312,c.y-0.0112,c.z+0.02),V(c.x+0.0312,c.y-0.0112,c.z+0.02),0.012,"#f0c419",2);
  const bl=sprzet.blaszkiBaterii(c);box(add(bl.plus,V(0,0,-0.006)),mul(SX,0.003),mul(SY,0.0003),mul(Z,0.006),"#d8b45a",{metal:40,spec:0.6});
  const mm=bl.minus;box(add(mm,V(0,0,-0.0125)),mul(SX,0.003),mul(SY,0.0003),mul(Z,0.0125),"#d8b45a",{metal:40,spec:0.6})},
 blaszkiBaterii(c){return{plus:V(c.x-0.014,c.y,c.z+0.077),minus:V(c.x+0.014,c.y,c.z+0.09)}},
 // Bateria AA (R6) leżąca: c środek, os — kierunek do bieguna +.
 bateriaAA({c,os=SX}={}){const r=0.007,L=0.05,a=add(c,mul(os,-L/2)),b=add(c,mul(os,L/2));const lift=V(0,0,r);
  cyl(add(a,lift),add(a,add(lift,mul(os,0.03))),r,"#1f2a3a",{n:18,amb:0.45,spec:0.5,capCol:"#b9bfc6"});cyl(add(a,add(lift,mul(os,0.03))),add(b,lift),r,"#c9a23a",{n:18,amb:0.45,spec:0.5,capCol:"#b9bfc6"});
  cyl(add(b,lift),add(b,add(lift,mul(os,0.0015))),0.0025,"#c4c9cf",{n:12,metal:40})},
 // Magnes neodymowy (walec): c środek podstawy.
 magnes({c,r=0.006,h=0.003}={}){cyl(c,add(c,V(0,0,h)),r,"#c3c8ce",{n:24,metal:60,spec:0.8,amb:0.35})},
 // Żarówka 3,5 V w oprawce: c środek podstawy. swieci 0–1.
 zarowka({c,swieci=0}={}){const lit=Math.max(0,Math.min(1,swieci));cyl(c,add(c,V(0,0,0.008)),0.012,"#2b2e33",{n:18,amb:0.45});
  cyl(add(c,V(0,0,0.008)),add(c,V(0,0,0.016)),0.005,"#c9ced4",{n:14,metal:45,spec:0.6});
  cyl(add(c,V(0,0,0.016)),add(c,V(0,0,0.024)),0.0055,"#f2f2ea",{n:16,r1:0.0055,alpha:0.35,amb:0.6+0.4*lit,caps:false});cyl(add(c,V(0,0,0.024)),add(c,V(0,0,0.03)),0.0055,"#f2f2ea",{n:16,r1:0.0015,alpha:0.35,amb:0.6+0.4*lit});
  cyl(add(c,V(0,0,0.0215)),add(c,V(0,0,0.0225)),0.0016,lit>0.05?"#fff3b0":"#666",{n:6,amb:0.3+0.7*lit,shadow:false});
  if(lit>0.05)cyl(add(c,V(0,0,0.012)),add(c,V(0,0,0.036)),0.016*(0.6+0.5*lit),"#ffe680",{n:16,r1:0.004,alpha:0.16*lit,amb:1,shadow:false,caps:false});
  for(const s of[-1,1])cyl(add(c,V(s*0.01,-0.008,0.004)),add(c,V(s*0.01,-0.014,0.004)),0.0022,"#b9bec4",{n:8,metal:40})}
,
 // Stoper elektroniczny leżący na stole: c środek podstawy, czas [s] — wyświetlany jak na prawdziwym stoperze (mm:ss.ss).
 stoper({c,czas=0,biegnie=false}={}){const t=Math.max(0,czas),m=Math.floor(t/60),sx=(t-60*m).toFixed(2).padStart(5,"0");
  box(add(c,V(0,0,0.007)),mul(SX,0.03),mul(SY,0.038),mul(Z,0.007),"#2f3d52",{amb:0.5,spec:0.35});cyl(add(c,V(0,0.038,0.007)),add(c,V(0,0.046,0.007)),0.004,"#9aa2ab",{n:10,metal:40});
  const z=c.z+0.0142;wyswietlacz([V(c.x-0.024,c.y+0.026,z),V(c.x+0.024,c.y+0.026,z),V(c.x+0.024,c.y+0.004,z),V(c.x-0.024,c.y+0.004,z)],String(m).padStart(2,"0")+":"+sx);
  for(const[dx,col]of[[-0.014,"#c0392b"],[0.014,"#3a7d44"]])cyl(V(c.x+dx,c.y-0.018,z-0.0005),V(c.x+dx,c.y-0.018,z+0.0018),0.0055,col,{n:14,amb:0.5});
  if(biegnie)stripNow(V(c.x+0.02,c.y+0.0015,z),V(c.x+0.023,c.y+0.0015,z),0.0016,"#e74c3c",3)},
 // Napis (cyfry, znaczki) na powierzchni: pts jak w wyświetlaczu, tekst jasny/ciemny, tło przezroczyste.
 napis(pts,tekst,kolor="#f2f2f2"){texQuadNow(pts,[0,0,1,0,1,1,0,1],"lbl:"+tekst+"|"+kolor,128,(g,S)=>{g.clearRect(0,0,S,S);g.fillStyle=kolor;g.font=`700 ${Math.round(S*0.8)}px system-ui,sans-serif`;g.textAlign="center";g.textBaseline="middle";g.fillText(tekst,S/2,S*0.55)})}
});