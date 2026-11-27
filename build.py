#!/usr/bin/env python3
"""Skleja moduły silnika src/core/*.js (w kolejności nazw) w jeden engine.js — wspólne domknięcie, bez bundlera."""
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
parts=sorted(glob.glob("src/core/[0-9]*.js"))
open("engine.js","w").write("\n".join(open(p).read().rstrip()+"\n" for p in parts))
print("engine.js <-",", ".join(os.path.basename(p) for p in parts))

# wersja z src/core/04-shell.js → adresy ?v= w index.html i lista plików service workera (nowa wersja = nowe pliki, bez starej pamięci)
import re
ver=re.search(r'const VERSION="([^"]+)"',open("src/core/04-shell.js").read()).group(1)
for f in ("index.html","sw.js"):
    t=open(f).read();t=re.sub(r"\?v=[0-9.]+","?v="+ver,t);t=re.sub(r'const CACHE="lab-v[0-9.]+"','const CACHE="lab-v'+ver+'"',t);open(f,"w").write(t)
print("wersja",ver)
