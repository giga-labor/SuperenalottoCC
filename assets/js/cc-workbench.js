(function () {
  'use strict';
  var body = document.body;
  if (!body) return;
  var page = String(body.dataset.pageId || 'pagina');
  var titles = {
    'laboratorio-tecnico': 'Laboratorio',
    'proposte': 'Sestine consigliate',
    'storico': 'Storico estrazioni',
    'concorso': 'Dettaglio concorso',
    'cax': 'Mercato algoritmi',
    'cnx': 'Mercato numeri',
    'mercati': 'Mercati',
    'community': 'Community',
    'consenso': 'Consenso numerico',
    'oracle': 'Oracolo del Chaos',
    'cosmos': 'Oracle Cosmos',
    'contatti-chi-siamo': 'Contatti',
    'cookie-policy': 'Cookie policy',
    'disclaimer': 'Disclaimer',
    'policy-consenso': 'Policy e consenso',
    'privacy-policy': 'Privacy policy',
    'termini-servizio': 'Termini di servizio',
    '404': 'Pagina non trovata'
  };
  if (!titles[page]) return;
  document.documentElement.classList.add('cc-algorithm-migrated', 'cc-workbench-migrated');
  if (['contatti-chi-siamo','cookie-policy','disclaimer','policy-consenso','privacy-policy','termini-servizio'].indexOf(page) >= 0) document.documentElement.classList.add('cc-info-page');
  var icon = function (path) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '"/></svg>'; };
  var icons = {
    back: icon('m15 18-6-6 6-6'), home: icon('m3 11 9-8 9 8v10h-6v-6H9v6H3Z'),
    dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>',
    flask: icon('M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8'),
    oracle: icon('m12 3 8 4.5v9L12 21l-8-4.5v-9Zm-4 6 4-2 4 2-4 2Zm0 0v5l4 2 4-2V9'),
    privacy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.8 8.3 7 10 4.2-1.7 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>'
  };
  var header = document.createElement('header');
  header.className = 'cca-topbar';
  header.innerHTML = '<button class="cca-icon-btn" type="button" aria-label="Indietro" data-cc-back>' + icons.back + '</button><div class="cca-titlebar">' + titles[page] + '</div><button class="cca-icon-btn is-theme-disabled" type="button" aria-label="Cambio tema (temporaneamente disabilitato)" data-cca-theme disabled>' + icons.sun + '</button>';
  body.prepend(header);
  var items = [['Home','/#/home','home'],['Algoritmi','/pages/algoritmi/','dots'],['Laboratorio','/#/laboratorio','flask'],['Oracolo','/pages/oracle/','oracle'],['Privacy','/pages/privacy-policy/','privacy']];
  var nav = document.createElement('nav');
  nav.className = 'cca-bottom-nav'; nav.setAttribute('aria-label','Navigazione principale');
  nav.innerHTML = items.map(function (item) {
    var labPages = ['laboratorio-tecnico','proposte','storico','concorso','cax','cnx','mercati','consenso'];
    var profilePages = ['community','contatti-chi-siamo','cookie-policy','disclaimer','policy-consenso','privacy-policy','termini-servizio'];
    var active = labPages.indexOf(page) >= 0 ? 'laboratorio' : profilePages.indexOf(page) >= 0 ? 'privacy' : page;
    return '<a class="cca-nav-item' + (item[2] === active ? ' is-active' : '') + '" href="' + item[1] + '">' + icons[item[2]] + '<span>' + item[0] + '</span></a>';
  }).join('');
  body.append(nav);
  document.documentElement.classList.add('cc-ui-ready');
  function finalizeWorkbenchLayout() {
    var main = document.querySelector('main');
    if (main) {
      main.style.setProperty('width', 'min(100% - 24px, 980px)', 'important');
      main.style.setProperty('max-width', '980px', 'important');
      main.style.setProperty('margin-left', 'auto', 'important');
      main.style.setProperty('margin-right', 'auto', 'important');
      main.style.setProperty('padding-top', '16px', 'important');
      main.style.setProperty('padding-bottom', '30px', 'important');
    }
    var box = main && main.querySelector(':scope > .content-box');
    if (box) {
      box.style.setProperty('width', '100%', 'important');
      box.style.setProperty('padding', '0', 'important');
      box.style.setProperty('background', 'transparent', 'important');
      box.style.setProperty('border', '0', 'important');
      box.style.setProperty('box-shadow', 'none', 'important');
    }
  }
  finalizeWorkbenchLayout();
  window.addEventListener('load', function () { finalizeWorkbenchLayout(); });
  header.querySelector('[data-cc-back]').addEventListener('click', function () { if (history.length > 1) history.back(); else location.href = '/'; });
  header.querySelector('[data-cca-theme]').addEventListener('click', function () { var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = next; try { localStorage.setItem('cc-app-theme', next); localStorage.setItem('cc-theme', next); } catch (_) {} });
  document.documentElement.dataset.theme = 'dark'; // tema chiaro temporaneamente disabilitato
})();
