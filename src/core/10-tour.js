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
