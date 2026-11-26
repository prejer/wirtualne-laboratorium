/* Wirtualne Laboratorium — silnik (plik generowany: `python3 build.py` skleja src/core/*.js).
   Nie edytuj engine.js ręcznie — edytuj moduły w src/core/. Kontrakt zadania: src/ZADANIA.md. */
"use strict";
const LAB=(()=>{
// ---------- wektory ----------
const V=(x,y,z)=>({x,y,z}),add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z),sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z),mul=(a,k)=>V(a.x*k,a.y*k,a.z*k),
 dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x),len=a=>Math.sqrt(dot(a,a)),nrm=a=>mul(a,1/(len(a)||1)),lerp=(a,b,t)=>add(a,mul(sub(b,a),t));
const Z=V(0,0,1);
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=v=>parseFloat(String(v).replace(",","."));
const fmt=(v,d)=>(isFinite(v)?v.toFixed(Math.max(0,d)):"—").replace(".",",");
const route=(()=>{const m=location.hash.match(/^#([a-z0-9-]+)(?:\/(\d+))?$/);return m?{id:m[1],z:m[2]}:null})();
let seed=0;
try{history.replaceState(null,"","#z"+seed)}catch(e){}
let noiseR=Math.random;function gauss(){let a=0;for(let i=0;i<6;i++)a+=noiseR();return(a-3)/0.7071}

let T=null; // znormalizowana konfiguracja aktywnego zadania

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
 if(!o.two&&dot(n,sub(CB.pos,c))<=0)return;prims.push({t:"f",pts,c:shade(col,n,o,c),z:dz(c)+(o.dz||0),a:o.alpha})}
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
 cyl,box,band,face,flush:()=>{drawPrims();prims=[]},
 faceNow:(pts,n,col,o)=>{o=o||{};const c=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length);if(!o.two&&dot(n,sub(CB.pos,c))<=0)return;quadNow(pts,shade(col,n,o,c))},
 shadowsNow:area=>{drawShadows(area);shadowPolys=[]},
 get grabbing(){return grab},
 line:(a,b,w,col,o)=>prims.push({t:"l",a,b,w,col,z:segZ(a,b),...(o||{})}),
 quad:(pts,col,o)=>prims.push({t:"q",pts,col,z:pts.reduce((s,p)=>s+dz(p),0)/pts.length,...(o||{})}),
 hexNut:(p,r,o)=>prims.push({t:"nut",p,r,z:dz(p),...(o||{})}),
 custom:(z,fn)=>prims.push({t:"c",z,fn}),
 quadNow,lineNow,tapeNow,P2,dz,get camPos(){return CB.pos},get pip(){return isPip}};
// ---------- stały motyw: stół laboratoryjny (sklejka brzozowa, nogi, podłoga) ----------
// Zadanie podaje scene.table={x0,x1,y0,y1}; blat ma górę na z=0. Rysowany przed sceną zadania,
// w dwóch przebiegach (to, co pod blatem → blat), więc nic spod stołu nie „prześwituje” przez blat.
function drawTable(tb){const X=V(1,0,0),Y=V(0,1,0);const th=tb.th||0.028,fz=tb.floor??-0.75,{x0,x1,y0,y1}=tb,cp=CB.pos,pad=3;
 quadNow([V(x0-pad,y0-pad,fz),V(x1+pad,y0-pad,fz),V(x1+pad,y1+pad,fz),V(x0-pad,y1+pad,fz)],"#a49c90");
 if(!isPip){for(let k=-6;k<=6;k++){const y=(y0+y1)/2+k*0.3;lineNow(V(x0-pad,y,fz),V(x1+pad,y,fz),0.002,"rgba(0,0,0,.05)")}}
 const li=0.05,lh=(-fz-th)/2;for(const[x,y]of[[x0+li,y0+li],[x1-li,y0+li],[x0+li,y1-li],[x1-li,y1-li]])box(V(x,y,-th-lh),mul(X,0.022),mul(Y,0.022),mul(Z,lh),"#b08d5f");
 for(const y of[y0+li,y1-li])box(V((x0+x1)/2,y,-th-0.04),mul(X,(x1-x0)/2-li),mul(Y,0.01),mul(Z,0.04),"#bd9a6b");
 drawPrims();prims=[];
 const t=[V(x0,y0,0),V(x1,y0,0),V(x1,y1,0),V(x0,y1,0)],b=t.map(p=>add(p,V(0,0,-th)));const fn=(pts,n,col)=>{const c=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),0.25);if(dot(n,sub(cp,c))>0)quadNow(pts,shade(col,n,{},c))};
 fn([t[1],t[0],b[0],b[1]],mul(Y,-1),"#d4b283");fn([t[3],t[2],b[2],b[3]],Y,"#d4b283");fn([t[2],t[1],b[1],b[2]],X,"#c9a675");fn([t[0],t[3],b[3],b[0]],mul(X,-1),"#c9a675");
 if(cp.z>0){quadNow(t,"#e2c597");if(!isPip){const n=Math.round((y1-y0)/0.03);for(let k=0;k<n;k++){const y=y0+0.015+k*(y1-y0-0.03)/(n-1);lineNow(V(x0,y,0),V(x1,y+0.004*Math.sin(k*1.7),0),0.0005,"rgba(140,95,45,.10)")}}}
 else quadNow(b,"#a88a62")}
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
function drawPrims(){prims.sort((p,q)=>q.z-p.z);const c=ctx;
 for(const p of prims){if(p.t==="f"){const cp=clipPoly(p.pts);if(!cp)continue;const P=cp.map(P2);if(P.some(q=>!q))continue;c.fillStyle=p.c;c.strokeStyle=p.c;c.lineWidth=0.7;c.lineJoin="round";if(p.a)c.globalAlpha=p.a;c.beginPath();P.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();c.fill();if(!p.a)c.stroke();c.globalAlpha=1;continue}
  if(p.t==="l"){const cl=clip(p.a,p.b);if(!cl)continue;const A=P2(cl[0]),B=P2(cl[1]);if(!A||!B)continue;const w=Math.max(1.2,p.w*(A.k+B.k)/2);
   c.lineCap=p.cap||"round";if(p.metal){c.lineCap="butt";c.strokeStyle="#565d66";c.lineWidth=w+1.5;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();c.strokeStyle=p.col;c.lineWidth=w;c.stroke();c.strokeStyle="rgba(255,255,255,.75)";c.lineWidth=Math.max(1,w*.2);c.stroke();if(p.after)p.after(c,w)}
   else{c.strokeStyle=p.col;c.lineWidth=w;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();if(p.fray){c.strokeStyle="rgba(255,255,255,.55)";c.lineWidth=Math.max(1,w*.15);c.setLineDash([2,3]);c.stroke();c.setLineDash([])}}}
  else if(p.t==="q")quadNow(p.pts,p.col);
  else if(p.t==="nut"){const q=P2(p.p);if(!q)continue;const r=p.r*q.k;const g2=c.createLinearGradient(q.x-r,q.y-r,q.x+r,q.y+r);g2.addColorStop(0,"#c9ced5");g2.addColorStop(1,"#6b727b");c.fillStyle=g2;c.strokeStyle="#3f454c";c.lineWidth=1;c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;c.lineTo(q.x+r*Math.cos(a),q.y+r*Math.sin(a))}c.closePath();c.fill();c.stroke();c.fillStyle="#2f343a";c.beginPath();c.arc(q.x,q.y,r*.55,0,7);c.fill();
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

// ---------- wejście: kamera swobodna + chwytanie przedmiotów ----------
// Złap przedmiot → od razu przeciągasz wzdłuż jego osi. Ostatnio chwycony przedmiot zostaje „aktywny” (podświetlony w scenie i na pasku).
const ptrs=new Map();let pinch=0,grab=null;
function screenOf(p){VW=SW;VH=SH;VX=0;VY=0;camBasis(cam);return P2(p)}
let moveTool=null,hoverId=null,downInfo=null;
function grabList(){return T.grabbables?T.grabbables():[]}
function hitGrab(x,y,only,extra){let best=null,bd=1e9;for(const g of grabList()){if(only&&g.id!==only)continue;const q=screenOf(g.p);if(!q)continue;const R=Math.max(extra||26,(g.r||0.02)*q.k+(extra?extra-14:12));const d=Math.hypot(x-q.x,y-q.y);if(d<R&&d<bd){bd=d;best=g}}return best}
function setMoveTool(id,frame){moveTool=moveTool===id?null:id;hideHint();if(moveTool&&frame!==false){const g=grabList().find(q=>q.id===moveTool);if(g){const q=screenOf(g.p);if(!q||q.x<60||q.y<60||q.x>SW-60||q.y>SH-140)goCam({t:g.p,yaw:cam.yaw,pitch:cam.pitch,dist:Math.min(cam.dist,0.6)},600)}}}
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);const b=cv.getBoundingClientRect();const x=e.clientX-b.left,y=e.clientY-b.top;
 downInfo={x:e.clientX,y:e.clientY,t:performance.now()};
 if(ptrs.size===0&&e.button===0&&!e.shiftKey){const g=(moveTool&&hitGrab(x,y,moveTool,44))||hitGrab(x,y,null,30);if(g){moveTool=g.id;grab=g;g.onStart&&g.onStart();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,grab:true});cv.style.cursor="grabbing";return}}
 ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY})});
cv.addEventListener("pointermove",e=>{if(ptrs.size)return;const b=cv.getBoundingClientRect();const g=hitGrab(e.clientX-b.left,e.clientY-b.top,null,moveTool?44:26);hoverId=g?g.id:null;
 cv.style.cursor=g?"grab":"default"});
cv.addEventListener("pointerleave",()=>{hoverId=null});
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId);const dx=e.clientX-p.x,dy=e.clientY-p.y;ptrs.set(e.pointerId,{...p,x:e.clientX,y:e.clientY});
 if(p.grab&&grab){const a0=screenOf(grab.p),a1=screenOf(add(grab.p,mul(grab.axis,0.01)));if(!a0||!a1)return;const vx=(a1.x-a0.x)/0.01,vy=(a1.y-a0.y)/0.01;if(vx*vx+vy*vy<150*150)return;grab.onMove((dx*vx+dy*vy)/(vx*vx+vy*vy));return}
 camAnim=null;
 if(ptrs.size===1){if(e.shiftKey||(e.buttons&2)||(e.buttons&4))panBy(dx,dy);else orbitBy(dx,dy)}
 else if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,bb=cv.getBoundingClientRect();
  if(pinch)zoomAt(cx-bb.left,cy-bb.top,pinch/d);panBy(dx/2,dy/2);pinch=d}});
const up=e=>{const p=ptrs.get(e.pointerId);ptrs.delete(e.pointerId);if(p&&p.grab&&grab){grab.onEnd&&grab.onEnd();grab=null;cv.style.cursor="grab"}if(ptrs.size<2)pinch=0;};
cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
// --- swobodna kamera: obrót, przesuwanie, przybliżanie do kursora, latanie WASD ---
function orbitBy(dx,dy){cam.yaw-=dx*0.007;cam.pitch=Math.max(-0.8,Math.min(1.565,cam.pitch+dy*0.007))}
function panBy(dx,dy){VW=SW;VH=SH;camBasis(cam);const k=cam.dist/CB.F;cam.t=add(cam.t,add(mul(CB.r,-dx*k),mul(CB.up,dy*k)))}
function zoomAt(x,y,f){VW=SW;VH=SH;camBasis(cam);f=Math.max(0.012/cam.dist,Math.min(8/cam.dist,f));
 const Pc=add(cam.t,add(mul(CB.r,(x-SW/2)*cam.dist/CB.F),mul(CB.up,-(y-SH/2)*cam.dist/CB.F)));cam.t=add(Pc,mul(sub(cam.t,Pc),f));cam.dist*=f}
cv.addEventListener("wheel",e=>{e.preventDefault();camAnim=null;hideHint();const b=cv.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
 const dy=e.deltaMode===1?e.deltaY*33:e.deltaY,dx=e.deltaMode===1?e.deltaX*33:e.deltaX;
 const mouseWheel=e.deltaMode===1||(dx===0&&Math.abs(dy)>=50&&Number.isInteger(dy));
 if(e.ctrlKey||e.metaKey)zoomAt(x,y,Math.exp(dy*0.01));           // szczypanie na touchpadzie
 else if(mouseWheel)zoomAt(x,y,Math.exp(dy*0.0015));               // kółko myszy
 else if(e.shiftKey)panBy(-dx,-dy);                                // Shift + dwa palce: przesuwanie
 else orbitBy(-dx*0.6,-dy*0.6)},{passive:false});                  // dwa palce: obrót
cv.addEventListener("dblclick",e=>{const b=cv.getBoundingClientRect();const x=e.clientX-b.left,y=e.clientY-b.top;const c0={t:cam.t,dist:cam.dist};zoomAt(x,y,0.5);const c1={t:cam.t,dist:cam.dist};Object.assign(cam,c0);goCam({t:c1.t,yaw:cam.yaw,pitch:cam.pitch,dist:c1.dist},350)});
const keys=new Set();
addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea"))return;const k=e.key.toLowerCase();if(k==="escape"&&moveTool){moveTool=null;return}if("wasdqe".includes(k)&&k.length===1||k.startsWith("arrow")||k===" "){keys.add(k);e.preventDefault();camAnim=null;hideHint()}if(e.shiftKey)keys.add("shift")});
addEventListener("keyup",e=>{keys.delete(e.key.toLowerCase());if(!e.shiftKey)keys.delete("shift")});addEventListener("blur",()=>keys.clear());
function flyStep(dt){if(!keys.size)return;VW=SW;VH=SH;camBasis(cam);const sp=Math.max(0.12,cam.dist*0.9)*(keys.has("shift")?3:1)*dt;
 const fw=nrm(V(CB.f.x,CB.f.y,0)),rt=nrm(V(CB.r.x,CB.r.y,0));let m=V(0,0,0);
 if(keys.has("w"))m=add(m,fw);if(keys.has("s"))m=sub(m,fw);if(keys.has("d"))m=add(m,rt);if(keys.has("a"))m=sub(m,rt);if(keys.has("e")||keys.has(" "))m=add(m,Z);if(keys.has("q"))m=sub(m,Z);
 if(len(m)>0)cam.t=add(cam.t,mul(nrm(m),sp));
 if(keys.has("arrowleft"))orbitBy(-260*dt,0);if(keys.has("arrowright"))orbitBy(260*dt,0);if(keys.has("arrowup"))orbitBy(0,-200*dt);if(keys.has("arrowdown"))orbitBy(0,200*dt)}

// ---------- LabShell: wspólna rama każdego doświadczenia ----------
// Buduje cały interfejs wokół sceny: górny pasek (Zadania, kamery, Lupa, Pomiar/Nauka, tempo, nowy zestaw, pomoc, Zadanie),
// dolny dock (lewa sekcja: przedmioty do chwytania, prawa: akcje jednorazowe), panel Nauki, komunikaty, ekran startowy.
// Zadanie przekazuje wyłącznie konfigurację — patrz LAB.defineTask i src/ZADANIA.md.
const VERSION="0.7";
const ICONS={
 tape:'<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v8M14 11.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.6 0-4-1.3-5.3-3.4L3.5 14a1.5 1.5 0 0 1 2.6-1.5L8 15"/>',
 lift:'<path d="M12 3v14M8 7l4-4 4 4"/><path d="M6 21h12"/><circle cx="12" cy="18.5" r="1.6"/>',
 stop:'<circle cx="12" cy="12" r="9"/><path d="M9 9h6v6H9z"/>',
 wipe:'<path d="M4 18c3-1 5-4 7-8l5 3c-2 4-5 6-8 7z"/><path d="M11 10l2-5 5 3-2 5"/><path d="M3 21h18"/>',
 slide:'<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/><rect x="8" y="10" width="8" height="4" rx="2"/>',
 slow:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',
 pencil:'<path d="M15 4l5 5L9 20H4v-5z"/><path d="M13 6l5 5"/>',
 mark:'<path d="M5 5l14 14M19 5L5 19"/>',
 pin:'<path d="M12 21V11"/><path d="M8 11h8l-1.5-6h-5z"/><path d="M9 21h6"/>',
 release:'<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 20h14"/>',
 paper:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/>',
 ruler:'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
 grab:'<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v6M14 10.5V7a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-2.6 0-4-1.3-5.3-3.4L4 15a1.5 1.5 0 0 1 2.6-1.5L8 15"/><path d="M2 5l2-2M22 5l-2-2"/>',
 thread:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h10"/><path d="M17 6c3 0 4 2 4 4"/>'};

ICONS.dice='<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="16" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="12" cy="12" r="1.2"/>';
function shellDOM(){const st=$("stage");st.insertAdjacentHTML("beforeend",`
 <div class="top"><button class="pill zad" id="bZad">☰ Zadania</button><span id="views"></span><button class="pill on" id="bPip" title="Lupa: powiększony podgląd miejsca pomiaru">Lupa</button><span class="sp"></span>
  <span id="modes" class="seg" title="Pomiar: jak w laboratorium · Nauka: siły, kąty i odległości na żywo"><button class="pill on" data-m="pomiar">Pomiar</button><button class="pill" data-m="nauka">Nauka</button></span>
  <button class="pill" id="bSpeed" title="Zwolnione tempo (ułatwienie symulacji)">×1</button>
  <button class="pill ico" id="bNew" title="Nowy zestaw pomiarowy — losuje ukryte parametry">${'<svg viewBox="0 0 24 24">'+ICONS.dice+'</svg>'}</button>
  <button class="pill" id="bHelp" title="Sterowanie">?</button><button class="pill" id="bTask">Zadanie</button></div>
 <div id="help"><b>Poruszanie się</b><table>
  <tr><td>obrót</td><td>przeciągnij · dwa palce na touchpadzie · strzałki</td></tr>
  <tr><td>przybliżanie</td><td>szczypanie · kółko myszy · dwuklik (do kursora)</td></tr>
  <tr><td>przesuwanie</td><td>Shift + przeciągnij · Shift + dwa palce · prawy przycisk</td></tr>
  <tr><td>latanie</td><td><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> · <kbd>E</kbd>/<kbd>Spacja</kbd> w górę · <kbd>Q</kbd> w dół · <kbd>Shift</kbd> szybciej</td></tr>
  <tr><td>przedmioty</td><td>złap i przeciągnij · ✋ na pasku pokazuje przedmiot · <kbd>Esc</kbd> odznacza</td></tr></table><button class="btn" id="helpX">OK</button></div>
 <aside id="learn" aria-hidden="true"></aside>
 <div id="dock"><div class="dsec" id="dockMove"></div><div class="dsplit"></div><div class="dsec" id="dockAct"></div></div>
 <div id="hint"></div><div id="status"></div><div id="ver">v${VERSION} · Wirtualne Laboratorium</div>`)}

// ---------- komunikaty ----------
let hintEl=null,hintT=0;function showHint(t,ms){hintEl.textContent=t;hintEl.style.opacity=1;clearTimeout(hintT);hintT=setTimeout(hideHint,ms||8000)}function hideHint(){if(hintEl)hintEl.style.opacity=0}
let flashT=0,flashMsg="";function flash(m){flashMsg=m;flashT=performance.now()}
let lastStatus=null;function status(){let s=T.status?T.status():"";if(flashMsg&&performance.now()-flashT<3500)s+=(s?" · ":"")+"<b style='color:#1e5aa8'>"+esc(flashMsg)+"</b>";if(s===lastStatus)return;lastStatus=s;const el=$("status");el.innerHTML=s;el.style.display=s?"":"none"}

// ---------- dock: przedmioty (lewa sekcja) | akcje (prawa sekcja) ----------
const dockSync=[];
function toolBtn(icon,label,tip){const b=document.createElement("button");b.className="tool";b.title=tip||"";b.innerHTML=`<svg viewBox="0 0 24 24">${ICONS[icon]||ICONS.hand}</svg><span></span>`;b.lastChild.textContent=label;return b}
function buildDock(){const mv=$("dockMove"),ac=$("dockAct");mv.innerHTML="";ac.innerHTML="";
 for(const m of T.movables){const b=toolBtn("grab",m.label,`${m.label}: złap w scenie i przeciągnij (kliknij, żeby pokazać)`);b.classList.add("mv");b.onclick=()=>setMoveTool(m.id);mv.appendChild(b);dockSync.push(()=>b.classList.toggle("active",moveTool===m.id))}
 for(const a of T.actions){const lab=()=>typeof a.label==="function"?a.label():a.label;const b=toolBtn(a.icon,lab(),a.tip);
  b.onclick=()=>{a.run();b.classList.remove("pulse");void b.offsetWidth;b.classList.add("pulse")};ac.appendChild(b);
  if(typeof a.label==="function")dockSync.push(()=>{const t=lab();if(b.lastChild.textContent!==t)b.lastChild.textContent=t})}
 mv.style.display=T.movables.length?"":"none";$("dock").querySelector(".dsplit").style.display=T.movables.length&&T.actions.length?"":"none";
 requestAnimationFrame(()=>{$("status").style.bottom=($("dock").offsetHeight+24)+"px"})}
function syncUI(){dockSync.forEach(f=>f())}

// ---------- tryby: Pomiar / Nauka ----------
let mode="pomiar";
function setMode(m){mode=m;document.querySelectorAll("#modes button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));const L=$("learn");L.classList.toggle("on",m==="nauka"&&!!T.learn);L.setAttribute("aria-hidden",m!=="nauka")}
let learnHTML="";function renderLearn(rows){const h=rows?rows.map(r=>`<div class="lr"><span${r[2]?` style="color:${r[2]}"`:""}>${r[0]}</span><b>${r[1]}</b></div>`).join(""):"";if(h!==learnHTML){learnHTML=h;$("learn").innerHTML=h?`<div class="lh">Nauka · wielkości w układzie</div>${h}`:""}}

// ---------- tempo symulacji ----------
const SPEEDS=[1,0.25];let speed=1;

// ---------- parametry ukryte: losowane z numeru zestawu, z możliwością lokalnego przelosowania ----------
let P={},PSPEC={},prng=Math.random;
function rollParams(spec,r){const o={};for(const k in spec){const s=spec[k];o[k]=s.min+(s.max-s.min)*r()}return o}
const params={get:()=>P,
 reroll(names){for(const k of names){const s=PSPEC[k];if(s)P[k]=s.min+(s.max-s.min)*prng()}},              // nowe losowanie w pełnym zakresie
 jitter(names,rel){for(const k of names){const s=PSPEC[k];if(!s)continue;P[k]=Math.max(s.min,Math.min(s.max,P[k]*(1+rel*(2*prng()-1))))}}}; // niewielka zmiana

// ---------- definicja zadania (jedyny punkt wejścia dla kolejnych symulacji) ----------
function defineTask(cfg){
 const movables=cfg.movables||[];
 const tb=cfg.scene.table||null;
 T={...cfg,draw:cfg.scene.draw,table:tb,light:cfg.scene.light,pip:cfg.lupa||null,
  shadowArea:cfg.scene.shadowArea||(tb?[V(tb.x0,tb.y0,0),V(tb.x1,tb.y0,0),V(tb.x1,tb.y1,0),V(tb.x0,tb.y1,0)]:null),
  camMinZ:cfg.scene.camMinZ??(tb?0.012:null),
  movables,actions:cfg.actions||[],views:cfg.views,
  grabbables:()=>movables.map(m=>{const g=m.grab();return g?{...g,id:m.id,label:m.label,hint:g.hint||m.hint}:null}).filter(Boolean)};
 run()}

function run(){if(T.light)LIGHT=nrm(T.light);document.title=T.meta.title+" — Wirtualne Laboratorium";
 shellDOM();hintEl=$("hint");
 const SKEY="lab-"+T.id+"-"+seed+"-state";let saved=null;try{saved=JSON.parse(localStorage.getItem(SKEY))}catch(e){}
 PSPEC=T.params||{};prng=rng(seed*13+5);P=rollParams(PSPEC,prng);if(saved&&saved.__params)Object.assign(P,saved.__params);
 T.init({seed,rng,gauss,P,params});if(saved&&T.setState){try{T.setState(saved)}catch(e){}}
 // ekran startowy i treść zadania
 const ov=$("startOv");ov.querySelector(".box").innerHTML=`<div class="kick">${T.meta.kicker}</div><h2>${T.meta.title}</h2><p>${T.meta.desc}</p>${saved?`<p class="resume">Układ czeka tak, jak go zostawiłeś.</p>`:""}
  <div class="row"><button class="btn p big" id="goStart">${saved?"Wróć do układu":"Wejdź do laboratorium"}</button><button class="btn" id="goTask">Treść zadania</button></div><p class="small">Zestaw nr <b>${seed}</b> · <a href="#" id="newS">nowy zestaw</a></p>`;
 $("taskBox").innerHTML=T.taskHtml+(T.hints||[]).map(h=>`<details><summary>${h.title}</summary><div class="small">${h.html}</div></details>`).join("")+`<div class="row"><button class="btn p" id="taskX">Wracam</button></div>`;
 $("goStart").onclick=()=>{ov.classList.remove("on");try{if(!localStorage.getItem("lab-help-seen"))$("help").classList.add("on")}catch(e){}T.start&&T.start(!!saved)};$("goTask").onclick=()=>$("taskOv").classList.add("on");
 const newSet=()=>{location.hash="#"+T.id+"/"+(1000+Math.floor(Math.random()*899000))};
 $("newS").onclick=e=>{e.preventDefault();newSet()};
 $("bNew").onclick=()=>{if(confirm("Nowy zestaw pomiarowy?\nUkryte parametry (np. współczynniki tarcia) zostaną wylosowane od nowa, a układ wróci do stanu początkowego."))newSet()};
 $("bTask").onclick=()=>$("taskOv").classList.add("on");$("taskX").onclick=()=>$("taskOv").classList.remove("on");$("taskOv").addEventListener("click",e=>{if(e.target===$("taskOv"))$("taskOv").classList.remove("on")});
 // górny pasek
 const vb=$("views");vb.innerHTML=T.views.map((v,i)=>`<button class="pill" data-v="${i}">${v.label}</button>`).join("");vb.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>goCam(T.views[+b.dataset.v].cam()));
 document.querySelectorAll("#modes button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));if(!T.learn)$("modes").style.display="none";
 $("bHelp").onclick=()=>$("help").classList.toggle("on");$("helpX").onclick=()=>{$("help").classList.remove("on");try{localStorage.setItem("lab-help-seen","1")}catch(e){}};
 const bp=$("bPip");if(!T.pip)bp.style.display="none";bp.onclick=()=>{pipOn=!pipOn;bp.classList.toggle("on",pipOn)};
 const bs=$("bSpeed");bs.onclick=()=>{speed=SPEEDS[(SPEEDS.indexOf(speed)+1)%SPEEDS.length];bs.textContent=speed===1?"×1":"×¼";bs.classList.toggle("on",speed!==1)};
 $("bZad").onclick=()=>{renderCatalog(window.LAB_TASKS||[]);$("catalog").classList.add("on")};
 // zapis stanu (z parametrami ukrytymi)
 const persist=()=>{if(T.getState)try{localStorage.setItem(SKEY,JSON.stringify({...T.getState(),__params:P}))}catch(e){}};setInterval(persist,2000);document.addEventListener("visibilitychange",persist);window.addEventListener("pagehide",persist);
 buildDock();resize();Object.assign(cam,T.views[0].cam());cam.dist*=2;cam.yaw-=0.6;
 let tPrev=performance.now();function loop(now){let dt=Math.min(0.05,(now-tPrev)/1000);tPrev=now;
  flyStep(dt);T.update(dt*speed);learnRows=null;draw();renderLearn(mode==="nauka"?learnRows:null);status();syncUI();requestAnimationFrame(loop)}
 window.addEventListener("resize",()=>resize());new ResizeObserver(()=>resize()).observe(cv);requestAnimationFrame(loop)}

// ---------- tryb Nauki: pomocnicze rysowanie (wektory, kąty, wymiary) + panel liczb w HTML ----------
let learnRows=null;
const viz={
 arrow(c,D,p,vec,col,label,o){o=o||{};const A=D.P2(p),B=D.P2(add(p,vec));if(!A||!B)return;const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);if(L<2)return;const ux=dx/L,uy=dy/L,h=Math.min(11,L*0.45);
  c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=o.w||2.6;c.lineCap="round";if(o.dash)c.setLineDash([5,4]);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x-ux*h*0.6,B.y-uy*h*0.6);c.stroke();c.setLineDash([]);
  c.beginPath();c.moveTo(B.x,B.y);c.lineTo(B.x-ux*h-uy*h*0.45,B.y-uy*h+ux*h*0.45);c.lineTo(B.x-ux*h+uy*h*0.45,B.y-uy*h-ux*h*0.45);c.closePath();c.fill();
  if(label)viz.tag(c,B.x+ux*10,B.y+uy*10,label,col);c.restore()},
 tag(c,x,y,t,col){c.save();c.font="600 13px system-ui";c.textAlign="center";c.textBaseline="middle";const w=c.measureText(t).width+10;c.fillStyle="rgba(255,255,255,.88)";c.beginPath();c.roundRect(x-w/2,y-10,w,20,6);c.fill();c.fillStyle=col||"#111";c.fillText(t,x,y);c.restore()},
 dim(c,D,a,b,label,col){const A=D.P2(a),B=D.P2(b);if(!A||!B)return;c.save();c.strokeStyle=col||"#333";c.lineWidth=1.3;c.setLineDash([4,3]);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();c.setLineDash([]);
  for(const[P,Q]of[[A,B],[B,A]]){const dx=Q.x-P.x,dy=Q.y-P.y,L=Math.hypot(dx,dy)||1;c.beginPath();c.moveTo(P.x-dy/L*5,P.y+dx/L*5);c.lineTo(P.x+dy/L*5,P.y-dx/L*5);c.stroke()}
  if(label)viz.tag(c,(A.x+B.x)/2,(A.y+B.y)/2,label,col);c.restore()},
 arc(c,D,O,e1,e2,ang,r,label,col){const pts=[];for(let k=0;k<=20;k++){const t=ang*k/20;pts.push(D.P2(add(O,add(mul(e1,r*Math.cos(t)),mul(e2,r*Math.sin(t))))))}if(pts.some(q=>!q))return;
  c.save();c.strokeStyle=col||"#333";c.lineWidth=1.8;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();if(label){const m=D.P2(add(O,add(mul(e1,r*1.6*Math.cos(ang/2)),mul(e2,r*1.6*Math.sin(ang/2)))));if(m)viz.tag(c,m.x,m.y,label,col)}c.restore()},
 line(c,D,a,b,col,dash){const A=D.P2(a),B=D.P2(b);if(!A||!B)return;c.save();c.strokeStyle=col;c.lineWidth=1.3;if(dash)c.setLineDash([4,4]);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();c.restore()},
 panel(c,rows){learnRows=rows}};

// ---------- katalog zadań ----------
function progressOf(id){let z=null;try{z=localStorage.getItem("lab-lastseed-"+id)}catch(e){}if(!z)return null;let st=null;try{st=localStorage.getItem("lab-"+id+"-"+z+"-state")}catch(e){}return st?{}:null}
function renderCatalog(tasks){const c=$("catalog");const cur=route&&route.id;
 c.innerHTML=`<div class="cat"><div class="cathead"><div><div class="kick">Wirtualne Laboratorium · Olimpiada Fizyczna</div><h1>Zadania doświadczalne w 3D</h1><p>Gotowy układ z rozwiązania Komitetu. Obracasz go i mierzysz jak w prawdziwym laboratorium. W trybie Nauka widzisz siły, kąty i odległości. Układ poczeka, aż wrócisz.</p></div>${cur?'<button class="btn" id="catX">Zamknij ✕</button>':""}</div>
 <div class="cards">${tasks.map(t=>{const p=progressOf(t.id);return`<button class="tcard" data-id="${t.id}"><div class="tsvg">${t.svg||""}</div><div class="tbody"><div class="kick">${t.kicker}</div><b>${t.title}</b><span>${t.desc}</span><div class="tags">${(t.tags||[]).map(g=>`<i>${g}</i>`).join("")}${p?`<i class="prog">w toku</i>`:""}</div></div></button>`}).join("")}
 <div class="tcard soon"><div class="tbody"><b>Kolejne zadania</b><span>Wrzucaj PDF-y z zadaniami i rozwiązaniami — każde staje się kolejnym stanowiskiem.</span></div></div></div></div>`;
 c.querySelectorAll(".tcard[data-id]").forEach(b=>b.onclick=()=>{if(cur===b.dataset.id){c.classList.remove("on");return}location.hash="#"+b.dataset.id});
 const x=$("catX");if(x)x.onclick=()=>c.classList.remove("on")}
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);window.addEventListener("hashchange",()=>location.reload());
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 const s=document.createElement("script");s.src=t.file;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);

return{defineTask,params,screenOf,V,add,sub,mul,dot,cross,len,nrm,lerp,Z,goCam,flash,showHint,hideHint,viz,fmt,num,esc,gauss,get seed(){return seed},get P(){return P},VERSION};
})();
