(function () {
  'use strict';

  var body = document.body;
  if (!body || body.dataset.pageId !== 'oracle-new') return;
  document.documentElement.classList.add('cc-algorithm-migrated', 'cc-oracle-migrated');

  var icons = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z"/></svg>',
    dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>',
    flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/></svg>',
    oracle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m8 9 4-2 4 2-4 2Zm0 0v5l4 2 4-2V9"/></svg>',
    privacy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.8 8.3 7 10 4.2-1.7 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>'
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function highlightedSpeech(text, numbers) {
    var safe = esc(text);
    var choices = (numbers || []).map(Number).sort(function (a, b) { return b - a; }).join('|');
    return choices ? safe.replace(new RegExp('\\b(' + choices + ')\\b', 'g'), '<strong>$1</strong>') : safe;
  }

  function navigation() {
    var items = [
      ['Home', '/#/home', icons.home, 'home'],
      ['Algoritmi', '/pages/algoritmi/', icons.dots, 'algoritmi'],
      ['Laboratorio', '/#/laboratorio', icons.flask, 'laboratorio'],
      ['Oracolo', '/pages/oracle/', icons.oracle, 'oracle'],
      ['Privacy', '/pages/privacy-policy/', icons.privacy, 'privacy']
    ];
    return '<nav class="cca-bottom-nav" aria-label="Navigazione principale">' + items.map(function (item) {
      return '<a class="cca-nav-item' + (item[3] === 'oracle' ? ' is-active' : '') + '" href="' + item[1] + '">' + item[2] + '<span>' + item[0] + '</span></a>';
    }).join('') + '</nav>';
  }

  function setTheme() {
    var saved = '';
    try { saved = localStorage.getItem('cc-app-theme') || localStorage.getItem('cc-theme') || ''; } catch (_) {}
    document.documentElement.dataset.theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  function startWormhole() {
    var script = document.createElement('script');
    script.src = '../../assets/js/oracle-wormhole.js?v=02.00.011';
    script.defer = true;
    body.appendChild(script);
  }

  function render(reading) {
    body.innerHTML = '<div class="cca-app">' +
      '<header class="cca-topbar"><button class="cca-icon-btn" type="button" data-back aria-label="Indietro">' + icons.back + '</button><div class="cca-titlebar">Chaos <span>Oracolo</span></div><button class="cca-icon-btn" type="button" data-theme aria-label="Cambia tema">' + icons.sun + '</button></header>' +
      '<main class="cco-page"><section class="cco-vision"><div class="cco-portal oracle-wormhole" aria-hidden="true"><canvas class="oracle-wormhole__canvas" data-wormhole-canvas width="1280" height="720"></canvas><div class="oracle-wormhole__vignette"></div></div><blockquote>' + highlightedSpeech(reading.oracle_speech, reading.promoted_numbers) + '</blockquote></section></main>' +
      navigation() + '</div>';
    document.querySelector('[data-back]').addEventListener('click', function () {
      setTheme();
      if (history.length > 1) history.back();
      else location.assign('/#/home');
    });
    document.querySelector('[data-theme]').addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('cc-app-theme', next); localStorage.setItem('cc-theme', next); } catch (_) {}
    });
    startWormhole();
    document.documentElement.classList.add('cc-ui-ready');
  }

  setTheme();
  fetch('../../data/oracle-reading.json', { cache: 'no-store' })
    .then(function (response) { if (!response.ok) throw new Error('reading'); return response.json(); })
    .then(render)
    .catch(function () {
      body.innerHTML = '<main class="cco-error"><p>Il velo resta chiuso.</p></main>';
      document.documentElement.classList.add('cc-ui-ready');
    });
})();
