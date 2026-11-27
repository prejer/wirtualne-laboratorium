/* Liceum (podstawa programowa, zakres rozszerzony, X.18 e) — Załamanie światła i kąt graniczny.
   Tarcza optyczna ze skalą kątową, półwalec z pleksi w środku, laser na obrzeżu.
   Fizyka: prawo Snella, wzory Fresnela (jasność promienia odbitego i załamanego), całkowite wewnętrzne odbicie.
   n jest ukryte (losowe dla zestawu) — uczeń wyznacza je z pomiaru kąta granicznego albo z pary kątów (α, β). */
(()=>{const{V,add,sub,mul,len,nrm,Z}=LAB;const S=LAB.sprzet;let P={};
const TB={x0:-0.5,x1:0.5,y0:-0.4,y1:0.4},RD=0.15,TD=0.004,RB=0.05,HB=0.02,ZB=TD+0.0002;
const LAS=[{n:"czerwony",rgb:"255,40,30",dn:0},{n:"zielony",rgb:"40,255,70",dn:0.006}];
const st={phi:20,flip:false,laser:0};
const O=V(0,0,ZB);const dirA=a=>V(Math.sin(a*Math.PI/180),-Math.cos(a*Math.PI/180),0);   // kierunek od środka do punktu na obwodzie (kąt od normalnej −y)
function fres(n1,n2,ci){const si=Math.sqrt(1-ci*ci),st2=n1/n2*si;if(st2>=1)return{R:1,T:0,tir:true};const ct=Math.sqrt(1-st2*st2);
 const rs=(n1*ci-n2*ct)/(n1*ci+n2*ct),rp=(n2*ci-n1*ct)/(n2*ci+n1*ct),R=(rs*rs+rp*rp)/2;return{R,T:1-R,tir:false,bt:Math.asin(st2)}}
function rays(){const n=P.n+LAS[st.laser].dn,a=st.phi*Math.PI/180,ci=Math.cos(a),side=st.flip?1:-1;   // side: po której stronie (−y / +y) jest łuk półwalca
 // laser zawsze po stronie −y; bez obrotu promień wchodzi przez łuk (bez załamania) i pada na płaską ścianę od strony szkła
 const f=st.flip?fres(1,n,ci):fres(n,1,ci);const din=mul(dirA(st.phi),-1);
 const refl=V(din.x,-din.y,0),out=f.tir?null:V(Math.sign(din.x)*Math.sin(f.bt)||0,din.y>0?Math.cos(f.bt):-Math.cos(f.bt),0);
 return{n,f,din,refl,out,inGlassIn:!st.flip,side}}
function strip(D,a,b,w,rgb,al,layer){if(al<0.01)return;D.stripNow(a,b,w,`rgba(${rgb},${Math.min(1,al).toFixed(3)})`,layer)}
function beam(D,a,b,I,rgb){strip(D,a,b,0.006,rgb,0.12*I,3);strip(D,a,b,0.0022,rgb,0.45*I,4);strip(D,a,b,0.0008,"255,245,235",0.9*I,5)}
function draw(D){const L=LAS[st.laser],R=rays();
 // tarcza: biały krążek z naniesioną skalą kątową
 D.cyl(V(0,0,0),V(0,0,TD),RD,"#f4f2ea",{n:72,amb:0.62,spec:0.15,capCol:"#f7f5ee"});
 D.texQuadNow([V(-RD,-RD,TD+0.00005),V(RD,-RD,TD+0.00005),V(RD,RD,TD+0.00005),V(-RD,RD,TD+0.00005)],[0,1,1,1,1,0,0,0],"tarcza2",1024,(g,Sz)=>{g.clearRect(0,0,Sz,Sz);const c=Sz/2,r=Sz/2*0.985;g.strokeStyle="#222";g.fillStyle="#222";g.textAlign="center";g.textBaseline="middle";
  for(let d=0;d<360;d++){const t=d*Math.PI/180,l=d%10===0?0.07:d%5===0?0.045:0.025;g.lineWidth=d%10===0?2.4:1.3;g.beginPath();g.moveTo(c+r*Math.sin(t),c+r*Math.cos(t));g.lineTo(c+r*(1-l)*Math.sin(t),c+r*(1-l)*Math.cos(t));g.stroke();
   if(d%10===0){const lab=d<=90?d:d<=180?180-d:d<=270?d-180:360-d;g.save();g.translate(c+r*0.87*Math.sin(t),c+r*0.87*Math.cos(t));g.rotate(-t);g.font=`600 ${Math.round(Sz*0.022)}px system-ui,sans-serif`;g.fillText(String(lab),0,0);g.restore()}}
  g.lineWidth=1.6;g.setLineDash([10,8]);g.beginPath();g.moveTo(c,c-r*0.8);g.lineTo(c,c+r*0.8);g.stroke();g.beginPath();g.moveTo(c-r*0.8,c);g.lineTo(c+r*0.8,c);g.stroke()});
 // promienie (smuga lasera na tarczy)
 const Ls=add(O,mul(dirA(st.phi),0.155)),I0=1;
 if(!st.flip){beam(D,Ls,O,I0,L.rgb);beam(D,O,add(O,mul(R.refl,RB)),R.f.R,L.rgb);beam(D,add(O,mul(R.refl,RB)),add(O,mul(R.refl,0.149)),R.f.R*0.96,L.rgb);if(R.out)beam(D,O,add(O,mul(R.out,0.149)),R.f.T,L.rgb)}
 else{beam(D,Ls,O,I0,L.rgb);beam(D,O,add(O,mul(R.refl,0.149)),R.f.R,L.rgb);if(R.out){beam(D,O,add(O,mul(R.out,RB)),R.f.T,L.rgb);beam(D,add(O,mul(R.out,RB)),add(O,mul(R.out,0.149)),R.f.T*0.96,L.rgb)}}
 // półwalec z pleksi (przezroczysty): płaska ściana w y = 0, łuk po stronie side
 const n=40,col="rgba(205,232,240,.32)",z0=ZB,z1=ZB+HB,pt=(k,z)=>{const t=Math.PI*k/n;return V(RB*Math.cos(t),R.side*RB*Math.sin(t),z)};
 for(let k=0;k<n;k++)D.quadNow([pt(k,z0),pt(k+1,z0),pt(k+1,z1),pt(k,z1)],col);
 const top=[],bot=[];for(let k=0;k<=n;k++){top.push(pt(k,z1));bot.push(pt(k,z0))}D.quadNow(top,"rgba(215,238,244,.22)");D.quadNow([V(-RB,0,z0),V(RB,0,z0),V(RB,0,z1),V(-RB,0,z1)],"rgba(225,242,248,.28)");
 for(let k=0;k<n;k++)D.lineNow(pt(k,z1),pt(k+1,z1),0.0004,"rgba(120,160,170,.7)");D.lineNow(V(-RB,0,z1),V(RB,0,z1),0.0004,"rgba(120,160,170,.7)");
 // laser na wysięgniku za obrzeżem tarczy
 const d=dirA(st.phi),a=add(O,mul(d,0.16)),b=add(O,mul(d,0.27));D.cyl(V(a.x,a.y,ZB+0.0005),V(b.x,b.y,ZB+0.0005),0.0065,"#2b2f36",{n:16,metal:30,spec:0.6});
 D.cyl(V(a.x,a.y,ZB+0.0005),V(a.x-d.x*0.004,a.y-d.y*0.004,ZB+0.0005),0.003,`rgb(${L.rgb})`,{n:12,amb:1});const m=add(O,mul(d,0.215));
 D.box(V(m.x,m.y,0.0028),V(0.012,0,0),V(0,0.012,0),V(0,0,0.0028),"#3a3f47",{metal:20})}
LAB.defineTask({id:"lo-zalamanie",
 meta:{kicker:"Liceum · matura rozszerzona · X.18",title:"Załamanie światła i kąt graniczny",desc:"Laser, półwalec z pleksi i tarcza ze skalą kątową. Zbadaj prawo Snella i wyznacz współczynnik załamania z kąta granicznego."},
 taskHtml:`<h2>Załamanie światła i kąt graniczny</h2><p><b>Masz:</b> tarczę optyczną ze skalą kątową, półwalec z pleksi ustawiony płaską ścianą na średnicy tarczy, laser.</p>
 <p><b>Zadania:</b> 1) Zmierz kąty padania i załamania dla kilku położeń lasera, sprawdź prawo Snella. 2) Wyznacz kąt graniczny i z niego współczynnik załamania pleksi.</p>
 <p class="muted">Przesuwaj laser po obwodzie tarczy. Gdy światło wychodzi ze szkła do powietrza, przy pewnym kącie promień załamany znika — to całkowite wewnętrzne odbicie. Przyciskiem „Obróć półwalec” zmienisz kierunek: powietrze → szkło.</p>`,
 hints:["Promień biegnący wzdłuż promienia łuku przechodzi przez łuk bez załamania — załamuje się tylko na płaskiej ścianie w środku tarczy.","Prawo Snella: n₁·sin α = n₂·sin β. Wykres sin β od sin α to prosta.","Na granicy szkło–powietrze: sin α_gr = 1/n, więc n = 1/sin α_gr."],
 params:{n:{min:1.475,max:1.515}},
 scene:{table:TB,draw,light:V(0.3,-0.5,1)},
 views:[{label:"Z góry",cam:()=>({t:V(0,-0.03,0),yaw:Math.PI,pitch:1.565,dist:0.62})},{label:"3D",cam:()=>({t:V(0,0.0,0.0),yaw:Math.PI+0.5,pitch:0.62,dist:0.6})},{label:"Środek",cam:()=>({t:O,yaw:Math.PI,pitch:1.565,dist:0.18})}],
 movables:[{id:"laser",label:"Laser",hint:"przesuwaj po obwodzie tarczy",grab:()=>{const d=dirA(st.phi);return{p:add(O,mul(d,0.215)),r:0.02,axis:V(-d.y,d.x,0),onMove:ds=>{st.phi=Math.max(-89,Math.min(89,st.phi+ds/0.215*180/Math.PI))}}}}],
 actions:[{icon:"slide",label:()=>st.flip?"Półwalec: powietrze → szkło":"Półwalec: szkło → powietrze",tip:"Obróć półwalec o 180°",run:()=>{st.flip=!st.flip}},
  {icon:"pencil",label:()=>"Laser: "+LAS[st.laser].n,tip:"Zmień laser",run:()=>{st.laser=(st.laser+1)%2}},
  {icon:"hand",label:"Laser na 0°",tip:"Ustaw laser na normalnej",run:()=>{st.phi=0}}],
 learn(D,c,viz){const R=rays(),n=R.n,ag=Math.asin(1/n)*180/Math.PI;const be=R.out?Math.atan2(Math.abs(R.out.x),Math.abs(R.out.y))*180/Math.PI:null;
  viz.panel(c,[["kąt padania α",LAB.fmt(Math.abs(st.phi),1)+"°"],["kąt załamania β",be==null?"— (całkowite odbicie)":LAB.fmt(be,1)+"°"],["sin α / sin β",be?LAB.fmt(Math.sin(Math.abs(st.phi)*Math.PI/180)/Math.sin(be*Math.PI/180),4):"—"],
   ["n pleksi (ukryte)",LAB.fmt(n,4)],["kąt graniczny (ukryte)",LAB.fmt(ag,2)+"°"],["odbite / załamane",Math.round(100*R.f.R)+"% / "+Math.round(100*R.f.T)+"%"]]);
  const zz=V(0,0,ZB+0.022),Oz=add(O,zz);viz.line(c,D,add(Oz,V(0,-0.13,0)),add(Oz,V(0,0.13,0)),"rgba(0,0,0,.4)",true)}
 ,init(env){P=env.P;window.LOZ_TEST={st,P:()=>P,rays}},update(){},status(){const R=rays();return R.f.tir?"całkowite wewnętrzne odbicie":""},
 getState:()=>({...st}),setState(o){Object.assign(st,o)}});
})();
