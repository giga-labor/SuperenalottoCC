# PATCH_HOME_LAB_PAPER_BRIDGE_TECH_SPEC.md
PATCH_ID: HOME_LAB_PAPER_BRIDGE_V1
EVENT_VERSION: 1.0.0
SCOPE: home only

## 0) Obiettivo
Documento tecnico di patch completo per `secc`, con varianti operative gia definite.
Per ogni variante sono riportati:
1. cosa fare (intervento effettivo)
2. perche farlo (motivazione tecnica/UX)
3. codice da inserire (con commenti inline)
4. verifica minima

Vincoli fissi:
1. non toccare AdSense in `secc/index.html`
2. non rompere analytics schema in `secc/docs/ANALYTICS_SCHEMA.md`
3. patch chirurgica, nessun refactor esteso

---

## 1) Baseline Reale (riesaminata)
File coinvolti:
1. `secc/index.html`
2. `secc/layouts/home.layout.json`
3. `secc/assets/js/architects/home.architect.js`
4. `secc/assets/js/cards.js`
5. `secc/assets/js/header.js`
6. `secc/docs/ANALYTICS_SCHEMA.md`

Stato utile gia presente:
1. telemetry `paper_card_impression`, `paper_card_click` in `cards.js`
2. telemetry `bridge_box_impression`, `bridge_box_click` in `header.js` (via `data-bridge-box`)
3. `mountCardList(ctx, host, cards, options)` in `base.architect.js` supporta `sourceBlock`
4. home architect gestisce `news_cards`, `proposals_list`, `kpi_cards`

---

## 2) Matrice Varianti (complete)
1. `VAR-001`: Hero paper dominante
2. `VAR-002`: Bridge dati -> paper contestuale
3. `VAR-003`: Rafforzamento visivo laboratorio
4. `VAR-004`: Micro-abstract + badge livello sulle card paper
5. `VAR-005`: Segmentazione telemetry per blocco home
6. `VAR-006`: Compatibilita analytics (zero breaking)

---

## VAR-001 - Hero Paper Dominante

### Perche
Manca un aggancio paper immediato nella home. Una sola card paper in hero crea focus e abilita KPI specifico `source_block=home_hero`.

### Intervento Effettivo
1. aggiungere mount point in `index.html`
2. aggiungere zone in `home.layout.json`
3. estendere `home.architect.js` con tipo zona `hero_paper_card`
4. aggiungere CSS locale per slot hero paper
5. criterio paper esplicito: una card e considerata `paper` se la destinazione (`page|href|url`) matcha `pages/algoritmi/algs/`
6. matching paper case-insensitive (valore normalizzato con `toLowerCase()`)

### Codice Da Inserire

#### A) `secc/index.html` (dentro `section.cc-hero-grid`, nel primo `article.cc-hero-panel`)
```html
<!-- Hero paper slot: mount per card studio consigliato -->
<div class="cc-home-hero-paper-slot mt-4" data-home-hero-paper>
  <div class="rounded-xl border border-dashed border-white/15 bg-midnight/30 px-4 py-4 text-xs text-ash">
    Caricamento studio consigliato...
  </div>
</div>
```

#### B) `secc/layouts/home.layout.json` (in `zones`, dopo `news-zone` e prima di `proposals-zone`)
```json
{
  "id": "hero-paper-zone",
  "type": "hero_paper_card",
  "mount": "[data-home-hero-paper]"
}
```

#### C) `secc/assets/js/architects/home.architect.js` (nel `run`, dentro `for (const zone of zones)`)
```js
const zoneHost = document.querySelector(zone.mount);
if (!zoneHost) continue;

if (zone.type === 'hero_paper_card') {
  // Renderizza una sola card paper top-priority nel blocco hero.
  await this.renderHeroPaper(ctx, zoneHost, data.modules || []);
  continue;
}
```

#### D) `secc/assets/js/architects/home.architect.js` (nuovo metodo nell'oggetto architect)
```js
async renderHeroPaper(ctx, host, modules) {
  const all = Array.isArray(modules) ? modules : [];
  const papers = all.filter((card) => {
    if (!card || card.isActive === false) return false;
    const p = String(card.page || card.href || card.url || '').toLowerCase();
    return p.includes('pages/algoritmi/algs/') || p.includes('/algoritmi/algs/');
  });

  if (!papers.length) {
    host.innerHTML = '<div class="rounded-xl border border-dashed border-white/15 bg-midnight/30 px-4 py-4 text-xs text-ash">Nessun paper disponibile.</div>';
    return;
  }

  const cardsApi = window.CARDS;
  const scored = await Promise.all(papers.map(async (card) => {
    let ranking = Number.NaN;
    if (Number.isFinite(card?.rankingValue)) {
      ranking = Number(card.rankingValue);
    } else if (cardsApi && typeof cardsApi.computeRankingForAlgorithm === 'function') {
      ranking = await cardsApi.computeRankingForAlgorithm(card);
    }
    return { card, ranking };
  }));

  scored.sort((a, b) => {
    // 1) featured prima, 2) ranking desc, 3) ultimo update piu recente.
    const af = a.card?.featured ? 1 : 0;
    const bf = b.card?.featured ? 1 : 0;
    if (bf !== af) return bf - af;
    const ar = Number.isFinite(a.ranking) ? a.ranking : Number.NEGATIVE_INFINITY;
    const br = Number.isFinite(b.ranking) ? b.ranking : Number.NEGATIVE_INFINITY;
    if (br !== ar) return br - ar;
    const bt = Date.parse(b.card?.lastUpdated || '') || 0;
    const at = Date.parse(a.card?.lastUpdated || '') || 0;
    return bt - at;
  });

  const selected = scored[0]?.card;
  if (!selected) return;

  const selectedKey = String(selected.id || selected.page || selected.href || selected.url || 'paper');
  if (host.dataset.heroMounted === '1' && host.dataset.heroMountedKey === selectedKey) return;

  host.innerHTML = '';
  host.dataset.heroMounted = '1';
  host.dataset.heroMountedKey = selectedKey;

  const listHost = document.createElement('div');
  listHost.className = 'cc-home-hero-paper-list';
  host.appendChild(listHost);

  const { mountCardList } = window.CC_ARCHITECT_BASE || {};
  if (typeof mountCardList === 'function') {
    // sourceBlock esplicito per KPI per-blocco.
    await mountCardList(ctx, listHost, [selected], { forceActive: true, sourceBlock: 'home_hero' });
  }
}
```

#### E) `secc/assets/css/main.css` (append in fondo file)
```css
/* VAR-001: slot hero paper */
.cc-home-hero-paper-slot {
  width: 100%;
}

@media (min-width: 1024px) {
  .cc-home-hero-paper-slot .algorithm-card {
    min-height: 340px;
  }
}

@media (max-width: 767px) {
  .cc-home-hero-paper-slot .algorithm-card {
    min-height: auto;
  }
}
```

### Verifica
1. in home appare 1 card paper nel blocco hero
2. click apre una pagina `pages/algoritmi/algs/...`
3. `window.CC_TELEMETRY.getEvents()` mostra `paper_card_impression/click` con `source_block=home_hero`

---

## VAR-002 - Bridge Dati -> Paper Contestuale

### Perche
La sezione dati e autonoma ma non guida in modo esplicito allo studio teorico correlato.

### Intervento Effettivo
1. inserire bridge-box con dataset `data-bridge-*` compatibile con `header.js`
2. applicare stile dedicato senza cambiare struttura globale
3. confermare mapping attributi DOM -> payload snake_case in telemetry
4. `classic-frequency` e ID canonico (slug) e deve essere identico tra dataset card, pagina paper e telemetry `paper_view.paper_id`

### Codice Da Inserire

#### A) `secc/index.html` (subito dopo `section.cc-hero-grid`)
```html
<!-- Bridge contestuale: collega KPI/dati a paper specifico -->
<section class="cc-bridge-box-home-wrap mt-5" data-section-id="home_data_bridge">
  <article
    class="cc-bridge-box-home"
    data-bridge-box
    data-bridge-id="home_bridge_data_to_paper"
    data-linked-paper-id="classic-frequency"
    data-source-data-module="home_dashboard">
    <p class="cc-bridge-box-home__title">Dal dato alla teoria</p>
    <p class="cc-bridge-box-home__text">
      Le anomalie frequenziali osservate nei KPI sono analizzate nello studio tecnico dedicato.
    </p>
    <a class="cc-bridge-box-home__cta" href="pages/algoritmi/algs/classic-frequency/index.html">
      Apri lo studio correlato
    </a>
  </article>
</section>
```

#### B) `secc/assets/css/main.css` (append in fondo file)
```css
/* VAR-002: bridge box home -> paper */
.cc-bridge-box-home {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(22, 28, 48, 0.72), rgba(14, 18, 33, 0.72));
  padding: 16px 18px;
}

.cc-bridge-box-home__title {
  margin: 0 0 6px 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #9fb2cf;
}

.cc-bridge-box-home__text {
  margin: 0 0 10px 0;
  color: #d2dbeb;
}

.cc-bridge-box-home__cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(88, 215, 255, 0.55);
  color: #8de7ff;
  text-decoration: none;
}
```

### Verifica
1. `bridge_box_impression` tracciato quando il box entra in viewport
2. `bridge_box_click` tracciato al click su CTA
3. payload eventi usa chiavi coerenti: `bridge_id`, `linked_paper_id`, `source_data_module`
4. `data-linked-paper-id` combacia con il `paper_id` emesso da `paper_view` nella pagina destinazione

---

## VAR-003 - Rafforzamento Visivo Laboratorio

### Perche
La sezione laboratorio deve pesare visivamente piu della media per risultare il cuore editoriale.

### Intervento Effettivo
1. aggiungere classe dedicata alla CTA studi nel blocco hero
2. usare selettore CSS per classe (non per path href)
3. mantenere intervento solo locale su hero/laboratorio

### Codice Da Inserire

#### A) `secc/index.html` (nel blocco `section.cc-hero-grid`, CTA "Apri studi e algoritmi")
```html
<a class="cc-cta-studi" href="pages/algoritmi/index.html">Apri studi e algoritmi</a>
```

#### B) `secc/assets/css/main.css` (append in fondo file)
```css
/* VAR-003: enfasi visiva sezione laboratorio */
.cc-hero-grid {
  margin-top: 14px;
  gap: 16px;
}

.cc-hero-panel {
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(180deg, rgba(24, 30, 52, 0.78), rgba(16, 20, 36, 0.78));
}

.cc-hero-panel .cc-cta-studi {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 217, 102, 0.7);
  background: rgba(255, 217, 102, 0.1);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #ffd966;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
  box-shadow: 0 0 0 1px rgba(109, 237, 255, 0.22), 0 8px 20px rgba(11, 21, 40, 0.35);
}

.cc-hero-panel .cc-cta-studi:hover {
  transform: translateY(-2px);
  background: rgba(255, 217, 102, 0.18);
}
```

### Verifica
1. blocco laboratorio piu leggibile e dominante
2. nessun overflow su viewport mobile

---

## VAR-004 - Micro-Abstract + Badge Livello Nelle Card Paper

### Perche
Serve qualificare il click: l utente deve capire subito tema e difficolta del paper.

### Intervento Effettivo
1. estendere `buildAlgorithmCard` in `cards.js` con metadati paper
2. mostrare blocco solo per card `paper`
3. aggiungere stile dedicato in `main.css`

### Codice Da Inserire

#### A) `secc/assets/js/cards.js` (in `buildAlgorithmCard`, dopo `descriptionTpl`)
```js
// VAR-004: metadata sintetici per paper card (solo se card_type = paper).
const rawLevel = String(algorithm?.level || 'intermedio').trim().toLowerCase();
const level = (rawLevel === 'base' || rawLevel === 'avanzato') ? rawLevel : 'intermedio';
const levelLabel = level === 'base' ? 'Intro' : (level === 'avanzato' ? 'Avanzato' : 'Intermedio');

const abstractSource = String(algorithm?.narrativeSummary || algorithm?.subtitle || '').trim();
const abstractText = abstractSource || 'Approfondimento tecnico disponibile nella scheda completa.';
const escapeFn = window.CC_UTILS?.escapeHtml || ((value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;'));
const abstractHtml = escapeFn(abstractText);
```

#### B) `secc/assets/js/cards.js` (in `buildAlgorithmCard`, prima di `const bodyHtml = ...`)
```js
const paperMetaHtml = cardType === 'paper'
  ? `
      <div class="cc-paper-meta">
        <span class="cc-paper-level-badge cc-paper-level-badge--${level}">${levelLabel}</span>
        <p class="cc-paper-abstract">${abstractHtml}</p>
      </div>
    `
  : '';
```

#### C) `secc/assets/js/cards.js` (dentro template `bodyHtml`, subito dopo `algorithm-card__desc`)
```js
${paperMetaHtml}
```

#### D) `secc/assets/css/main.css` (append in fondo file)
```css
/* VAR-004: meta card paper (badge livello + micro-abstract) */
.cc-paper-meta {
  margin-top: 8px;
}

.cc-paper-level-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e8eef8;
}

.cc-paper-level-badge--base {
  border-color: rgba(122, 245, 167, 0.5);
  color: #8bf4b7;
}

.cc-paper-level-badge--intermedio {
  border-color: rgba(104, 210, 255, 0.5);
  color: #8fe0ff;
}

.cc-paper-level-badge--avanzato {
  border-color: rgba(255, 174, 112, 0.5);
  color: #ffc48b;
}

.cc-paper-abstract {
  margin: 6px 0 0 0;
  color: #c8d4e8;
  font-size: 13px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* vincolo 2 righe */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Verifica
1. card paper mostrano badge livello + abstract breve
2. card non-paper non mostrano blocco `cc-paper-meta`
3. layout card non si rompe su desktop/mobile
4. convenzione livello unificata: `base|intermedio|avanzato`

---

## VAR-005 - Segmentazione Telemetry Per Blocco Home

### Perche
KPI non affidabili se `source_block` non e coerente per area.

### Intervento Effettivo
1. mantenere `home_news` dove gia presente
2. forzare `home_hero` per hero card
3. riservare `home_laboratorio` per eventuale zone futura

### Codice Da Inserire/Confermare

#### `secc/assets/js/architects/home.architect.js`
```js
// Gia presente: news zone.
await mountCardList(ctx, host, limited, { forceActive: false, sourceBlock: 'home_news' });

// Nuovo: hero paper zone.
await mountCardList(ctx, listHost, [selected], { forceActive: true, sourceBlock: 'home_hero' });

// Eventuale estensione futura: blocco laboratorio dedicato.
// await mountCardList(ctx, host, cards, { forceActive: true, sourceBlock: 'home_laboratorio' });
```
Nota operativa: in questo snippet `host` indica il mount node della zona corrente (equivalente a `zoneHost` usato in VAR-001).

#### `secc/assets/js/cards.js` (logica gia compatibile, non va rimossa)
```js
card.dataset.sourceBlock = String(options.sourceBlock || algorithm?.macroGroup || 'catalog');
```

### Verifica
1. in `window.CC_TELEMETRY.getEvents()` i `paper_card_*` hanno `source_block` coerente
2. nessuna rinomina eventi

---

## VAR-006 - Compatibilita Analytics (Obbligatoria)

### Perche
Serve continuita storica delle metriche.

### Intervento Effettivo
1. mantenere `event_version: 1.0.0`
2. non cambiare nomi evento
3. non modificare dedup/rules runtime in `header.js` senza bump schema
4. mantenere mapping coerente da attributi DOM a payload evento:
   - `data-bridge-id` -> `bridge_id`
   - `data-linked-paper-id` -> `linked_paper_id`
   - `data-source-data-module` -> `source_data_module`
5. mapping implementato in `secc/assets/js/header.js`, funzione `initTelemetryBindings()`, blocco `bridgeBoxes.forEach(...)`
6. non modificare il blocco `bridgeBoxes.forEach(...)` senza bump schema analytics

### Controllo
Confronto con `secc/docs/ANALYTICS_SCHEMA.md`:
1. `paper_card_impression`, `paper_card_click` invariati
2. `bridge_box_impression`, `bridge_box_click` invariati
3. regole dedup e threshold invariati

---

## 3) KPI Operativi Post-Patch
1. `CTR hero card = paper_card_click(source_block=home_hero) / paper_card_impression(source_block=home_hero)`
2. `CTR news/lab = paper_card_click(source_block in [home_news, home_laboratorio]) / paper_card_impression(...)`
3. `Bridge conversion = bridge_box_click(bridge_id=home_bridge_data_to_paper) / bridge_box_impression(...)`
4. `Paper depth medio = avg(paper_scroll_depth.depth_pct)`
5. `Paper read-time medio = avg(paper_read_time.engaged_seconds)`
6. `Bounce tecnico = paper_exit where engaged_seconds < 10 and max_depth_pct < 25`
7. `Data->Paper share = paper_view(entry_source=data_section) / paper_view(all)` (target consigliato: `>= 20%`)

---

## 4) Sequenza Esecutiva Consigliata
1. applicare VAR-001
2. applicare VAR-002
3. applicare VAR-003
4. applicare VAR-004
5. validare VAR-005 (payload telemetry)
6. validare VAR-006 (schema freeze)

---

## 5) Smoke Test Minimo
1. home senza errori console
2. hero paper visibile/cliccabile
3. bridge box visibile + eventi `bridge_box_*`
4. card paper con badge + abstract
5. eventi in `window.CC_TELEMETRY.getEvents()`
6. script AdSense invariato in `secc/index.html`
7. `paper_card_impression` non duplicata su rerender/refresh parziale
8. hero card non duplicata se `home.architect.js` runna due volte
9. bridge home non invade visivamente slot AdSense (spaziatura coerente)
10. micro-abstract non mostra entita HTML (`&amp;`, `&lt;`) in chiaro

---

## 6) Rollback Chirurgico
1. VAR-001: rimuovere mount `data-home-hero-paper`, zone `hero-paper-zone`, metodo `renderHeroPaper`
2. VAR-002: rimuovere blocco HTML bridge + CSS `.cc-bridge-box-home*`
3. VAR-003: rimuovere override `.cc-hero-grid` / `.cc-hero-panel`
4. VAR-004: rimuovere `paperMetaHtml` + CSS `.cc-paper-*`
5. VAR-005: ripristinare `sourceBlock` solo default

---

## 7) Checklist Finale Bloccante (Go/No-Go)
Nessuna nuova variante oltre a VAR-001..VAR-006. Questa checklist e solo di verifica finale.

1. `home.architect.js` variabili e contesto:
Pass: mount node della zona passato correttamente a `renderHeroPaper(ctx, zoneHost, ...)`, nessun `ReferenceError`, hero card unica.

2. `header.js` mapping DOM -> payload bridge:
Pass: eventi con chiavi `bridge_id`, `linked_paper_id`, `source_data_module` in `window.CC_TELEMETRY.getEvents()`.

3. `cards.js` escape + tipo card:
Pass: `escapeFn` stabile in strict mode, niente XSS, badge+abstract solo su `cardType === 'paper'`.

4. dedup impression (hero + news):
Pass: no doppie `paper_card_impression` nella stessa sessione per stessa card/source block su rerender, resize, scroll.

5. vincoli grafici + AdSense:
Pass: hero e bridge non invadono gli slot Ads, nessun CSS globale tocca container AdSense.
