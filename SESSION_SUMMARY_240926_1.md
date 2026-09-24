# Rezumat sesiune $240926.1 — ProjectBoard
**Versiune la start:** V139 (Claude, confirmat) → **Versiune la final: V154 (Claude)**
**Manual Tehnic / Help:** actualizate la final de sesiune → V154

---

## Stare curentă

- **Ultima livrare Claude:** V154 (+ Manual_Tehnic_V154.html + help_V154_ro.html)
- **Dan livrează:** V155+ (întreabă la start sesiune următoare)
- **Firebase project:** project-board-1fe7c
- **Google OAuth client ID:** 679630226914-8sftsbf2gqu7hhv82jn8rc9q51j94pha.apps.googleusercontent.com
- **Split-View e acum modul implicit de pornire** (nu view-ul clasic) — reține asta dacă testezi ceva ce ține de view-ul clasic „Toate"

---

## Ce s-a implementat în această sesiune (V140–V154)

### K1/K2 — Persistență evenimente calendar (V140)
- `calInjectEvents`: rândurile `cal::` nebifate care nu mai apar în fetch-ul curent sunt PĂSTRATE (prefix `↺ `, o singură dată), nu mai șterse necondiționat
- `pb-deleted-ids` folosit și ca listă de evenimente bifate — nu se re-adaugă chiar dacă rămân active în Google Calendar (K2)
- Eliminat wipe-ul necondiționat zilnic din `calCheckAndFetch`
- Buton ✓ verde (nu ✕) pe rândurile de calendar din NEXT → apelează `delFree`

### calDayOfN + FINALIZARE persistent (V141)
- `calDayOfN(ev)`: eticheta `(ziua X din N)` pentru evenimente ongoing multi-zi
- C2: `pb-pending-final` + `savePendingFinalizare`/`removePendingFinalizare`/`getPendingFinalizari`/`checkPendingFinalizari()` — reminder FINALIZARE decuplat de rândul sursă d1-d2; apelată la fiecare lansare lângă `applyWeekdaysToAll`; expiră hard la 30 zile după d2

### T1 — Taburi NEXT (V142, experimental)
- `getNextRowCategory(row)`: marker/calendar/prioritare/termene/restul, pe bază de `zone` stocat
- Bandă de taburi sub NEXT (Toate/Prioritare/Termene/Calendar/Restul) cu contoare — `idx` real păstrat din lista completă, deci drag funcțional și în view filtrat
- `S.nextTab` (state)

### E1 / R14 / J1 (V143)
- Guard `if(ov&&ov.parentNode)ov.parentNode.removeChild(ov)` la ~17 puncte de închidere overlay (variabile `ov` și `overlay`) — fix crash `NotFoundError` la dublu-tap
- `parseCalCmd`: exit instant (fără regex, fără traceLog) dacă textul nu conține `/c` — elimină noise masiv din trace generat de `applyWeekdaysToAll`
- `delFree` jurnalizează distinct bifarea calendarului: `kind:'cal-event-check'` → afișat „📅✓ Bifat (calendar)" în Journal și în export .txt

### A1 — Header restructurat + dirty-flag fixes (V144)
- Rândul 1 (Cal/Sort/Help) și rândul 3 (Data/Journal/Share/+Sec/+Proj/Reset/Trace) mutate în ⚙ Settings, ca rânduri „⚡ Acțiuni" / „📁 Fișiere"
- Doar ☁ Sync rămâne, mutat pe rândul cu Search
- Fix dirty-flag lipsă (nu marcau `pb-local-dirty-ts`, deci sync automat nu le trimitea): `delFree` (bifare calendar), `delWaitFree`, `addWaitFree`, `moveToWait`/`moveToNext` (ramurile free-task)

### G1 — Guard sync + backup rotativ (V145–147)
- `dataSize(items,freeTasks)` — proiecte+taskuri+free tasks reale (exclus marcatori/cal::)
- Prag 10% (`SIZE_GUARD_PCT`), reper `pb-last-good-size`
- `confirmSizeGuard()` — modal Promise-based, la Push ȘI Pull, când scăderea ≥10%
- V146: al 3-lea buton „🔽 Fă Pull în loc" (doar la Push) — comută direct pe Pull; mesaje distincte (nu „Firebase error" generic) în `fbSync`/`fbPullIfNewer`/buton manual Pull
- V147: fetch remote suplimentar DOAR când guard-ul se declanșează (nu la fiecare push)
- Backup rotativ: `pb-fb-backups` (array, ultimele 5, înlocuiește vechiul `pb-fb-backup` singular) — listă completă cu Restore individual în Data → Firebase Sync

### G3 — Diff pe categorii + curățenie calendar + Î1 (V148)
- `categorizeTaskSet()`/`diffTaskSets()` rescrise: NEXT (4 subcategorii) + WAIT + SHARE, cu id-uri stabile; modalul de guard arată sumar „local +X / cloud +Y" per categorie + nume doar unde există diferență
- `oldKept` (K1) exclude rânduri `cal::` cu nume gol; curățenie silențioasă la `init()`; contor NEXT real (fără marcatori/fantome); `showMorningModal` filtrează rânduri goale și exclude evenimentele `↺` din rezumatul zilnic
- Î1: `resolvePlusInterval(text)` integrată în `resolveCalCmd` (singurul punct de intrare, 9 locuri de apel) — `26.7+31` → `26.7-26.8`, validare zi≤31/lună≤12, tolerant la spații

### P1 / T1 — nume proiect + task gol (V149)
- `findSimilarProjectName()`/`confirmProjectNameGuard()` — identic/case-insensitive/inclus — la toate cele 3 puncte de creare proiect (`confAdd`, `doCreateProject`→`_doCreateProjectImpl`, `moveSelectedToProject`)
- `promptRenameTask()` — niciun task nu mai e golit direct (`name=''`); dialog suplimentar la toate cele 4 puncte (proiect/liber × NEXT/WAIT)
- **Notă:** la prima editare a acestui fix am șters accidental cod de închidere a unei funcții (brace mismatch) — prins de `node --check` înainte de livrare, reparat în aceeași livrare. Vezi regula nouă de mai jos.

### SV1-SV3 — Split-View (V150–152)
- Buton ▣ Split, lângă tabul „Toate"; două coloane 88vw (Prioritare stânga / Termene+Calendar dreapta, amestecate și sortate cronologic); read-only, fără butoane de acțiune
- Checkbox real pe fiecare rând (`markDone`/`delFree`); aliniere text spre linia de separație
- Separator central fix: `svCenterScroll()` = `(scrollWidth-clientWidth)/2`, debounce 400ms la oprirea scroll-ului, guard anti-buclă `_svCentering` (600ms) — animația proprie nu se mai re-declanșează singură

### Split-View implicit + SB1 (V153)
- `S.nextSplitView:true` la pornire
- Bara de selecție multiplă pe 2 rânduri + buton nou ✎ Editează (doar la exact 1 rând selectat) → `editSelectedSingleTask()`

### Fix critic zone (V154)
- `sortBetweenMarkers`, `sortRestNext`, `sortByTime` NU apelau `detectAndSaveZones()` — repoziționau corect `nextOrder`, dar nu actualizau câmpul `zone` stocat. Invizibil în view-ul clasic (colorare pe poziție), dar vizibil imediat în Split-View/T1 (categorisare pe `zone` stocat) — un task nou sortat cronologic apărea în „Restul" în loc de „Termene". Toate 3 funcțiile apelează acum `detectAndSaveZones()` înainte de `save()`.

---

## Bug-uri rezolvate notabile

| Bug | Fix |
|-----|-----|
| Rânduri fantomă (nume gol) în modalul de dimineață | Filtrare `addSection` + curățenie `init()` + `oldKept` exclude nume gol (K1/C1) |
| Contor NEXT (218) nu coincide cu suma taburilor (53) | Contor real, exclude marcatori/fantome |
| Crash `NotFoundError` la dublu-tap pe overlay | Guard `if(ov&&ov.parentNode)` la toate punctele |
| Trace poluat cu `parseCalCmd: no match` pe marcatori | Exit instant dacă nu conține `/c` |
| Task golit rămâne „pierdut" în listă | `promptRenameTask` — niciodată `name=''` direct |
| Bifare calendar nu se propaga automat pe alt device | Fix dirty-flag lipsă în `delFree` |
| Push a suprascris cloud cu date locale reduse (incident tabletă) | Guard G1 10% + backup rotativ + diff pe categorii |
| Task nou sortat cronologic apărea în „Restul" în Split-View | `detectAndSaveZones()` adăugată în cele 3 funcții de sortare |

---

## Probleme cunoscute / neînchise la final sesiune

- **Anomalie de sincronizare pe tabletă** (rânduri din zona verde „zboară" la poziții diverse după sync): investigată de două ori din trace.
  - Prima dată: cauza identificată clar — un apel `moveSelectedNext: 3 items→top`, foarte probabil accidental, posibil legat de bara de selecție greu de citit (îmbunătățită între timp în V153 cu 2 rânduri + butoane mai mari).
  - A doua oară: nereproductibilă, trace gol. Suspiciune: se produce doar când apare un rând nou în zona verde, posibil la sync. **Abandonat temporar la cererea lui Dan**, până reapare.
  - Protocol de reproducere stabilit: apasă 🔄 Reset (golește trace-ul) chiar înainte de sincronizare pe tabletă, fă sync pe ambele device-uri, trimite trace de pe **ambele** imediat după.

---

## Fișiere livrate această sesiune

- `kanban_V140.html` → `kanban_V154.html` (15 versiuni)
- `Manual_Tehnic_V154.html`
- `help_V154_ro.html`

---

## Reguli pentru sesiunea următoare

1. **Întreabă versiunea curentă** — Dan poate fi la V155+
2. **Pornești de la N+1** față de versiunea confirmată
3. **Nu genera sw.js**
4. **Nu genera `kanban_VN.html` până Dan nu confirmă explicit** că a terminat de dat idei pentru pasul curent — a dat de mai multe ori 2-3 cerințe pe rând înainte de a cere generarea
5. **Help/Manual Tehnic** — NU se ating la fiecare versiune, doar `kanban_VN.html`. Se actualizează doar la cerere explicită (ca acum)
6. **`detectAndSaveZones()`** după ORICE operație care modifică `nextOrder` — inclusiv toate funcțiile de sortare (regulă întărită după bug-ul V154)
7. **`resolveCalCmd`** rămâne punctul unic de rezolvare (/c ȘI acum `zi.lună+N`) — orice sintaxă nouă de dată se integrează acolo, nu separat
8. **Orice acțiune care ar goli un nume de task** trebuie să treacă prin `promptRenameTask` sau echivalent — niciodată `name=''` direct
9. **Orice funcție care scrie date local fără `save()`** trebuie să seteze explicit `pb-local-dirty-ts` — verifică asta la orice funcție nouă de mutare/ștergere
10. **Rulează `node --check` pe JS-ul extras înainte de fiecare livrare** — a prins deja o greșeală reală (brace mismatch) în V149, înainte să ajungă la Dan
11. Folosește **Python** pentru patch-uri complexe (str_replace e fragil pe șiruri mari)
12. Split-View e modul implicit — testează schimbările din NEXT și în Split-View, nu doar în view-ul clasic „Toate"
