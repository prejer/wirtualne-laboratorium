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
