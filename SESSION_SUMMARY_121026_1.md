# Rezumat sesiune $121026.1 — ProjectBoard
**Versiune la start:** V160 (confirmat din index.html din Project Knowledge) → **Versiune la final: V165**
**Manual Tehnic / Help:** actualizate la final de sesiune → V165

---

## Stare curentă

- **Ultima livrare Claude:** V165 (+ Manual_Tehnic_V165.html + help_V165_ro.html + acest document)
- **Dan livrează:** V166+ (întreabă la start sesiune următoare; Dan redenumește local fișierele, pornești de la N+1 față de numărul pe care îl confirmă explicit)
- **Firebase project / Google OAuth client ID:** neschimbate
- **Aplicația pornește pe tabul „Prioritare"** (nu Split-View) din V163; Split-View rămâne disponibil din ▣
- **Disciplina chatului:** ~15 mesaje de urmărire ($121026.1-1 … -15). Claude NU generează kanban_VN.html până Dan nu scrie explicit „generează" / „genera". sw.js îl actualizează Dan (cache `projectboard-v165`).
- **Verificare:** toate versiunile au trecut `node --check`. V161 și V162 au fost testate de Dan (trace-uri primite); **V163, V164, V165 nu au feedback de test încă.**

---

## Ce s-a implementat (V161–V165)

### V161
- Ti: start pe Prioritare; N1: buton „Top" în editorul notei; Sn1: note pe subtaskuri; C1: căutare în subtaskuri și note
- EU: prefix `w ` / `w.` → copie legată în Wait (`wl::` ids, nume sincronizat bidirecțional; bifarea unei părți o închide pe cealaltă); `u ` / `u.` → urgent roșu
- PE: `/p` = push punctual (tranzacție Firestore, doar taskul respectiv)
- Bn1: buton „Subtaskuri din notă"; V1: trace-uri de viteză; Trrm2: task nou cu dată intră direct în zona `*1` (`insertNew`)
- Monitor clipboard la 20 s — introdus, apoi **retras în V163** (nu funcționează în fundal: Android blochează citirea clipboardului fără focus)

### V162
- Share afișează primele 20 de rânduri („încă 50"/„Toate"); tab „Z2-utile" (zona `*2`); „→ Zona 2" în bara de selecție
- Rg2: ordine vizuală u → w → rest în Prioritare (CSS `order`, mâner ⠿ dezactivat cât timp e activă)
- Mtn: la editare, dată nouă într-un task din verde → mutat în roșu
- Subtaskuri: ordine (nivel 1 nebifat primele), subtaskuri cu `*` nu sunt șterse la curățare, separatori `.` / `==` / `---`, primul bloc din notă; trace cu mărimea cheilor localStorage

### V163
- Butoane **U** / **W** în bara de selecție (prefix pe selecție, toggle)
- Subtaskuri `N.` promovate vizual în Prioritare; Mtd (schimbarea unei date existente mută în roșu); „+ Next" eliminat; click pe rezultat de căutare → editor; backup-uri fără Share (+ curățare automată a celor vechi); trace curățat; monitor clipboard scos

### V164
- Marcaj `X` în notă la extragere + comparare normalizată (fără dubluri); subtaskurile noi sus/jos după Top
- Subtaskuri promovate: U/W, drag cu ancoră (`promoAfter`), chenar continuu pe părinte; ordine căutare (taskuri NEXT pe taburi → Wait → Share → proiecte → jurnal)
- Settings → 💾 Memorie (ocupare pe componente, alte aplicații de pe origine, istoric zilnic Share)

### V165
- Marcaje numerotate `X1`, `X2`… (legătura notă↔subtask prin număr), previzualizare la extragere (blocuri noi/existente), debifare readuce linia în notă, stampila versiunii la bifare
- 🧹 Curăță scrie în Jurnal (`subtask-clean`) cu „↩ Refă"; 📤 Neterminate (clipboard)
- Sel2st: **⊟ → Subtask** (primul selectat = ținta; taskuri libere / din proiecte / subtaskuri promovate devin subtaskuri; nota și subtaskurile se mută; „Refă" în Jurnal)
- Tuns: taskuri noi din cloud (Pull/Merge) la începutul zonei verzi + insigna 🆕 (local, 3 zile; protecție >30)
- Nota pe tot ecranul: fereastră mică de linkuri sus, editor jos, butoane jos (ajustat cu `visualViewport`)

---

## Bug-uri / descoperiri notabile

| Problemă | Cauză / decizie |
|----------|-----------------|
| Task cu dată adăugat prin FAB rămânea în Prioritare (Trrm2) | `insertInGreenZone` îl punea în `*3`, iar `sortBetweenMarkers` ignoră `*3`. Fix la inserare (`insertNew`), nu în sortare |
| Task din verde cu dată schimbată nu se muta (Mtn/Mtd) | `onDateAdded` compară acum datele (`getTime`), nu doar prezența |
| Editare în zona roșie fără dată scotea rândul din roșu | Comportament al sortării forțate (în `*1` rămân doar taskurile cu dată) — neschimbat, semnalat |
| Randări lente (300–1250 ms) | Share cu 1031 itemi randat integral + scrieri `traceLog` în localStorage (inclusiv linii per rând). Share limitat la 20; trace curățat; randări tipice ~100–150 ms după V162 |
| **localStorage ~4910 KB (aproape de limită)** | `pb-fb-backups` 2674 KB (backup-uri cu Share), jurnal Share 674 KB, jurnal 564 KB, Share 461 KB, plus `trident_ge_cache` — **Trident împarte aceeași origine (xpareto.github.io) și aceeași limită ~5M caractere**. Backup-uri fără Share din V163 |
| Dublură la extragerea unui bloc din notă (linia cu URL) | Comparare exactă a textului; acum normalizată + marcaj numerotat X |
| Monitor clipboard în fundal | Imposibil în browser/PWA/APK (restricții Android 10+) — scos |

## Probleme cunoscute / deschise la final de sesiune

- **V163–V165 netestate de Dan.** De verificat în special: tastatura + butoanele din editorul de notă pe telefon; Tuns la prima sincronizare între două device-uri; mutarea cu degetul a rândurilor promovate; Sel2st cu subtaskuri promovate; memoria totală după curățarea backup-urilor (trace `V1 backup-uri slim`, `V1 ls top`).
- Marcajele `X` fără număr (create în V164) sunt doar ignorate la extragere — nu li se atribuie număr retroactiv.
- Subtaskul editat după extragere: legătura se păstrează prin număr; pentru linii multi-rând se șterge doar prima linie dacă textul s-a schimbat.
- Culorile u/w nu apar în Split-View (doar în vederea clasică); ordinea u/w în Split nu e implementată.
- **Anomalia de sincronizare pe tabletă** (rânduri din zona verde „zboară" la poziții diverse) — rămâne nereprodusă; protocolul 🔄 Reset + trace de pe ambele device-uri rămâne valabil.
- Subtaskurile nu au drag real (doar ▲/▼); rândurile promovate au drag.
- Jurnalul principal (564 KB) și jurnalul Share (674 KB) sunt mari — recomandat: export + golire periodică.

## Fișiere livrate această sesiune

- `kanban_V161.html` … `kanban_V165.html` (5 versiuni)
- `Manual_Tehnic_V165.html`, `help_V165_ro.html`, `SESSION_SUMMARY_121026_1.md` (acest document)

---

## Reguli pentru sesiunea următoare

1. **Întreabă versiunea curentă** — Dan poate fi la V166+; pornești de la N+1 față de numărul confirmat explicit
2. La începutul fiecărui chat din Proiect: compară versiunea din memorie cu `index*.html` din Project Knowledge; dacă diferă și nu există SESSION_SUMMARY pentru interval, **oferă-te** să generezi unul (nu-l genera nepus)
3. **Nu genera `kanban_VN.html` până Dan nu scrie explicit „generează"** — adună cerințe, lămurește ambiguitățile cu întrebări scurte, abia apoi construiește
4. **Nu genera sw.js** (R9). **Help/Manual Tehnic** — doar la cererea explicită a lui Dan, la final de chat
5. **Etichete conversație:** `$zzllaa.N` (N dat de Dan; dacă lipsește, `N=?` și cere confirmare), urmărirea `$zzllaa.N-n`; la început sugerează titlu `$zzllaa.N - Descriere`
6. `detectAndSaveZones()` după ORICE operație care modifică `nextOrder` (R12); orice inserare de task nou prin `insertNew` / `insertInGreenZone` (R19, R22)
7. Orice funcție care scrie local fără `save()` setează `pb-local-dirty-ts` (R17/R18, inclusiv Share și subtaskuri)
8. `render()` rulează `syncWaitCopies()` + `scanPushCmd()` — idempotente, fără apel `render()` (R23)
9. Rândurile promovate `N.` sunt virtuale: chei `v::`, drag `promo` (R24); după `tunsPlace` apelezi `detectAndSaveZones()` și sari `_tunsSkip` (R25)
10. `traceLog` scrie în localStorage — fără trace-uri în bucle per rând; urmărește ocuparea (Settings → 💾 Memorie); origine partajată cu Trident (R26)
11. Contractul notă↔subtask: `X<n> ` în notă, `removeNoteLine(note,text,xn)`, curățare cu Jurnal (R27)
12. Rulează `node --check` pe JS-ul extras înainte de fiecare livrare; patch-uri cu Python + asert pe numărul de potriviri
13. Split-View + tabul Prioritare + ambele vederi: testează schimbările din NEXT și în Split-View, nu doar în vederea clasică
