// ---------- render 3D: kamera, rzutowanie, prymitywy, bryły, cienie, lupa ----------
const cv=$("cv"),ctx=cv.getContext("2d");let SW=300,SH=300,dpr=1;
const cam={t:V(0,0,0.2),yaw:0,pitch:0.3,dist:1.5};let camAnim=null;let pipOn=true;
let VW,VH,VX,VY,CB,prims,isPip=false;
function resize(){const b=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,3);SW=b.width;SH=b.height;cv.width=Math.round(SW*dpr);cv.height=Math.round(SH*dpr)}
function camBasis(c){const cp=Math.cos(c.pitch);const pos=add(c.t,V(c.dist*cp*Math.sin(c.yaw),-c.dist*cp*Math.cos(c.yaw),c.dist*Math.sin(c.pitch)));
 const f=nrm(sub(c.t,pos));let r=cross(f,Z);if(len(r)<1e-6)r=V(Math.cos(c.yaw),Math.sin(c.yaw),0);r=nrm(r);CB={pos,f,r,up:cross(r,f),F:Math.min(VW,VH)*1.5}}
function P2(p){const d=sub(p,CB.pos);const zc=dot(d,CB.f);if(zc<0.01)return null;return{x:VX+VW/2+dot(d,CB.r)*CB.F/zc,y:VY+VH/2-dot(d,CB.up)*CB.F/zc,k:CB.F/zc}}
function clip(a,b){const n=0.015,za=dot(sub(a,CB.pos),CB.f),zb=dot(sub(b,CB.pos),CB.f);if(za<n&&zb<n)return null;if(za>=n&&zb>=n)return[a,b];const t=(n-za)/(zb-za);const m=lerp(a,b,t);return za<n?[m,b]:[a,m]}
const dz=p=>len(sub(p,CB.pos));
function segZ(a,b){const ab=sub(b,a);const t=Math.max(0,Math.min(1,dot(sub(CB.pos,a),ab)/(dot(ab,ab)||1)));return dz(add(a,mul(ab,t)))}
function clipPoly(pts){const n=0.012;const zs=pts.map(p=>dot(sub(p,CB.pos),CB.f));if(zs.every(z=>z>=n))return pts;if(zs.every(z=>z<n))return null;const out=[];
 for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length,a=pts[i],b=pts[j],za=zs[i],zb=zs[j];if(za>=n)out.push(a);if((za>=n)!==(zb>=n))out.push(lerp(a,b,(n-za)/(zb-za)))}return out.length>=3?out:null}
function quadNow(pts,col){pts=clipPoly(pts);if(!pts)return;const P=pts.map(P2);if(P.some(p=>!p))return;ctx.fillStyle=col;ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill()}
function lineNow(a,b,w,col,cap,dash){const cl=clip(a,b);if(!cl)return;const A=P2(cl[0]),B=P2(cl[1]);if(!A||!B)return;ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,w*(A.k+B.k)/2);ctx.lineCap=cap||"round";ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();ctx.setLineDash([])}
// taśma miarowa: początek o, kierunek d (jednostkowy), kierunek w poprzek w (od krawędzi z podziałką w głąb taśmy), długość [m], szerokość [m]
function tapeNow(o,d,w,L,W,opts){opts=opts||{};const zt=V(0,0,0.0006);const o2=add(o,zt);const c4=[o2,add(o2,mul(d,L)),add(add(o2,mul(d,L)),mul(w,W)),add(o2,mul(w,W))];quadNow(c4,opts.color||"#f6e36a");
 const p1=P2(o2),p2=P2(add(o2,mul(d,0.001)));const mid=P2(add(o2,mul(d,L/2)));if(!p1||!p2)return;
 // gęstość podziałki liczona przy środku kadru
 const ref=CB.pos;let near=o2;{const t=Math.max(0,Math.min(L,dot(sub(ref,o2),d)));near=add(o2,mul(d,t))}const a1=P2(near),a2=P2(add(near,mul(d,0.001)));const px=a1&&a2?Math.hypot(a2.x-a1.x,a2.y-a1.y):0;
 const stepMM=px>1.8?1:px>0.7?5:10;const labEvery=px*10>16?1:px*10>6?5:10;
 ctx.font=`600 ${Math.max(8,Math.min(13,px*4))}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#222";ctx.strokeStyle="#222";
 for(let mm=0;mm<=Math.round(L*1000);mm+=stepMM){const p=add(o2,mul(d,mm/1000));const Lt=mm%10===0?0.0065:mm%5===0?0.0045:0.003;const q1=P2(p),q2=P2(add(p,mul(w,Lt)));if(!q1||!q2)continue;if(q1.x<VX-20||q1.x>VX+VW+20||q1.y<VY-20||q1.y>VY+VH+20)continue;
  ctx.lineWidth=mm%10===0?1.2:0.8;ctx.beginPath();ctx.moveTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);ctx.stroke();
  if(mm%10===0&&(mm/10)%labEvery===0){const ql=P2(add(p,mul(w,0.0105)));if(ql)ctx.fillText(String(mm/10),ql.x,ql.y)}}}
// ---------- bryły z cieniowaniem i cieniami ----------
let LIGHT=nrm(V(-0.3,0.5,1));let shadowPolys=[];const rgbC={};
function rgbOf(h){if(rgbC[h])return rgbC[h];const n=parseInt(h.slice(1),16);return rgbC[h]=[n>>16&255,n>>8&255,n&255]}
function shade(col,n,o,cen){const rgb=rgbOf(col);let d=dot(n,LIGHT);if(o.two)d=Math.abs(d);const amb=o.amb??0.42;let k=amb+(1-amb)*Math.max(0,d);let sp=0;
 if(o.metal){const v=nrm(sub(CB.pos,cen));const h=nrm(add(LIGHT,v));sp=Math.pow(Math.max(0,dot(n,h)),o.metal)*(o.spec??0.75)}
 const f=x=>Math.max(0,Math.min(255,Math.round(x*k+255*sp)));return`rgb(${f(rgb[0])},${f(rgb[1])},${f(rgb[2])})`}
function face(pts,n,col,o){o=o||{};const cen=pts.reduce((s,p)=>add(s,p),V(0,0,0));const c=mul(cen,1/pts.length);if(o.shadow!==false)shadowPolys.push(pts);
 if(!o.two&&dot(n,sub(CB.pos,c))<=0)return;const pr={t:"f",pts,c:shade(col,n,o,c),z:dz(c)+(o.dz||0),a:o.alpha,ref:c,decal:!!o.decal};
 if(solidCur){solidCur.faces.push(pr);if(!o.decal&&!o.two)solidCur.planes.push({n,d:dot(n,c)});solidCur.cen=add(solidCur.cen,c);return}prims.push(pr)}
// Bryła wypukła (np. karton): jej ściany sortujemy razem, a inne obiekty rysujemy przed nią lub po niej
// testem płaszczyzn widocznych ścian — usuwa „przenikanie” dużych ścian przez mniejsze obiekty.
let solidCur=null;
function solid(fn){solidCur={faces:[],planes:[],cen:V(0,0,0)};fn();const S=solidCur;solidCur=null;if(!S.faces.length)return;const c=mul(S.cen,1/S.faces.length);prims.push({t:"S",faces:S.faces,planes:S.planes,z:dz(c),ref:c})}
function frame3(u){const e1=nrm(cross(u,Math.abs(u.z)<0.9?Z:V(1,0,0)));return[e1,cross(u,e1)]}
function cyl(a,b,r0,col,o){o=o||{};const r1=o.r1??r0;const ab=sub(b,a),L=len(ab),u=mul(ab,1/L);const[e1,e2]=frame3(u);const n=o.n||14,ns=Math.max(1,Math.ceil(L/(o.seg||0.06)));
 const ring=(t,r)=>{const c=add(a,mul(ab,t));return Array.from({length:n},(_,i)=>{const th=(i+(o.rot||0))*2*Math.PI/n;return add(c,add(mul(e1,r*Math.cos(th)),mul(e2,r*Math.sin(th))))})};
 const slope=(r0-r1)/L;let prev=ring(0,r0);for(let k=1;k<=ns;k++){const t=k/ns,cur=ring(t,r0+(r1-r0)*t);for(let i=0;i<n;i++){const j=(i+1)%n;const th=(i+0.5+(o.rot||0))*2*Math.PI/n;const nn=nrm(add(add(mul(e1,Math.cos(th)),mul(e2,Math.sin(th))),mul(u,slope)));face([prev[i],prev[j],cur[j],cur[i]],nn,col,o)}prev=cur}
 if(o.caps!==false){if(r0>0.0005)face(ring(0,r0).reverse(),mul(u,-1),o.capCol||col,o);if(r1>0.0005)face(ring(1,r1),u,o.capCol||col,o)}}
function box(c,ax,ay,az,col,o){const P=(i,j,k)=>add(c,add(mul(ax,i),add(mul(ay,j),mul(az,k))));const F=[[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1],ax],[[-1,1,-1],[-1,-1,-1],[-1,-1,1],[-1,1,1],mul(ax,-1)],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],ay],[[1,-1,-1],[-1,-1,-1],[-1,-1,1],[1,-1,1],mul(ay,-1)],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],az],[[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1],mul(az,-1)]];
 for(const f of F)face(f.slice(0,4).map(q=>P(...q)),nrm(f[4]),(o&&o.cols&&o.cols[F.indexOf(f)])||col,o)}
function band(path,w,width,col,o){o=Object.assign({two:true},o||{});for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];const hw=mul(w,width/2);const n=nrm(cross(sub(b,a),w));if(len(n)<1e-9)continue;face([sub(a,hw),add(a,hw),add(b,hw),sub(b,hw)],n,col,o)}}
const shCv=document.createElement("canvas"),shCtx=shCv.getContext("2d");
function drawShadows(area){if(!shadowPolys.length)return;if(shCv.width!==cv.width||shCv.height!==cv.height){shCv.width=cv.width;shCv.height=cv.height}const s=shCtx;s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,shCv.width,shCv.height);s.setTransform(dpr,0,0,dpr,0,0);
 if(area){const A=area.map(P2);if(A.some(q=>!q))return;s.save();s.beginPath();A.forEach((q,i)=>i?s.lineTo(q.x,q.y):s.moveTo(q.x,q.y));s.closePath();s.clip()}
 s.fillStyle="#000";s.strokeStyle="#000";s.lineWidth=0.8;for(const poly of shadowPolys){if(poly.some(p=>p.z<-0.0005))continue;const q=poly.map(p=>P2(sub(p,mul(LIGHT,p.z/LIGHT.z))));if(q.some(x=>!x))continue;s.beginPath();q.forEach((x,i)=>i?s.lineTo(x.x,x.y):s.moveTo(x.x,x.y));s.closePath();s.fill();s.stroke()}if(area)s.restore();
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.26;ctx.drawImage(shCv,0,0);ctx.restore()}
const D={ // API rysowania dla zadania
 cyl,box,band,face,solid,flush:()=>{drawPrims();prims=[]},
 faceNow:(pts,n,col,o)=>{o=o||{};const c=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length);if(!o.two&&dot(n,sub(CB.pos,c))<=0)return;quadNow(pts,shade(col,n,o,c))},
 shadowsNow:area=>{drawShadows(area);shadowPolys=[]},
 get grabbing(){return grab},
 line:(a,b,w,col,o)=>prims.push({t:"l",a,b,w,col,z:segZ(a,b),ref:lerp(a,b,0.5),...(o||{})}),
 quad:(pts,col,o)=>prims.push({t:"q",pts,col,z:pts.reduce((s,p)=>s+dz(p),0)/pts.length,...(o||{})}),
 hexNut:(p,r,o)=>prims.push({t:"nut",p,r,z:dz(p),...(o||{})}),
 custom:(z,fn,ref)=>prims.push({t:"c",z,fn,ref}),
 quadNow,lineNow,tapeNow,stripNow,P2,dz,get camPos(){return CB.pos},get pip(){return isPip}};
// ---------- stały motyw: stół laboratoryjny (sklejka brzozowa, nogi, podłoga) ----------
// Zadanie podaje scene.table={x0,x1,y0,y1}; blat ma górę na z=0. Rysowany przed sceną zadania,
// w dwóch przebiegach (to, co pod blatem → blat), więc nic spod stołu nie „prześwituje” przez blat.
// pasek leżący na płaszczyźnie poziomej — perspektywicznie poprawny (zamiast grubej linii z zaokrąglonymi końcami)
function stripNow(a,b,w,col){const d=nrm(sub(b,a)),n=mul(nrm(V(-d.y,d.x,0)),w/2);quadNow([sub(a,n),sub(b,n),add(b,n),add(a,n)],col)}
function drawTable(tb){const X=V(1,0,0),Y=V(0,1,0);const th=tb.th||0.028,fz=tb.floor??-0.75,{x0,x1,y0,y1}=tb,cp=CB.pos,pad=3;
 quadNow([V(x0-pad,y0-pad,fz),V(x1+pad,y0-pad,fz),V(x1+pad,y1+pad,fz),V(x0-pad,y1+pad,fz)],"#a49c90");
 if(!isPip){for(let k=-6;k<=6;k++){const y=(y0+y1)/2+k*0.3;stripNow(V(x0-pad,y,fz+0.0005),V(x1+pad,y,fz+0.0005),0.004,"rgba(0,0,0,.06)")}}
 const li=0.05,lh=(-fz-th)/2,legs=()=>{for(const[x,y]of[[x0+li,y0+li],[x1-li,y0+li],[x0+li,y1-li],[x1-li,y1-li]])solid(()=>box(V(x,y,-th-lh),mul(X,0.022),mul(Y,0.022),mul(Z,lh),"#b08d5f"));
  for(const y of[y0+li,y1-li])solid(()=>box(V((x0+x1)/2,y,-th-0.04),mul(X,(x1-x0)/2-li),mul(Y,0.01),mul(Z,0.04),"#bd9a6b"))};
 if(cp.z<=0){ // kamera pod blatem: blat i nogi to bryły w zwykłym przebiegu — blat zasłania wszystko, co na nim leży
  legs();solid(()=>box(V((x0+x1)/2,(y0+y1)/2,-th/2),mul(X,(x1-x0)/2),mul(Y,(y1-y0)/2),mul(Z,th/2),"#d4b283",{cols:["#c9a675","#c9a675","#d4b283","#d4b283","#e2c597","#a88a62"],shadow:false}));return}
 // kamera nad blatem: najpierw to, co pod blatem, potem blat — przedmioty na stole rysują się na nim
 legs();drawPrims();prims=[];
 const t=[V(x0,y0,0),V(x1,y0,0),V(x1,y1,0),V(x0,y1,0)],b=t.map(p=>add(p,V(0,0,-th)));const fn=(pts,n,col)=>{const c=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),0.25);if(dot(n,sub(cp,c))>0)quadNow(pts,shade(col,n,{},c))};
 fn([t[1],t[0],b[0],b[1]],mul(Y,-1),"#d4b283");fn([t[3],t[2],b[2],b[3]],Y,"#d4b283");fn([t[2],t[1],b[1],b[2]],X,"#c9a675");fn([t[0],t[3],b[3],b[0]],mul(X,-1),"#c9a675");
 quadNow(t,"#e2c597");if(!isPip){const n=Math.round((y1-y0)/0.03);for(let k=0;k<n;k++){const y=y0+0.015+k*(y1-y0-0.03)/(n-1);stripNow(V(x0,y,0.0001),V(x1,y+0.004*Math.sin(k*1.7),0.0001),0.0012,"rgba(140,95,45,.10)")}}}
function drawGrabUI(c){const L=grabList();const t=performance.now()/1000;
 for(const g of L){const act=g.id===moveTool,hov=g.id===hoverId;if(!act&&!hov)continue;const q=P2(g.p);if(!q)continue;const q1=P2(add(g.p,mul(g.axis,0.01)));
  let ux=1,uy=0;if(q1){const dx=q1.x-q.x,dy=q1.y-q.y,l=Math.hypot(dx,dy);if(l>0.5){ux=dx/l;uy=dy/l}}
  c.save();const col=act?"#1e5aa8":"rgba(30,90,168,.75)";const R=act?17+2*Math.sin(t*4):15;
  c.strokeStyle=col;c.lineWidth=act?2.5:1.6;c.setLineDash(act?[]:[4,3]);c.beginPath();c.arc(q.x,q.y,R,0,7);c.stroke();c.setLineDash([]);
  if(act){c.fillStyle="rgba(30,90,168,.12)";c.fill();const a=R+6,bL=R+30;c.lineWidth=2.5;c.lineCap="round";
   for(const sg of[-1,1]){const x0=q.x+ux*a*sg,y0=q.y+uy*a*sg,x1=q.x+ux*bL*sg,y1=q.y+uy*bL*sg;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
    c.beginPath();c.moveTo(x1+ux*sg*2,y1+uy*sg*2);c.lineTo(x1-ux*sg*7-uy*6,y1-uy*sg*7+ux*6);c.lineTo(x1-ux*sg*7+uy*6,y1-uy*sg*7-ux*6);c.closePath();c.fillStyle=col;c.fill()}}
  const txt=act?(g.hint||"przeciągnij"):(g.label||"")+" — złap i przeciągnij";c.font="600 12px system-ui";const w=c.measureText(txt).width+16;const ly=q.y+R+(act?40:14);
  c.fillStyle=act?"#1e5aa8":"rgba(27,33,48,.85)";c.beginPath();c.roundRect(q.x-w/2,ly,w,22,11);c.fill();c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";c.fillText(txt,q.x,ly+11);c.restore()}}
function frontOf(S,p){if(!p.ref)return p.z<S.z;for(const pl of S.planes)if(dot(pl.n,p.ref)-pl.d>1e-4)return true;return false}
// kolejność brył: S rysujemy po R, jeśli środek S leży przed którąś widoczną ścianą R (remis → odległość)
function orderSolids(arr){const rem=arr.sort((p,q)=>q.z-p.z).slice(),out=[];while(rem.length){let i=rem.findIndex(S=>!rem.some(R=>R!==S&&frontOf(R,S)&&!frontOf(S,R)));if(i<0)i=0;out.push(rem.splice(i,1)[0])}return out}
function drawPrims(){const solids=orderSolids(prims.filter(p=>p.t==="S"));let rest=prims.filter(p=>p.t!=="S");const byZ=(p,q)=>q.z-p.z;
 for(const S of solids){const B=[],F=[];for(const p of rest)(frontOf(S,p)?F:B).push(p);B.sort(byZ).forEach(drawOne);S.faces.sort((p,q)=>(p.decal-q.decal)||byZ(p,q)).forEach(drawOne);rest=F}
 rest.sort(byZ).forEach(drawOne)}
function drawOne(p){const c=ctx;{if(p.t==="f"){const cp=clipPoly(p.pts);if(!cp)return;const P=cp.map(P2);if(P.some(q=>!q))return;c.fillStyle=p.c;c.strokeStyle=p.c;c.lineWidth=0.7;c.lineJoin="round";if(p.a)c.globalAlpha=p.a;c.beginPath();P.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();c.fill();if(!p.a)c.stroke();c.globalAlpha=1;return}
  if(p.t==="l"){const cl=clip(p.a,p.b);if(!cl)return;const A=P2(cl[0]),B=P2(cl[1]);if(!A||!B)return;const w=Math.max(1.2,p.w*(A.k+B.k)/2);
   c.lineCap=p.cap||"round";if(p.metal){c.lineCap="butt";c.strokeStyle="#565d66";c.lineWidth=w+1.5;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();c.strokeStyle=p.col;c.lineWidth=w;c.stroke();c.strokeStyle="rgba(255,255,255,.75)";c.lineWidth=Math.max(1,w*.2);c.stroke();if(p.after)p.after(c,w)}
   else{c.strokeStyle=p.col;c.lineWidth=w;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();if(p.fray){c.strokeStyle="rgba(255,255,255,.55)";c.lineWidth=Math.max(1,w*.15);c.setLineDash([2,3]);c.stroke();c.setLineDash([])}}}
  else if(p.t==="q")quadNow(p.pts,p.col);
  else if(p.t==="nut"){const q=P2(p.p);if(!q)return;const r=p.r*q.k;const g2=c.createLinearGradient(q.x-r,q.y-r,q.x+r,q.y+r);g2.addColorStop(0,"#c9ced5");g2.addColorStop(1,"#6b727b");c.fillStyle=g2;c.strokeStyle="#3f454c";c.lineWidth=1;c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;c.lineTo(q.x+r*Math.cos(a),q.y+r*Math.sin(a))}c.closePath();c.fill();c.stroke();c.fillStyle="#2f343a";c.beginPath();c.arc(q.x,q.y,r*.55,0,7);c.fill();
   if(!isPip&&p.ring){c.strokeStyle="#ffd23f";c.lineWidth=3;c.beginPath();c.arc(q.x,q.y,r+6,0,7);c.stroke()}}
  else if(p.t==="c")p.fn(c)}}
function scene(view,pip){VW=view.w;VH=view.h;VX=view.x;VY=view.y;isPip=pip;camBasis(view.cam);prims=[];shadowPolys=[];const c=ctx;
 c.save();c.beginPath();c.rect(VX,VY,VW,VH);c.clip();
 const gr=c.createLinearGradient(0,VY,0,VY+VH);gr.addColorStop(0,"#dfe3e8");gr.addColorStop(1,"#b9bcc0");c.fillStyle=gr;c.fillRect(VX,VY,VW,VH);
 if(T.table)drawTable(T.table);T.draw(D);drawShadows(T.shadowArea);drawPrims();if(!pip&&mode==="nauka"&&T.learn)T.learn(D,ctx,viz);if(!pip)drawGrabUI(ctx);
 if(pip){ // celownik ułatwiający odczyt skali
  const cx=VX+VW/2,cy=VY+VH/2,g=7;c.lineWidth=1;c.strokeStyle="rgba(200,30,30,.55)";c.beginPath();
  c.moveTo(VX,cy+.5);c.lineTo(cx-g,cy+.5);c.moveTo(cx+g,cy+.5);c.lineTo(VX+VW,cy+.5);c.moveTo(cx+.5,VY);c.lineTo(cx+.5,cy-g);c.moveTo(cx+.5,cy+g);c.lineTo(cx+.5,VY+VH);c.stroke();
  c.strokeStyle="rgba(200,30,30,.8)";c.beginPath();c.arc(cx+.5,cy+.5,2,0,7);c.stroke();
  c.strokeStyle="#fff";c.lineWidth=3;c.strokeRect(VX+1.5,VY+1.5,VW-3,VH-3);c.fillStyle="rgba(27,33,48,.85)";c.fillRect(VX+6,VY+6,44,18);c.fillStyle="#fff";c.font="600 11px system-ui";c.textAlign="left";c.textBaseline="alphabetic";c.fillText("lupa",VX+12,VY+19)}
 c.restore()}
const pipY=()=>{const t=document.querySelector("#stage .top");return t?t.offsetTop+t.offsetHeight+6:56};
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);
 if(camAnim){const t=Math.min(1,(performance.now()-camAnim.t0)/camAnim.d),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;cam.t=lerp(camAnim.a.t,camAnim.b.t,e);for(const k of["yaw","pitch","dist"])cam[k]=camAnim.a[k]+(camAnim.b[k]-camAnim.a[k])*e;if(t>=1)camAnim=null}
 keepCamAbove();scene({x:0,y:0,w:SW,h:SH,cam},false);
 const pc=pipOn&&T.pip&&T.pip();if(pc){const w=Math.min(SW*0.46,260),h=w*0.78;scene({x:SW-w-8,y:pipY(),w,h,cam:pc},true)}}
// kamera nie schodzi pod blat stołu (stały motyw — pod stołem nie ma nic do mierzenia)
function keepCamAbove(){if(T.camMinZ==null)return;const m=T.camMinZ;if(cam.t.z<m-0.02)cam.t=V(cam.t.x,cam.t.y,m-0.02);const need=(m-cam.t.z)/cam.dist;if(need>=0.98)return;if(Math.sin(cam.pitch)<need)cam.pitch=Math.asin(need)}
function goCam(v,d){camAnim={t0:performance.now(),d:d||900,a:{t:cam.t,yaw:cam.yaw,pitch:cam.pitch,dist:cam.dist},b:v}}

