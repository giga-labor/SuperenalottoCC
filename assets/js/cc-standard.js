(function () {
  "use strict";

  if (window.__CC_STANDARD_READY__) return;
  window.__CC_STANDARD_READY__ = true;

  var doc = document;
  var html = doc.documentElement;

  function loadTheme() {
    var saved = null;
    try { saved = localStorage.getItem("cc-app-theme") || localStorage.getItem("cc-theme"); } catch (_err) {}
    if (saved !== "light" && saved !== "dark") {
      saved = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    html.setAttribute("data-theme", saved);
  }

  function setTheme(theme) {
    var next = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cc-app-theme", next);
      localStorage.setItem("cc-theme", next);
    } catch (_err) {}
  }

  function pageKind() {
    var path = location.pathname.toLowerCase();
    if (path.indexOf("/pages/algoritmi/algs/") >= 0) return "algorithm-detail";
    if (path.indexOf("/pages/algoritmi/") >= 0) return "algorithms-list";
    if (/privacy|cookie|consenso|disclaimer|contatti|termini|policy/.test(path)) return "legal-info";
    if (path.indexOf("/oracle") >= 0) return "oracle";
    if (path.indexOf("/laboratorio") >= 0 || path.indexOf("/analisi-statistiche") >= 0 || path.indexOf("/storico-estrazioni") >= 0 || path.indexOf("/ranking") >= 0 || path.indexOf("/sestine-proposte") >= 0) return "analysis-tool";
    return "secondary-tool";
  }

  function bindExistingThemeControls() {
    doc.querySelectorAll("[data-cc-theme]").forEach(function (button) {
      if (button.__ccThemeBound) return;
      button.__ccThemeBound = true;
      button.addEventListener("click", function () {
        setTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    });
  }

  function apply() {
    html.classList.add("cc-standardized");
    html.setAttribute("data-page-kind", pageKind());
    if (doc.body) doc.body.classList.add("cc-standard-body");
    bindExistingThemeControls();
  }

  loadTheme();
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  window.CCStandard = {
    setTheme: setTheme,
    getTheme: function () {
      return html.getAttribute("data-theme") || "dark";
    }
  };
})();
