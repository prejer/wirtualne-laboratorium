/* Szablon nowego doświadczenia — skopiuj, zmień id i dopisz do zadania/index.js. Kontrakt: src/ZADANIA.md */
(()=>{const{V,add,mul,Z,fmt}=LAB;
const st={x:0.1};let P;
function draw(D){D.quadNow([V(-0.5,-0.4,0),V(0.6,-0.4,0),V(0.6,0.4,0),V(-0.5,0.4,0)],"#dcbf93");
 D.box(V(st.x,0,0.02),V(0.03,0,0),V(0,0.02,0),V(0,0,0.02),"#8d949c",{metal:20})}
LAB.defineTask({id:"szablon",
 meta:{kicker:"Szablon",title:"Nowe doświadczenie",desc:"Opis układu."},
 taskHtml:`<h2>Treść zadania</h2><p>…</p>`,
 params:{m:{min:0.09,max:0.11}},
 scene:{draw,shadowArea:[V(-0.5,-0.4,0),V(0.6,-0.4,0),V(0.6,0.4,0),V(-0.5,0.4,0)]},
 views:[{label:"3D",cam:()=>({t:V(0.05,0,0.05),yaw:0.6,pitch:0.4,dist:0.8})}],
 movables:[{id:"block",label:"Klocek",hint:"przesuń wzdłuż stołu",grab:()=>({p:V(st.x,0,0.04),axis:V(1,0,0),r:0.03,onMove:ds=>{st.x+=ds}})}],
 actions:[{icon:"hand",label:"Ustaw na zero",tip:"…",run:()=>{st.x=0}}],
 init(env){P=env.P},update(dt){},status(){return""},getState:()=>({...st}),setState(o){Object.assign(st,o)}});
})();
