/* LVI OF, II etap (2006/07) — Diody LED: krótkofalowa granica widma i stała Plancka.
   Płyta CD jako odbiciowa siatka dyfrakcyjna (d = 1,55 µm). Kolor każdego fragmentu płyty liczony z warunku siatki
   dla RZECZYWISTEGO położenia oka (kamery): u_out·g − u_in·g = mλ/d, u_out·t = u_in·t — więc obraz zmienia się, gdy się poruszasz.
   Elektryka: zasilacz → opornik 460 Ω → dioda (napięcie złącza + opór doprowadzeń), woltomierz na oporniku albo na diodzie. */
(()=>{const{V,add,sub,mul,dot,len,nrm,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const TB={x0:-0.55,x1:0.55,y0:-0.38,y1:0.38},DTR=1.55e-6,RCD=0.06,RS=460;
const DIODY=[{n:"czerwona",kol:"#e3261c",lp:"lpR",sg:9,ug:"ugR",rs:22},{n:"zielona",kol:"#2fbf4a",lp:"lpG",sg:13,ug:"ugG",rs:30},{n:"niebieska",kol:"#2d6bff",lp:"lpB",sg:11,ug:"ugB",rs:38}];
const st={x:0.04,H:0.26,dioda:0,U:0,woltomierz:1,zak:3,odczyt:"",linX:0.0};let tD=0;
const LED=()=>V(0,0,st.H);const cdC=()=>V(st.x+0.04,0,0);const marker=()=>V(st.x,0,0.0013);
// --- elektryka: U = I·(R + R_s) + U_j(I),  U_j = U_g + nV_T·ln(I/3 mA) (prawie stałe powyżej 3 mA) ---
function diode(){const d=DIODY[st.dioda],Ug=P[d.ug],Rs=d.rs*P.rsf,nVt=0.045,Uj=I=>Ug+nVt*Math.log(Math.max(I,1e-12)/0.003);
 if(st.U<=0)return{I:0,UR:0,UD:0};const f=I=>I*(RS+Rs)+Uj(I)-st.U;let lo=1e-12,hi=st.U/RS;if(f(hi)<0)return{I:hi,UR:hi*RS,UD:st.U-hi*RS};
 for(let i=0;i<80;i++){const m=Math.sqrt(lo*hi);f(m)>0?hi=m:lo=m}const I=lo;return{I,UR:I*RS,UD:st.U-I*RS}}
function reading(){if(!st.zak||!st.woltomierz)return st.zak?"0.00":"";const e=diode(),v=(st.woltomierz===1?e.UD:e.UR)+gauss()*0.003,Z=[null,0.1999,1.999,19.99][st.zak];
 if(Math.abs(v)>Z)return"1.";return st.zak===1?(v*1000).toFixed(1):st.zak===2?v.toFixed(3):v.toFixed(2)}
// --- widmo diody i kolor fali ---
const spec=(lam,sgx)=>{const d=DIODY[st.dioda],lp=P[d.lp],s=Math.hypot(d.sg,sgx||0);return d.sg/s*Math.exp(-0.5*Math.pow((lam-lp)/s,2))};
function rgbOf(l){let r=0,g=0,b=0;if(l>=380&&l<440){r=-(l-440)/60;b=1}else if(l<490){g=(l-440)/50;b=1}else if(l<510){g=1;b=-(l-510)/20}else if(l<580){r=(l-510)/70;g=1}else if(l<645){r=1;g=-(l-645)/65}else if(l<=750){r=1}
 return[r,g,b].map(x=>Math.round(255*Math.pow(Math.max(0,x),0.8)))}
// jasność obrazu dyfrakcyjnego w punkcie płyty Pp widzianym z oka E
function glow(Pp,E,I,da){da=da||0.044;const c=cdC(),gv=sub(V(Pp.x,Pp.y,0),V(c.x,c.y,0)),rr=len(gv);if(rr<0.012||rr>RCD-0.002)return null;const g=mul(gv,1/rr),t=V(-g.y,g.x,0);
 const L=LED(),uin=nrm(sub(Pp,L)),uout=nrm(sub(E,Pp)),dl=len(sub(Pp,L)),de=len(sub(E,Pp));const eps=Math.max(0.0025/dl,0.0035/de);
 const dt=dot(uout,t)-dot(uin,t),dg=dot(uout,g)-dot(uin,g);const er=Math.hypot(eps,0.5*da*Math.abs(dg)+0.5*da*Math.abs(dot(uout,g)));const wt=Math.exp(-0.5*Math.pow(dt/er,2));if(wt<0.01)return null;
 let R=0,G=0,B=0,a=0;const amp=I/0.006*0.22/(dl*dl);
 const z0=Math.exp(-0.5*Math.pow(dg/eps,2))*0.6;if(z0>0.01){const lp=P[DIODY[st.dioda].lp],k=rgbOf(lp);R+=k[0]*z0;G+=k[1]*z0;B+=k[2]*z0;a+=z0}
 for(const m of[1,-1,2,-2]){const lam=DTR*dg/m*1e9;if(lam<380||lam>760)continue;const sgx=DTR*eps/Math.abs(m)*1e9,s=spec(lam,sgx)*(Math.abs(m)===1?1:0.35);if(s<0.004)continue;const k=rgbOf(lam);R+=k[0]*s;G+=k[1]*s;B+=k[2]*s;a+=s}
 a*=wt*amp;if(a<0.02)return null;const n=Math.max(R,G,B)||1;return{a,c:`rgba(${Math.round(R/n*255)},${Math.round(G/n*255)},${Math.round(B/n*255)},${Math.min(1,a).toFixed(3)})`}}
function draw(D){const e=diode(),d=DIODY[st.dioda],L=LED(),c=cdC();
 // statyw z łapą trzymającą diodę świecącą w dół
 D.box(V(0,0.17,0.005),V(0.06,0,0),V(0,0.05,0),V(0,0,0.005),"#30343a",{metal:15,spec:0.3});D.cyl(V(0,0.17,0.01),V(0,0.17,st.H+0.06),0.005,"#a9b0b8",{n:12,metal:40,spec:0.6});
 D.box(V(0,0.17,st.H+0.03),V(0.012,0,0),V(0,0.012,0),V(0,0,0.012),"#26292e",{metal:15});D.cyl(V(0,0.165,st.H+0.03),V(0,0.008,st.H+0.03),0.004,"#a9b0b8",{n:10,metal:40});
 D.box(V(0,0.004,st.H+0.03),V(0.008,0,0),V(0,0.008,0),V(0,0,0.01),"#26292e",{metal:15});
 const lit=Math.min(1,e.I/0.006),o={n:16,amb:0.45+0.55*lit,spec:0.5,alpha:0.88};D.cyl(V(0,0,st.H+0.02),V(0,0,st.H+0.012),0.0029,d.kol,o);D.cyl(V(0,0,st.H+0.012),V(0,0,st.H+0.0045),0.0025,d.kol,o);D.cyl(V(0,0,st.H+0.0045),V(0,0,st.H+0.0027),0.0025,d.kol,{...o,r1:0.0008});
 if(lit>0.02)D.cyl(V(0,0,st.H+0.012),V(0,0,st.H-0.004),0.008*(0.6+0.6*lit),d.kol,{n:16,r1:0.002,alpha:0.18*lit,amb:1,shadow:false,caps:false});
 // płyta CD: srebrna, z otworem; pole obrazów dyfrakcyjnych liczone dla bieżącego położenia oka
 D.cyl(V(c.x,c.y,0),V(c.x,c.y,0.0012),RCD,"#cfd4da",{n:64,metal:80,spec:0.9,amb:0.4,capCol:"#d9dde2"});D.cyl(V(c.x,c.y,0.0012),V(c.x,c.y,0.00125),0.0075,"#e9ecef",{n:24,amb:0.8,shadow:false});
 D.cyl(V(c.x,c.y,0.00121),V(c.x,c.y,0.00123),0.0205,"#bfc5cc",{n:32,amb:0.6,shadow:false,caps:true,capCol:"#c3c9cf"});
 const E=D.camPos;if(e.I>1e-5){const NR=36,NA=150;for(let i=0;i<NR;i++){const r0=0.012+(RCD-0.014)*i/NR,r1=0.012+(RCD-0.014)*(i+1)/NR,rm=(r0+r1)/2;for(let j=0;j<NA;j++){const a0=2*Math.PI*j/NA,a1=2*Math.PI*(j+1)/NA,am=(a0+a1)/2;
   const Pp=V(c.x+rm*Math.cos(am),c.y+rm*Math.sin(am),0.0013);const gl=glow(Pp,E,e.I,2*Math.PI/NA);if(!gl)continue;const q=(r,a)=>V(c.x+r*Math.cos(a),c.y+r*Math.sin(a),0.0013);D.quadNow([q(r0,a0),q(r1,a0),q(r1,a1),q(r0,a1)],gl.c,4)}}}
 // taśma ze znacznikiem (kreska radialna)
 const m=marker();S.tasma({c:V(m.x-0.012,0,0.0012),n:Z,u:V(1,0,0),dl:0.02,szer:0.01});D.stripNow(V(m.x-0.02,0,0.0013),V(m.x,0,0.0013),0.0006,"#1d2a44",5);
 // linijka wzdłuż ruchu płyty i linijka pionowa (do H)
 S.linijka({o:V(-0.15,-0.075,0),L:0.30});S.linijka({o:V(st.linX,0.07,0),d:Z,w:V(1,0,0),L:0.30,przezroczysta:true});
 // elektryka: zasilacz, płytka z opornikiem 460 Ω, multimetr
 const zc=V(-0.36,0.18,0),pc=V(-0.17,0.2,0),mc=V(0.3,0.16,0);S.zasilacz({c:zc,U:st.U.toFixed(2),I:"",kU:st.U/12*5-2.5});S.plytkaStykowa({c:pc});const h=(k,r)=>S.dziura(pc,k,r);
 S.opornik({a:h(4,2),b:h(12,2),paski:["#f2d21b","#3a7d44","#7a4a1f","#c9a64a"]});const zz=S.zaciskiZasilacza(zc);
 S.przewod({a:zz.plus,kA:V(0,-1,0),b:h(4,4),wtykB:"pin",kolor:"#c0271d"});S.przewod({a:zz.minus,kA:V(0,-1,0),b:h(20,4),wtykB:"pin",kolor:"#1b1d21",bok:-0.4});
 S.przewod({a:h(12,0),b:V(-0.006,0.0,st.H+0.025),kB:V(0,0,1),wtykA:"pin",wtykB:"pin",kolor:"#d4a017",luz:0.15,bok:0.2});S.przewod({a:h(20,0),b:V(0.006,0.0,st.H+0.025),kB:V(0,0,1),wtykA:"pin",wtykB:"pin",kolor:"#2c3e50",luz:0.15,bok:-0.2});
 S.multimetr({c:mc,odczyt:st.odczyt,pokretlo:(st.zak-2)*0.6});const gn=S.gniazdaMultimetru(mc);
 if(st.woltomierz){const pa=st.woltomierz===1?h(12,1):h(4,1),pb=st.woltomierz===1?h(20,1):h(12,3);S.przewod({a:gn.v,b:pa,wtykB:"pin",kolor:"#c0271d",luz:0.3,bok:0.3});S.przewod({a:gn.com,b:pb,wtykB:"pin",kolor:"#1b1d21",luz:0.3,bok:-0.3})}}
LAB.defineTask({id:"of56-2-led-cd",
 meta:{kicker:"LVI OF · II etap · 2006/07",title:"Diody LED, płyta CD i stała Plancka",desc:"Trzy diody, płyta CD jako siatka dyfrakcyjna, zasilacz, opornik 460 Ω, woltomierz. Wyznacz granice widm diod i stałą Plancka."},
 taskHtml:`<h2>Diody LED i stała Plancka</h2><p>Największa energia kwantu wysyłanego przez diodę (krótkofalowa granica widma λ<sub>g</sub>) odpowiada zamianie w foton całej energii, jaką elektron pobrał ze źródła: eU<sub>g</sub> = hc/λ<sub>g</sub>.</p>
 <p><b>Masz:</b> trzy diody (czerwoną, zieloną, niebieską), płytę CD (odstęp ścieżek d = 1,55 ± 0,05 µm), linijki, zasilacz o regulowanym napięciu, woltomierz, opornik 460 Ω, statyw, taśmę.</p>
 <p><b>A)</b> Wyznacz λ<sub>g</sub> każdej diody dla kilku prądów z zakresu 3–10 mA. <b>B)</b> Wyznacz stałą Plancka (c = 2,998·10⁸ m/s, e = 1,602·10⁻¹⁹ C). Przyjmij, że powyżej 3 mA napięcie na złączu jest stałe, a wzrost napięcia na diodzie wynika ze stałego oporu doprowadzeń.</p>
 <p class="muted">Uwaga: prąd powyżej 10 mA może uszkodzić diodę. Patrz z góry na znacznik na płycie (widok „Oko”) i przesuwaj płytę wzdłuż znacznika.</p>`,
 hints:["Gdy znacznik jest pod diodą, widzisz jej lustrzane odbicie (rząd zerowy). Przesuwaj płytę — w odległości x pojawi się barwny obraz pierwszego rzędu.","Warunek siatki dla światła biegnącego pionowo do oka: d·sinα = λ, a sinα = x/√(x² + H²).","Prąd: I = U_R/460 Ω. U_g z ekstrapolacji U_diody(I) do I = 0; potem U_g od 1/λ_g — prosta o nachyleniu hc/e."],
 params:{lpR:{min:628,max:640},lpG:{min:562,max:572},lpB:{min:462,max:474},ugR:{min:1.70,max:1.80},ugG:{min:1.95,max:2.05},ugB:{min:2.55,max:2.70},rsf:{min:0.85,max:1.15}},
 scene:{table:TB,draw,light:V(0.3,-0.5,1)},
 views:[{label:"3D",cam:()=>({t:V(0,0.04,0.1),yaw:0.55,pitch:0.42,dist:0.85})},{label:"Oko",cam:()=>({t:marker(),yaw:0,pitch:1.563,dist:0.34})},
  {label:"Z boku",cam:()=>({t:V(0.05,0,0.13),yaw:0,pitch:0.05,dist:0.6})},{label:"Elektryka",cam:()=>({t:V(-0.12,0.18,0.03),yaw:0.1,pitch:0.85,dist:0.5})}],
 movables:[
  {id:"cd",label:"Płyta CD",hint:"przesuwaj wzdłuż znacznika",grab:()=>({p:add(cdC(),V(0.035,0.02,0.002)),r:0.02,axis:V(1,0,0),onMove:ds=>{st.x=Math.max(-0.3,Math.min(0.3,st.x+ds))}})},
  {id:"led",label:"Wysokość diody",hint:"przesuń łapę statywu",grab:()=>({p:V(0,0.17,st.H+0.03),r:0.015,axis:Z,onMove:ds=>{st.H=Math.max(0.12,Math.min(0.40,st.H+ds))}})},
  {id:"kU",label:"Pokrętło U",hint:"w prawo — więcej woltów",grab:()=>({p:S.pokretlaZasilacza(V(-0.36,0.18,0)).U,r:0.014,axis:V(1,0,0),onMove:ds=>{st.U=Math.max(0,Math.min(12,st.U+ds*20))}})},
  {id:"ruler",label:"Linijka pionowa",hint:"do pomiaru H",dock:false,grab:()=>({p:V(st.linX+0.015,0.07,0.15),r:0.015,axis:V(1,0,0),onMove:ds=>{st.linX=Math.max(-0.3,Math.min(0.3,st.linX+ds))}})}],
 actions:[
  {icon:"pencil",label:()=>"Dioda: "+DIODY[st.dioda].n,tip:"Wymień diodę w łapie statywu",run:()=>{st.dioda=(st.dioda+1)%3}},
  {icon:"thread",label:()=>"Woltomierz: "+["odłączony","na diodzie","na oporniku"][st.woltomierz],tip:"Przełóż przewody woltomierza",run:()=>{st.woltomierz=(st.woltomierz+1)%3;st.odczyt=reading()}},
  {icon:"slide",label:()=>"Zakres: "+["OFF","200 mV","2 V","20 V"][st.zak],tip:"Pokrętło multimetru",run:()=>{st.zak=(st.zak+1)%4;st.odczyt=reading()}}],
 learn(D,c,viz){const e=diode(),L=LED(),m=marker(),x=Math.abs(m.x),sa=x/Math.hypot(x,st.H),d=DIODY[st.dioda];
  viz.panel(c,[["I diody",LAB.fmt(e.I*1000,2)+" mA"],["U diody",LAB.fmt(e.UD,3)+" V"],["x, H",LAB.fmt(x*100,1)+" cm, "+LAB.fmt(st.H*100,1)+" cm"],["λ = d·sinα w znaczniku",LAB.fmt(DTR*sa*1e9,0)+" nm"],
   ["szczyt widma (ukryte)",LAB.fmt(P[d.lp],0)+" nm"],["U_g złącza (ukryte)",LAB.fmt(P[d.ug],2)+" V"]]);
  viz.line(c,D,L,m,"rgba(230,160,40,.9)");const E=D.camPos;viz.line(c,D,m,add(m,mul(nrm(sub(E,m)),0.08)),"rgba(30,90,168,.9)");
  viz.dim(c,D,V(0,-0.03,0),V(m.x,-0.03,0),"x = "+LAB.fmt(x*100,1)+" cm","#555");viz.dim(c,D,V(-0.03,0,0),V(-0.03,0,st.H),"H","#555")},
 init(env){P=env.P;gauss=env.gauss||gauss;window.OF56_TEST={st,P:()=>P,diode,glow,LED,marker,DTR}},
 update(dt){const e=diode();if(e.I>0.03){st.U=Math.min(st.U,4);LAB.flash&&LAB.flash("Za duży prąd — dioda by się przepaliła! Zmniejsz napięcie.")}tD+=dt;if(tD>0.4){tD=0;st.odczyt=reading()}},
 status(){const e=diode();return e.I>0.0105?"prąd powyżej 10 mA — uważaj na diodę":""},
 getState:()=>({...st}),setState(o){Object.assign(st,o)}});
})();
