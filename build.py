#!/usr/bin/env python3
"""Skleja moduły silnika src/core/*.js (w kolejności nazw) w jeden engine.js — wspólne domknięcie, bez bundlera."""
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
parts=sorted(glob.glob("src/core/[0-9]*.js"))
open("engine.js","w").write("\n".join(open(p).read().rstrip()+"\n" for p in parts))
print("engine.js <-",", ".join(os.path.basename(p) for p in parts))
