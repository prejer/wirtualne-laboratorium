/* Plac zabaw — wszystkie przedmioty z biblioteki LAB.sprzet na jednym stole, do oglądania i testów wyglądu/sterowania. */
(()=>{const{V,add,mul,Z}=LAB;const S=LAB.sprzet;
// położenia przedmiotów (środek, na blacie); przesuwane w scenie
const HOME={linijka30:[0.05,-0.30],linijka60:[-0.40,0.36],przezr:[0.42,-0.20],miarka:[-0.30,-0.42],karton:[-0.50,0.0],kartka:[0.08,-0.05],papier:[0.40,0.12],
 olowek:[0.10,0.20],nakretka:[0.62,-0.28],plastelina:[0.66,0.05],tasma:[0.22,-0.18],chusteczki:[0.74,0.28],klips:[0.30,0.32],statyw:[1.03,-0.22]};
const NAMES={linijka30:"Linijka 30 cm",linijka60:"Linijka 60 cm",przezr:"Linijka przezroczysta",miarka:"Taśma miernicza",karton:"Karton",kartka:"Kartka A4",papier:"Papier milimetrowy",
 olowek:"Ołówek",nakretka:"Nakrętka M24",plastelina:"Plastelina",tasma:"Taśma klejąca",chusteczki:"Chusteczki",klips:"Klips",statyw:"Statyw"};
let pos={},axisY=false;const reset=()=>{pos=JSON.parse(JSON.stringify(HOME))};reset();
const TB={x0:-0.8,x1:1.32,y0:-0.5,y1:0.5};
const clampP=(k,v)=>{v[0]=Math.max(TB.x0+0.03,Math.min(TB.x1-0.03,v[0]));v[1]=Math.max(TB.y0+0.03,Math.min(TB.y1-0.03,v[1]))};
const P=k=>pos[k];
// punkt chwytu każdego przedmiotu (na jego wierzchu)
const HANDLE={linijka30:k=>V(P(k)[0],P(k)[1]-0.015,0.003),linijka60:k=>V(P(k)[0],P(k)[1]-0.015,0.003),przezr:k=>V(P(k)[0]+0.015,P(k)[1],0.12),miarka:k=>V(P(k)[0],P(k)[1]+0.008,0.001),
 karton:k=>V(P(k)[0],P(k)[1],0.20),kartka:k=>V(P(k)[0],P(k)[1],0.001),papier:k=>V(P(k)[0],P(k)[1],0.001),olowek:k=>V(P(k)[0],P(k)[1],0.005),nakretka:k=>V(P(k)[0],P(k)[1],0.021),
 plastelina:k=>V(P(k)[0],P(k)[1],0.01),tasma:k=>V(P(k)[0],P(k)[1],0.001),chusteczki:k=>V(P(k)[0],P(k)[1],0.037),klips:k=>V(P(k)[0],P(k)[1],0.009),statyw:k=>V(P(k)[0],P(k)[1],0.30)};
function draw(D){const p=k=>pos[k];
 S.kartka({x0:p("kartka")[0]-0.1485,x1:p("kartka")[0]+0.1485,y0:p("kartka")[1]-0.105,y1:p("kartka")[1]+0.105});
 S.papierMm({x0:p("papier")[0]-0.10,x1:p("papier")[0]+0.10,y0:p("papier")[1]-0.14,y1:p("papier")[1]+0.14});
 S.linijka({o:V(p("linijka30")[0]-0.15,p("linijka30")[1],0),L:0.30});
 S.linijka({o:V(p("linijka60")[0]-0.30,p("linijka60")[1],0),L:0.60,W:0.035});
 S.linijka({o:V(p("przezr")[0],p("przezr")[1],0),d:Z,w:V(1,0,0),L:0.20,przezroczysta:true});
 S.miarka({o:V(p("miarka")[0]-0.35,p("miarka")[1],0),L:0.70});
 S.karton({c:V(p("karton")[0],p("karton")[1],0),hx:0.12,hy:0.15,hz:0.10});
 S.tasma({c:V(p("tasma")[0],p("tasma")[1],0),n:Z,u:V(1,0,0),dl:0.06});
 const o=p("olowek");S.olowek(V(o[0]+0.09,o[1],0.004),V(o[0]-0.09,o[1],0.004));S.nic([V(o[0]+0.094,o[1],0.002),V(o[0]+0.20,o[1]+0.03,0.0005),V(o[0]+0.26,o[1]-0.01,0.0005)]);
 S.nakretka(V(p("nakretka")[0],p("nakretka")[1],0.0095),Z);
 S.plastelina({c:V(p("plastelina")[0],p("plastelina")[1],0),r:0.02});S.plastelina({c:V(p("plastelina")[0]+0.045,p("plastelina")[1]+0.01,0),r:0.012,kolor:"#c0392b"});
 S.chusteczki({c:V(p("chusteczki")[0],p("chusteczki")[1],0)});S.klips({c:V(p("klips")[0],p("klips")[1],0)});
 S.statyw({baza:V(p("statyw")[0],p("statyw")[1],0),H:0.55,belka:0.5});
}
LAB.defineTask({id:"plac-zabaw",
 meta:{kicker:"Biblioteka sprzętu",title:"Plac zabaw",desc:"Cały sprzęt z biblioteki na jednym stole — do obejrzenia i sprawdzenia, jak wygląda i jak się przesuwa."},
 taskHtml:`<h2>Plac zabaw</h2><p>Tu leży cały sprzęt, z którego budowane są zadania. Złap dowolny przedmiot i przeciągnij go po stole. Przycisk <b>Kierunek</b> zmienia, czy przesuwasz wzdłuż, czy w poprzek stołu. W trybie <b>Nauka</b> widać nazwy przedmiotów.</p><p>Do zgłoszenia: wszystko, co wygląda nieprawdziwie, miga, przenika albo źle się chwyta.</p>`,
 params:{},
 scene:{table:TB,draw,light:V(0.35,-0.5,1)},
 views:[{label:"Cały stół",cam:()=>({t:V(0.2,0,0),yaw:0.35,pitch:0.62,dist:1.45})},{label:"Z góry",cam:()=>({t:V(0.2,0,0),yaw:0,pitch:1.56,dist:1.7})},
  {label:"Linijki",cam:()=>({t:V(0.05,-0.25,0.02),yaw:0.2,pitch:0.45,dist:0.45})},{label:"Drobiazgi",cam:()=>({t:V(0.68,0.05,0.02),yaw:-0.3,pitch:0.5,dist:0.5})}],
 movables:Object.keys(HOME).map(k=>({id:k,label:NAMES[k],dock:false,hint:"przeciągnij po stole",
  grab:()=>({p:HANDLE[k](k),r:k==="karton"||k==="statyw"?0.03:0.015,axis:axisY?V(0,1,0):V(1,0,0),onMove:ds=>{pos[k][axisY?1:0]+=ds;clampP(k,pos[k])}})})),
 actions:[{icon:"slide",label:()=>axisY?"Kierunek: w poprzek":"Kierunek: wzdłuż",tip:"Zmień kierunek przesuwania przedmiotów",run:()=>{axisY=!axisY}},
  {icon:"hand",label:"Ułóż od nowa",tip:"Wszystko wraca na swoje miejsca",run:reset}],
 learn(D,c,viz){viz.panel(c,[["przedmiotów na stole",String(Object.keys(HOME).length)],["przesuwanie",axisY?"w poprzek stołu (oś y)":"wzdłuż stołu (oś x)"]]);for(const k in HOME){const q=D.P2(HANDLE[k](k));if(q)viz.tag(c,q.x,q.y-22,NAMES[k],"#1e5aa8")}},
 init(){},update(){},status(){return""},getState:()=>({pos,axisY}),setState(o){if(o.pos)pos=Object.assign(JSON.parse(JSON.stringify(HOME)),o.pos);axisY=!!o.axisY}});
})();
