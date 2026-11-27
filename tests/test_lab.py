#!/usr/bin/env python3
"""Testy regresji laboratorium: fizyka zadań + start każdego zadania bez błędów.
Uruchom przed każdym wydaniem:  python3 tests/test_lab.py
Wymaga: pip install playwright && playwright install chromium   (albo zmienna CHROME=/ścieżka/do/chrome)."""
import os, sys, json, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
fails = []
def check(name, ok, info=""):
    print(("  OK   " if ok else "  BŁĄD ") + name + (f"  [{info}]" if info else ""))
    if not ok: fails.append(name)

OF75 = r"""(()=>{const S=window.OF75_TEST,st=S.st;S.setDirty(false);const out=[];
for(const ya of[-0.014,-0.054,-0.094]){st.ya=ya;S.autoLen();for(let i=0;i<300;i++)S.step(0.001);const r=S.rib,seq=S.seq(),g=S.geom(r.s),yv=g.D.y-ya;
 let xmax=0;for(let x=0.001;x<0.08;x+=0.0005){r.s=seq+x;r.v=0;r.stuck=true;r.held=false;r.muNow=S.MUS*S.muFactor(r.s);let mv=false;for(let i=0;i<300;i++){S.step(0.001);if(!S.rib.stuck){mv=true;break}}if(mv)break;xmax=x}
 out.push({y:yv,xmax,pred:S.MUS*S.muFactor(seq)*yv})}return out})()"""
OF73 = r"""(()=>{const S=window.OF73_TEST,st=S.st;S.newTrial();let slip=null;
 for(let i=0;i<1500&&!slip;i++){S.movePaper(0.0001);for(let k=0;k<4;k++)S.step(0.002);if(S.slide){const c=S.cfg(st.Xt);slip={ratio:c.ratio,f:1/(c.ctgB-2*c.tanA),xP:c.P.x,yP:c.P.z}}}
 for(let k=0;k<20;k++){S.movePaper(0.0001);for(let j=0;j<4;j++)S.step(0.002)}const x1=st.Xt;
 for(let k=0;k<100;k++){S.movePaper(0.0001);for(let j=0;j<4;j++)S.step(0.002)}const x2=st.Xt,sliding=!!S.slide;
 for(let k=0;k<200;k++)S.step(0.002);const stuck=!S.slide;
 for(let i=0;i<3000;i++){S.movePaper(-0.0002);S.step(0.002)}
 return{slip,kinDrift:Math.abs(x2-x1),sliding,stuck,trail:S.trail.length,valid:!!S.cfg(st.Xt),off:st.off}})()"""

ELEK = r"""(()=>{const T=window.ELEK_TEST,st=T.st,P=T.P();st.podl=true;st.spalona=false;st.Ilim=1;
 st.U=5;let c=T.solve();const I5=c.I,UD=c.UD,kir=c.U-c.I*P.R-c.UD;st.U=1.5;const I15=T.solve().I;
 st.U=12;st.Ilim=0.005;c=T.solve();const cc=c.cc,Icc=c.I,Ucc=c.U;
 st.Ilim=1;for(let i=0;i<60;i++)T.update(0.02);const safe=!st.spalona;st.mostek=true;st.U=5;for(let i=0;i<60;i++)T.update(0.02);const burnt=st.spalona,Iafter=T.solve().I;st.spalona=false;st.mostek=false;st.U=0;
 st.zakres=3;for(let i=0;i<30;i++)T.update(0.02);const m20=st.odczyt;st.zakres=2;for(let i=0;i<30;i++)T.update(0.02);const m2=st.odczyt;st.zakres=3;
 return{safe,I5,UD,kir,I15,cc,Icc,Ucc,burnt,Iafter,m20,m2,emf:P.emf}})()"""

OF65 = r"""(()=>{const T=window.OF65_TEST,st=T.st,P=T.P(),g=9.81;const out=[];
for(const dz of[0.01,0.03,0.05]){st.dz=dz;st.s=0.33;st.marks=[];st.kalka=true;st.papX=0.0;let sum=0,n=0;
 for(let k=0;k<6;k++){T.take();T.release();for(let i=0;i<40000&&T.B()&&T.B().ph!=="stop";i++)T.step(0.0005);const m=st.marks[st.marks.length-1];if(m){sum+=m.x-T.geo().topEnd.x;n++}}
 const G=T.geo(),R=T.r(),al=G.al,h=G.topEnd.z,a=g*(Math.sin(al)-(P.k/R)*Math.cos(al))/(1+P.beta),v2=2*a*0.33,A=g/(2*v2*Math.cos(al)**2),Bq=Math.tan(al);
 out.push({tg:Bq,d:sum/n,pred:(-Bq+Math.sqrt(Bq*Bq+4*A*h))/(2*A)})}return out})()"""

OF59 = r"""(()=>{const T=window.OF59_TEST,st=T.st,g=9.81,out=[];T.P().Q=70;
for(const L of[0.27,0.2,0.14]){st.L=L;const M=T.mech();T.set(-0.035,0);let last=0,t=0;
 for(let i=0;i<300000;i++){T.step(0.0002);t+=0.0002;if(T.clip().air)last=t;if(last>0&&t-last>1.5)break;if(t>40)break}
 out.push({L,f:M.f,fe:Math.sqrt(g/T.lastDet())/(2*Math.PI)})}return out})()"""

OF71 = r"""(()=>{const T=window.OF71_TEST,st=T.st,P=T.P();st.bP=1;st.bM=3;for(let i=0;i<50;i++)T.step(0.02);const U1=st.U1,U2=st.U2;
 st.bP=0;st.bM=0;st.mC=2;st.mV=1;const v0=T.meterV();for(let i=0;i<1000;i++)T.step(0.02);const v20=T.meterV();st.mC=0;st.mV=0;
 return{U1,sum:U1+U2,UB:P.UB,U1p:P.UB*P.C2/(P.C1+P.C2),v0,v0p:U1*T.RW/(P.R+T.RW),tau:20/Math.log(v0/v20),tau_p:(P.R+T.RW)*P.C1}})()"""

OF56 = r"""(()=>{const T=window.OF56_TEST,st=T.st,P=T.P(),out=[];st.U=5;
for(let d=0;d<3;d++){st.dioda=d;const e=T.diode();let best=0,bx=0;
 for(let x=0.03;x<0.25;x+=0.0005){st.x=x;const m=T.marker(),E=LAB.V(m.x,0,0.35);const g=T.glow(m,E,e.I);if(g){const a=g.a;if(a>best+1e-9){best=a;bx=x}}}
 out.push({d,lam:T.DTR*bx/Math.hypot(bx,st.H)*1e9,lp:[P.lpR,P.lpG,P.lpB][d],kir:e.UR+e.UD-st.U})}st.U=0;return out})()"""

OF72 = r"""(()=>{const T=window.OF72_TEST,st=T.st,P=T.P(),out=[];
for(const d of[0,1]){st.dioda=d;st.y=0.04;let best=1,bx=0;const pb=-P.beta*Math.PI/180;
 for(let x=0.1;x<0.21;x+=0.0002){st.x=x;st.psi=pb;const E=LAB.add(T.C0,LAB.mul(T.eyeDir(),0.34)),g=T.glint(E);if(g&&g.through&&g.I<best){best=g.I;bx=x}}
 st.x=bx;const E=LAB.add(T.C0,LAB.mul(T.eyeDir(),0.34));st.psi=0;const I0=T.glint(E).I;st.psi=pb;out.push({d,tg:bx/0.04,n:d?P.nB:P.nR,Imin:best,I0})}
st.x=0.09;st.y=0.06;st.dioda=0;st.psi=0;return out})()"""

LOW = r"""(()=>{const T=window.LOW_TEST,st=T.st,out=[];
for(const[L,A]of[[0.4,4],[1.0,4],[1.0,50]]){st.L=L;st.th=A*Math.PI/180;st.om=0;st.held=false;T.reset();for(let i=0;i<24000;i++)T.step(0.0005);
 const T0=2*Math.PI*Math.sqrt(T.Lc()/9.81),Tm=T.periodMeas();out.push({L,A,T:Tm,ratio:Tm/T0})}st.th=0;st.om=0;return out})()"""

with sync_playwright() as p:
    exe = os.environ.get("CHROME") or ("/usr/bin/google-chrome" if os.path.exists("/usr/bin/google-chrome") else None)
    b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    for tid in ["of73-2-olowek", "of75-2-tarcie", "of65-2-kulka", "of59-2-brzeszczot", "of71-2-rc", "of56-2-led-cd", "of72-2-brewster", "lo-wahadlo"]:
        print(f"== {tid}")
        pg = b.new_page(viewport={"width": 1280, "height": 800}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"{URL}#{tid}/4242"); pg.evaluate("localStorage.clear();localStorage.setItem('lab-help-seen','1')"); pg.reload(); pg.wait_for_timeout(800)
        pg.click("#goStart"); pg.wait_for_timeout(1200)
        check("start bez błędów JS", not errs, "; ".join(errs)[:200])
        check("grafika 3D działa", pg.evaluate("!!document.getElementById('glc')&&!document.getElementById('noGL')"))
        if tid == "of75-2-tarcie":
            for r in pg.evaluate(OF75):
                check(f"OF75 x_gr = f_s·y (y={r['y']*100:.1f} cm)", abs(r["xmax"] - r["pred"]) < 0.0015 + 0.05 * r["pred"], f"x={r['xmax']*100:.2f} pred={r['pred']*100:.2f} cm")
        elif tid == "lo-wahadlo":
            for r in pg.evaluate(LOW):
                if r["A"] < 10: check(f"wahadło: T = 2π√(L/g) dla małych wychyleń (L={r['L']} m)", abs(r["ratio"] - 1) < 0.003, f"T={r['T']:.4f} s")
                else: check(f"wahadło: okres rośnie z amplitudą ({r['A']}°)", r["ratio"] > 1.01, f"T/T₀={r['ratio']:.4f}")
        elif tid == "of72-2-brewster":
            for r in pg.evaluate(OF72):
                check(f"OF72 wygaszenie przy tgα = n (dioda {r['d']})", abs(r["tg"] - r["n"]) < 0.02, f"tgα={r['tg']:.3f}, n={r['n']:.3f}")
                check(f"OF72 polaryzator: wygaszenie tylko przy osi poziomej (dioda {r['d']})", r["Imin"] < 0.01 and r["I0"] > 0.1)
        elif tid == "of56-2-led-cd":
            for r in pg.evaluate(OF56):
                check(f"OF56 dyfrakcja na CD: d·sinα = λ (dioda {r['d']})", abs(r["lam"] - r["lp"]) < 8, f"λ={r['lam']:.0f} nm, szczyt {r['lp']:.0f} nm")
                check(f"OF56 U = I·(R+R_s) + U_j (dioda {r['d']})", abs(r["kir"]) < 1e-6)
        elif tid == "of71-2-rc":
            r = pg.evaluate(OF71)
            check("OF71 ładowanie 1–3: U₁+U₂ = U_B, podział wg pojemności", abs(r["sum"] - r["UB"]) < 1e-3 and abs(r["U1"] - r["U1p"]) < 1e-3)
            check("OF71 rozładowanie przez R+R_w: τ = (R+R_w)C₁", abs(r["tau"] - r["tau_p"]) < 0.01 * r["tau_p"], f"τ={r['tau']:.2f} s")
            check("OF71 woltomierz pokazuje U·R_w/(R+R_w)", abs(r["v0"] - r["v0p"]) < 1e-4, f"{r['v0']*1000:.1f} mV")
        elif tid == "of59-2-brzeszczot":
            for r in pg.evaluate(OF59):
                check(f"OF59 próg spinacza → f (L={r['L']*100:.0f} cm)", abs(r["fe"] - r["f"]) < 0.03 * r["f"], f"f={r['f']:.2f} Hz, z progu {r['fe']:.2f} Hz")
        elif tid == "of65-2-kulka":
            for r in pg.evaluate(OF65):
                check(f"OF65 zasięg d = wzór Komitetu (tgα={r['tg']:.3f})", abs(r["d"] - r["pred"]) < 0.004 + 0.03 * r["pred"], f"d={r['d']*1000:.1f} wzór={r['pred']*1000:.1f} mm")
        elif tid == "of73-2-olowek":
            r = pg.evaluate(OF73)
            s = r["slip"]
            check("OF73 zerwanie tarcia następuje", s is not None)
            if s:
                check("OF73 wzór f = 1/(ctgβ − 2tgα) zgodny z T/R", abs(s["f"] - s["ratio"]) < 1e-6, f"f={s['f']:.3f}")
                check("OF73 geometria jak u Komitetu (x_P≈7, y_P≈5,5 cm)", 0.05 < s["xP"] < 0.09 and 0.045 < s["yP"] < 0.065, f"x_P={s['xP']*100:.1f} y_P={s['yP']*100:.1f} cm")
            check("OF73 ciągły poślizg kinetyczny (bez skoków)", r["sliding"] and r["kinDrift"] < 0.001, f"dryf {r['kinDrift']*1000:.2f} mm")
            check("OF73 po zatrzymaniu kartki — przylganie", r["stuck"])
            check("OF73 ślad grafitu na kartce", r["trail"] > 0)
            check("OF73 kartka nie wchodzi pod pudło, układ poprawny", r["valid"] and r["off"] >= -0.0191, f"off={r['off']:.3f}")
        pg.close()
    b.close()
print("\nWYNIK:", "wszystko OK" if not fails else f"{len(fails)} błędów: " + ", ".join(fails))
sys.exit(1 if fails else 0)
