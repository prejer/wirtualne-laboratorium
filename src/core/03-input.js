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

