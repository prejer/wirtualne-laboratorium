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

with sync_playwright() as p:
    exe = os.environ.get("CHROME") or ("/usr/bin/google-chrome" if os.path.exists("/usr/bin/google-chrome") else None)
    b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    for tid in ["of73-2-olowek", "of75-2-tarcie", "plac-zabaw"]:
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
        else:
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
