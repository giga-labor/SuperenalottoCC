(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const root = $("#cc-app");
  const state = {
    cards: [],
    algorithms: [],
    home: null,
    jackpot: null,
    latest: null,
    filter: "tutti",
    route: "welcome",
    slug: null
  };

  const nav = [
    ["home", "Home", "M3 10.8 12 3l9 7.8v9.7a1 1 0 0 1-1 1h-5.2v-6h-7.6v6H4a1 1 0 0 1-1-1z"],
    ["algoritmi", "Algoritmi", "M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01"],
    ["laboratorio", "Laboratorio", "M9 2h6M10 2v6l-5.8 9.4A3 3 0 0 0 6.8 22h10.4a3 3 0 0 0 2.6-4.6L14 8V2"],
    ["oracle", "Oracolo", "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9"],
    ["privacy", "Privacy", "M12 3 5 6v5c0 4.7 2.8 8.3 7 10 4.2-1.7 7-5.3 7-10V6l-7-3zM9 12l2 2 4-5"]
  ];

  function svg(path) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  async function json(path, fallback) {
    try {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) throw new Error(path);
      return await res.json();
    } catch (_err) {
      return fallback;
    }
  }

  function normalizePath(path) {
    if (!path) return "#";
    return String(path).replace(/^\/+/, "");
  }

  function formatJackpot() {
    const raw = state.jackpot?.jackpot_raw;
    if (Number.isFinite(raw)) {
      const mil = raw / 1000000;
      return `${mil.toLocaleString("it-IT", { maximumFractionDigits: 1 })}`;
    }
    return (state.jackpot?.jackpot_str || "--").replace(/\./g, ",");
  }

  function ball(n, kind) {
    return `<span class="cc-number-ball ${kind || ""}">${escapeHtml(n)}</span>`;
  }

  function setTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("cc-app-theme", next);
      localStorage.setItem("cc-theme", next);
    } catch (_err) {}
    const btn = $("#theme-toggle");
    if (btn) btn.setAttribute("aria-label", next === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro");
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("cc-app-theme") || localStorage.getItem("cc-theme"); } catch (_err) {}
    if (saved === "dark" || saved === "light") return setTheme(saved);
    setTheme(matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }

  function readRoute() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) return { route: "welcome", slug: null };
    const parts = hash.split("/").filter(Boolean);
    if (parts[0] === "algoritmi" && parts[1]) return { route: "algoritmo", slug: parts[1] };
    return { route: parts[0] || "welcome", slug: null };
  }

  function go(route) {
    window.location.hash = route === "welcome" ? "" : `/${route}`;
  }

  function topbar(title) {
    return `
      <header class="cc-topbar">
        <button class="cc-icon-btn" type="button" data-back aria-label="Indietro">${svg("M15 18l-6-6 6-6")}</button>
        <a class="cc-logo-lockup" href="#/home" aria-label="Control Chaos Home">
          CONTROL <b>CHAOS</b>
          <span class="cc-logo-sub">SuperEnalotto</span>
        </a>
        <button class="cc-icon-btn" id="theme-toggle" type="button">${svg("M12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z")}</button>
      </header>
    `;
  }

  function bottomNav() {
    return `
      <nav class="cc-bottom-nav" aria-label="Navigazione principale">
        ${nav.map(([id, label, icon]) => `
          <a class="cc-nav-item ${isActiveNav(id) ? "active" : ""}" href="${id === "privacy" ? "/pages/privacy-policy/" : id === "algoritmi" ? "/pages/algoritmi/" : `#/${id}`}" aria-label="${label}">
            ${svg(icon)}<span>${label}</span>
          </a>
        `).join("")}
      </nav>
    `;
  }

  function isActiveNav(id) {
    if (id === "algoritmi") return state.route === "algoritmi" || state.route === "algoritmo";
    return state.route === id;
  }

  function shell(content, title) {
    root.innerHTML = `
      <div class="cc-app">
        <div class="cc-app-shell">
          ${topbar(title)}
          <main class="cc-main cc-page">${content}</main>
          ${bottomNav()}
        </div>
      </div>
    `;
    bindShell();
  }

  function bindShell() {
    const back = $("[data-back]");
    if (back) back.addEventListener("click", () => {
      if (state.route === "home") go("welcome");
      else if (state.route === "algoritmo") go("algoritmi");
      else go("home");
    });
    const theme = $("#theme-toggle");
    if (theme) theme.addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  function renderWelcome() {
    state.route = "welcome";
    root.innerHTML = `
      <main class="cc-welcome">
        <section class="cc-phone-stage" aria-labelledby="welcome-title">
          <div>
            <div class="cc-brand-mark">CC</div>
            <h1 class="cc-welcome-title" id="welcome-title">Control<br><span>Chaos</span></h1>
            <div class="cc-super">SuperEnalotto</div>
            <p class="cc-tagline">Algoritmi e statistiche per leggere il caos dei numeri</p>
          </div>
          <div class="cc-energy-orbit" aria-label="Numeri in evidenza">
            <div class="cc-core-ball">${escapeHtml(state.home?.consensus_top?.[0]?.number || 72)}</div>
            <div class="cc-float-ball cc-ball-gold">45</div>
            <div class="cc-float-ball cc-ball-cyan">13</div>
            <div class="cc-float-ball cc-ball-purple">26</div>
            <div class="cc-float-ball cc-ball-green">33</div>
            <div class="cc-float-ball cc-ball-red">81</div>
          </div>
          <div class="cc-benefits">
            <div class="cc-benefit"><strong>${state.algorithms.length || "--"}</strong>Algoritmi avanzati</div>
            <div class="cc-benefit"><strong>${state.home?.latest_draw?.seq || "--"}</strong>Ultimo concorso</div>
            <div class="cc-benefit"><strong>90</strong>Numeri analizzati</div>
          </div>
          <div style="width:100%">
            <button class="cc-primary-cta" type="button" data-enter>Entra nel caos</button>
            <p style="text-align:center;margin:14px 0 0"><a class="cc-link" href="#/info">Scopri come funziona</a></p>
          </div>
        </section>
      </main>
    `;
    $("[data-enter]").addEventListener("click", () => go("home"));
  }

  function renderHome() {
    const latest = state.latest || state.home?.latest_draw || {};
    const topNumbers = (state.home?.consensus_top || []).slice(0, 6);
    const latestNums = latest.nums || [];
    shell(`
      <section class="cc-card cc-jackpot">
        <div class="cc-kicker">Jackpot attuale</div>
        <div class="cc-jackpot-value">${formatJackpot()}<small>milioni EUR</small></div>
      </section>

      <section class="cc-card cc-card-pad cc-contest">
        <div>
          <div class="cc-kicker">Prossimo concorso</div>
          <h2 style="margin:.3rem 0 0">Dataset aggiornato</h2>
          <p style="margin:.3rem 0 0;color:var(--text-muted)">Ultimo concorso n. ${escapeHtml(latest.seq || "--")} - ${escapeHtml(latest.date || "--")}</p>
        </div>
        <div class="cc-countdown" aria-label="Sintesi dati">
          <div class="cc-count-unit"><strong>${state.algorithms.length || "--"}</strong><span>alg</span></div>
          <div class="cc-count-unit"><strong>${topNumbers.length || "--"}</strong><span>segnali</span></div>
        </div>
      </section>

      <div class="cc-grid cc-grid-2 cc-grid-desktop-3" style="margin-top:14px">
        <section class="cc-card cc-card-pad">
          <div class="cc-section-head" style="margin-top:0">
            <div><div class="cc-kicker">Convergenza degli algoritmi</div><h2>Consenso reale</h2></div>
            <div class="cc-metric-ring" style="--value:${Math.min(100, (topNumbers[0]?.support || 0) * 14)}"><strong>${topNumbers[0]?.support || "--"}</strong></div>
          </div>
          <p style="color:var(--text-muted)">Supporto massimo tra gli algoritmi disponibili. Non e una probabilita di vincita.</p>
        </section>
        <section class="cc-card cc-card-pad">
          <div class="cc-kicker">I 6 numeri piu segnalati</div>
          <div class="cc-number-row" style="margin-top:14px">${topNumbers.map((x, i) => ball(x.number, i % 2 ? "gold" : "")).join("")}</div>
        </section>
        <section class="cc-card cc-card-pad">
          <div class="cc-kicker">Ultima estrazione</div>
          <div class="cc-number-row" style="margin-top:14px">${latestNums.map((n, i) => ball(n, i === latestNums.length - 1 ? "gold" : "")).join("") || "<span>N/D</span>"}</div>
        </section>
      </div>

      <div class="cc-section-head">
        <div><h2>Accessi rapidi</h2><p>Funzioni storiche conservate come schermate dedicate.</p></div>
      </div>
      <div class="cc-grid cc-grid-2">
        ${quick("Storico estrazioni", "Archivio completo dei concorsi", "pages/storico-estrazioni/")}
        ${quick("Classifica", "Classifiche e confronto modelli", "/pages/algoritmi/")}
        ${quick("Proposte / Sestine", "Output aggregati dagli algoritmi", "pages/sestine-proposte/")}
        ${quick("Analisi statistiche", "Frequenze, ritardi e pattern", "pages/analisi-statistiche/")}
      </div>
    `, "Home");
  }

  function quick(title, text, href) {
    return `<a class="cc-card cc-card-pad" href="${href}"><div class="cc-kicker">Apri</div><h3 style="margin:.35rem 0">${escapeHtml(title)}</h3><p style="margin:0;color:var(--text-muted)">${escapeHtml(text)}</p></a>`;
  }

  function renderAlgorithms() {
    const groups = ["tutti", ...Array.from(new Set(state.algorithms.map(a => a.macroGroup).filter(Boolean)))];
    const list = state.filter === "tutti" ? state.algorithms : state.algorithms.filter(a => a.macroGroup === state.filter);
    shell(`
      <section class="cc-card cc-hero">
        <div>
          <div class="cc-kicker">${state.algorithms.length} algoritmi di calcolo</div>
          <h1>Algoritmi</h1>
          <p>Diverse intelligenze statistiche su un solo dataset storico. I valori mostrati sono classifiche interne, non probabilita.</p>
        </div>
        <div class="cc-cube">${state.algorithms.length}</div>
      </section>
      <div class="cc-filter-row" role="tablist">
        ${groups.map(g => `<button class="cc-chip ${state.filter === g ? "active" : ""}" type="button" data-filter="${escapeHtml(g)}">${labelGroup(g)}</button>`).join("")}
      </div>
      <div class="cc-grid">
        ${list.map((algo, i) => algorithmCard(algo, i)).join("") || `<div class="cc-card cc-empty">Nessun algoritmo in questa categoria.</div>`}
      </div>
    `, "Algoritmi");
    root.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter || "tutti";
      renderAlgorithms();
    }));
  }

  function labelGroup(group) {
    const map = { tutti: "Tutti", statistica: "Statistici", generativi: "AI / ML", ibrido: "Ibridi", matematico: "Matematici" };
    return map[group] || group.replace(/-/g, " ");
  }

  function algorithmCard(algo, index) {
    const ranking = Number.isFinite(algo.rankingValue) ? `${algo.rankingValue.toFixed(1)}` : "--";
    const scoreDelta = Number(algo.rankingScoreDeltaPct);
    const positionDelta = Number(algo.rankingPositionDelta);
    const tone = value => value > 0.049 ? "is-up" : value < -0.049 ? "is-down" : "is-flat";
    const signed = (value, decimals) => `${value >= 0 ? "+" : ""}${value.toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    const trends = Number.isFinite(scoreDelta) && Number.isFinite(positionDelta)
      ? `<span class="cc-trend-badges"><span class="cc-trend-badge ${tone(scoreDelta)}" title="Variazione del punteggio rispetto al concorso precedente">${signed(scoreDelta, 1)}%</span><span class="cc-trend-badge ${tone(positionDelta)}" title="Posti guadagnati o persi rispetto al concorso precedente">${signed(positionDelta, 0)} ${Math.abs(Math.round(positionDelta)) === 1 ? "posto" : "posti"}</span></span>`
      : "";
    return `
      <a class="cc-card cc-algo-card" href="#/algoritmi/${encodeURIComponent(algo.id)}">
        <div class="cc-algo-icon">${String(index + 1).padStart(2, "0")}</div>
        <div>
          <h3 class="cc-algo-title">${escapeHtml(algo.title || algo.id)}</h3>
          <p class="cc-algo-sub">${escapeHtml(algo.subtitle || algo.narrativeSummary || "")}</p>${trends}
        </div>
        <div class="cc-score">${ranking}<span>classifica</span></div>
      </a>
    `;
  }

  function renderAlgorithmDetail() {
    const algo = state.algorithms.find(a => a.id === state.slug);
    if (!algo) {
      shell(`<div class="cc-card cc-empty">Algoritmo non trovato.</div>`, "Dettaglio");
      return;
    }
    const top = (state.home?.consensus_top || []).filter(n => (n.algorithms || []).includes(algo.id)).slice(0, 6);
    const hits = algo.exactHits || {};
    shell(`
      <section class="cc-card cc-card-pad cc-detail-hero">
        <div class="cc-detail-top">
          <div class="cc-algo-icon" style="width:64px">${svg("M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z")}</div>
          <div>
            <span class="cc-pill">${escapeHtml(labelGroup(algo.macroGroup || "algoritmo"))}</span>
            <h1 style="margin:.45rem 0 .25rem">${escapeHtml(algo.title || algo.id)}</h1>
            <p style="margin:0;color:var(--text-muted)">${escapeHtml(algo.narrativeSummary || algo.subtitle || "")}</p>
          </div>
        </div>
      </section>
      <section class="cc-card cc-card-pad">
        <div class="cc-kicker">Metriche reali disponibili</div>
        <div class="cc-metrics" style="margin-top:12px">
          <div class="cc-mini-metric"><strong>${Number.isFinite(algo.rankingValue) ? algo.rankingValue.toFixed(1) : "--"}</strong><span>classifica</span></div>
          <div class="cc-mini-metric"><strong>${Number.isFinite(algo.rankingPosition) ? algo.rankingPosition : "--"}</strong><span>posizione</span></div>
          <div class="cc-mini-metric"><strong>${algo.rankProfile?.risk || "--"}</strong><span>rischio</span></div>
        </div>
      </section>
      <section class="cc-card cc-card-pad">
        <div class="cc-kicker">Numeri evidenziati da consenso</div>
        <div class="cc-number-row" style="margin-top:14px">${top.map((x, i) => ball(x.number, i % 2 ? "gold" : "")).join("") || "<p style='color:var(--text-muted)'>Nessun numero aggregato disponibile per questo algoritmo.</p>"}</div>
      </section>
      <section class="cc-card cc-card-pad">
        <div class="cc-kicker">Riscontri storici</div>
        <p style="color:var(--text-muted)">Distribuzione exact hit registrata nella classifica interna.</p>
        <div class="cc-number-row">${Object.keys(hits).map(k => `<span class="cc-pill">${k}: ${escapeHtml(hits[k])}</span>`).join("") || "<span>N/D</span>"}</div>
        <p style="margin:16px 0 0"><a class="cc-gold-cta" href="${normalizePath(algo.page)}">Vedi analisi completa</a></p>
      </section>
    `, "Dettaglio algoritmo");
  }

  function renderLaboratorio() {
    shell(`
      <section class="cc-card cc-hero">
        <div><div class="cc-kicker">Strumenti avanzati</div><h1>Laboratorio</h1><p>Area tecnica per dataset, schede, classifica, storico e analisi gia presenti nel sito.</p></div>
        <div class="cc-cube">LAB</div>
      </section>
      <div class="cc-grid cc-grid-2" style="margin-top:14px">
        ${quick("Laboratorio tecnico", "Strumenti e documentazione avanzata", "pages/laboratorio-tecnico/")}
        ${quick("Analisi statistiche", "Pattern, frequenze e anomalie", "pages/analisi-statistiche/")}
        ${quick("Storico estrazioni", "Archivio dati completo", "pages/storico-estrazioni/")}
        ${quick("Classifica", "Confronto sintetico dei modelli", "/pages/algoritmi/")}
      </div>
    `, "Laboratorio");
  }

  function renderInfo() {
    shell(`
      <section class="cc-card cc-hero">
        <div><div class="cc-kicker">Trasparenza</div><h1>Info</h1><p>Privacy, consenso, gioco responsabile, contatti e informazioni sul progetto.</p></div>
        <div class="cc-cube">i</div>
      </section>
      <div class="cc-grid cc-grid-2" style="margin-top:14px">
        ${quick("Privacy Policy", "Trattamento dei dati e diritti", "pages/privacy-policy/")}
        ${quick("Cookie Policy", "Cookie, consenso e preferenze", "pages/cookie-policy/")}
        ${quick("Gestione consenso", "Impostazioni e policy consenso", "pages/consenso/")}
        ${quick("Gioco responsabile", "Disclaimer e assenza di garanzie", "pages/disclaimer/")}
        ${quick("Chi siamo e contatti", "Informazioni sul progetto", "pages/contatti-chi-siamo/")}
        ${quick("Termini di servizio", "Regole generali del sito", "pages/termini-servizio/")}
      </div>
    `, "Info");
  }

  function render() {
    const parsed = readRoute();
    state.route = parsed.route;
    state.slug = parsed.slug;
    if (state.route === "oracle") return window.location.assign("pages/oracle/");
    if (state.route === "privacy") return window.location.assign("pages/privacy-policy/");
    if (state.route === "welcome") return renderWelcome();
    if (state.route === "home") return renderHome();
    if (state.route === "algoritmi") return window.location.assign("/pages/algoritmi/");
    if (state.route === "algoritmo") return renderAlgorithmDetail();
    if (state.route === "laboratorio") return renderLaboratorio();
    if (state.route === "info") return renderInfo();
    renderHome();
  }

  async function init() {
    initTheme();
    const [cards, home, jackpot] = await Promise.all([
      json("data/cards-index.json", []),
      json("data/precomputed/home-summary.json", {}),
      json("data/jackpot.json", {})
    ]);
    state.cards = Array.isArray(cards) ? cards : [];
    state.algorithms = state.cards
      .filter(card => card.type === "ALGORITMI" && card.isActive !== false && card.view !== false)
      .sort((a, b) => (a.rankingPosition || 999) - (b.rankingPosition || 999));
    state.home = home || {};
    state.jackpot = jackpot || {};
    state.latest = state.home?.latest_draw || {};
    window.addEventListener("hashchange", render);
    render();
  }

  init();
})();
