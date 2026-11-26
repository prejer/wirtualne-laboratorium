# Jak dodać nowe doświadczenie

Silnik (`engine.js`, budowany z `src/core/*.js` przez `python3 build.py`) to **LabShell** — wspólna rama każdego zadania:

- górny pasek: ☰ Zadania · widoki kamery · Lupa · Pomiar/Nauka · tempo ×1/×¼ · 🎲 nowy zestaw · ? pomoc · Zadanie,
- okno Lupy z celownikiem, panel Nauki (widoczny tylko w trybie Nauka),
- dolny dock: **lewa sekcja** — przedmioty do chwytania (stan `active`), **prawa sekcja** — akcje jednorazowe,
- ekran startowy, treść zadania, zapis stanu w przeglądarce, losowanie parametrów ukrytych.

Zadanie to jeden plik w `zadania/` + wpis w `zadania/index.js`. Plik przekazuje **wyłącznie konfigurację**:

```js
(()=>{const{V,add,sub,mul,Z,fmt}=LAB;
// … własna fizyka i rysowanie …
LAB.defineTask({
  id:"of73-2-olowek",
  meta:{kicker:"…", title:"…", desc:"…"},          // karta startowa
  taskHtml:`<h2>Treść zadania</h2>…`,                // modal „Zadanie”
  hints:[{title:"Podpowiedź: …", html:"…"}],         // rozwijane w modalu (opcjonalne)
  params:{f0:{min:0.20,max:0.30}},                   // ukryte parametry, losowane z numeru zestawu
  scene:{draw, light:V(…), shadowArea:[…]},          // draw(D) rysuje scenę API D (cyl, box, band, face, line, tapeNow…)
  views:[{label:"Z boku", cam:()=>({t:V(…),yaw,pitch,dist})}],
  lupa:()=>({t,yaw,pitch,dist}) | null,              // kamera okna Lupy (null = ukryta)
  movables:[{id:"paper", label:"Kartka", hint:"ciągnij powoli",
             grab:()=>({p:V(…), axis:V(1,0,0), r:0.012, onStart, onMove:ds=>…, onEnd}) | null}],
  actions:[{icon:"paper", label:"Wymień kartkę", tip:"…", run:()=>…}],   // bez trwałego stanu
  learn(D,c,viz){ viz.arrow(…); viz.panel(c,[["α","16°"],…]) },           // tryb Nauka (opcjonalne)
  init(env){ /* env.P – parametry, env.rng, env.gauss, env.params */ },
  update(dt){…}, status(){return ""}, getState(){…}, setState(o){…}, start(resumed){…}
});
})();
```

## Zasady
- **Fizyka 100% prawdziwa.** Nic nie mierzy za ucznia, nic sztucznie nie zatrzymuje układu.
- **Akcje = czynności rękami** („Wymień kartkę”, „Przetrzyj rurkę”), nie „Zmierz”.
- **Parametry ukryte** w `params`. Lokalna zmiana w akcji: `LAB.params.jitter(["f0"],0.04)`, pełne przelosowanie: `LAB.params.reroll(["ph1"])`. Wartości zapisują się ze stanem.
- Ikony docka: `tape hand lift stop wipe slide slow pencil mark pin release paper ruler thread grab dice` (dodawaj w `src/core/04-shell.js`).
