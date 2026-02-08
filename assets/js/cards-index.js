(() => {
  const BASE = window.CC_BASE || createBase();
  if (!window.CC_BASE) {
    window.CC_BASE = BASE;
  }

  const CARDS_INDEX = {
    async load(cardsIndexPath) {
      const manifestPath = resolveWithBase(resolveManifestPath(cardsIndexPath));
      const manifest = await fetchJson(manifestPath, { cache: 'no-store' }, true);
      if (Array.isArray(manifest) && manifest.length) {
        return buildFromManifest(manifest);
      }
      const fallback = await fetchJson(resolveWithBase(cardsIndexPath), { cache: 'no-store' }, false);
      if (!Array.isArray(fallback)) return [];
      return fallback
        .map((card) => normalizeCard(card))
        .filter(Boolean);
    }
  };

  window.CARDS_INDEX = CARDS_INDEX;

  async function buildFromManifest(entries) {
    const cards = await Promise.all(
      entries.map((entry) => fetchCard(entry))
    );
    return cards
      .filter(Boolean)
      .sort((a, b) => {
        const activeA = a.isActive !== false;
        const activeB = b.isActive !== false;
        if (activeA !== activeB) return activeA ? -1 : 1;
        return String(a.title || '').toLowerCase().localeCompare(String(b.title || '').toLowerCase());
      });
  }

  async function fetchCard(entry) {
    if (typeof entry !== 'string') return null;
    const normalizedEntry = normalizePath(entry);
    const cardUrl = resolveWithBase(normalizedEntry);
    const data = await fetchJson(cardUrl, { cache: 'no-store' }, true);
    if (!data || typeof data !== 'object') return null;

    const cardBase = normalizedEntry.replace(/card\.json$/i, '');
    const id = data.id || inferId(cardBase);
    return normalizeCard(data, { id, cardBase });
  }

  function normalizeCard(data, defaults = {}) {
    if (!data || typeof data !== 'object') return null;
    const card = { ...data };

    const id = card.id || defaults.id || inferId(card.cardBase || defaults.cardBase || '');
    if (!card.id) card.id = id;
    if (!card.cardBase && defaults.cardBase) card.cardBase = defaults.cardBase;
    if (!card.page) card.page = card.cardBase || defaults.cardBase || '';
    if (!card.image) card.image = 'img.webp';
    if (card.isActive === undefined) card.isActive = false;
    if (!card.title) card.title = card.id || id;
    if (card.no_data_show === undefined) card.no_data_show = true;

    return card;
  }

  function resolveManifestPath(cardsIndexPath) {
    if (typeof cardsIndexPath !== 'string' || !cardsIndexPath.trim()) {
      return 'data/modules-manifest.json';
    }
    return cardsIndexPath;
  }

  function inferId(cardBase) {
    const trimmed = cardBase.replace(/\/+$/, '');
    const parts = trimmed.split('/');
    return parts[parts.length - 1] || '';
  }

  function normalizePath(value) {
    return String(value || '').replace(/\\/g, '/');
  }

  function resolveWithBase(path) {
    if (!path) return path;
    const value = String(path);
    if (value.startsWith('#') || /^https?:\/\//i.test(value) || value.startsWith('file:')) {
      return value;
    }
    const trimmed = value.startsWith('/') ? value.slice(1) : value.replace(/^\.\//, '');
    return new URL(trimmed, BASE.url).toString();
  }

  function createBase() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const marker = '/pages/';
    const index = path.toLowerCase().indexOf(marker);
    const basePath = index !== -1
      ? path.slice(0, index + 1)
      : path.replace(/\/[^\/]*$/, '/');
    const baseUrl = new URL(basePath, window.location.href);
    return {
      path: basePath,
      url: baseUrl,
      resolve: (value) => resolveWithBase(value)
    };
  }

  async function fetchJson(url, options, silent) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (silent) return null;
        throw new Error(`status ${response.status}`);
      }
      return response.json();
    } catch (error) {
      if (silent) return null;
      throw error;
    }
  }
})();
