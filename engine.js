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

// ---------- render 3D (WebGL2 z buforem głębokości) ----------
// Każdy piksel pokazuje to, co naprawdę jest najbliżej kamery — bez sortowania malarskiego i bez „przenikania”.
// Zadanie rysuje przez API D (bryły, ściany, linie, paski, taśmy z podziałką). Napisy, strzałki Nauki, uchwyty
// i ramka Lupy idą na przezroczystą warstwę 2D nad sceną (#cv), w tych samych współrzędnych ekranu (P2).
const cv=$("cv"),ctx=cv.getContext("2d");let SW=300,SH=300,dpr=1;
// WebGL2, a gdy niedostępny (np. przeglądarki wbudowane w aplikacje, stare GPU) — WebGL1; shadery w GLSL ES 1.00 działają w obu.
// Utrata kontekstu GPU (na tabletach przy braku pamięci lub restarcie sterownika): czekamy na przywrócenie,
// a jeśli nie nadchodzi — tworzymy nowe płótno i nowy kontekst. Scena wraca sama, bez odświeżania strony.
const GLOPT={antialias:true,stencil:true,depth:true,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:false};
let glc=null,gl=null,glLost=false,glRetry=0;
function makeGL(){if(glc)glc.remove();glc=document.createElement("canvas");glc.id="glc";cv.parentNode.insertBefore(glc,cv);
 gl=glc.getContext("webgl2",GLOPT)||glc.getContext("webgl",GLOPT)||glc.getContext("experimental-webgl",GLOPT)||glc.getContext("webgl",{stencil:true})||glc.getContext("webgl");
 glLost=false;if(!gl)return false;
 glc.addEventListener("webglcontextlost",e=>{e.preventDefault();glLost=true;clearTimeout(glRetry);glRetry=setTimeout(()=>{if(glLost){makeGL()&&(initGL(),resize(),flash("Grafika 3D została odświeżona."))}},1200)});
 glc.addEventListener("webglcontextrestored",()=>{clearTimeout(glRetry);initGL();glLost=false;flash("Grafika 3D została odświeżona.")});return true}
makeGL();
if(!gl){const m=document.createElement("div");m.id="noGL";m.style.cssText="position:absolute;inset:0;display:grid;place-items:center;font:600 16px system-ui;color:#333";m.textContent="Ta przeglądarka nie udostępnia grafiki 3D (WebGL). Otwórz laboratorium w Chrome, Firefoksie albo Safari.";cv.parentNode.appendChild(m)}
const cam={t:V(0,0,0.2),yaw:0,pitch:0.3,dist:1.5};let camAnim=null;
let VW,VH,VX,VY,CB,isPip=false;
// gdpr: rozdzielczość sceny 3D — ograniczona (MSAA + bufor głębokości przy pełnym dpr tabletu zjada setki MB pamięci GPU)
let gdpr=1;function resize(){if(!glc)return;const b=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,3);gdpr=Math.min(dpr,matchMedia("(pointer:coarse)").matches?1.5:2);SW=b.width;SH=b.height;
 cv.width=Math.round(SW*dpr);cv.height=Math.round(SH*dpr);glc.width=Math.round(SW*gdpr);glc.height=Math.round(SH*gdpr)}
function camBasis(c){const cp=Math.cos(c.pitch);const pos=add(c.t,V(c.dist*cp*Math.sin(c.yaw),-c.dist*cp*Math.cos(c.yaw),c.dist*Math.sin(c.pitch)));
 const f=nrm(sub(c.t,pos));let r=cross(f,Z);if(len(r)<1e-6)r=V(Math.cos(c.yaw),Math.sin(c.yaw),0);r=nrm(r);CB={pos,f,r,up:cross(r,f),F:Math.min(VW,VH)*1.5}}
function P2(p){const d=sub(p,CB.pos);const zc=dot(d,CB.f);if(zc<0.01)return null;return{x:VX+VW/2+dot(d,CB.r)*CB.F/zc,y:VY+VH/2-dot(d,CB.up)*CB.F/zc,k:CB.F/zc}}
const dz=p=>len(sub(p,CB.pos));

// ---------- kolory i cieniowanie ----------
let LIGHT=nrm(V(-0.3,0.5,1));const colC=new Map();
function rgba(s){let c=colC.get(s);if(c)return c;if(s[0]==="#"){const n=parseInt(s.slice(1),16);c=[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255,1]}
 else{const m=s.match(/[\d.]+/g).map(Number);c=[m[0]/255,m[1]/255,m[2]/255,m.length>3?m[3]:1]}colC.set(s,c);return c}
function shadeC(col,n,o,cen){const b=rgba(col);let d=dot(n,LIGHT);if(o.two)d=Math.abs(d);const amb=o.amb??0.42;const k=amb+(1-amb)*Math.max(0,d);let sp=0;
 if(o.metal){const v=nrm(sub(CB.pos,cen));const h=nrm(add(LIGHT,v));sp=Math.pow(Math.max(0,dot(n,h)),o.metal)*(o.spec??0.75)}
 const f=x=>Math.max(0,Math.min(1,x*k+sp));return[f(b[0]),f(b[1]),f(b[2]),o.alpha??b[3]]}

// ---------- bufory geometrii (budowane co klatkę, osobno dla każdego widoku) ----------
let OP=[],TR=[],TX=[],shadowPolys=[];   // nieprzezroczyste trójkąty, przezroczyste wielokąty, taśmy z teksturą
function pushPoly(arr,pts,c){for(let i=1;i<pts.length-1;i++)for(const p of[pts[0],pts[i],pts[i+1]])arr.push(p.x,p.y,p.z,c[0],c[1],c[2],c[3])}
function poly(pts,c){if(pts.length<3)return;if(c[3]<0.999){TR.push({pts,c,z:dz(mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length))});return}pushPoly(OP,pts,c)}
function quadNow(pts,col){poly(pts,rgba(col))}
function face(pts,n,col,o){o=o||{};const c=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length);if(o.shadow!==false)shadowPolys.push(pts);
 if(!o.two&&dot(n,sub(CB.pos,c))<=0)return;poly(pts,shadeC(col,n,o,c))}
// linia o grubości w [m] — wstęga zwrócona do kamery, nie cieńsza niż ~1,2 px
function line(a,b,w,col){const c=typeof col==="string"?rgba(col):col;const ab=sub(b,a);if(len(ab)<1e-9)return;const side=p=>{const s=cross(ab,sub(CB.pos,p));const l=len(s);if(l<1e-12)return V(0,0,0);
  const zc=Math.max(0.004,dot(sub(p,CB.pos),CB.f));return mul(s,Math.max(w,1.2*zc/CB.F)/2/l)};const sa=side(a),sb=side(b);poly([sub(a,sa),sub(b,sb),add(b,sb),add(a,sa)],c)}
function lineNow(a,b,w,col){line(a,b,w,col)}
// pasek leżący płasko na płaszczyźnie poziomej
function stripNow(a,b,w,col){const d=nrm(sub(b,a)),n=mul(nrm(V(-d.y,d.x,0)),w/2);quadNow([sub(a,n),sub(b,n),add(b,n),add(a,n)],col)}
function frame3(u){const e1=nrm(cross(u,Math.abs(u.z)<0.9?Z:V(1,0,0)));return[e1,cross(u,e1)]}
function cyl(a,b,r0,col,o){o=o||{};const r1=o.r1??r0;const ab=sub(b,a),L=len(ab),u=mul(ab,1/L);const[e1,e2]=frame3(u);const n=o.n||14,ns=Math.max(1,Math.ceil(L/(o.seg||0.06)));
 const ring=(t,r)=>{const c=add(a,mul(ab,t));return Array.from({length:n},(_,i)=>{const th=(i+(o.rot||0))*2*Math.PI/n;return add(c,add(mul(e1,r*Math.cos(th)),mul(e2,r*Math.sin(th))))})};
 const slope=(r0-r1)/L;let prev=ring(0,r0);for(let k=1;k<=ns;k++){const t=k/ns,cur=ring(t,r0+(r1-r0)*t);for(let i=0;i<n;i++){const j=(i+1)%n;const th=(i+0.5+(o.rot||0))*2*Math.PI/n;const nn=nrm(add(add(mul(e1,Math.cos(th)),mul(e2,Math.sin(th))),mul(u,slope)));face([prev[i],prev[j],cur[j],cur[i]],nn,col,o)}prev=cur}
 if(o.caps!==false){if(r0>0.0005)face(ring(0,r0).reverse(),mul(u,-1),o.capCol||col,o);if(r1>0.0005)face(ring(1,r1),u,o.capCol||col,o)}}
function box(c,ax,ay,az,col,o){const P=(i,j,k)=>add(c,add(mul(ax,i),add(mul(ay,j),mul(az,k))));const F=[[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1],ax],[[-1,1,-1],[-1,-1,-1],[-1,-1,1],[-1,1,1],mul(ax,-1)],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],ay],[[1,-1,-1],[-1,-1,-1],[-1,-1,1],[1,-1,1],mul(ay,-1)],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],az],[[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1],mul(az,-1)]];
 F.forEach((f,i)=>face(f.slice(0,4).map(q=>P(...q)),nrm(f[4]),(o&&o.cols&&o.cols[i])||col,o))}
function band(path,w,width,col,o){o=Object.assign({two:true},o||{});for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];const hw=mul(w,width/2);const n=nrm(cross(sub(b,a),w));if(len(n)<1e-9)continue;face([sub(a,hw),add(a,hw),add(b,hw),sub(b,hw)],n,col,o)}}

// ---------- taśma / linijka z podziałką (tekstura w kafelkach po 5 cm, ostra przy dużym przybliżeniu) ----------
// o: początek (0 cm), d: kierunek wzdłuż, w: w poprzek (od krawędzi z podziałką w głąb), L, W: długość i szerokość [m]
const TILE=0.05,TPX=512,texCache=new Map();const pow2=n=>2**Math.ceil(Math.log2(n));
function tapeTile(W,i,o,mir){const key=W+"|"+i+"|"+(o.labelUp||"edge")+"|"+mir;let t=texCache.get(key);if(t)return t;
 const h=pow2(Math.max(64,Math.round(TPX*W/TILE))),c=document.createElement("canvas");c.width=TPX;c.height=h;const g=c.getContext("2d");const pm=TPX/(TILE*1000),pv=h/(W*1000); // px na mm wzdłuż i w poprzek (tekstury 2^n — wymóg WebGL1)
 g.clearRect(0,0,TPX,h);g.strokeStyle="#1d1d1d";g.fillStyle="#1d1d1d";const mm0=Math.round(i*TILE*1000);
 for(let mm=mm0-12;mm<=mm0+62;mm++){if(mm<0)continue;const x=(mm-mm0)*pm;const Lt=(mm%10===0?6.5:mm%5===0?4.5:3)*pv;g.lineWidth=mm%10===0?0.3*pm:0.17*pm;g.beginPath();g.moveTo(x,0);g.lineTo(x,Lt);g.stroke();
  if(mm%10===0){g.font=`700 ${4*pm}px system-ui,sans-serif`;g.textAlign="center";g.textBaseline="middle";const yl=Math.min(10.5*pv,h-2.2*pv);
   g.save();g.translate(x,yl);g.scale(1,pv/pm);if(mir)g.scale(1,-1);if(o.labelUp==="d")g.rotate(mir?-Math.PI/2:Math.PI/2);g.fillText(String(mm/10),0,0);g.restore()}}
 const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const af=gl.getExtension("EXT_texture_filter_anisotropic");if(af)gl.texParameterf(gl.TEXTURE_2D,af.TEXTURE_MAX_ANISOTROPY_EXT,8);texCache.set(key,tx);return tx}
function tapeNow(o,d,w,L,W,opts){opts=opts||{};const mir=cross(w,d).z<-0.5?1:0;const lift=V(0,0,0.0006);const o2=add(o,lift);
 quadNow([o2,add(o2,mul(d,L)),add(add(o2,mul(d,L)),mul(w,W)),add(o2,mul(w,W))],opts.color||"#f6e36a");
 const n=Math.ceil(L/TILE-1e-9);for(let i=0;i<n;i++){const a=i*TILE,b=Math.min(L,a+TILE),ub=(b-a)/TILE;const p0=add(o2,mul(d,a)),p1=add(o2,mul(d,b));
  TX.push({tex:tapeTile(W,i,opts,mir),pts:[p0,p1,add(p1,mul(w,W)),add(p0,mul(w,W))],uv:[0,0,ub,0,ub,1,0,1]})}}

// ---------- programy GL ----------
function prog(vs,fs){const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x};
 const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);return p}
let PC,PT,bufC,bufT;
function initGL(){texCache.clear();PC=prog(`attribute vec3 p;attribute vec4 c;uniform mat4 M;varying vec4 vc;void main(){gl_Position=M*vec4(p,1.0);vc=c;}`,
 `precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}`);
 PT=prog(`attribute vec3 p;attribute vec2 t;uniform mat4 M;varying vec2 vt;void main(){gl_Position=M*vec4(p,1.0);vt=t;}`,
 `precision mediump float;varying vec2 vt;uniform sampler2D s;void main(){gl_FragColor=texture2D(s,vt);}`);
 bufC=gl.createBuffer();bufT=gl.createBuffer()}
if(gl)initGL();
const NEAR=0.004,FAR=25;
function viewMatrix(){const sx=2*CB.F/VW,sy=2*CB.F/VH,A=(FAR+NEAR)/(FAR-NEAR),B=-2*FAR*NEAR/(FAR-NEAR);const{r,up,f,pos}=CB;
 const R=[[r.x*sx,r.y*sx,r.z*sx,-dot(r,pos)*sx],[up.x*sy,up.y*sy,up.z*sy,-dot(up,pos)*sy],[f.x*A,f.y*A,f.z*A,-dot(f,pos)*A+B],[f.x,f.y,f.z,-dot(f,pos)]];
 const m=new Float32Array(16);for(let c=0;c<4;c++)for(let k=0;k<4;k++)m[c*4+k]=R[k][c];return m}
function drawColor(data,M){if(!data.length)return;gl.useProgram(PC);gl.bindBuffer(gl.ARRAY_BUFFER,bufC);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STREAM_DRAW);
 const lp=gl.getAttribLocation(PC,"p"),lc=gl.getAttribLocation(PC,"c");gl.enableVertexAttribArray(lp);gl.enableVertexAttribArray(lc);gl.vertexAttribPointer(lp,3,gl.FLOAT,false,28,0);gl.vertexAttribPointer(lc,4,gl.FLOAT,false,28,12);
 gl.uniformMatrix4fv(gl.getUniformLocation(PC,"M"),false,M);gl.drawArrays(gl.TRIANGLES,0,data.length/7)}
function drawTapes(M){if(!TX.length)return;gl.useProgram(PT);gl.uniformMatrix4fv(gl.getUniformLocation(PT,"M"),false,M);gl.bindBuffer(gl.ARRAY_BUFFER,bufT);
 const lp=gl.getAttribLocation(PT,"p"),lt=gl.getAttribLocation(PT,"t");gl.enableVertexAttribArray(lp);gl.enableVertexAttribArray(lt);
 for(const q of TX){const v=[];for(const i of[0,1,2,0,2,3])v.push(q.pts[i].x,q.pts[i].y,q.pts[i].z,q.uv[i*2],q.uv[i*2+1]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STREAM_DRAW);
  gl.vertexAttribPointer(lp,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(lt,2,gl.FLOAT,false,20,12);gl.bindTexture(gl.TEXTURE_2D,q.tex);gl.drawArrays(gl.TRIANGLES,0,6)}}
// cienie na blacie: rzut wzdłuż światła na z=0, przycięty do obszaru blatu; bufor szablonu (stencil) = każdy piksel przyciemniony raz
function clip2(poly,area){let out=poly;for(let i=0;i<area.length&&out.length;i++){const A=area[i],B=area[(i+1)%area.length];const ins=p=>(B.x-A.x)*(p.y-A.y)-(B.y-A.y)*(p.x-A.x)>=0;const inp=out;out=[];
  for(let j=0;j<inp.length;j++){const P=inp[j],Q=inp[(j+1)%inp.length],ip=ins(P),iq=ins(Q);if(ip)out.push(P);if(ip!==iq){const d1=(B.x-A.x)*(P.y-A.y)-(B.y-A.y)*(P.x-A.x),d2=(B.x-A.x)*(Q.y-A.y)-(B.y-A.y)*(Q.x-A.x);const t=d1/(d1-d2);out.push(V(P.x+(Q.x-P.x)*t,P.y+(Q.y-P.y)*t,0))}}}return out}
function shadowData(area){if(!area)return[];let A=area;{const s=(A[1].x-A[0].x)*(A[2].y-A[0].y)-(A[1].y-A[0].y)*(A[2].x-A[0].x);if(s<0)A=A.slice().reverse()}
 const out=[],c=[0,0,0,0.26];for(const pts of shadowPolys){if(pts.some(p=>p.z<-0.0005))continue;let q=pts.map(p=>{const s=sub(p,mul(LIGHT,p.z/LIGHT.z));return V(s.x,s.y,0)});
  const ar=(q[1].x-q[0].x)*(q[2].y-q[0].y)-(q[1].y-q[0].y)*(q[2].x-q[0].x);if(Math.abs(ar)<1e-12&&q.length===3)continue;if(ar<0)q=q.reverse();q=clip2(q,A);if(q.length<3)continue;pushPoly(out,q.map(p=>V(p.x,p.y,0.00035)),c)}return out}

const D={ // API rysowania dla zadania
 cyl,box,band,face,solid:fn=>fn(),flush:()=>{},shadowsNow:()=>{},
 faceNow:(pts,n,col,o)=>face(pts,n,col,Object.assign({shadow:false},o||{})),
 get grabbing(){return grab},
 line:(a,b,w,col)=>line(a,b,w,col),
 quad:(pts,col)=>quadNow(pts,col),
 custom:(z,fn)=>fn(ctx),
 quadNow,lineNow,tapeNow,stripNow,P2,dz,get camPos(){return CB.pos},get pip(){return isPip}};

// ---------- stały motyw: stół laboratoryjny (sklejka brzozowa, nogi, oskrzynienie, podłoga) ----------
// Zadanie podaje scene.table={x0,x1,y0,y1}; blat ma górę na z=0.
function drawTable(tb){const X=V(1,0,0),Y=V(0,1,0);const th=tb.th||0.028,fz=tb.floor??-0.75,{x0,x1,y0,y1}=tb,pad=3;
 quadNow([V(x0-pad,y0-pad,fz),V(x1+pad,y0-pad,fz),V(x1+pad,y1+pad,fz),V(x0-pad,y1+pad,fz)],"#a49c90");
 for(let k=-6;k<=6;k++){const y=(y0+y1)/2+k*0.3;stripNow(V(x0-pad,y,fz+0.0008),V(x1+pad,y,fz+0.0008),0.004,"rgba(0,0,0,.06)")}
 const li=0.05,lw=0.022,lh=(-fz-th)/2;for(const[x,y]of[[x0+li,y0+li],[x1-li,y0+li],[x0+li,y1-li],[x1-li,y1-li]])box(V(x,y,-th-lh),mul(X,lw),mul(Y,lw),mul(Z,lh),"#b08d5f",{shadow:false});
 const ax=(x1-x0)/2-li-lw,ay=(y1-y0)/2-li-lw;
 for(const y of[y0+li,y1-li])box(V((x0+x1)/2,y,-th-0.04),mul(X,ax),mul(Y,0.009),mul(Z,0.04),"#bd9a6b",{shadow:false});
 for(const x of[x0+li,x1-li])box(V(x,(y0+y1)/2,-th-0.04),mul(X,0.009),mul(Y,ay),mul(Z,0.04),"#bd9a6b",{shadow:false});
 box(V((x0+x1)/2,(y0+y1)/2,-th/2),mul(X,(x1-x0)/2),mul(Y,(y1-y0)/2),mul(Z,th/2),"#d4b283",{cols:["#c9a675","#c9a675","#d4b283","#d4b283","#e2c597","#a88a62"],shadow:false,amb:0.55});
 if(!isPip){const n=Math.round((y1-y0)/0.03);for(let k=0;k<n;k++){const y=y0+0.015+k*(y1-y0-0.03)/(n-1);stripNow(V(x0,y,0.00012),V(x1,y+0.004*Math.sin(k*1.7),0.00012),0.0012,"rgba(140,95,45,.10)")}}}

// ---------- warstwa 2D: uchwyty przedmiotów ----------
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

// ---------- jeden widok: geometria → GL (głębia) → warstwa 2D ----------
function scene(view,pip){VW=view.w;VH=view.h;VX=view.x;VY=view.y;isPip=pip;camBasis(view.cam);OP=[];TR=[];TX=[];shadowPolys=[];
 if(T.table)drawTable(T.table);T.draw(D);
 if(gl&&!glLost){const x=Math.round(VX*gdpr),y=Math.round((SH-VY-VH)*gdpr),w=Math.round(VW*gdpr),h=Math.round(VH*gdpr);gl.viewport(x,y,w,h);gl.enable(gl.SCISSOR_TEST);gl.scissor(x,y,w,h);
  if(pip){gl.clearColor(0.84,0.85,0.87,1)}else gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clearStencil(0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
  const M=viewMatrix();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.depthMask(true);
  drawColor(OP,M);                                                                        // 1) bryły i powierzchnie
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);
  gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,0,0xff);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);drawColor(shadowData(T.shadowArea),M);gl.disable(gl.STENCIL_TEST); // 2) cienie
  gl.disable(gl.POLYGON_OFFSET_FILL);const tr=[];TR.sort((a,b)=>b.z-a.z).forEach(t=>pushPoly(tr,t.pts,t.c));drawColor(tr,M);   // 3) półprzezroczyste (od najdalszych)
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-4);drawTapes(M);gl.disable(gl.POLYGON_OFFSET_FILL);                      // 4) podziałki taśm i linijek
  gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.SCISSOR_TEST)}
 const c=ctx;c.save();c.beginPath();c.rect(VX,VY,VW,VH);c.clip();
 if(!pip&&mode==="nauka"&&T.learn)T.learn(D,ctx,viz);if(!pip)drawGrabUI(ctx);
 if(pip){ // celownik ułatwiający odczyt skali + ramka Lupy
  const cx=VX+VW/2,cy=VY+VH/2,g=7;c.lineWidth=1;c.strokeStyle="rgba(200,30,30,.55)";c.beginPath();
  c.moveTo(VX,cy+.5);c.lineTo(cx-g,cy+.5);c.moveTo(cx+g,cy+.5);c.lineTo(VX+VW,cy+.5);c.moveTo(cx+.5,VY);c.lineTo(cx+.5,cy-g);c.moveTo(cx+.5,cy+g);c.lineTo(cx+.5,VY+VH);c.stroke();
  c.strokeStyle="rgba(200,30,30,.8)";c.beginPath();c.arc(cx+.5,cy+.5,2,0,7);c.stroke();
  c.strokeStyle="#fff";c.lineWidth=3;c.strokeRect(VX+1.5,VY+1.5,VW-3,VH-3);c.fillStyle="rgba(27,33,48,.85)";c.fillRect(VX+6,VY+6,44,18);c.fillStyle="#fff";c.font="600 11px system-ui";c.textAlign="left";c.textBaseline="alphabetic";c.fillText("lupa",VX+12,VY+19)}
 c.restore()}
function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(dpr,0,0,dpr,0,0);
 if(gl&&!glLost&&gl.isContextLost()){glLost=true;clearTimeout(glRetry);glRetry=setTimeout(()=>{if(glLost){makeGL()&&(initGL(),resize())}},1200)}
 if(gl&&!glLost){gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,glc.width,glc.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}
 if(camAnim){const t=Math.min(1,(performance.now()-camAnim.t0)/camAnim.d),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;cam.t=lerp(camAnim.a.t,camAnim.b.t,e);for(const k of["yaw","pitch","dist"])cam[k]=camAnim.a[k]+(camAnim.b[k]-camAnim.a[k])*e;if(t>=1)camAnim=null}
 keepCamAbove();scene({x:0,y:0,w:SW,h:SH,cam},false);
}
// kamera nie schodzi poniżej podłogi
function keepCamAbove(){if(T.camMinZ==null)return;const m=T.camMinZ;if(cam.t.z<m-0.02)cam.t=V(cam.t.x,cam.t.y,m-0.02);const need=(m-cam.t.z)/cam.dist;if(need>=0.98)return;if(Math.sin(cam.pitch)<need)cam.pitch=Math.asin(need)}
function goCam(v,d){camAnim={t0:performance.now(),d:d||900,a:{t:cam.t,yaw:cam.yaw,pitch:cam.pitch,dist:cam.dist},b:v}}

// ---------- wejście: kamera swobodna + chwytanie przedmiotów ----------
// Złap przedmiot → od razu przeciągasz wzdłuż jego osi. Ostatnio chwycony przedmiot zostaje „aktywny” (podświetlony w scenie i na pasku).
const ptrs=new Map();let pinch=0,grab=null;
function screenOf(p){VW=SW;VH=SH;VX=0;VY=0;camBasis(cam);return P2(p)}
let moveTool=null,hoverId=null,downInfo=null,dragLine=null;
// Przeciąganie wzdłuż osi przedmiotu: punkt osi najbliższy promieniowi spod kursora (stabilne z każdego kąta kamery).
function axisParam(O,u,x,y){VW=SW;VH=SH;VX=0;VY=0;camBasis(cam);const r=nrm(add(CB.f,add(mul(CB.r,(x-SW/2)/CB.F),mul(CB.up,-(y-SH/2)/CB.F))));
 const w0=sub(O,CB.pos),b=dot(u,r),den=1-b*b;if(den<0.03)return null;return(b*dot(r,w0)-dot(u,w0))/den}
function grabList(){return T.grabbables?T.grabbables():[]}
function hitGrab(x,y,only,extra){let best=null,bd=1e9;for(const g of grabList()){if(only&&g.id!==only)continue;const q=screenOf(g.p);if(!q)continue;const R=Math.max(extra||26,(g.r||0.02)*q.k+(extra?extra-14:12));const d=Math.hypot(x-q.x,y-q.y);if(d<R&&d<bd){bd=d;best=g}}return best}
function setMoveTool(id,frame){moveTool=moveTool===id?null:id;hideHint();if(moveTool&&frame!==false){const g=grabList().find(q=>q.id===moveTool);if(g){const q=screenOf(g.p);if(!q||q.x<60||q.y<60||q.x>SW-60||q.y>SH-140)goCam({t:g.p,yaw:cam.yaw,pitch:cam.pitch,dist:Math.min(cam.dist,0.6)},600)}}}
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);const b=cv.getBoundingClientRect();const x=e.clientX-b.left,y=e.clientY-b.top;
 downInfo={x:e.clientX,y:e.clientY,t:performance.now()};
 if(ptrs.size===0&&e.button===0&&!e.shiftKey){const g=(moveTool&&hitGrab(x,y,moveTool,44))||hitGrab(x,y,null,30);if(g){moveTool=g.id;grab=g;g.onStart&&g.onStart();dragLine={O:g.p,u:nrm(g.axis),t:axisParam(g.p,nrm(g.axis),x,y)};ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,grab:true});cv.style.cursor="grabbing";return}}
 ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY})});
cv.addEventListener("pointermove",e=>{if(ptrs.size)return;const b=cv.getBoundingClientRect();const g=hitGrab(e.clientX-b.left,e.clientY-b.top,null,moveTool?44:26);hoverId=g?g.id:null;
 cv.style.cursor=g?"grab":"default"});
cv.addEventListener("pointerleave",()=>{hoverId=null});
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId);const dx=e.clientX-p.x,dy=e.clientY-p.y;ptrs.set(e.pointerId,{...p,x:e.clientX,y:e.clientY});
 if(p.grab&&grab){const b0=cv.getBoundingClientRect(),t=dragLine&&axisParam(dragLine.O,dragLine.u,e.clientX-b0.left,e.clientY-b0.top);if(t!=null&&dragLine.t!=null){const ds=t-dragLine.t;dragLine.t=t;if(Math.abs(ds)<0.5)grab.onMove(ds);return}
  const a0=screenOf(grab.p),a1=screenOf(add(grab.p,mul(grab.axis,0.01)));if(!a0||!a1)return;const vx=(a1.x-a0.x)/0.01,vy=(a1.y-a0.y)/0.01;if(vx*vx+vy*vy<150*150)return;grab.onMove((dx*vx+dy*vy)/(vx*vx+vy*vy));return}
 camAnim=null;
 if(ptrs.size===1){if(e.shiftKey||(e.buttons&2)||(e.buttons&4))panBy(dx,dy);else orbitBy(dx,dy)}
 else if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,bb=cv.getBoundingClientRect();
  if(pinch)zoomAt(cx-bb.left,cy-bb.top,pinch/d);panBy(dx/2,dy/2);pinch=d}});
const up=e=>{const p=ptrs.get(e.pointerId);ptrs.delete(e.pointerId);if(p&&p.grab&&grab){grab.onEnd&&grab.onEnd();grab=null;dragLine=null;moveTool=null;cv.style.cursor="grab"}if(ptrs.size<2)pinch=0;};
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
// Buduje cały interfejs wokół sceny: górny pasek (Zadania, kamery, Pomiar/Nauka, tempo, nowy zestaw, pomoc, Zadanie),
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
 <div class="top"><button class="pill zad" id="bZad">☰ Zadania</button><span id="views"></span><span class="sp"></span>
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
 T={...cfg,draw:cfg.scene.draw,table:tb,light:cfg.scene.light,
  shadowArea:cfg.scene.shadowArea||(tb?[V(tb.x0,tb.y0,0),V(tb.x1,tb.y0,0),V(tb.x1,tb.y1,0),V(tb.x0,tb.y1,0)]:null),
  camMinZ:cfg.scene.camMinZ??(tb?(tb.floor??-0.75)+0.03:null),
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

return{_draw:()=>draw(),_grabs:()=>grabList(),defineTask,params,screenOf,V,add,sub,mul,dot,cross,len,nrm,lerp,Z,goCam,flash,showHint,hideHint,viz,fmt,num,esc,gauss,get seed(){return seed},get P(){return P},VERSION};
})();
