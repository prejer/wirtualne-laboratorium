/* Liceum (podstawa programowa, zakres rozszerzony, VIII.15 c, d) — Charakterystyka prądowo-napięciowa elementów.
   Zasilacz (CV/CC) → amperomierz (opór wewnętrzny) → element; woltomierz (10 MΩ) na elemencie albo na elemencie z amperomierzem.
   Elementy: opornik (prawo Ohma), żarówka (opór włókna rośnie z temperaturą: bilans mocy promieniowanie + przewodzenie, bezwładność cieplna),
   dioda krzemowa i LED (równanie Shockleya + opór szeregowy; odwrócone — zaporowo). */
(()=>{const{V,add,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const TB={x0:-0.55,x1:0.55,y0:-0.4,y1:0.4},RV=1e7,T0=295;
const EL=[{n:"opornik 47 Ω"},{n:"żarówka 6 V / 0,15 A"},{n:"dioda krzemowa"},{n:"dioda LED czerwona"}];
const ZA={A:[{n:"20 mA",max:0.01999,f:i=>(i*1000).toFixed(2),RA:10},{n:"200 mA",max:0.1999,f:i=>(i*1000).toFixed(1),RA:1}],V:[{n:"2 V",max:1.999,f:v=>v.toFixed(3)},{n:"20 V",max:19.99,f:v=>v.toFixed(2)}]};
const st={el:1,U:0,Ilim:0.2,odw:false,vPos:0,zA:1,zV:1,T:T0,dA:"",dV:"",spalona:false};let tD=0,circ={Ue:0,I:0,Ia:0,Uv:0,Us:0,cc:false};
// prąd elementu przy napięciu U na jego zaciskach (bieżąca temperatura żarnika)
function Rbulb(T){return P.R0*Math.pow(T/T0,1.21)}
function Ie(U){const e=st.el,sg=st.odw&&e>=2?-1:1,u=U*sg;let I;
 if(e===0)I=u/P.R;else if(e===1)I=u/Rbulb(st.T);
 else{const d=e===2?{Is:P.Is,n:1.9,Rs:0.15}:{Is:P.IsL,n:2.0,Rs:12};if(e===3&&st.spalona)return 0;const nVt=d.n*0.02585;
  // U = U_j + I·Rs, I = Is(e^{U_j/nVt} − 1): rozwiązanie po U_j bisekcją
  let lo=-50,hi=Math.min(u,3.5);if(u<=0){I=d.Is*(Math.exp(Math.max(u,-50)/nVt)-1)+u*1e-9}else{for(let k=0;k<60;k++){const m=(lo+hi)/2,i=d.Is*(Math.exp(m/nVt)-1);(m+i*d.Rs>u)?hi=m:lo=m}I=d.Is*(Math.exp(lo/nVt)-1)}}
 return I*sg}
function solve(){const RA=ZA.A[st.zA].RA,vAcrossEl=st.vPos===0;
 const supI=Ue=>{const ie=Ie(Ue),ia=vAcrossEl?ie+Ue/RV:ie;return{ie,ia,Us:Ue+ia*RA,isup:ia+(vAcrossEl?0:(Ue+ia*RA)/RV)}};
 let lo=-1,hi=Math.max(0.001,st.U);for(let k=0;k<70;k++){const m=(lo+hi)/2;supI(m).Us>st.U?hi=m:lo=m}let Ue=lo,s=supI(Ue),cc=false;
 if(s.isup>st.Ilim){let l2=-1,h2=Ue;for(let k=0;k<70;k++){const m=(l2+h2)/2;supI(m).isup>st.Ilim?h2=m:l2=m}Ue=l2;s=supI(Ue);cc=true}
 circ={Ue,I:s.ie,Ia:s.ia,Uv:vAcrossEl?Ue:s.Us,Us:s.Us,Isup:s.isup,cc,RA}}
function meter(z,v){if(Math.abs(v)>z.max)return v<0?"-1.":"1.";return z.f(v)}
function step(dt){solve();if(st.el===1){const P_=circ.I*circ.I*Rbulb(st.T),loss=T=>P.kr*(T**4-T0**4)+P.kc*(T-T0);const Teq=(()=>{let lo=T0,hi=3600;for(let k=0;k<50;k++){const m=(lo+hi)/2;loss(m)>P_?hi=m:lo=m}return lo})();
  st.T+=(Teq-st.T)*(1-Math.exp(-dt/0.06))}else st.T=T0;
 if(st.el===3&&!st.spalona&&Math.abs(circ.I)>0.06){st.spalona=true;LAB.flash&&LAB.flash("Dioda LED przepalona — bez opornika ogranicz prąd na zasilaczu!")}}
// barwa ciała doskonale czarnego (przybliżenie) i względna jasność w zakresie widzialnym
function bbColor(T){const t=T/100;let r=t<=66?255:329.7*Math.pow(t-60,-0.1332),g=t<=66?99.47*Math.log(t)-161.1:288.1*Math.pow(t-60,-0.0755),b=t>=66?255:t<=19?0:138.5*Math.log(t-10)-305;
 const c=x=>Math.max(0,Math.min(255,Math.round(x)));return`rgb(${c(r)},${c(g)},${c(b)})`}
function draw(D){solve();const zc=V(-0.32,0.12,0),pc=V(0.0,-0.13,0),ac=V(-0.16,-0.18,0),vc=V(0.24,-0.05,0);
 S.zasilacz({c:zc,U:circ.Us.toFixed(2),I:circ.Isup.toFixed(3),kU:st.U/12*5-2.5,kI:st.Ilim/0.5*5-2.5});S.plytkaStykowa({c:pc});const h=(k,r)=>S.dziura(pc,k,r);
 const e=st.el,cB=e===3?4:10,a=st.odw?h(cB,2):h(3,2),b=st.odw?h(3,2):h(cB,2);
 if(e===0)S.opornik({a:h(3,2),b:h(10,2),paski:["#f2d21b","#8e44ad","#1b1b1b","#c9a64a"]});
 else if(e===2)S.opornik({a,b,paski:[null,null,null,"#d0d4d9"],korpus:"#1c1c1e"});
 else if(e===3)S.led({a,k:b,swieci:st.spalona?0:Math.min(1,Math.abs(circ.I)/0.012)*(st.odw?0:1),kolor:st.spalona?"#5a2a26":"#e3261c"});
 else{const bc=V(pc.x+0.003,pc.y+0.07,0),lit=Math.max(0,Math.min(1,(st.T-850)/1700));S.zarowka({c:bc,swieci:lit,kolor:bbColor(st.T)});
  S.przewod({a:h(3,3),b:V(bc.x-0.01,bc.y-0.014,0.004),kB:V(0,-1,0),wtykA:"pin",wtykB:"krokodyl",kolor:"#d4a017",luz:0.15,bok:0.2});S.przewod({a:h(cB,3),b:V(bc.x+0.01,bc.y-0.014,0.004),kB:V(0,-1,0),wtykA:"pin",wtykB:"krokodyl",kolor:"#d4a017",luz:0.15,bok:-0.2})}
 // przewody obwodu: + zasilacza → amperomierz → płytka; płytka → − zasilacza
 const zz=S.zaciskiZasilacza(zc),ga=S.gniazdaMultimetru(ac),gv=S.gniazdaMultimetru(vc);
 S.multimetr({c:ac,odczyt:st.dA,pokretlo:-1.2+st.zA*0.5});S.multimetr({c:vc,odczyt:st.dV,pokretlo:0.3+st.zV*0.5});
 S.przewod({a:zz.plus,kA:V(0,-1,0),b:ga.v,kolor:"#c0271d",luz:0.3,bok:0.3});S.przewod({a:ga.com,b:h(3,4),wtykB:"pin",kolor:"#1b1d21",luz:0.25,bok:-0.3});
 S.przewod({a:h(cB,4),b:zz.minus,kB:V(0,-1,0),wtykA:"pin",kolor:"#1b1d21",luz:0.3,bok:-0.4});
 if(st.vPos===0)S.przewod({a:gv.v,b:h(3,0),wtykB:"pin",kolor:"#c0271d",luz:0.3,bok:0.35});else S.przewod({a:gv.v,b:ga.v,kolor:"#c0271d",luz:0.35,bok:0.5});
 S.przewod({a:gv.com,b:h(cB,0),wtykB:"pin",kolor:"#1b1d21",luz:0.3,bok:-0.3})}
LAB.defineTask({id:"lo-charakterystyka",
 meta:{kicker:"Liceum · matura rozszerzona · VIII.15",title:"Charakterystyka prądowo-napięciowa",desc:"Zasilacz, amperomierz, woltomierz i cztery elementy: opornik, żarówka, dioda krzemowa, LED. Które spełniają prawo Ohma?"},
 taskHtml:`<h2>Charakterystyka prądowo-napięciowa</h2><p><b>Masz:</b> zasilacz z regulacją napięcia i ograniczeniem prądu, amperomierz, woltomierz, płytkę stykową, opornik 47 Ω, żarówkę 6 V/0,15 A, diodę krzemową i diodę LED.</p>
 <p><b>Zadania:</b> 1) Zmierz charakterystykę I(U) każdego elementu i narysuj wykresy. 2) Wskaż elementy, które nie spełniają prawa Ohma, i wyjaśnij dlaczego. 3) Pokaż, że dioda przewodzi tylko w jedną stronę.</p>
 <p class="muted">Kręć pokrętłem U (przeciągnij w bok). Uwaga na LED bez opornika — ogranicz prąd pokrętłem I. Sprawdź, jak wynik zależy od tego, gdzie podłączysz woltomierz.</p>`,
 hints:["Opór żarówki to R = U/I w każdym punkcie — policz go dla kilku napięć. Dlaczego rośnie?","Dioda zaczyna wyraźnie przewodzić dopiero od napięcia progowego (krzemowa ok. 0,6 V, LED czerwona ok. 1,8 V).","Woltomierz na samym elemencie: amperomierz mierzy też prąd woltomierza. Woltomierz na elemencie z amperomierzem: woltomierz dolicza spadek napięcia na amperomierzu. Który układ jest lepszy dla małego, a który dla dużego oporu?"],
 params:{R:{min:46.0,max:48.0},R0:{min:3.1,max:3.6},kr:{min:2.1e-14,max:2.5e-14},kc:{min:8e-5,max:1.2e-4},Is:{min:3e-9,max:8e-9},IsL:{min:2e-19,max:6e-19}},
 scene:{table:TB,draw,light:V(0.3,-0.5,1)},
 views:[{label:"Stół",cam:()=>({t:V(-0.03,-0.04,0.02),yaw:0.1,pitch:0.85,dist:0.85})},{label:"Mierniki",cam:()=>({t:V(0.04,-0.12,0.03),yaw:0.0,pitch:1.0,dist:0.55})},
  {label:"Element",cam:()=>({t:V(0.0,-0.1,0.012),yaw:0.25,pitch:0.55,dist:0.2})},{label:"Zasilacz",cam:()=>({t:V(-0.27,-0.06,0.08),yaw:0.15,pitch:0.25,dist:0.42})}],
 movables:[{id:"kU",label:"Pokrętło U",hint:"w prawo — więcej woltów",grab:()=>({p:S.pokretlaZasilacza(V(-0.32,0.12,0)).U,r:0.014,axis:V(1,0,0),onMove:ds=>{st.U=Math.max(0,Math.min(12,st.U+ds*20))}})},
  {id:"kI",label:"Pokrętło I",hint:"limit prądu zasilacza",grab:()=>({p:S.pokretlaZasilacza(V(-0.32,0.12,0)).I,r:0.014,axis:V(1,0,0),onMove:ds=>{st.Ilim=Math.max(0.001,Math.min(0.5,st.Ilim+ds*1.5))}})}],
 actions:[{icon:"pencil",label:()=>"Element: "+EL[st.el].n,tip:"Wstaw inny element",run:()=>{st.el=(st.el+1)%4;st.T=T0}},
  {icon:"slide",label:()=>st.odw?"Odwrócony (zaporowo)":"Kierunek przewodzenia",tip:"Odwróć element na płytce",run:()=>{st.odw=!st.odw}},
  {icon:"thread",label:()=>st.vPos?"V: na elemencie + A":"V: na elemencie",tip:"Przełóż czerwony przewód woltomierza",run:()=>{st.vPos=1-st.vPos}},
  {icon:"slide",label:()=>"Zakres A: "+ZA.A[st.zA].n,tip:"Pokrętło amperomierza",run:()=>{st.zA=1-st.zA}},
  {icon:"slide",label:()=>"Zakres V: "+ZA.V[st.zV].n,tip:"Pokrętło woltomierza",run:()=>{st.zV=1-st.zV}},
  {icon:"paper",label:"Nowa dioda LED",tip:"Wymień przepaloną diodę",run:()=>{st.spalona=false}}],
 learn(D,c,viz){solve();const R=Math.abs(circ.I)>1e-7?circ.Ue/circ.I:null;viz.panel(c,[["U na elemencie",LAB.fmt(circ.Ue,3)+" V"],["I przez element",LAB.fmt(circ.I*1000,3)+" mA"],["R = U/I",R?LAB.fmt(R,1)+" Ω":"—"],
  ["temperatura żarnika",st.el===1?LAB.fmt(st.T,0)+" K":"—"],["moc elementu",LAB.fmt(circ.Ue*circ.I*1000,1)+" mW"],["błąd metody (V vs U, A vs I)",LAB.fmt((circ.Uv-circ.Ue)*1000,2)+" mV, "+LAB.fmt((circ.Ia-circ.I)*1e6,2)+" µA"]])},
 init(env){P=env.P;gauss=env.gauss||gauss;window.LOC_TEST={st,P:()=>P,solve:()=>{solve();return circ},step,Rbulb}},
 update(dt){const n=Math.max(1,Math.ceil(dt/0.01));for(let i=0;i<n;i++)step(dt/n);tD+=dt;if(tD>0.4){tD=0;const nA=gauss()*2e-5,nV=gauss()*0.002;st.dA=meter(ZA.A[st.zA],circ.Ia+nA*Math.abs(circ.Ia));st.dV=meter(ZA.V[st.zV],circ.Uv*(1+nV*0.2))}},
 status(){return st.spalona&&st.el===3?"dioda LED przepalona":circ.cc?"zasilacz ogranicza prąd (CC)":""},
 getState:()=>({...st,T:Math.round(st.T)}),setState(o){Object.assign(st,o);st.T=T0}});
})();
