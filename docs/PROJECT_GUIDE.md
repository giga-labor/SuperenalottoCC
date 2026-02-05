# Documentazione del progetto "Control Chaos"

## 1. Obiettivo generale
- Sito statico dedicato alla pubblicazione di statistiche, algoritmi e simulazioni legate al SuperEnalotto.
- Tema visivo e narrativo: "controllare il caos" con palette scura e neon, immagini di riferimento situate in `img/` (es. `fortuna.png`, `headerControlChaos*.png`).
- Monetizzazione trasparente via spazi pubblicitari chiaramente etichettati e contenuti di valore; nessuna promessa di vincita.
- Tutti i contenuti (analisi, reti, simulazioni) sono elaborati offline dall'amministratore e pubblicati sotto forma di moduli statici – nessuna richiesta di input utente finale né calcolo lato server intensivo.

## 2. Architettura dei contenuti
### 2.1 Macrogruppi
- `statistica`: elaborazioni logiche/analitiche che lavorano su estrazioni, ritardi, frequenze, coppie.
- `neurale`: modelli di reti neurali (es. LSTM, RNN leggere, architetture custom) che apprendono dai dati statistici.
- `simulazione`: mix controllato tra statistiche e reti per restituire scenari sintetici o previsioni narrative.

### 2.2 Moduli
- Ogni modulo è un file JSON posizionato in `modules/<macrogruppo>/<nome>.json`.
- Il file contiene:
  - `title`: titolo del modulo (es. “Ritardi astronomici”).
  - `subtitle`: breve descrizione.
  - `lastUpdated`: data dell’ultimo aggiornamento (formato YYYY-MM-DD).
  - `metrics`: array di metriche derivate (label, valore, trend). 
  - `insights`: array di paragrafi narrativi.
  - `asset` (opzionale): percorso verso immagine/grafico PNG/SVG che accompagna il modulo.
  - `priority` (opzionale): numero per ordinare i moduli nella home.

### 2.3 Manifest centralizzato
- `data/modules-manifest.json` raccoglie i riferimenti a tutti i moduli; viene rigenerato automaticamente.
- Struttura esempio:
  ```json
  [
    {
      "id": "ritardo-astro",
      "macroGroup": "statistica",
      "title": "Ritardi astronomici",
      "subtitle": "Analisi logica su frequenze recenti",
      "file": "modules/statistica/ritardo-astro.json",
      "priority": 10
    }
  ]
  ```

## 3. Frontend e rendering
### 3.1 `index.html`
- Hero con titolo manifesto e CTA (“Scopri gli algoritmi”, “Archivio delle simulazioni”).
- Spazio per sottolineare la libertà di scelta (solo contenuti admin) e disclaimer di monetizzazione.
- Contenitore principale `main` dove `site.js` inserisce le sezioni generate dinamicamente.

### 3.2 CSS
- Palette definita dall’immagine `fortuna.png`: blu notte (#05060F) background, blu/azzurri profondi (#486FA5, #5B89BA), accenti fosforescenti (#FFD966).
- Utilizzare gradienti neon, linee di separazione sottili, badge “Aggiornato il…”, schede con ombre leggere.

### 3.3 JS dinamico
- `assets/js/site.js` esegue fetch su `data/modules-manifest.json`.
- Raggruppa i moduli per `macroGroup` e crea sezioni (Titolo, descrizione, fila di carte).
- Ogni scheda mostra: titolo, sottotitolo, badge `lastUpdated`, elenco `metrics`, `insights`, asset (soprattutto immagini/grafici), CTA per download.
- Prevedere fallback (es. “grafico non disponibile”) se asset mancante.

## 4. Automazione del contenuto
### 4.1 Script `scripts/build-manifest.js`
- Soggetto a esecuzione manuale ogni volta che vengono creati/aggiornati moduli.
- Scansiona le cartelle `modules/statistica`, `modules/neurale`, `modules/simulazione`.
- Per ogni JSON valido costruisce un oggetto (detect `macroGroup` dal nome cartella) e ordina per `priority` (decrescente), salvando il manifest aggiornato.

### 4.2 Flusso tipico
1. Aggiungi modulo (JSON + eventuale grafico) nella cartella corretta.
2. Apri `scripts/build-manifest.js`, esegui `node` per rigenerare `data/modules-manifest.json`.
3. Apri `index.html` (o server statico con `http-server`) per verificare visualizzazione.

## 5. Monetizzazione e trust
- Inserire `div.ad-slot` in zone strategiche (hero, sidebar, footer) con `aria-label` e testo “Spazio pubblicitario trasparente”.
- Sezione “Guadagno etico” vicino all’archivio che spiega: solo insight, no promesse; guadagno derivato da annunci “supportano il progetto”.
- Inserire note “sponsor” vicino a grafici quando ci sono partner (es. tool di visualizzazione). Sempre trasparente.

## 6. Checklist operativa
1. ✅ Definire palette principale e grafiche di riferimento (immagini in `img/`).
2. 🟧 Creare struttura cartelle: `assets/css`, `assets/js`, `data`, `modules/statistica`, `modules/neurale`, `modules/simulazione`, `scripts`.
3. 🟧 Scrivere template modulo JSON (titolo, subtitle, metriche, insights, asset). 
4. 🟧 Implementare `scripts/build-manifest.js` e testare rigenerazione del manifest.
5. 🟧 Costruire `index.html` + `site.js` per leggere manifest e montare moduli.
6. 🟧 Stilizzare con palette neon, badge, card animate; ricorda luci e contrasti.
7. 🟧 Aggiungere sezioni “Archivio” e “Monetizzazione etica”.
8. 🟧 Testare con server statico e assicurarsi che i path relativi funzionino sempre.

## 7. ToDo dettagliata
1. Compilare almeno due moduli reali (statistico e neurale) con metriche pubblicabili e asset visivo.
2. Documentare con note per ogni modulo: origine dati, persona che l’ha calcolato, visione dietro la scelta del numero.
3. Predisporre screenshot o mockup per la sezione hero (desktop/mobile) con palette e titoli.
4. Validare che i badge “ultimo aggiornamento” riflettano la data del JSON, magari con `moment` lato client se necessario.
5. Definire un processo di pubblicazione mensile/settimanale: aggiornare moduli esistenti, aggiungerne di nuovi e rigenerare manifest.

## 8. Materiali correlati
- Immagini base in `img/`: `fortuna.png` (fonte della palette e sfondo della homepage) `headerControlChaos*.png` (hero/ambientazioni e titolo del sito). Usare come sfondo per sezioni chiave.
- Eventuali documenti aggiuntivi (es. note su algoritmi) conservare in sottocartella `docs/notes` e linkarli da `site.js` come “approfondimenti” per moduli appropriati.

## 9. Standard degli archivi/metadati
- Tutti i moduli visualizzati prendono come sorgente primari JSON in `modules/<macrogruppo>/`; ogni modulo può avere accompagnato un archivio (CSV, ZIP, PDF) con i calcoli dettagliati.
- Convenzione per i nomi degli archivi:
  - `<modulo>-data.csv`: dataset elaborato (liste di estrazioni, frequenze, ritardi) usato dalle analisi statistiche.
  - `<modulo>-model.json`: configurazione della rete neurale (architettura, iperparametri, pesi semplificati o link esterni).
  - `<modulo>-notes.md`: note operative (metodologia, dati utilizzati, osservazioni) che puoi includere come testo esplicativo nel campo `resources` del JSON.
- I file archivio devono essere posizionati nella medesima cartella del modulo oppure in `archives/<macrogruppo>/` se condivisi tra più moduli; in ogni caso, il modulo JSON deve contenere la chiave `archives`:
  ```json
  "archives": [
    "modules/statistica/ritardo-astro-data.csv",
    "modules/statistica/ritardo-astro-notes.md"
  ]
  ```
- Lo script `site.js` deve leggere questa lista ed esporre link di download nella card del modulo (etichetta “Scarica archivio dati”). Se l’archivio è un ZIP o PDF, assicurati di includere un `type` descrittivo nell’array, es: `{ "path": "archives/simulazione/ibrido-v1.zip", "label": "Log completo", "type": "zip" }`.
- Standard per i dati tabulari:
  - `CSV`: separatore `;`, intestazioni (tag `metric`, `value`, `source`) coerenti, valori scritti senza formattazione tipo `.` o `,` per migliaia.
  - Ogni CSV deve includere una riga `#meta` iniziale con data e autori, esempio: `#meta data=2026-01-28;author=Admin;note=Calcolo ritardi logici`.
  - Le date nel CSV usano il formato `YYYY-MM-DD` uniforme per facilitarne la lettura.
- Standard per note/markdown:
  - Inizia con un front-matter YAML minimale (titolo, data, persona responsabile).
  - Utilizza sezioni `## Input`, `## Logica`, `## Output`, `## Osservazioni` per rendere l’archivio leggibile.
- Per ogni macrogruppo tieni un file `modules/<macrogruppo>/README.md` che sintetizza:
  1. Scopo della categoria.
  2. Lista degli algoritmi attivi con riferimenti ai moduli.
  3. Aggiornamenti previsti.
- Questi README possono essere esposti dal frontend come “Mappa dei moduli” o semplicemente consultati offline per mantenere ordine.

## 10. Storico delle performance
- Ogni modulo deve includere uno storico delle performance (array `performanceHistory`) all'interno del proprio JSON o come file associato (`<modulo>-performance.csv`), in modo che il frontend possa generare trend lineari o badge temporali.
- Il JSON può contenere:
  ```json
  "performanceHistory": [
    { "date": "2026-01-15", "impact": "media", "note": "Aggiunta nuova regola su ritardi", "score": 72 },
    { "date": "2026-01-22", "impact": "basso", "note": "Ricalcolo dopo verifica manuale", "score": 69 }
  ]
  ```
- `score`: numero da 0 a 100 che sintetizza quanto il modulo era “performante” (in termini di affidabilità osservata, percentuale di hit, ecc.). Il campo `note` sintetizza la modifica o osservazione. Il campo `impact` può essere “alto”, “medio”, “basso”.
- Se preferisci mantenere gli storici in CSV, i file `<modulo>-performance.csv` devono seguire lo stesso schema (date, score, impact, note) e riportare anche `#meta` con autore e data. L'array `archives` deve includere quel CSV così che il frontend lo presenti come download “Storico performance”.
- Frontend: `site.js` mostra lo storico con un grafico sparkline e badge “Trend” (incremento/decremento) utilizzando `score` e `date`. Le nuove entry devono essere aggiunte da te dopo ogni aggiornamento del modulo.

## 11. Archivio successi e pagina confronto
- Ogni archivio specifico (CSV/JSON) associato a un modulo deve contenere i concorsi con successi ≥ 2 e informazioni strutturate:
  - Righe `.csv` con colonne `date`, `concorso`, `estrazioni`, `successo`, `type` (es. “2+”, “3+”, “Jolly”).
  - Una sezione `matches` in `modules/<macrogruppo>/<modulo>-data.json` che dettaglia i concorsi memorabili (valore, note, fermata dei numeri).
- Questi dati alimentano la futura pagina “Confronti” che permette all’utente di scegliere due moduli/archivi e visualizzare i successi in comune, le discrepanze e l’evoluzione storica.
- Implementazione front-end: `pages/confronti.html` (o sezione SPA) carica `data/comparison.json` con metadati e richieste di default; `assets/js/comparison.js` recupera i CSV/JSON elencati nei moduli selezionati e mostra:
  1. Dropdown di selezione moduli (statistica vs neurale vs simulazione).
  2. Filtri per tipo di successo (>=2, >=3, ecc.).
  3. Tabella con concorsi affiancati, evidenziando matches, percentuali e note.
  4. Grafico a barre o heatmap per la frequenza dei successi condivisi.
- `data/comparison.json` contiene la configurazione base:
  ```json
  {
    "default": ["ritardo-astro", "ibrido-simulazione"],
    "modules": [
      { "id": "ritardo-astro", "label": "Logica ritardi" },
      { "id": "lstm-diagonali", "label": "Reti LSTM" }
    ],
    "filters": ["2+", "3+", "Jolly"]
  }
  ```
- Lo script di rendering deve accedere al campo `archives` nel manifest per recuperare il path di download e delle serie storiche (inclusi eventuali ZIP con i match più dettagliati).
- Questo mantiene l’interazione solo sul front-end: tu prepari i file `matches` e la pagina li offre come strumento di comparazione trasparente.

## 12. Checklist aggiuntiva per archivi e confronto
1. Ogni modulo ha un CSV/JSON con concorsi successivi con due o più numeri (nominare `-data` o `-matches`).
2. I metadata `matches` includono `date`, `numbers`, `success`, `notes`, `type`.
3. La pagina “Confronti” può usare le sezioni `archives` dei moduli per generare dropdown e caricamenti.
4. Aggiorna `data/comparison.json` ogni volta che aggiungi nuove configurazioni da far confrontare.
5. Mantieni la documentazione `docs/confronti.md` (opzionale) con i risultati più rilevanti per uso interno.

## 13. Metadati per gli archivi
- Ogni archivio di modulo (CSV/JSON/ZIP) deve includere dentro se stesso o nel manifest:
  - `archiveName`: nome sintetico dell’archivio (es. “Archivio Ritardi Astronomici”).
  - `archiveDescription`: breve testo (1-2 frasi) usato nel frontend per descrivere il tipo di calcolo/algoritmo mostrato nel modulo.
- Questi campi devono essere scritti direttamente nel JSON del modulo (ogni item in `archives` può essere un oggetto con `path`, `name`, `description`, `type`):
  ```json
  \"archives\": [
    { \"path\": \"modules/statistica/ritardo-astro-data.csv\", \"name\": \"Archivio Ritardi Astronomici\", \"description\": \"Elenco delle estrazioni con successi >=2 usate per il calcolo dei ritardi\", \"type\": \"csv\" }
  ]
  ```
- `site.js` mostra `name` e `description` quando elenca i download/carte e li può usare anche nel codice descrittivo dell’algoritmo per mantenere coerenza tra contenuto e archivio scaricabile.

## 14. Commento narrativo finale
- Alla fine di ogni modulo (JSON) aggiungi il campo `narrativeSummary` con una frase o paragrafo breve che commenta poeticamente l’andamento delle estrazioni (“i numeri attesi continuano a caricarsi di energia”) e attenua i fallimenti descrivendoli come “carica”, “ritardo creativo” o altri metafore coerenti con la voce “controllo del caos”. Servirà al codice per mostrare un messaggio coerente con la voce del progetto.
- Il testo può includere riferimenti a trend plausibili (“L’ultimo ciclo segnala un aumento di precisione sulle diagonali più "fredde"”) e ricordare che si tratta sempre di elaborazioni statistiche senza garanzie (“Controlliamo il caos, ma non promettiamo vincite”), in modo da mantenere onestà pur usando un tono evocativo.
- Il player del sito o il riquadro delle analisi dedicato possono visualizzare questo `narrativeSummary` sotto il titolo del modulo o accanto alle metriche, in modo che l’utente legga subito la voce che racconta l’andamento delle estrazioni mentre consulta i numeri.
