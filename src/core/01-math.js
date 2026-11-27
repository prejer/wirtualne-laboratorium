/* Wirtualne Laboratorium — silnik (plik generowany: `python3 build.py` skleja src/core/*.js).
   Nie edytuj engine.js ręcznie — edytuj moduły w src/core/. Kontrakt zadania: src/ZADANIA.md. */
"use strict";
const LAB=(()=>{
// ---------- wektory ----------
const V=(x,y,z)=>({x,y,z}),add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z),sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z),mul=(a,k)=>V(a.x*k,a.y*k,a.z*k),
 dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x),len=a=>Math.sqrt(dot(a,a)),nrm=a=>mul(a,1/(len(a)||1)),lerp=(a,b,t)=>add(a,mul(sub(b,a),t));
const Z=V(0,0,1);
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=v=>parseFloat(String(v).replace(",","."));
const fmt=(v,d)=>(isFinite(v)?v.toFixed(Math.max(0,d)):"—").replace(".",",");
const route=(()=>{const m=location.hash.match(/^#([a-z0-9-]+)(?:\/(\d+))?$/);return m?{id:m[1],z:m[2]}:null})();
let seed=0;
let noiseR=Math.random;function gauss(){let a=0;for(let i=0;i<6;i++)a+=noiseR();return(a-3)/0.7071}

let T=null; // znormalizowana konfiguracja aktywnego zadania
