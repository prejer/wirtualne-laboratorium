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

with sync_playwright() as p:
    exe = os.environ.get("CHROME") or ("/usr/bin/google-chrome" if os.path.exists("/usr/bin/google-chrome") else None)
    b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    for tid in ["of73-2-olowek", "of75-2-tarcie", "plac-zabaw", "plac-elektronika", "of65-2-kulka"]:
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
        elif tid == "of65-2-kulka":
            for r in pg.evaluate(OF65):
                check(f"OF65 zasięg d = wzór Komitetu (tgα={r['tg']:.3f})", abs(r["d"] - r["pred"]) < 0.004 + 0.03 * r["pred"], f"d={r['d']*1000:.1f} wzór={r['pred']*1000:.1f} mm")
        elif tid == "plac-elektronika":
            r = pg.evaluate(ELEK)
            check("LED: U = I·R + U_D (Kirchhoff)", abs(r["kir"]) < 1e-6, f"I={r['I5']*1000:.2f} mA przy 5 V, U_D={r['UD']:.3f} V")
            check("LED: realny prąd przy 5 V (8–10 mA)", 0.0075 < r["I5"] < 0.0105)
            check("LED: poniżej progu prawie nie przewodzi", r["I15"] < 1e-5, f"I(1,5 V)={r['I15']*1e6:.2f} µA")
            check("zasilacz: ograniczenie prądu (CC)", r["cc"] and abs(r["Icc"] - 0.005) < 1e-9, f"U={r['Ucc']:.2f} V")
            check("opornik chroni diodę (12 V, bez przepalenia)", r["safe"])
            check("bez opornika dioda się przepala", r["burnt"] and r["Iafter"] == 0)
            check("multimetr: 20 V pokazuje SEM baterii", abs(float(r["m20"]) - r["emf"]) < 0.02, f"{r['m20']} vs {r['emf']:.3f}")
            check("multimetr: 2 V — przekroczenie zakresu „1.”", r["m2"] == "1.")
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
