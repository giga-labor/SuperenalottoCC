(function () {
  'use strict';

  var icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z"/></svg>',
    algorithms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="6" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>',
    laboratory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/></svg>',
    oracle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m8 9 4-2 4 2-4 2Zm0 0v5l4 2 4-2V9"/></svg>',
    privacy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.8 8.3 7 10 4.2-1.7 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>'
  };

  var items = [
    ['Home', '/#/home', 'home'],
    ['Algoritmi', '/pages/algoritmi/', 'algorithms'],
    ['Laboratorio', '/#/laboratorio', 'laboratory'],
    ['Oracolo', '/pages/oracle/', 'oracle'],
    ['Privacy', '/pages/privacy-policy/', 'privacy']
  ];

  function storedTheme() {
    var theme = '';
    try { theme = localStorage.getItem('cc-app-theme') || localStorage.getItem('cc-theme') || ''; } catch (_) {}
    return theme === 'light' || theme === 'dark' ? theme : '';
  }

  function restoreTheme() {
    var requested = '';
    try { requested = new URL(location.href).searchParams.get('ccTheme') || ''; } catch (_) {}
    var theme = requested === 'light' || requested === 'dark' ? requested : storedTheme();
    if (!theme) return;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('cc-app-theme', theme);
      localStorage.setItem('cc-theme', theme);
    } catch (_) {}
    if (requested) {
      try {
        var clean = new URL(location.href);
        clean.searchParams.delete('ccTheme');
        history.replaceState(history.state, '', clean.pathname + clean.search + clean.hash);
      } catch (_) {}
    }
  }

  function activeItem() {
    var path = String(location.pathname || '').toLowerCase();
    var hash = String(location.hash || '').toLowerCase();
    if (path.indexOf('/pages/algoritmi/') >= 0) return 'algorithms';
    if (path.indexOf('/pages/oracle/') >= 0) return 'oracle';
    if (/privacy|cookie|consenso|disclaimer|contatti|termini|policy/.test(path)) return 'privacy';
    if (hash.indexOf('laboratorio') >= 0 || /laboratorio|storico-estrazioni|sestine-proposte|concorso|cax|cnx|mercati/.test(path)) return 'laboratory';
    return 'home';
  }

  function normalizeNavigation(nav) {
    if (!(nav instanceof HTMLElement) || nav.dataset.ccShellNormalized === 'true') return;
    var active = activeItem();
    nav.className = 'cc-site-nav';
    nav.innerHTML = items.map(function (item) {
      var selected = item[2] === active;
      return '<a class="cc-site-nav__item' + (selected ? ' is-active' : '') + '" href="' + item[1] + '" aria-label="' + item[0] + '"' + (selected ? ' aria-current="page"' : '') + '>' + icons[item[2]] + '<span>' + item[0] + '</span></a>';
    }).join('');
    nav.dataset.ccShellNormalized = 'true';
  }

  function normalizeTopbar(bar) {
    if (!(bar instanceof HTMLElement) || bar.dataset.ccShellFixed === 'true') return;
    var spacer = document.createElement('div');
    spacer.className = 'cc-site-topbar-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    bar.classList.add('cc-site-topbar');
    bar.insertAdjacentElement('afterend', spacer);
    bar.dataset.ccShellFixed = 'true';
    var updateSpacer = function () {
      spacer.style.height = Math.ceil(bar.getBoundingClientRect().height) + 'px';
    };
    updateSpacer();
    if ('ResizeObserver' in window) new ResizeObserver(updateSpacer).observe(bar);
  }

  function replaceTerm(value) {
    return String(value || '').replace(/\branking\b/gi, function (word) {
      return word.charAt(0) === word.charAt(0).toUpperCase() ? 'Classifica' : 'classifica';
    });
  }

  function normalizeTerms(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      var parent = root.parentElement;
      if (!parent || /^(SCRIPT|STYLE|CODE|PRE)$/i.test(parent.tagName)) return;
      var nextText = replaceTerm(root.nodeValue);
      if (nextText !== root.nodeValue) root.nodeValue = nextText;
      return;
    }
    if (!(root instanceof Element || root instanceof Document)) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(normalizeTerms);
    if (root instanceof Element) {
      ['aria-label', 'title', 'placeholder'].forEach(function (name) {
        if (!root.hasAttribute(name)) return;
        root.setAttribute(name, replaceTerm(root.getAttribute(name)));
      });
      root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(function (element) {
        ['aria-label', 'title', 'placeholder'].forEach(function (name) {
          if (element.hasAttribute(name)) element.setAttribute(name, replaceTerm(element.getAttribute(name)));
        });
      });
    }
    var nextTitle = replaceTerm(document.title);
    if (nextTitle !== document.title) document.title = nextTitle;
  }

  function apply(root) {
    document.querySelectorAll('.cc-bottom-nav,.cca-bottom-nav,.cc-site-nav').forEach(normalizeNavigation);
    document.querySelectorAll('.cc-topbar,.cca-topbar').forEach(normalizeTopbar);
    normalizeTerms(root || document.body);
  }

  function start() {
    restoreTheme();
    apply(document.body);
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') normalizeTerms(mutation.target);
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) apply(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    window.addEventListener('pageshow', restoreTheme);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
