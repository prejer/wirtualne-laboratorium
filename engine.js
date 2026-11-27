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
let LQ=false;try{LQ=localStorage.getItem("lab-quality")==="low"}catch(e){}   // lżejsza grafika: mniej pikseli, bez wygładzania i cieni, mniejsze tekstury
const GLOPT={antialias:!LQ,stencil:true,depth:true,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:false};
let glc=null,gl=null,glLost=false,glRetry=0;const GLSTAT={lost:0,remade:0,frames:0,err:""};
addEventListener("error",e=>{GLSTAT.err=(e.message||"")+" @"+(e.lineno||"")});
const getCtx=c=>c.getContext("webgl2",GLOPT)||c.getContext("webgl",GLOPT)||c.getContext("experimental-webgl",GLOPT)||c.getContext("webgl",{stencil:true})||c.getContext("webgl");
function watch(c){c.addEventListener("webglcontextlost",e=>{e.preventDefault();if(c!==glc)return;glLost=true;GLSTAT.lost++;clearTimeout(glRetry);glRetry=setTimeout(newContext,1500)});
 c.addEventListener("webglcontextrestored",()=>{if(c!==glc)return;clearTimeout(glRetry);initGL();glLost=false;forceRedraw();flash("Grafika 3D wróciła.")})}
function makeGL(){glc=document.createElement("canvas");glc.id="glc";cv.parentNode.insertBefore(glc,cv);gl=getCtx(glc);if(gl)watch(glc);return!!gl}
// przeglądarka nie oddała grafiki — próbujemy na nowym płótnie; stare zostaje, dopóki nowe nie zadziała (ponawiamy co 2 s)
function newContext(){if(!glLost)return;const c=document.createElement("canvas");c.id="glc";const g=getCtx(c);
 if(!g){GLSTAT.retry=(GLSTAT.retry||0)+1;glRetry=setTimeout(newContext,2000);return}
 glc.remove();glc=c;gl=g;cv.parentNode.insertBefore(glc,cv);watch(glc);GLSTAT.remade++;initGL();glLost=false;resize();forceRedraw();flash("Grafika 3D została odświeżona.")}
makeGL();
if(!gl){const m=document.createElement("div");m.id="noGL";m.style.cssText="position:absolute;inset:0;display:grid;place-items:center;font:600 16px system-ui;color:#333";m.textContent="Ta przeglądarka nie udostępnia grafiki 3D (WebGL). Otwórz laboratorium w Chrome, Firefoksie albo Safari.";cv.parentNode.appendChild(m)}
const cam={t:V(0,0,0.2),yaw:0,pitch:0.3,dist:1.5};let camAnim=null;
let VW,VH,VX,VY,CB,isPip=false;
// gdpr: rozdzielczość sceny 3D — ograniczona (MSAA + bufor głębokości przy pełnym dpr tabletu zjada setki MB pamięci GPU)
let gdpr=1;function resize(){if(!glc)return;forceRedraw();const b=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,3);gdpr=LQ?Math.min(dpr,1):Math.min(dpr,matchMedia("(pointer:coarse)").matches?1.5:2);SW=b.width;SH=b.height;
 cv.width=Math.round(SW*dpr);cv.height=Math.round(SH*dpr);glc.width=Math.round(SW*gdpr);glc.height=Math.round(SH*gdpr)}
function camBasis(c){const cp=Math.cos(c.pitch);const pos=add(c.t,V(c.dist*cp*Math.sin(c.yaw),-c.dist*cp*Math.cos(c.yaw),c.dist*Math.sin(c.pitch)));
 const f=nrm(sub(c.t,pos));let r=cross(f,Z);if(len(r)<1e-6)r=V(Math.cos(c.yaw),Math.sin(c.yaw),0);r=nrm(r);CB={pos,f,r,up:cross(r,f),F:Math.min(VW,VH)*1.5};NEAR=Math.max(0.004,Math.min(0.06,c.dist*0.12,(pos.z-(T.table?.floor??-0.76))*0.5));FAR=Math.max(6,c.dist*12)}
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
let OP=[],TR=[],TX=[],DL=[],shadowPolys=[];   // nieprzezroczyste trójkąty, przezroczyste wielokąty, taśmy z teksturą
function pushPoly(arr,pts,c){for(let i=1;i<pts.length-1;i++)for(const p of[pts[0],pts[i],pts[i+1]])arr.push(p.x,p.y,p.z,c[0],c[1],c[2],c[3])}
function poly(pts,c){if(pts.length<3)return;if(c[3]<0.999){TR.push({pts,c,z:dz(mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length))});return}pushPoly(OP,pts,c)}
function quadNow(pts,col,layer){if(layer){const c=rgba(col);DL.push({pts,c,layer});return}poly(pts,rgba(col))}
function face(pts,n,col,o){o=o||{};const c=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length);if(o.shadow!==false)shadowPolys.push(pts);
 if(!o.two&&dot(n,sub(CB.pos,c))<=0)return;poly(pts,shadeC(col,n,o,c))}
// linia o grubości w [m] — wstęga zwrócona do kamery, nie cieńsza niż ~1,2 px
function line(a,b,w,col){const c=typeof col==="string"?rgba(col):col;const ab=sub(b,a);if(len(ab)<1e-9)return;const side=p=>{const s=cross(ab,sub(CB.pos,p));const l=len(s);if(l<1e-12)return V(0,0,0);
  const zc=Math.max(0.004,dot(sub(p,CB.pos),CB.f));return mul(s,Math.max(w,1.2*zc/CB.F)/2/l)};const sa=side(a),sb=side(b);poly([sub(a,sa),sub(b,sb),add(b,sb),add(a,sa)],c)}
function lineNow(a,b,w,col){line(a,b,w,col)}
// pasek leżący płasko na płaszczyźnie poziomej
function stripNow(a,b,w,col,layer){const d=nrm(sub(b,a)),n=mul(nrm(V(-d.y,d.x,0)),w/2);quadNow([sub(a,n),sub(b,n),add(b,n),add(a,n)],col,layer)}
function frame3(u){const e1=nrm(cross(u,Math.abs(u.z)<0.9?Z:V(1,0,0)));return[e1,cross(u,e1)]}
function cyl(a,b,r0,col,o){o=o||{};const r1=o.r1??r0;const ab=sub(b,a),L=len(ab),u=mul(ab,1/L);const[e1,e2]=frame3(u);const n=LQ?Math.max(5,Math.round((o.n||14)*0.6)):(o.n||14),ns=Math.max(1,Math.ceil(L/(o.seg||0.06)));
 const ring=(t,r)=>{const c=add(a,mul(ab,t));return Array.from({length:n},(_,i)=>{const th=(i+(o.rot||0))*2*Math.PI/n;return add(c,add(mul(e1,r*Math.cos(th)),mul(e2,r*Math.sin(th))))})};
 const slope=(r0-r1)/L;let prev=ring(0,r0);for(let k=1;k<=ns;k++){const t=k/ns,cur=ring(t,r0+(r1-r0)*t);for(let i=0;i<n;i++){const j=(i+1)%n;const th=(i+0.5+(o.rot||0))*2*Math.PI/n;const nn=nrm(add(add(mul(e1,Math.cos(th)),mul(e2,Math.sin(th))),mul(u,slope)));face([prev[i],prev[j],cur[j],cur[i]],nn,col,o)}prev=cur}
 if(o.caps!==false){if(r0>0.0005)face(ring(0,r0).reverse(),mul(u,-1),o.capCol||col,o);if(r1>0.0005)face(ring(1,r1),u,o.capCol||col,o)}}
function box(c,ax,ay,az,col,o){const P=(i,j,k)=>add(c,add(mul(ax,i),add(mul(ay,j),mul(az,k))));const F=[[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1],ax],[[-1,1,-1],[-1,-1,-1],[-1,-1,1],[-1,1,1],mul(ax,-1)],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],ay],[[1,-1,-1],[-1,-1,-1],[-1,-1,1],[1,-1,1],mul(ay,-1)],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],az],[[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1],mul(az,-1)]];
 F.forEach((f,i)=>face(f.slice(0,4).map(q=>P(...q)),nrm(f[4]),(o&&o.cols&&o.cols[i])||col,o))}
function sphere(c,r,col,o){o=o||{};const nl=LQ?8:(o.nl||16),nm=LQ?14:(o.n||28),P=(i,j)=>{const t=Math.PI*i/nl-Math.PI/2,f=2*Math.PI*j/nm;return add(c,V(r*Math.cos(t)*Math.cos(f),r*Math.cos(t)*Math.sin(f),r*Math.sin(t)))};
 // gładkie cieniowanie (kolor liczony w wierzchołkach z normalnych kuli, interpolowany na trójkątach)
 const smooth=!(o.alpha<1);for(let i=0;i<nl;i++)for(let j=0;j<nm;j++){const a=P(i,j),b=P(i,j+1),d=P(i+1,j+1),e=P(i+1,j);const pts=i===0?[a,d,e]:i===nl-1?[a,b,d]:[a,b,d,e];
  const m=mul(pts.reduce((s,p)=>add(s,p),V(0,0,0)),1/pts.length),fn=nrm(sub(m,c));if(!smooth){face(pts,fn,col,o);continue}
  if(o.shadow!==false)shadowPolys.push(pts);if(dot(fn,sub(CB.pos,m))<=0)continue;const cs=pts.map(q=>shadeC(col,nrm(sub(q,c)),o,q));
  for(let k=1;k<pts.length-1;k++)for(const t of[0,k,k+1]){const q=pts[t],cc=cs[t];OP.push(q.x,q.y,q.z,cc[0],cc[1],cc[2],cc[3])}}}
function band(path,w,width,col,o){o=Object.assign({two:true},o||{});for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];const hw=mul(w,width/2);const n=nrm(cross(sub(b,a),w));if(len(n)<1e-9)continue;face([sub(a,hw),add(a,hw),add(b,hw),sub(b,hw)],n,col,o)}}

// ---------- taśma / linijka z podziałką (tekstura w kafelkach po 5 cm, ostra przy dużym przybliżeniu) ----------
// o: początek (0 cm), d: kierunek wzdłuż, w: w poprzek (od krawędzi z podziałką w głąb), L, W: długość i szerokość [m]
const TILE=0.05,TPX=LQ?256:512,texCache=new Map();const pow2=n=>2**Math.ceil(Math.log2(n));
function tapeTile(W,i,o,mir){const key=W+"|"+i+"|"+(o.labelUp||"edge")+"|"+mir;let t=texCache.get(key);if(t)return t;
 const h=pow2(Math.max(64,Math.round(TPX*W/TILE))),c=document.createElement("canvas");c.width=TPX;c.height=h;const g=c.getContext("2d");const pm=TPX/(TILE*1000),pv=h/(W*1000); // px na mm wzdłuż i w poprzek (tekstury 2^n — wymóg WebGL1)
 g.clearRect(0,0,TPX,h);g.strokeStyle="#1d1d1d";g.fillStyle="#1d1d1d";const mm0=Math.round(i*TILE*1000);
 for(let mm=mm0-12;mm<=mm0+62;mm++){if(mm<0)continue;const x=(mm-mm0)*pm;const Lt=(mm%10===0?6.5:mm%5===0?4.5:3)*pv;g.lineWidth=mm%10===0?0.3*pm:0.17*pm;g.beginPath();g.moveTo(x,0);g.lineTo(x,Lt);g.stroke();
  if(mm%10===0){g.font=`700 ${4*pm}px system-ui,sans-serif`;g.textAlign="center";g.textBaseline="middle";const yl=Math.min(10.5*pv,h-2.2*pv);
   g.save();g.translate(x,yl);g.scale(1,pv/pm);if(mir)g.scale(1,-1);if(o.labelUp==="d")g.rotate(mir?-Math.PI/2:Math.PI/2);g.fillText(String(mm/10),0,0);g.restore()}}
 const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const af=gl.getExtension("EXT_texture_filter_anisotropic");if(af)gl.texParameterf(gl.TEXTURE_2D,af.TEXTURE_MAX_ANISOTROPY_EXT,8);texCache.set(key,tx);return tx}
function tapeNow(o,d,w,L,W,opts){opts=opts||{};const mir=cross(w,d).z<-0.5?1:0;const o2=o;   // taśma leży DOKŁADNIE na powierzchni; nad nią wynosi ją warstwa (polygonOffset), nie odległość — bez migotania
 quadNow([o2,add(o2,mul(d,L)),add(add(o2,mul(d,L)),mul(w,W)),add(o2,mul(w,W))],opts.color||"#f6e36a",opts.layer||2);
 const n=Math.ceil(L/TILE-1e-9);for(let i=0;i<n;i++){const a=i*TILE,b=Math.min(L,a+TILE),ub=(b-a)/TILE;const p0=add(o2,mul(d,a)),p1=add(o2,mul(d,b));
  TX.push({tex:tapeTile(W,i,opts,mir),pts:[p0,p1,add(p1,mul(w,W)),add(p0,mul(w,W))],uv:[0,0,ub,0,ub,1,0,1]})}}

// tekstura powtarzalna (np. siatka papieru milimetrowego): rysowana raz na płótnie 2^n×2^n, potem kafelkowana
const dynKeys=[];   // tekstury zmienne (wyświetlacze): trzymamy tylko ostatnie
function repTex(key,size,paint){if(LQ&&size>64)size/=2;let t=texCache.get(key);if(t)return t;
 if(key.startsWith("dyn:")){dynKeys.push(key);if(dynKeys.length>40){const k=dynKeys.shift(),o=texCache.get(k);if(o){gl.deleteTexture(o);texCache.delete(k)}}}const c=document.createElement("canvas");c.width=c.height=size;paint(c.getContext("2d"),size);
 const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 const af=gl.getExtension("EXT_texture_filter_anisotropic");if(af)gl.texParameterf(gl.TEXTURE_2D,af.TEXTURE_MAX_ANISOTROPY_EXT,8);texCache.set(key,tx);return tx}
// prostokąt z teksturą: pts = 4 rogi, uv = [u0,v0,u1,v0,u1,v1,u0,v1]
function texQuadNow(pts,uv,key,size,paint){if(!gl||glLost)return;TX.push({tex:repTex(key,size,paint),pts,uv})}

// ---------- programy GL ----------
function prog(vs,fs){const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x};
 const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);return p}
let PC,PT,bufC,bufT;
function initGL(){texCache.clear();dynKeys.length=0;PC=prog(`attribute vec3 p;attribute vec4 c;uniform mat4 M;varying vec4 vc;void main(){gl_Position=M*vec4(p,1.0);vc=c;}`,
 `precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}`);
 PT=prog(`attribute vec3 p;attribute vec2 t;uniform mat4 M;varying vec2 vt;void main(){gl_Position=M*vec4(p,1.0);vt=t;}`,
 `precision mediump float;varying vec2 vt;uniform sampler2D s;void main(){gl_FragColor=texture2D(s,vt);}`);
 bufC=gl.createBuffer();bufT=gl.createBuffer()}
if(gl)initGL();
let NEAR=0.004,FAR=25;
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
 cyl,box,sphere,band,face,solid:fn=>fn(),flush:()=>{},shadowsNow:()=>{},
 faceNow:(pts,n,col,o)=>face(pts,n,col,Object.assign({shadow:false},o||{})),
 get grabbing(){return grab},
 line:(a,b,w,col)=>line(a,b,w,col),
 quad:(pts,col)=>quadNow(pts,col),
 custom:(z,fn)=>fn(ctx),
 quadNow,lineNow,tapeNow,stripNow,texQuadNow,P2,dz,get camPos(){return CB.pos},get pip(){return isPip}};

// ---------- stały motyw: stół laboratoryjny (sklejka brzozowa, nogi, oskrzynienie, podłoga) ----------
// Zadanie podaje scene.table={x0,x1,y0,y1}; blat ma górę na z=0.
function drawTable(tb){const X=V(1,0,0),Y=V(0,1,0);const th=tb.th||0.028,fz=tb.floor??-0.75,{x0,x1,y0,y1}=tb,pad=3;
 quadNow([V(x0-pad,y0-pad,fz),V(x1+pad,y0-pad,fz),V(x1+pad,y1+pad,fz),V(x0-pad,y1+pad,fz)],"#a49c90");
 for(let k=-6;k<=6;k++){const y=(y0+y1)/2+k*0.3;stripNow(V(x0-pad,y,fz),V(x1+pad,y,fz),0.004,"rgba(0,0,0,.06)",0.5)}
 const li=0.05,lw=0.022,lh=(-fz-th)/2;for(const[x,y]of[[x0+li,y0+li],[x1-li,y0+li],[x0+li,y1-li],[x1-li,y1-li]])box(V(x,y,-th-lh),mul(X,lw),mul(Y,lw),mul(Z,lh),"#b08d5f",{shadow:false});
 const ax=(x1-x0)/2-li-lw,ay=(y1-y0)/2-li-lw;
 for(const y of[y0+li,y1-li])box(V((x0+x1)/2,y,-th-0.04),mul(X,ax),mul(Y,0.009),mul(Z,0.04),"#bd9a6b",{shadow:false});
 for(const x of[x0+li,x1-li])box(V(x,(y0+y1)/2,-th-0.04),mul(X,0.009),mul(Y,ay),mul(Z,0.04),"#bd9a6b",{shadow:false});
 box(V((x0+x1)/2,(y0+y1)/2,-th/2),mul(X,(x1-x0)/2),mul(Y,(y1-y0)/2),mul(Z,th/2),"#d4b283",{cols:["#c9a675","#c9a675","#d4b283","#d4b283","#e2c597","#a88a62"],shadow:false,amb:0.55});
 if(!isPip){const n=Math.round((y1-y0)/0.03);for(let k=0;k<n;k++){const y=y0+0.015+k*(y1-y0-0.03)/(n-1);stripNow(V(x0,y,0),V(x1,y+0.004*Math.sin(k*1.7),0),0.0012,"rgba(140,95,45,.10)",0.5)}}}

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
function scene(view,pip){VW=view.w;VH=view.h;VX=view.x;VY=view.y;isPip=pip;camBasis(view.cam);OP=[];TR=[];TX=[];DL=[];shadowPolys=[];
 if(T.table)drawTable(T.table);T.draw(D);
 if(gl&&!glLost){const x=Math.round(VX*gdpr),y=Math.round((SH-VY-VH)*gdpr),w=Math.round(VW*gdpr),h=Math.round(VH*gdpr);gl.viewport(x,y,w,h);gl.enable(gl.SCISSOR_TEST);gl.scissor(x,y,w,h);
  if(pip){gl.clearColor(0.84,0.85,0.87,1)}else gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clearStencil(0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
  const M=viewMatrix();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.depthMask(true);
  drawColor(OP,M);                                                                        // 1) bryły i powierzchnie
  if(DL.length){gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.POLYGON_OFFSET_FILL);
   const ls=[...new Set(DL.map(d=>d.layer))].sort((a,b)=>a-b);for(const L of ls){gl.polygonOffset(-1,-4*L);const a=[];for(const d of DL)if(d.layer===L)pushPoly(a,d.pts,d.c);drawColor(a,M)}
   gl.disable(gl.POLYGON_OFFSET_FILL);gl.disable(gl.BLEND);gl.depthMask(true)}                // 1b) płaskie warstwy leżące na powierzchni (kartki, ślady) — kolejność warstw, bez migotania
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-14);
  gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,0,0xff);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);if(!LQ)drawColor(shadowData(T.shadowArea),M);gl.disable(gl.STENCIL_TEST); // 2) cienie
  gl.disable(gl.POLYGON_OFFSET_FILL);const tr=[];TR.sort((a,b)=>b.z-a.z).forEach(t=>pushPoly(tr,t.pts,t.c));drawColor(tr,M);   // 3) półprzezroczyste (od najdalszych)
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-18);drawTapes(M);gl.disable(gl.POLYGON_OFFSET_FILL);                      // 4) podziałki taśm i linijek
  gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.SCISSOR_TEST)}
 const c=ctx;c.save();c.beginPath();c.rect(VX,VY,VW,VH);c.clip();
 if(!pip&&mode==="nauka"&&T.learn)T.learn(D,ctx,viz);if(!pip)drawGrabUI(ctx);
 if(pip){ // celownik ułatwiający odczyt skali + ramka Lupy
  const cx=VX+VW/2,cy=VY+VH/2,g=7;c.lineWidth=1;c.strokeStyle="rgba(200,30,30,.55)";c.beginPath();
  c.moveTo(VX,cy+.5);c.lineTo(cx-g,cy+.5);c.moveTo(cx+g,cy+.5);c.lineTo(VX+VW,cy+.5);c.moveTo(cx+.5,VY);c.lineTo(cx+.5,cy-g);c.moveTo(cx+.5,cy+g);c.lineTo(cx+.5,VY+VH);c.stroke();
  c.strokeStyle="rgba(200,30,30,.8)";c.beginPath();c.arc(cx+.5,cy+.5,2,0,7);c.stroke();
  c.strokeStyle="#fff";c.lineWidth=3;c.strokeRect(VX+1.5,VY+1.5,VW-3,VH-3);c.fillStyle="rgba(27,33,48,.85)";c.fillRect(VX+6,VY+6,44,18);c.fillStyle="#fff";c.font="600 11px system-ui";c.textAlign="left";c.textBaseline="alphabetic";c.fillText("lupa",VX+12,VY+19)}
 c.restore()}
function draw(){GLSTAT.frames++;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(dpr,0,0,dpr,0,0);
 if(gl&&!glLost&&gl.isContextLost()){glLost=true;GLSTAT.lost++;clearTimeout(glRetry);glRetry=setTimeout(newContext,1500)}
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
function zoomAt(x,y,f){VW=SW;VH=SH;camBasis(cam);f=Math.max(0.03/cam.dist,Math.min(8/cam.dist,f));if(!isFinite(f))return;
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
const VERSION="0.26";
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
  <button class="pill tourb" id="bTour" title="Kamera przeprowadzi przez doświadczenie krok po kroku" hidden>▶ Pokaz rozwiązania</button><button class="pill" id="bHelp" title="Sterowanie">?</button><button class="pill" id="bTask">Zadanie</button></div>
 <div id="help"><b>Poruszanie się</b><table>
  <tr><td>obrót</td><td>przeciągnij · dwa palce na touchpadzie · strzałki</td></tr>
  <tr><td>przybliżanie</td><td>szczypanie · kółko myszy · dwuklik (do kursora)</td></tr>
  <tr><td>przesuwanie</td><td>Shift + przeciągnij · Shift + dwa palce · prawy przycisk</td></tr>
  <tr><td>latanie</td><td><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> · <kbd>E</kbd>/<kbd>Spacja</kbd> w górę · <kbd>Q</kbd> w dół · <kbd>Shift</kbd> szybciej</td></tr>
  <tr><td>przedmioty</td><td>złap i przeciągnij · ✋ na pasku pokazuje przedmiot · <kbd>Esc</kbd> odznacza</td></tr></table><p style="margin:10px 0 0;font-size:13px">Grafika: <button class="btn" id="bQual" style="padding:4px 10px"></button></p><button class="btn" id="helpX">OK</button></div>
 <aside id="learn" aria-hidden="true"></aside><aside id="tour" aria-live="polite"></aside>
 <div id="dock"><div class="dsec" id="dockMove"></div><div class="dsplit"></div><div class="dsec" id="dockAct"></div></div>
 <div id="hint"></div><div id="status"></div><div id="ver" title="Dotknij: diagnostyka">v${VERSION} · Wirtualne Laboratorium</div><pre id="diag"></pre>`)}

// ---------- komunikaty ----------
let hintEl=null,hintT=0;function showHint(t,ms){hintEl.textContent=t;hintEl.style.opacity=1;clearTimeout(hintT);hintT=setTimeout(hideHint,ms||8000)}function hideHint(){if(hintEl)hintEl.style.opacity=0}
let flashT=0,flashMsg="";function flash(m){flashMsg=m;flashT=performance.now()}
let lastStatus=null;function status(){let s=T.status?T.status():"";if(flashMsg&&performance.now()-flashT<3500)s+=(s?" · ":"")+"<b style='color:#1e5aa8'>"+esc(flashMsg)+"</b>";if(s===lastStatus)return;lastStatus=s;const el=$("status");el.innerHTML=s;el.style.display=s?"":"none"}

// ---------- dock: przedmioty (lewa sekcja) | akcje (prawa sekcja) ----------
const dockSync=[];
function toolBtn(icon,label,tip){const b=document.createElement("button");b.className="tool";b.title=tip||"";b.innerHTML=`<svg viewBox="0 0 24 24">${ICONS[icon]||ICONS.hand}</svg><span></span>`;b.lastChild.textContent=label;return b}
function buildDock(){const mv=$("dockMove"),ac=$("dockAct");mv.innerHTML="";ac.innerHTML="";
 for(const m of T.movables){if(m.dock===false)continue;const b=toolBtn("grab",m.label,`${m.label}: złap w scenie i przeciągnij (kliknij, żeby pokazać)`);b.classList.add("mv");b.onclick=()=>setMoveTool(m.id);mv.appendChild(b);dockSync.push(()=>b.classList.toggle("active",moveTool===m.id))}
 for(const a of T.actions){const lab=()=>typeof a.label==="function"?a.label():a.label;const b=toolBtn(a.icon,lab(),a.tip);
  b.onclick=()=>{a.run();b.classList.remove("pulse");void b.offsetWidth;b.classList.add("pulse")};ac.appendChild(b);
  if(typeof a.label==="function")dockSync.push(()=>{const t=lab();if(b.lastChild.textContent!==t)b.lastChild.textContent=t})}
 const nm=T.movables.filter(m=>m.dock!==false).length;mv.style.display=nm?"":"none";$("dock").querySelector(".dsplit").style.display=nm&&T.actions.length?"":"none";
 requestAnimationFrame(()=>{$("status").style.bottom=($("dock").offsetHeight+24)+"px"})}
function syncUI(){dockSync.forEach(f=>f())}

// ---------- tryby: Pomiar / Nauka ----------
let mode="pomiar";
function setMode(m){mode=m;forceRedraw();document.querySelectorAll("#modes button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));const L=$("learn");L.classList.toggle("on",m==="nauka"&&!!T.learn);L.setAttribute("aria-hidden",m!=="nauka")}
let learnHTML="";function renderLearn(rows){const h=rows?rows.map(r=>`<div class="lr"><span${r[2]?` style="color:${r[2]}"`:""}>${r[0]}</span><b>${r[1]}</b></div>`).join(""):"";if(h!==learnHTML){learnHTML=h;$("learn").innerHTML=h?`<div class="lh">Nauka · wielkości w układzie</div>${h}`:""}}

// ---------- rysowanie na żądanie ----------
let lastKey=null;function forceRedraw(){lastKey=null}
function frameKey(){let st="";try{st=T.getState?JSON.stringify(T.getState()):""}catch(e){}return [cam.t.x,cam.t.y,cam.t.z,cam.yaw,cam.pitch,cam.dist,SW,SH,mode,moveTool,hoverId,st].join("|")}

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
 $("taskBox").innerHTML=T.taskHtml+(T.hints||[]).map((h,i)=>typeof h==="string"?{title:"Wskazówka "+(i+1),html:h}:h).map(h=>`<details><summary>${h.title}</summary><div class="small">${h.html}</div></details>`).join("")+`<div class="row"><button class="btn p" id="taskX">Wracam</button></div>`;
 $("goStart").onclick=()=>{ov.classList.remove("on");try{if(!localStorage.getItem("lab-help-seen"))$("help").classList.add("on")}catch(e){}T.start&&T.start(!!saved)};$("goTask").onclick=()=>$("taskOv").classList.add("on");
 const newSet=()=>{location.hash="#"+T.id+"/"+(1000+Math.floor(Math.random()*899000))};
 $("newS").onclick=e=>{e.preventDefault();newSet()};
 $("bNew").onclick=()=>{if(confirm("Nowy zestaw pomiarowy?\nUkryte parametry (np. współczynniki tarcia) zostaną wylosowane od nowa, a układ wróci do stanu początkowego."))newSet()};
 $("bTask").onclick=()=>$("taskOv").classList.add("on");$("taskX").onclick=()=>$("taskOv").classList.remove("on");$("taskOv").addEventListener("click",e=>{if(e.target===$("taskOv"))$("taskOv").classList.remove("on")});
 // górny pasek
 const vb=$("views");vb.innerHTML=T.views.map((v,i)=>`<button class="pill" data-v="${i}">${v.label}</button>`).join("");vb.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>goCam(T.views[+b.dataset.v].cam()));
 document.querySelectorAll("#modes button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));if(!T.learn)$("modes").style.display="none";
 // diagnostyka (dotknij numeru wersji): typ grafiki, utraty kontekstu, kamera, ostatni błąd
 let diagOn=false;$("ver").onclick=()=>{diagOn=!diagOn;$("diag").style.display=diagOn?"block":"none"};
 setInterval(()=>{if(!diagOn)return;const g=gl,ri=g&&g.getExtension("WEBGL_debug_renderer_info");$("diag").textContent=
  `grafika: ${g?(typeof WebGL2RenderingContext!=="undefined"&&g instanceof WebGL2RenderingContext?"WebGL2":"WebGL1"):"BRAK"}${g&&g.isContextLost()?" (UTRACONA)":""}\n`+
  `GPU: ${ri?g.getParameter(ri.UNMASKED_RENDERER_WEBGL):"?"} · głębia: ${g?g.getParameter(g.DEPTH_BITS):"?"} bit · grafika: ${LQ?"lżejsza":"pełna"}\nutraty: ${GLSTAT.lost} · odtworzenia: ${GLSTAT.remade} · próby: ${GLSTAT.retry||0} · klatki: ${GLSTAT.frames}\n`+
  `płótno 3D: ${glc?glc.width+"×"+glc.height:"-"} (gdpr ${gdpr})\nkamera: t=(${[cam.t.x,cam.t.y,cam.t.z].map(v=>v.toFixed(3))}) yaw=${cam.yaw.toFixed(2)} pitch=${cam.pitch.toFixed(2)} dist=${cam.dist.toFixed(3)}\n`+
  `błąd: ${GLSTAT.err||"-"}`},500);
 $("bHelp").onclick=()=>$("help").classList.toggle("on");{const q=$("bQual");q.textContent=LQ?"lżejsza — przełącz na pełną":"pełna — przełącz na lżejszą";q.onclick=()=>{try{localStorage.setItem("lab-quality",LQ?"full":"low")}catch(e){}location.reload()}}$("helpX").onclick=()=>{$("help").classList.remove("on");try{localStorage.setItem("lab-help-seen","1")}catch(e){}};
 const bs=$("bSpeed");bs.onclick=()=>{speed=SPEEDS[(SPEEDS.indexOf(speed)+1)%SPEEDS.length];bs.textContent=speed===1?"×1":"×¼";bs.classList.toggle("on",speed!==1)};
 if(T.tour){$("bTour").hidden=false;$("bTour").onclick=()=>TOUR?tourClose():tourOpen()}
 $("bZad").onclick=()=>{renderCatalog(window.LAB_TASKS||[]);$("catalog").classList.add("on")};
 // zapis stanu (z parametrami ukrytymi)
 const persist=()=>{if(T.getState)try{localStorage.setItem(SKEY,JSON.stringify({...T.getState(),__params:P}))}catch(e){}};setInterval(persist,2000);document.addEventListener("visibilitychange",persist);window.addEventListener("pagehide",persist);
 buildDock();resize();Object.assign(cam,T.views[0].cam());cam.dist*=2;cam.yaw-=0.6;
 let tPrev=performance.now();function loop(now){let dt=Math.min(0.05,(now-tPrev)/1000);tPrev=now;
  flyStep(dt);T.update(dt*speed*(TOUR?(TOUR.play?TOUR.k:0):1));tourTick(dt);
  // rysujemy tylko, gdy coś się zmieniło (kamera, stan układu, uchwyty, tryb) — mniej pracy GPU, mniej utrat grafiki na tabletach
  const key=frameKey();if(key!==lastKey||camAnim||grab||glLost){lastKey=key;learnRows=null;draw();renderLearn(mode==="nauka"?learnRows:null)}
  status();syncUI();requestAnimationFrame(loop)}
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

// ---------- strona główna (katalog doświadczeń) ----------
const KONTAKT="";   // adres e-mail do ofert dla szkół i korepetytorów — puste: przycisk pokazuje „wkrótce”
const DZIALY=["mechanika","drgania","optyka","elektryczność"];
const GRUPY={of:{n:"Olimpiada Fizyczna"},lo:{n:"Matura rozszerzona"}};
function progressOf(id){let z=null;try{z=localStorage.getItem("lab-lastseed-"+id)}catch(e){}if(!z)return null;let st=null;try{st=localStorage.getItem("lab-"+id+"-"+z+"-state")}catch(e){}return st?{}:null}
const grupaOf=t=>t.id.startsWith("lo-")?"lo":"of";
// „LXV OF · II etap · 2015/16” → „LXV OF, II etap, 2015/16”; „Liceum · matura rozszerzona · V.8” → „Podstawa programowa, punkt V.8”
function edycja(t){const k=t.kicker||"";if(grupaOf(t)==="lo"){const m=k.match(/([IVX]+\.\d+)\s*$/);return m?"Podstawa programowa, punkt "+m[1]:"Podstawa programowa"}return k.replace(/ · /g,", ")}
function card(t){const p=progressOf(t.id),g=grupaOf(t);
 return`<li class="kc" data-g="${g}" data-dz="${(t.dzial||[]).join(" ")}"><button class="kcb" data-id="${t.id}"><span class="kimg"><img src="img/zadania/${t.id}.jpg?v=${VERSION}" alt="" loading="lazy" width="960" height="600"></span>
  <span class="kbody"><span class="kgr ${g}">${GRUPY[g].n}</span><span class="ktit">${esc(t.title)}</span><span class="kmeta">${esc(edycja(t))}</span><span class="kdesc">${esc(t.desc)}</span>
  <span class="kfoot">${(t.dzial||[]).map(d=>`<i>${d}</i>`).join("")}${p?`<i class="prog">rozpoczęte</i>`:""}</span></span></button></li>`}
const POLECANE=["lo-wahadlo","of56-2-led-cd","of72-2-brewster"];
const norm=x=>String(x||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ł/g,"l");
function row(t){const p=progressOf(t.id),g=grupaOf(t);
 return`<li class="kr" data-g="${g}" data-dz="${(t.dzial||[]).join(" ")}"><button class="krb" data-id="${t.id}"><span class="rimg"><img src="img/zadania/${t.id}.jpg?v=${VERSION}" alt="" loading="lazy" width="960" height="600"></span>
  <span class="rmain"><span class="ktit">${esc(t.title)}</span><span class="kmeta"><span class="kgr ${g}">${GRUPY[g].n}</span>${esc(edycja(t))}</span></span>
  <span class="rdz">${(t.dzial||[]).map(d=>`<i>${d}</i>`).join("")}${p?`<i class="prog">rozpoczęte</i>`:""}</span><span class="rgo">Otwórz</span></button></li>`}
const STRONY=[["home","Strona główna",""],["zadania","Doświadczenia","#zadania"],["szkoly","Dla szkół","#szkoly"],["o-projekcie","O projekcie","#o-projekcie"],["kontakt","Kontakt","#kontakt"]];
const href=k=>(STRONY.find(x=>x[0]===k)||[,,""])[2]||"#";
function navHTML(cur,page){return`<header class="nav"><div class="wrap navin"><a class="brand" href="#" data-p="home"><img src="icons/icon-192.png" alt="" width="32" height="32"><span>Wirtualne Laboratorium</span></a>
  <nav class="navl" id="navl" aria-label="Menu">${STRONY.map(([k,n])=>`<a href="${href(k)}" data-p="${k}"${page===k?' aria-current="page"':""}>${n}</a>`).join("")}</nav>
  ${cur?'<button class="b b2 navcta" id="catX">Wróć do doświadczenia</button>':page==="zadania"?"":`<a class="b navcta" href="#zadania" data-p="zadania">Otwórz doświadczenia</a>`}
  <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navl"><span></span><span></span><span></span></button></div></header>`}
const footHTML=()=>`<footer class="foot"><div class="wrap footgrid"><div class="fcol1"><b>Wirtualne Laboratorium</b><p>Doświadczenia z fizyki w 3D: zadania z Olimpiady Fizycznej i doświadczenia z podstawy programowej. Mierzysz sam, jak w pracowni.</p></div>
 <div><h4>Serwis</h4>${STRONY.map(([k,n])=>`<a href="${href(k)}" data-p="${k}">${n}</a>`).join("")}</div>
 <div><h4>Źródła</h4><p>Zadania olimpijskie opracowane na podstawie materiałów Komitetu Głównego Olimpiady Fizycznej. Doświadczenia licealne według podstawy programowej z fizyki, zakres rozszerzony (2024).</p></div></div>
 <div class="wrap"><div class="fbot"><span>© ${new Date().getFullYear()} Wirtualne Laboratorium</span><span>Wersja ${VERSION}</span></div></div></footer>`;
function homeHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;const pol=POLECANE.map(id=>tasks.find(t=>t.id===id)).filter(Boolean);
 return`<div class="site">${navHTML(cur,"home")}
 <section class="hero"><div class="wrap heroin"><div class="htx">
  <h1>Fizyka doświadczalna, w której mierzysz sam</h1>
  <p class="lead">Wirtualna pracownia fizyczna w przeglądarce. Odtworzone w 3D zadania z Olimpiady Fizycznej i doświadczenia z matury rozszerzonej — z prawdziwymi przyrządami, prawdziwą fizyką i prawdziwą niepewnością pomiaru.</p>
  <div class="hb"><button class="b" data-go="lo-wahadlo">Otwórz wahadło matematyczne</button><a class="b b2" href="#zadania" data-p="zadania">Wszystkie doświadczenia</a></div>
  <p class="hnote">${tasks.length} doświadczeń: ${nOf} z Olimpiady Fizycznej, ${nLo} z podstawy programowej. Działa na komputerze, bez instalacji.</p></div>
  <figure class="hfig"><img src="img/hero.jpg?v=${VERSION}" alt="Pomiar charakterystyki żarówki: zasilacz, amperomierz, płytka stykowa ze świecącą żarówką i woltomierz" width="1600" height="1075">
   <figcaption><span class="fx">R = U / I</span><span>Żarówka 6 V: opór włókna rośnie z 4 Ω do 38 Ω razem z jego temperaturą. Dla opornika wykres I(U) jest prostą — dla żarówki nie.</span></figcaption></figure></div></section>
 <section class="sec" id="jak"><div class="wrap"><h2>Jak to działa</h2>
  <ol class="steps"><li><h3>Wybierz doświadczenie</h3><p>Na stole leży ten sam sprzęt co w treści zadania: linijki, statyw, multimetr, papier milimetrowy. Każdy zestaw ma lekko inne parametry, jak prawdziwe przyrządy.</p></li>
  <li><h3>Zmierz</h3><p>Przesuwasz, odchylasz, przekładasz przewody i odczytujesz skale. Aplikacja nie liczy za Ciebie — wynik i jego niepewność zależą od Twojego pomiaru.</p></li>
  <li><h3>Sprawdź w trybie Nauka</h3><p>Jednym przełącznikiem zobaczysz siły, promienie i energię, a także ukryte wartości zestawu. Porównasz je ze swoim wynikiem.</p></li></ol></div></section>
 <section class="sec alt"><div class="wrap"><div class="sech2"><h2>Na początek</h2><a class="b b2" href="#zadania" data-p="zadania">Wszystkie doświadczenia (${tasks.length})</a></div>
  <ul class="grid">${pol.map(card).join("")}</ul></div></section>
 <section class="sec"><div class="wrap"><div class="band"><div><h2>Dla szkół i korepetytorów</h2><p>Pracownia fizyczna bez zakupu sprzętu i bez instalacji — na lekcje, kółka olimpijskie i zajęcia online.</p></div><a class="b" href="#szkoly" data-p="szkoly">Zobacz ofertę</a></div></div></section>
 ${footHTML()}</div>`}
function szkolyHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;
 return`<div class="site">${navHTML(cur,"szkoly")}
 <section class="zhead"><div class="wrap"><h1>Dla szkół i korepetytorów</h1><p>Pracownia fizyczna, która działa w przeglądarce na zwykłym komputerze. Bez zakupu sprzętu, bez instalacji i bez przygotowywania stanowisk przed lekcją.</p>
  <div class="hb"><a class="b" href="#kontakt" data-p="kontakt">Umów pokaz</a><a class="b b2" href="#zadania" data-p="zadania">Zobacz doświadczenia</a></div></div></section>
 <section class="sec"><div class="wrap"><h2>Dla kogo</h2><div class="cols3">
  <div class="tile"><h3>Szkoły</h3><p>Doświadczenia wymagane w podstawie programowej, także gdy w pracowni brakuje przyrządów albo czasu na ich rozstawienie. Uczniowie mogą powtórzyć pomiar w domu.</p></div>
  <div class="tile"><h3>Firmy korepetytorskie</h3><p>Zajęcia online z maturzystami i olimpijczykami na tym samym, prawdziwym układzie pomiarowym. Uczeń mierzy, korepetytor widzi ten sam zestaw.</p></div>
  <div class="tile"><h3>Nauczyciele i kółka olimpijskie</h3><p>${nOf} zadań doświadczalnych II etapu Olimpiady Fizycznej, odtworzonych według rozwiązań Komitetu Głównego — do treningu przed zawodami.</p></div></div></div></section>
 <section class="sec alt"><div class="wrap"><h2>Co dostajesz</h2><ul class="feats">
  <li><b>Doświadczenia z podstawy programowej</b><span>${nLo} doświadczenia z zakresu rozszerzonego, każde z odnośnikiem do punktu podstawy. Kolejne w przygotowaniu.</span></li>
  <li><b>Zadania z Olimpiady Fizycznej</b><span>Ten sam sprzęt i ta sama fizyka co w rozwiązaniach Komitetu, łącznie z pułapkami pomiarowymi.</span></li>
  <li><b>Uczeń mierzy sam</b><span>Aplikacja nie podaje wyniku. Odczyty mają rozdzielczość i szum prawdziwych przyrządów, więc liczy się niepewność pomiaru.</span></li>
  <li><b>Tryb Nauka</b><span>Siły, promienie, energia i ukryte parametry zestawu — do omówienia wyników po pomiarze.</span></li>
  <li><b>Wspólny zestaw dla klasy</b><span>Każdy zestaw ma swój kod w adresie strony. Nauczyciel wysyła link i wszyscy mierzą te same przyrządy.</span></li>
  <li><b>Bez instalacji</b><span>Działa w Chrome, Edge, Firefoksie i Safari na komputerach. Wersja na tablety jest w przygotowaniu.</span></li></ul></div></section>
 <section class="sec"><div class="wrap"><h2>Jak zacząć</h2><ol class="steps"><li><h3>Napisz do nas</h3><p>Krótko opisz, dla kogo szukasz pracowni: szkoła, firma korepetytorska, kółko olimpijskie.</p></li>
  <li><h3>Pokaz online</h3><p>Pokażemy wybrane doświadczenia na żywo i odpowiemy na pytania o program i organizację zajęć.</p></li>
  <li><h3>Dostęp dla uczniów</h3><p>Ustalimy zakres doświadczeń i sposób dostępu dopasowany do Twoich zajęć.</p></li></ol></div></section>
 <section class="sec alt"><div class="wrap faqw"><h2>Najczęstsze pytania</h2><div class="faq">
  <details><summary>Czy trzeba coś instalować?</summary><p>Nie. Wystarczy przeglądarka na komputerze. Doświadczenie można też dodać jako aplikację na pulpit.</p></details>
  <details><summary>Czy działa na tabletach i telefonach?</summary><p>Na razie pełna wersja działa na komputerach. Wersja na tablety jest w przygotowaniu; stronę i listę doświadczeń można już przeglądać na telefonie.</p></details>
  <details><summary>Czy każdy uczeń dostaje te same wyniki?</summary><p>Nie, jeśli tego nie chcesz. Każdy zestaw ma lekko inne parametry, jak prawdziwe przyrządy. Gdy klasa ma mierzyć ten sam zestaw, wystarczy wysłać jeden link.</p></details>
  <details><summary>Czy doświadczenia są zgodne z podstawą programową?</summary><p>Tak — doświadczenia licealne odpowiadają wymaganiom doświadczalnym z podstawy programowej z fizyki dla zakresu rozszerzonego (2024). Przy każdym podany jest punkt podstawy.</p></details>
  <details><summary>Skąd pochodzą zadania olimpijskie?</summary><p>To zadania doświadczalne II etapu Olimpiady Fizycznej. Układy odtworzyliśmy według opublikowanych rozwiązań Komitetu Głównego Olimpiady Fizycznej.</p></details></div></div></section>
 <section class="sec"><div class="wrap"><div class="band"><div><h2>Porozmawiajmy o Twoich zajęciach</h2><p>Odpowiemy na pytania i pokażemy doświadczenia na żywo.</p></div><a class="b" href="#kontakt" data-p="kontakt">Przejdź do kontaktu</a></div></div></section>
 ${footHTML()}</div>`}
function oprojHTML(tasks,cur){return`<div class="site">${navHTML(cur,"o-projekcie")}
 <section class="zhead"><div class="wrap"><h1>O projekcie</h1><p>Wirtualne Laboratorium powstało z prostej obserwacji: z fizyki doświadczalnej najwięcej uczy samodzielny pomiar, a do prawdziwej pracowni nie każdy ma dostęp.</p></div></section>
 <section class="sec"><div class="wrap prose"><h2>Po co</h2>
  <p>Zadania doświadczalne z Olimpiady Fizycznej i doświadczenia maturalne trudno ćwiczyć w domu: potrzebny jest sprzęt, czas na rozstawienie układu i ktoś, kto sprawdzi wynik. Symulacje, które pokazują gotową wartość na ekranie, nie uczą pomiaru.</p>
  <p>Tutaj układ wygląda i zachowuje się jak na stole w pracowni. Uczeń sam przesuwa, odchyla, przekłada przewody i odczytuje skale — a wynik zależy od tego, jak dokładnie to zrobi.</p>
  <h2>Zasady</h2><ul class="feats one">
  <li><b>Fizyka jak w rzeczywistości</b><span>Wahadło liczone bez przybliżenia małych kątów, żarówka z nagrzewającym się włóknem, dioda według równania Shockleya, odbicie według wzorów Fresnela. Każde doświadczenie ma testy, które porównują symulację ze wzorami i z wynikami Komitetu.</span></li>
  <li><b>Pomiar należy do ucznia</b><span>Aplikacja nie mierzy za ucznia. Przyrządy mają skończoną rozdzielczość i szum, więc liczy się niepewność pomiaru.</span></li>
  <li><b>Nauka osobno od pomiaru</b><span>Tryb Nauka pokazuje to, czego w pracowni nie widać: siły, promienie, energię i ukryte parametry. Włącza się go dopiero, gdy pomiar jest zrobiony.</span></li></ul>
  <h2>Co dalej</h2><p>Kolejne zadania z Olimpiady Fizycznej i doświadczenia z podstawy programowej, wersja na tablety oraz konta dla uczniów i nauczycieli.</p>
  <div class="hb"><a class="b" href="#zadania" data-p="zadania">Otwórz doświadczenia</a><a class="b b2" href="#kontakt" data-p="kontakt">Napisz do nas</a></div></div></section>
 ${footHTML()}</div>`}
function kontaktHTML(tasks,cur){return`<div class="site">${navHTML(cur,"kontakt")}
 <section class="zhead"><div class="wrap"><h1>Kontakt</h1><p>Pytania o doświadczenia, pokaz dla szkoły albo współpracę z firmą korepetytorską — napisz, odpowiemy.</p></div></section>
 <section class="sec"><div class="wrap kgrid"><form class="kform" id="kform" novalidate>
  <div class="frow2"><label>Imię i nazwisko<input name="imie" autocomplete="name" required></label><label>E-mail<input name="email" type="email" autocomplete="email" required></label></div>
  <div class="frow2"><label>Kim jesteś<select name="kto"><option>Szkoła</option><option>Firma korepetytorska</option><option>Nauczyciel</option><option>Uczeń</option><option>Inne</option></select></label><label><span>Szkoła lub firma <span class="opt">(opcjonalnie)</span></span><input name="org" autocomplete="organization"></label></div>
  <label>Wiadomość<textarea name="msg" rows="6" required></textarea></label>
  <p class="ferr" id="ferr" role="alert" hidden></p>
  <button class="b" type="submit">Wyślij wiadomość</button>
  <p class="fnote">${KONTAKT?"Po kliknięciu otworzy się Twój program pocztowy z gotową wiadomością.":"Formularz uruchomimy wkrótce. Do tego czasu odezwij się przez osobę, która przesłała Ci link."}</p></form>
  <aside class="kside"><div class="tile"><h3>Pokaz dla szkoły lub firmy</h3><p>W wiadomości podaj, ilu uczniów i jakie zajęcia planujesz — przygotujemy pokaz dopasowany do programu.</p></div>
  ${KONTAKT?`<div class="tile"><h3>E-mail</h3><p><a href="mailto:${KONTAKT}">${KONTAKT}</a></p></div>`:""}</aside></div></section>
 ${footHTML()}</div>`}
let VIEW="kafelki";try{VIEW=localStorage.getItem("lab-widok")||"kafelki"}catch(e){}
function zadHTML(tasks,cur){const nOf=tasks.filter(t=>grupaOf(t)==="of").length,nLo=tasks.length-nOf;
 return`<div class="site">${navHTML(cur,"zad")}
 <section class="zhead"><div class="wrap"><h1>Doświadczenia</h1><p>Zadania doświadczalne II etapu Olimpiady Fizycznej, odtworzone według rozwiązań Komitetu Głównego, oraz doświadczenia wymagane w podstawie programowej z fizyki dla zakresu rozszerzonego.</p>
  <div class="srch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="q" type="search" placeholder="Szukaj po nazwie, przyrządzie lub zjawisku" aria-label="Szukaj doświadczeń" autocomplete="off"></div></div></section>
 <section class="sec alt zlist"><div class="wrap">
  <div class="tools"><div class="seg" role="group" aria-label="Grupa"><button aria-pressed="true" data-g="">Wszystkie <span>${tasks.length}</span></button><button aria-pressed="false" data-g="of">Olimpiada Fizyczna <span>${nOf}</span></button><button aria-pressed="false" data-g="lo">Matura rozszerzona <span>${nLo}</span></button></div>
   <div class="tr"><label class="sortl">Kolejność <select id="sort"><option value="">polecana</option><option value="az">nazwa A–Z</option><option value="rok">najnowsze</option></select></label>
   <div class="vt" role="group" aria-label="Widok"><button data-v="kafelki" aria-pressed="${VIEW==="kafelki"}" title="Kafelki"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg><span>Kafelki</span></button><button data-v="lista" aria-pressed="${VIEW==="lista"}" title="Lista"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></svg><span>Lista</span></button></div></div></div>
  <div class="dz" role="group" aria-label="Dział fizyki"><span>Dział</span>${["",...DZIALY].map(d=>`<button aria-pressed="${d?"false":"true"}" data-d="${d}">${d?d:"każdy"}</button>`).join("")}</div>
  <p class="zcnt" aria-live="polite"></p><ul class="grid" id="zg"></ul><ul class="list" id="zl"></ul>
  <div class="empty" hidden><p>Nie ma doświadczeń pasujących do wyszukiwania.</p><button class="b b2" id="clr">Wyczyść filtry</button></div></div></section>
 ${footHTML()}</div>`}
let TASKHASH="";
const rokOf=t=>{const m=(t.kicker||"").match(/(\d{4})(?:\/\d{2})?\s*$/)||(t.kicker||"").match(/(\d{4})/);return m?+m[1]:(grupaOf(t)==="lo"?2024:0)};
function renderCatalog(tasks){const c=$("catalog");const cur=route&&tasks.some(t=>t.id===route.id)?route.id:null;
 const h=location.hash.replace(/^#/,""),page=h===""?"home":STRONY.some(x=>x[0]===h)?h:"zadania";
 const R={home:homeHTML,zadania:zadHTML,szkoly:szkolyHTML,"o-projekcie":oprojHTML,kontakt:kontaktHTML};
 c.innerHTML=R[page](tasks,cur);c.scrollTop=0;document.title=(page==="home"?"":STRONY.find(x=>x[0]===page)[1]+" — ")+"Wirtualne Laboratorium";
 c.querySelectorAll(".kcb,.krb,[data-go]").forEach(b=>b.onclick=()=>{const id=b.dataset.id||b.dataset.go;if(cur===id){c.classList.remove("on");return}location.hash="#"+id});
 const go=k=>{history.pushState(null,"",k==="home"?location.pathname+location.search:"#"+k);renderCatalog(tasks)};
 c.querySelectorAll("a[data-p]").forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.p)});
 const bg=$("burger");bg.onclick=()=>{const o=c.querySelector(".nav").classList.toggle("open");bg.setAttribute("aria-expanded",o)};
 const kf=$("kform");if(kf)kf.onsubmit=e=>{e.preventDefault();const f=new FormData(kf),er=$("ferr");const bad=!f.get("imie").trim()?"Podaj imię i nazwisko.":!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.get("email"))?"Podaj poprawny adres e-mail.":!f.get("msg").trim()?"Napisz treść wiadomości.":"";
  er.hidden=!bad;er.textContent=bad;if(bad)return;if(!KONTAKT){er.hidden=false;er.textContent="Formularz nie jest jeszcze aktywny.";return}
  const body=`${f.get("msg")}\n\n— ${f.get("imie")} (${f.get("kto")}${f.get("org")?", "+f.get("org"):""})\n${f.get("email")}`;location.href=`mailto:${KONTAKT}?subject=${encodeURIComponent("Wirtualne Laboratorium — "+f.get("kto"))}&body=${encodeURIComponent(body)}`};
 const x=$("catX");if(x)x.onclick=()=>{if(TASKHASH&&location.hash!==TASKHASH)history.replaceState(null,"",TASKHASH);c.classList.remove("on")};
 if(page!=="zadania")return;
 let fg="",fd="",q="",so="";const zg=$("zg"),zl=$("zl"),idx=tasks.map((t,i)=>({t,i,k:norm([t.title,t.desc,t.kicker,(t.tags||[]).join(" "),(t.dzial||[]).join(" "),GRUPY[grupaOf(t)].n].join(" "))}));
 const apply=()=>{const ws=norm(q).split(/\s+/).filter(Boolean).map(w=>w.length>=5?w.slice(0,w.length-2):w);/* rdzeń słowa: „dioda” znajdzie też „diody” */let L=idx.filter(o=>(!fg||grupaOf(o.t)===fg)&&(!fd||(o.t.dzial||[]).includes(fd))&&ws.every(w=>o.k.includes(w)));
  if(so==="az")L=[...L].sort((a,b)=>a.t.title.localeCompare(b.t.title,"pl"));else if(so==="rok")L=[...L].sort((a,b)=>rokOf(b.t)-rokOf(a.t));
  zg.innerHTML=VIEW==="kafelki"?L.map(o=>card(o.t)).join(""):"";zl.innerHTML=VIEW==="lista"?L.map(o=>row(o.t)).join(""):"";zg.hidden=VIEW!=="kafelki";zl.hidden=VIEW!=="lista";
  c.querySelector(".zcnt").textContent=L.length===tasks.length?`${L.length} doświadczeń`:`${L.length} z ${tasks.length} doświadczeń`;c.querySelector(".empty").hidden=L.length>0;
  c.querySelectorAll(".kcb,.krb").forEach(b=>b.onclick=()=>{const id=b.dataset.id;if(cur===id){c.classList.remove("on");return}location.hash="#"+id})};
 $("q").oninput=e=>{q=e.target.value;apply()};$("sort").onchange=e=>{so=e.target.value;apply()};
 c.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{fg=b.dataset.g;c.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 c.querySelectorAll(".dz button").forEach(b=>b.onclick=()=>{fd=b.dataset.d;c.querySelectorAll(".dz button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 c.querySelectorAll(".vt button").forEach(b=>b.onclick=()=>{VIEW=b.dataset.v;try{localStorage.setItem("lab-widok",VIEW)}catch(e){}c.querySelectorAll(".vt button").forEach(x=>x.setAttribute("aria-pressed",x===b));apply()});
 $("clr").onclick=()=>{q="";fg="";fd="";$("q").value="";c.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.g===""));c.querySelectorAll(".dz button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.d===""));apply()};
 apply()}
function boot(){const tasks=window.LAB_TASKS||[];renderCatalog(tasks);const isPage=h=>h===""||h==="#"||STRONY.some(x=>"#"+x[0]===h);
 window.addEventListener("hashchange",()=>{if(isPage(location.hash)&&!(route&&tasks.some(t=>t.id===route.id)))renderCatalog(tasks);else location.reload()});window.addEventListener("popstate",()=>{if(isPage(location.hash))renderCatalog(tasks)});
 const t=route&&tasks.find(t=>t.id===route.id);if(!t){$("catalog").classList.add("on");$("startOv").classList.remove("on");return}
 let z=route.z;if(!z){try{z=localStorage.getItem("lab-lastseed-"+t.id)}catch(e){}}if(!z)z=String(1000+Math.floor(Math.random()*899000));seed=+z;noiseR=rng(seed*7+3);
 try{localStorage.setItem("lab-lastseed-"+t.id,z)}catch(e){}if(location.hash!=="#"+t.id+"/"+z)history.replaceState(null,"","#"+t.id+"/"+z);
 TASKHASH=location.hash;const s=document.createElement("script");s.src=t.file+"?v="+VERSION;document.body.appendChild(s)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else setTimeout(boot,0);

// ---------- aplikacja instalowana (PWA) ----------
// Na wejściu proponujemy instalację: osobne okno ma więcej zasobów niż karta/okienko z innej aplikacji,
// działa na pełnym ekranie i offline. Chrome/Edge/Android: systemowe okno instalacji; iPhone/iPad: instrukcja.
let installEvt=null;
const standalone=()=>matchMedia("(display-mode: standalone)").matches||matchMedia("(display-mode: window-controls-overlay)").matches||navigator.standalone===true;
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;showInstall()});
addEventListener("appinstalled",()=>{installEvt=null;hideInstall();try{localStorage.setItem("lab-installed","1")}catch(e){}});
function installDismissed(){try{return Date.now()-(+localStorage.getItem("lab-install-later")||0)<3*864e5}catch(e){return false}}
function hideInstall(){const b=document.getElementById("install");if(b)b.remove()}
function showInstall(){if(window.LAB_MOBILE||standalone()||installDismissed()||document.getElementById("install"))return;if(!installEvt&&!isIOS())return;
 const b=document.createElement("div");b.id="install";
 b.innerHTML=`<img src="icons/icon-192.png" alt=""><div class="it"><b>Zainstaluj laboratorium</b><span>${isIOS()&&!installEvt?"W Safari: <b>Udostępnij</b> → <b>Do ekranu początkowego</b>. ":""}Własne okno, pełny ekran, działa offline — płynniej i stabilniej niż w karcie przeglądarki.</span></div>
  <div class="ib">${installEvt?'<button class="btn p" id="instGo">Zainstaluj</button>':""}<button class="btn" id="instLater">Nie teraz</button></div>`;
 document.body.appendChild(b);
 if(installEvt)b.querySelector("#instGo").onclick=async()=>{const e=installEvt;installEvt=null;hideInstall();e.prompt();try{await e.userChoice}catch(_){}};
 b.querySelector("#instLater").onclick=()=>{try{localStorage.setItem("lab-install-later",String(Date.now()))}catch(e){}hideInstall()}}
setTimeout(showInstall,600); // iOS nie ma zdarzenia instalacji — pokazujemy instrukcję

// ---------- biblioteka sprzętu: jeden wygląd każdego przedmiotu dla wszystkich zadań ----------
// Użycie w zadaniu: const S=LAB.sprzet; S.linijka({...}); S.karton({...}) … (rysuje w bieżącym widoku).
// Jednostki: metry. Kierunki: d — wzdłuż przedmiotu, w — w poprzek, n — „do góry” (normalna). Szczegóły: docs/BIBLIOTEKA.md.
const SX=V(1,0,0),SY=V(0,1,0);
const sprzet={
 // Linijka z podziałką mm. o: punkt „0 cm” na krawędzi z podziałką (na powierzchni, na której leży), d: wzdłuż, w: w głąb linijki.
 // n=cross(w,d) to strona z podziałką. przezroczysta: plastik do oglądania przez nią (np. pionowa przy ołówku).
 linijka({o,d=SX,w=V(0,-1,0),L=0.3,W=0.03,h=0.002,przezroczysta=false,kolor}={}){const n=nrm(cross(w,d)),start=-0.006,end=L+0.006;
  const c=add(o,add(mul(d,(start+end)/2),add(mul(w,W/2),mul(n,h/2))));const col=kolor||(przezroczysta?"rgba(235,240,236,.42)":"#e9e7df");
  if(przezroczysta){tapeNow(add(o,mul(n,h)),d,w,L,W,{color:"rgba(250,250,244,.72)",labelUp:Math.abs(d.z)>0.9?"d":undefined})}
  else{box(c,mul(d,(end-start)/2),mul(w,W/2),mul(n,h/2),col,{amb:0.55});tapeNow(add(o,mul(n,h)),d,w,L,W,{color:"#f7f6f0"})}},
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
 kartka({x0,x1,y0,y1,z=0,kolor="#fbfbf7",warstwa=1}={}){quadNow([V(x0,y0,z),V(x1,y0,z),V(x1,y1,z),V(x0,y1,z)],kolor,warstwa);stripNow(V(x0,y0,z),V(x1,y0,z),0.0006,"rgba(0,0,0,.10)",warstwa+1)},
 // Papier milimetrowy: siatka 1 mm / 5 mm / 10 mm, tekstura powtarzana co 1 cm. Leży płasko na wysokości z (warstwa jak kartka).
 papierMm({x0,x1,y0,y1,z=0,warstwa=1}={}){sprzet.papierMmNa([V(x0,y0,z),V(x1,y0,z),V(x1,y1,z),V(x0,y1,z)],x1-x0,y1-y0,warstwa)},
 // Papier milimetrowy na dowolnym czworokącie (np. pasek przyklejony do deski): pts w kolejności obwodu, szer/wys w metrach.
 papierMmNa(pts,szer,wys,warstwa=1){quadNow(pts,"#fdfcf6",warstwa);texQuadNow(pts,[0,0,szer/0.01,0,szer/0.01,wys/0.01,0,wys/0.01],"papierMm",512,(g,S)=>{
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
 opornik({a,b,paski=["#e07b1f","#e07b1f","#7a4a1f","#c9a64a"],h=0.004,korpus="#d9c79a"}={}){const m=mul(add(a,b),0.5),u=nrm(sub(b,a)),L=0.0063,top=add(m,V(0,0,h));
  const e1=add(top,mul(u,-L/2)),e2=add(top,mul(u,L/2));nozka(a,add(a,V(0,0,h)));nozka(b,add(b,V(0,0,h)));nozka(add(a,V(0,0,h)),e1);nozka(e2,add(b,V(0,0,h)));
  cyl(add(e1,mul(u,0.0004)),add(e2,mul(u,-0.0004)),0.0012,korpus,{n:12,amb:0.55,spec:0.25});cyl(e1,add(e1,mul(u,0.0012)),0.00135,korpus,{n:12,r1:0.0013});cyl(add(e2,mul(u,-0.0012)),e2,0.0013,korpus,{n:12,r1:0.00135});
  paski.forEach((col,i)=>{if(!col)return;const t=i<3?-0.0021+i*0.0011:0.0021;cyl(add(top,mul(u,t-0.00035)),add(top,mul(u,t+0.00035)),0.00128,col,{n:12,caps:false,amb:0.55})})},
 // Dioda LED 5 mm stojąca na nóżkach: a — anoda (dłuższa nóżka), k — katoda. swieci: 0–1 (jasność).
 led({a,k,kolor="#e3261c",swieci=0,h=0.012}={}){const m=mul(add(a,k),0.5),top=add(m,V(0,0,h));nozka(a,add(a,V(0,0,h)));nozka(k,add(k,V(0,0,h)));
  const lit=Math.max(0,Math.min(1,swieci)),o={n:16,amb:0.45+0.55*lit,spec:0.5,alpha:0.85};
  cyl(top,add(top,V(0,0,0.001)),0.0029,kolor,{...o,n:16});cyl(add(top,V(0,0,0.001)),add(top,V(0,0,0.0065)),0.0025,kolor,o);
  cyl(add(top,V(0,0,0.0065)),add(top,V(0,0,0.0083)),0.0025,kolor,{...o,r1:0.0008});
  if(lit>0.02)sphere(add(top,V(0,0,0.0055)),0.004+0.005*lit,kolor,{alpha:0.08+0.14*lit,amb:1,shadow:false,nl:10,n:16})},
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
 zarowka({c,swieci=0,kolor="#ffe680"}={}){const lit=Math.max(0,Math.min(1,swieci));cyl(c,add(c,V(0,0,0.008)),0.012,"#2b2e33",{n:18,amb:0.45});
  cyl(add(c,V(0,0,0.008)),add(c,V(0,0,0.016)),0.005,"#c9ced4",{n:14,metal:45,spec:0.6});
  cyl(add(c,V(0,0,0.016)),add(c,V(0,0,0.019)),0.0042,"#f2f2ea",{n:16,r1:0.005,alpha:0.35,amb:0.6+0.4*lit,caps:false});sphere(add(c,V(0,0,0.0245)),0.0068,"#f2f2ea",{alpha:0.3,amb:0.6+0.4*lit,shadow:false,nl:10,n:18});
  cyl(add(c,V(0,0,0.0215)),add(c,V(0,0,0.0225)),0.0016,lit>0.05?kolor:"#666",{n:6,amb:0.3+0.7*lit,shadow:false});
  if(lit>0.05){sphere(add(c,V(0,0,0.0235)),0.009+0.008*lit,kolor,{alpha:0.10+0.12*lit,amb:1,shadow:false,nl:10,n:18});sphere(add(c,V(0,0,0.0225)),0.004,kolor,{alpha:0.35*lit,amb:1,shadow:false,nl:8,n:12})}
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

// ---------- pokaz rozwiązania: kamera prowadzi przez doświadczenie, pomiary zbierają się na bieżąco ----------
// Zadanie podaje T.tour = {steps:[{title, text (tekst lub funkcja), cam (funkcja → widok), enter(), until() → true gdy krok skończony,
//   min, max [s], speed (przyspieszenie symulacji), nauka (tryb Nauka w tym kroku)}], table:{cols:[...], rows:()=>[[...]]}, plot:()=>{pts,fit,xl,yl}}
let TOUR=null;
function tourOpen(){if(!T.tour)return;TOUR={i:-1,t:0,play:true,k:1,doneAt:null};$("stage").classList.add("touring");$("tour").classList.add("on");$("bTour").classList.add("on");tourGo(0)}
function tourClose(){if(!TOUR)return;TOUR=null;$("tour").classList.remove("on");$("stage").classList.remove("touring");$("bTour").classList.remove("on");setMode("pomiar");T.tour.exit&&T.tour.exit()}
function tourGo(i){const S=T.tour.steps;if(i<0)i=0;if(i>=S.length){tourRender();return}TOUR.i=i;TOUR.t=0;TOUR.doneAt=null;const s=S[i];TOUR.k=s.speed||1;
 if(s.cam)goCam(s.cam(),s.camMs||1500);setMode(s.nauka?"nauka":"pomiar");s.enter&&s.enter();tourRender()}
function tourTick(dt){if(!TOUR)return;const s=T.tour.steps[TOUR.i];if(!s)return;TOUR.t+=dt;
 const ok=TOUR.t>=(s.min??3)&&(!s.until||s.until())||TOUR.t>=(s.max??120);
 if(ok&&TOUR.doneAt==null){TOUR.doneAt=TOUR.t;tourRender()}
 if(TOUR.play&&TOUR.doneAt!=null&&TOUR.t-TOUR.doneAt>1.2&&TOUR.i<T.tour.steps.length-1)tourGo(TOUR.i+1);
 if((TOUR._r=(TOUR._r||0)+dt)>0.25){TOUR._r=0;tourLive()}}
function tourPlot(){const p=T.tour.plot&&T.tour.plot();if(!p||p.pts.length<2)return"";const W=300,H=190,m={l:40,r:10,t:10,b:38};
 const xs=p.pts.map(q=>q[0]),ys=p.pts.map(q=>q[1]);let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const px=(x1-x0)*0.12||0.1,py=(y1-y0)*0.12||0.1;x0-=px;x1+=px;y0-=py;y1+=py;
 const X=x=>m.l+(x-x0)/(x1-x0)*(W-m.l-m.r),Y=y=>H-m.b-(y-y0)/(y1-y0)*(H-m.t-m.b);
 const tick=(a,b)=>{const st=Math.pow(10,Math.floor(Math.log10((b-a)/3)));const s=(b-a)/st>8?st*2:st;const r=[];for(let v=Math.ceil(a/s)*s;v<=b+1e-9;v+=s)r.push(+v.toFixed(6));return r};
 let g=`<svg viewBox="0 0 ${W} ${H}" class="tplot" role="img" aria-label="${p.xl} i ${p.yl}">`;
 for(const v of tick(x0,x1))g+=`<line x1="${X(v)}" y1="${m.t}" x2="${X(v)}" y2="${H-m.b}" class="gl"/><text x="${X(v)}" y="${H-m.b+15}" text-anchor="middle">${fmt(v,2)}</text>`;
 for(const v of tick(y0,y1))g+=`<line x1="${m.l}" y1="${Y(v)}" x2="${W-m.r}" y2="${Y(v)}" class="gl"/><text x="${m.l-5}" y="${Y(v)+3.5}" text-anchor="end">${fmt(v,2)}</text>`;
 if(p.fit)g+=`<line x1="${X(x0)}" y1="${Y(p.fit.b+p.fit.a*x0)}" x2="${X(x1)}" y2="${Y(p.fit.b+p.fit.a*x1)}" class="fit"/>`;
 for(const[x,y]of p.pts)g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="3.6" class="pt"/>`;
 return g+`<text x="${(W+m.l)/2}" y="${H-3}" text-anchor="middle" class="ax">${p.xl}</text><text x="11" y="${(H-m.b)/2}" text-anchor="middle" class="ax" transform="rotate(-90 11 ${(H-m.b)/2})">${p.yl}</text></svg>`}
function tourLive(){if(!TOUR)return;const s=T.tour.steps[TOUR.i];const tx=$("tourTxt");if(tx&&typeof s.text==="function"){const h=s.text();if(tx.innerHTML!==h)tx.innerHTML=h}
 const tb=T.tour.table,rows=tb?tb.rows():[];const k=JSON.stringify(rows);if(k!==TOUR._rows){TOUR._rows=k;$("tourData").innerHTML=(rows.length?`<table class="ttab"><thead><tr>${tb.cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`:`<p class="tempty">Pomiary pojawią się tutaj.</p>`)+tourPlot()}
 const pb=$("tourBar");if(pb)pb.style.width=(TOUR.doneAt!=null?100:Math.min(96,100*TOUR.t/Math.max(s.min??3,1)))+"%"}
function tourRender(){if(!TOUR)return;const S=T.tour.steps,s=S[TOUR.i],n=S.length,last=TOUR.i===n-1;
 $("tour").innerHTML=`<div class="th"><b>Pokaz rozwiązania</b><button class="tx" id="tourX" aria-label="Zakończ pokaz">✕</button></div>
  <div class="tsteps" aria-hidden="true">${S.map((_,j)=>`<i class="${j<TOUR.i?"d":j===TOUR.i?"c":""}"></i>`).join("")}</div>
  <div class="tn">Krok ${TOUR.i+1} z ${n}${TOUR.k>1?` · symulacja przyspieszona ×${TOUR.k}`:""}</div><h3>${s.title}</h3><div class="ttxt" id="tourTxt">${typeof s.text==="function"?s.text():s.text}</div>
  <div class="tbar"><span id="tourBar"></span></div>
  <div class="tctl"><button class="btn" id="tPrev"${TOUR.i?"":" disabled"}>Wstecz</button><button class="btn" id="tPlay">${TOUR.play?"Pauza":"Wznów"}</button><button class="btn p" id="tNext">${last?"Zakończ":"Dalej"}</button></div>
  <div id="tourData"></div>`;TOUR._rows=null;tourLive();
 $("tourX").onclick=tourClose;$("tPrev").onclick=()=>tourGo(TOUR.i-1);$("tNext").onclick=()=>last?tourClose():tourGo(TOUR.i+1);$("tPlay").onclick=()=>{TOUR.play=!TOUR.play;tourRender()}}

return{sprzet,_draw:()=>draw(),_grabs:()=>grabList(),defineTask,params,screenOf,V,add,sub,mul,dot,cross,len,nrm,lerp,Z,goCam,flash,showHint,hideHint,viz,fmt,num,esc,gauss,get seed(){return seed},get P(){return P},VERSION};
})();
