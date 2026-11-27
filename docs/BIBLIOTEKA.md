# Biblioteka sprzętu — propozycja (na podstawie 20 zadań II etapu, LVI–LXXV)

Każdy przedmiot ma w bibliotece **jeden** wygląd i jedno zachowanie: zadanie tylko go stawia na stole i ustawia parametry.
Liczby w nawiasach to liczba zadań (na 20), w których przedmiot występuje. Szczegóły: `KATALOG.md`.

## Wniosek główny

Prawie w każdym zadaniu powtarza się ten sam „stół olimpijczyka”: **papier milimetrowy, taśma klejąca, linijka lub taśma miernicza, nożyczki, plastelina, nić**.
Druga stała grupa to **elektryka**: przewody, zasilacz, multimetr, baterie, oporniki, diody LED (7 zadań z obwodem). Dlatego obok przedmiotów potrzebne są dwa wspólne **moduły fizyki**: obwody elektryczne i promienie światła.

## Poziom 1 — fundament (prawie każde zadanie)

| Przedmiot | Ile | Co musi umieć |
|---|---|---|
| Stół laboratoryjny | wszystkie | ✅ jest (blat, nogi, podłoga, cienie) |
| Papier milimetrowy | 11 | kartka z siatką 1 mm, do położenia i przyklejenia; podziałka jako ostra tekstura; możliwość rysowania znaczników |
| Taśma klejąca | 11 | „przyklej X do Y” — mocowanie przedmiotów (zaczep nici, ołówek, karton); kawałki widoczne na przedmiotach |
| Linijka | 7 | długość 20/30/50/60 cm, przezroczysta lub drewniana, grubość (paralaksa), przykładanie do przedmiotów |
| Taśma miernicza / krawiecka | 3 | ✅ podziałka jest; dodać: rozwijanie, przyklejanie |
| Nożyczki | 5 | czynność „przytnij” (nić, taśma, papier) — raczej akcja niż przedmiot |
| Plastelina | 4 | podpórka/klin: podeprzyj, ustaw kąt, obciąż |
| Nić / wstążka / drut | 3 + 2 | lina z napięciem, przewieszanie przez krawędź/walec, przywiązywanie (✅ podstawa jest w OF73/OF75) |

## Poziom 2 — często (3–7 zadań)

| Przedmiot | Ile | Co musi umieć |
|---|---|---|
| Przewody i zaciski | 7 | łączenie zacisków przeciąganiem → moduł obwodów |
| Multimetr (woltomierz / amperomierz) | 6 | wyświetlacz z rozdzielczością i szumem, opór wewnętrzny (OF71: 1 MΩ!), wybór zakresu |
| Zasilacz regulowany | 5 | pokrętło napięcia/prądu, ograniczenie prądowe, wyświetlacz |
| Statyw z poprzeczką i łapą | 5 | regulowana wysokość, mocowanie przedmiotów (✅ wygląd jest w OF75 — do wydzielenia) |
| Baterie | 3 | SEM z niepewnością, opór wewnętrzny |
| Oporniki | 3 | wartość z tolerancją (np. 5 %) |
| Diody LED | 3 | kolor/widmo, charakterystyka I–U, świecenie; jako detektor w kierunku zaporowym (OF69) |
| Pudełko kartonowe | 3 | ✅ jest (OF73) — do wydzielenia; otwory, ustawianie jako podpórka |
| Ciężarki / nakrętki | 3 | masa z niepewnością (✅ nakrętka M24 jest w OF75) |
| Naczynia, woda, strzykawki, pipety | 2–4 | ciecze — najtrudniejsze; odłożyć na później |

## Poziom 3 — pojedyncze zadania

Ścisk stolarski (2, ✅ jest), magnesy neodymowe (2), płyta CD/DVD (2), żarówka (2), spinacz (2), stoper (1), waga elektroniczna (1), polaryzator (1), soczewka (1), latarka (1), kontaktron (1), tranzystor (1), brzeszczot (1), kulka (1), kalka kopiująca (1).

## Moduły fizyki (wspólne)

1. **Obwody elektryczne** — rozwiązywanie sieci (oporniki, źródła z oporem wewnętrznym, diody i LED, kondensatory w czasie, tranzystor, mierniki z oporem wewnętrznym). Obsłuży: LVI, LVII, LXI, LXVI, LXIX, LXXI, LXXII.
2. **Promienie światła** — źródło, odbicie, załamanie, siatka dyfrakcyjna, polaryzacja, plamka na ekranie. Obsłuży: LVI, LVIII, LXIV, LXIX, LXXII.
3. **Tarcie i statyka** — ✅ jest w OF73/OF75 (tarcie statyczne/kinetyczne, przylganie i poślizg) — do wydzielenia jako wspólny model.

## Proponowana kolejność

1. Wydzielić z OF73/OF75 to, co już jest: linijka, taśma miernicza, pudełko, statyw, ścisk, nakrętka, nić, taśma klejąca.
2. Dodać papier milimetrowy i plastelinę (11 + 4 zadania).
3. Moduł obwodów + multimetr, zasilacz, przewody, bateria, opornik, LED — otwiera 7 zadań naraz.
4. Najłatwiejsze nowe zadania na tym zestawie: **LXXI (obwód RC)**, **LXVI (tranzystor)**, **LXII (tarcie papieru)**, **LX (drut)**, **LXIII (magnesy)**.

## Stan wdrożenia (v0.12)

Biblioteka istnieje w kodzie: `src/core/08-sprzet.js`, dostępna w zadaniach jako `LAB.sprzet` (skrót `const S=LAB.sprzet`). Oba zadania (OF73, OF75) rysują sprzęt wyłącznie z niej.

| Funkcja | Przedmiot |
|---|---|
| `linijka({o,d,w,L,W,h,przezroczysta})` | linijka z podziałką mm (zwykła lub przezroczysta) |
| `miarka({o,d,w,L,W})` | taśma miernicza |
| `karton({c,hx,hy,hz})` | karton z taśmą pakową |
| `tasma({c,n,u,dl,szer})` | kawałek taśmy klejącej |
| `nic(punkty)` | nić (łamana) |
| `olowek(P,tip)` | ołówek sześciokątny z pętelką |
| `kartka({x0,x1,y0,y1})` | kartka papieru |
| `papierMm({x0,x1,y0,y1})` | papier milimetrowy (siatka 1/5/10 mm) |
| `plastelina({c,r,kolor})` | bryłka plasteliny |
| `nakretka(c,os,{trzymana})` | nakrętka M24 |
| `statyw({baza,H,belka})` | statyw z poprzeczką |
| `scisk({x,zGora})` | ścisk stolarski na krawędzi blatu |
| `chusteczki({c})`, `klips({c})` | chusteczki, klips do kartki |

### Elektronika (v0.14, `src/core/09-elektronika.js`)

| Funkcja | Przedmiot |
|---|---|
| `multimetr({c,odczyt,pokretlo})`, `gniazdaMultimetru(c)` | multimetr 830 z LCD i gniazdami COM/V/10A |
| `zasilacz({c,U,I,kU,kI})`, `zaciskiZasilacza(c)`, `pokretlaZasilacza(c)` | zasilacz z wyświetlaczami U/I, pokrętłami i zaciskami |
| `przewod({a,b,kA,kB,wtykA,wtykB,kolor})` | przewód z wtykiem bananowym / krokodylkiem / pinem, sam układa się na stole |
| `plytkaStykowa({c})`, `dziura(c,kol,rz)` | płytka stykowa 30 kolumn, raster 2,54 mm |
| `opornik({a,b,paski})`, `led({a,k,kolor,swieci})`, `kondensator({c})`, `tranzystor({c})` | elementy na nóżkach |
| `bateriaPlaska({c})`, `blaszkiBaterii(c)`, `bateriaAA({c,os})` | baterie |
| `magnes({c})`, `zarowka({c,swieci})` | magnes neodymowy, żarówka w oprawce |

Plac zabaw „elektronika” ma działający obwód: zasilacz CV/CC → opornik → LED (równanie Shockleya, przepalenie przy zbyt dużym prądzie) i multimetr z zakresami na baterii.

Następny krok: zadania obwodowe — LXXI (RC), LXVI (tranzystor), potem LXII, LX, LXIII.

Testy regresji: `python3 tests/test_lab.py` (fizyka OF73/OF75 + start zadań bez błędów).
