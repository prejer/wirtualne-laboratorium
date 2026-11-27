/* Plac zabaw: elektronika — działający obwód (zasilacz → opornik → LED) i pomiar baterii multimetrem.
   Fizyka prawdziwa: dioda wg równania Shockleya, zasilacz z ograniczeniem prądu, multimetr z zakresami i szumem ostatniej cyfry. */
(()=>{const{V,add,mul,Z}=LAB;const S=LAB.sprzet;let P={},gauss=()=>0;
const TB={x0:-0.65,x1:0.8,y0:-0.45,y1:0.4};
const HOME={zasilacz:[-0.32,0.12],plytka:[0.0,-0.14],bateria:[0.30,0.14],multimetr:[0.34,-0.16],aa:[-0.40,-0.30],magnes:[-0.22,-0.33],zarowka:[0.60,0.22],kondensator:[0.14,-0.33]};
const NAMES={zasilacz:"Zasilacz",plytka:"Płytka stykowa",bateria:"Bateria 4,5 V",multimetr:"Multimetr",aa:"Bateria AA",magnes:"Magnes neodymowy",zarowka:"Żarówka",kondensator:"Kondensator"};
const ZAKRESY=[{n:"OFF"},{n:"200 mV",max:0.1999,f:v=>(v*1000).toFixed(1)},{n:"2 V",max:1.999,f:v=>v.toFixed(3)},{n:"20 V",max:19.99,f:v=>v.toFixed(2)},{n:"200 V",max:199.9,f:v=>v.toFixed(1)}];
const st={mostek:false,pos:null,U:0,Ilim:0.1,zakres:3,podl:true,spalona:false,odczyt:"",axisY:false};let tBurn=0,tMeter=0,circ={U:0,I:0,UD:0,cc:false};
const reset=()=>{st.pos=JSON.parse(JSON.stringify(HOME))};reset();
const C=k=>V(st.pos[k][0],st.pos[k][1],0);
// --- fizyka obwodu: U_zas = I·R + n·V_T·ln(1+I/I_s); zasilacz CV/CC ---
function solve(){const R=st.mostek?0.05:P.R,nVt=2*0.02585,Is=0.01/Math.exp(P.vf/nVt);if(!st.podl||st.spalona){circ={U:st.U,I:0,UD:0,cc:false};return}
 const f=(I,U)=>I*R+nVt*Math.log(1+I/Is)-U;let lo=0,hi=st.U/R+1e-9;for(let i=0;i<60;i++){const m=(lo+hi)/2;f(m,st.U)>0?hi=m:lo=m}let I=lo,U=st.U,cc=false;
 if(I>st.Ilim){I=st.Ilim;U=I*R+nVt*Math.log(1+I/Is);cc=true}circ={U,I,UD:U-I*R,cc}}
function meter(){const z=ZAKRESY[st.zakres];if(!z.max)return"";const v=P.emf*(1e7/(1e7+0.6))+gauss()*0.0015;return v>z.max?"1.":z.f(v)}
function this_update(dt){solve();if(circ.I>0.045){tBurn+=dt;if(tBurn>0.4){st.spalona=true;LAB.flash&&LAB.flash("Dioda przepalona — za duży prąd")}}else tBurn=Math.max(0,tBurn-dt);
  tMeter+=dt;if(tMeter>0.45){tMeter=0;st.odczyt=meter()}}
function draw(D){const zc=C("zasilacz"),pc=C("plytka"),bc=C("bateria"),mc=C("multimetr");solve();
 S.zasilacz({c:zc,U:circ.U.toFixed(2),I:circ.I.toFixed(3),kU:st.U/15*5-2.5,kI:st.Ilim/1*5-2.5});
 S.plytkaStykowa({c:pc});const d=(k,r)=>S.dziura(pc,k,r);
 S.opornik({a:d(2,2),b:d(10,2)});if(st.mostek)S.przewod({a:d(2,1),b:d(10,1),wtykA:"pin",wtykB:"pin",kolor:"#e0b21c",luz:0.05,bok:0.1});const bright=st.spalona?0:Math.min(1,circ.I/0.012);
 S.led({a:d(10,0),k:d(11,0),swieci:bright,kolor:st.spalona?"#5a2a26":"#e3261c"});S.tranzystor({c:d(22,7)});
 const zz=S.zaciskiZasilacza(zc);S.przewod({a:zz.plus,kA:V(0,-1,0),b:d(2,4),kB:Z,wtykB:"pin",kolor:"#c0271d"});
 if(st.podl)S.przewod({a:zz.minus,kA:V(0,-1,0),b:d(11,4),kB:Z,wtykB:"pin",kolor:"#1b1d21",bok:-0.4});
 else S.przewod({a:zz.minus,kA:V(0,-1,0),b:add(d(11,4),V(0.03,0.05,-0.0074)),kB:V(-0.3,0.95,0),wtykB:"pin",kolor:"#1b1d21",bok:-0.4});
 S.bateriaPlaska({c:bc});S.multimetr({c:mc,odczyt:st.odczyt,pokretlo:(st.zakres-2)*0.6});
 const g=S.gniazdaMultimetru(mc),bl=S.blaszkiBaterii(bc);
 S.przewod({a:g.v,b:bl.plus,wtykB:"krokodyl",kolor:"#c0271d",luz:0.4,bok:0.5});S.przewod({a:g.com,b:bl.minus,wtykB:"krokodyl",kolor:"#1b1d21",luz:0.4,bok:-0.5});
 S.bateriaAA({c:C("aa")});S.magnes({c:C("magnes")});S.magnes({c:add(C("magnes"),V(0.02,0.006,0))});S.zarowka({c:C("zarowka")});S.kondensator({c:C("kondensator")})}
const HANDLE={zasilacz:k=>add(C(k),V(0,0,0.14)),plytka:k=>add(C(k),V(0.03,0,0.009)),bateria:k=>add(C(k),V(0,0,0.06)),multimetr:k=>add(C(k),V(0,-0.03,0.033)),
 aa:k=>add(C(k),V(0,0,0.014)),magnes:k=>add(C(k),V(0,0,0.003)),zarowka:k=>add(C(k),V(0,0,0.03)),kondensator:k=>add(C(k),V(0,0,0.014))};
LAB.defineTask({id:"plac-elektronika",
 meta:{kicker:"Biblioteka sprzętu",title:"Plac zabaw: elektronika",desc:"Zasilacz, płytka stykowa, opornik, LED, multimetr, bateria, przewody. Działający obwód — do oglądania i testów."},
 taskHtml:`<h2>Plac zabaw: elektronika</h2><p>Na płytce stykowej jest dioda LED z opornikiem, zasilana z zasilacza laboratoryjnego. Kręć pokrętłem napięcia (<b>U</b>) i ograniczenia prądu (<b>I</b>) — przeciągając je w bok — i obserwuj wyświetlacze oraz diodę. Uważaj: zbyt duży prąd przepala diodę, jak w realu.</p><p>Multimetr jest podłączony do baterii płaskiej. Zmień zakres pokrętłem i odczytaj napięcie — na złym zakresie zobaczysz „1.” (przekroczenie).</p><p>Przedmioty można przesuwać; przewody idą za nimi. Do zgłoszenia: wszystko, co wygląda lub działa nieprawdziwie.</p>`,
 params:{R:{min:320,max:340},emf:{min:4.45,max:4.85},vf:{min:1.86,max:1.98}},
 scene:{table:TB,draw,light:V(0.35,-0.5,1)},
 views:[{label:"Cały stół",cam:()=>({t:V(0.05,-0.02,0.02),yaw:0.25,pitch:0.6,dist:1.05})},{label:"Zasilacz",cam:()=>({t:add(C("zasilacz"),V(0.05,-0.16,0.08)),yaw:0.15,pitch:0.25,dist:0.42})},
  {label:"Płytka",cam:()=>({t:add(C("plytka"),V(0,0,0.01)),yaw:0.35,pitch:0.6,dist:0.17})},{label:"Multimetr",cam:()=>({t:add(C("multimetr"),V(-0.03,0.02,0.04)),yaw:-0.25,pitch:0.75,dist:0.36})}],
 movables:[{id:"kU",label:"Pokrętło U",hint:"w prawo — więcej woltów",grab:()=>({p:S.pokretlaZasilacza(C("zasilacz")).U,r:0.014,axis:V(1,0,0),onMove:ds=>{st.U=Math.max(0,Math.min(15,st.U+ds*40))}})},
  {id:"kI",label:"Pokrętło I",hint:"w prawo — większy limit prądu",grab:()=>({p:S.pokretlaZasilacza(C("zasilacz")).I,r:0.014,axis:V(1,0,0),onMove:ds=>{st.Ilim=Math.max(0,Math.min(1,st.Ilim+ds*2))}})},
  ...Object.keys(HOME).map(k=>({id:k,label:NAMES[k],dock:false,hint:"przeciągnij po stole",grab:()=>({p:HANDLE[k](k),r:0.02,axis:st.axisY?V(0,1,0):V(1,0,0),
   onMove:ds=>{const v=st.pos[k];v[st.axisY?1:0]+=ds;v[0]=Math.max(TB.x0+0.06,Math.min(TB.x1-0.06,v[0]));v[1]=Math.max(TB.y0+0.06,Math.min(TB.y1-0.06,v[1]))}})}))],
 actions:[{icon:"slide",label:()=>"Zakres: "+ZAKRESY[st.zakres].n,tip:"Przekręć pokrętło multimetru na następny zakres",run:()=>{st.zakres=(st.zakres+1)%ZAKRESY.length;st.odczyt=meter()}},
  {icon:"thread",label:()=>st.podl?"Odłącz przewód":"Podłącz przewód",tip:"Wyjmij / włóż czarny przewód z płytki",run:()=>{st.podl=!st.podl}},
  {icon:"tape",label:()=>st.mostek?"Usuń mostek":"Mostek na oporniku",tip:"Zwarcie opornika przewodem — dioda bez ochrony",run:()=>{st.mostek=!st.mostek}},
  {icon:"paper",label:"Wymień diodę",tip:"Wstaw nową diodę LED",run:()=>{st.spalona=false;tBurn=0}},
  {icon:"slide",label:()=>st.axisY?"Kierunek: w poprzek":"Kierunek: wzdłuż",tip:"Kierunek przesuwania przedmiotów",run:()=>{st.axisY=!st.axisY}},
  {icon:"hand",label:"Ułóż od nowa",tip:"Przedmioty wracają na miejsca",run:reset}],
 learn(D,c,viz){solve();viz.panel(c,[["U zasilacza",LAB.fmt(circ.U,3)+" V"+(circ.cc?" (ogranicza prąd)":"")],["I",LAB.fmt(circ.I*1000,2)+" mA"],["U diody",LAB.fmt(circ.UD,3)+" V"],
  ["U opornika = I·R",LAB.fmt(circ.I*(st.mostek?0.05:P.R),3)+" V"],["R (ukryte)",LAB.fmt(P.R,1)+" Ω"],["moc diody",LAB.fmt(circ.UD*circ.I*1000,1)+" mW"]]);
  for(const k in HOME){const q=D.P2(HANDLE[k](k));if(q)viz.tag(c,q.x,q.y-24,NAMES[k],"#1e5aa8")}},
 init(env){window.ELEK_TEST={st,solve:()=>{solve();return circ},P:()=>P,update:dt=>this_update(dt)};P=env.P;gauss=env.gauss||gauss;st.odczyt=meter()},
 update(dt){this_update(dt)},
 status(){return st.spalona?"dioda przepalona — wymień ją":circ.cc?"zasilacz ogranicza prąd (CC)":""},
 getState:()=>({...st}),setState(o){Object.assign(st,o);if(!st.pos)reset();else st.pos=Object.assign(JSON.parse(JSON.stringify(HOME)),st.pos)}});
})();
