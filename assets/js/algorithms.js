const cardsIndexPath = 'data/modules-manifest.json';
const spotlightCardsIndexPath = 'data/algorithms-spotlight/modules-manifest.json';

document.addEventListener('DOMContentLoaded', () => {
  enableCardDepthForAll();
  const area = document.querySelector('[data-algorithms-area]');
  const counter = document.querySelector('[data-algorithms-count]');
  const spotlightArea = document.querySelector('[data-spotlight-cards]');
  if (spotlightArea) {
    loadSpotlightCards(spotlightArea);
  }
  if (!area) return;
  loadAlgorithms(area, counter);
});

async function loadSpotlightCards(area) {
  try {
    const cards = await loadCardsIndex(spotlightCardsIndexPath);
    const spotlight = cards
      .filter((card) => card.isActive !== false)
      .sort(sortBySpotlightType)
      .slice(0, 3);
    await renderSpotlightCards(area, spotlight);
  } catch (error) {
    area.innerHTML = '<div class="rounded-2xl border border-dashed border-white/15 bg-transparent p-5 text-sm text-ash">Impossibile caricare le tipologie.</div>';
  }
}

async function loadAlgorithms(area, counter) {
  try {
    const cards = await loadCardsIndex(cardsIndexPath);
    const algorithms = cards.filter((card) => card.id && card.id !== 'storico-estrazioni');
    const grouped = groupByMacro(algorithms);
    await renderAlgorithms(area, grouped);
    if (counter) {
      counter.textContent = `${algorithms.length} algoritmi`;
    }
  } catch (error) {
    area.innerHTML = '<div class="rounded-2xl border border-dashed border-white/15 bg-midnight/70 p-5 text-sm text-ash">Impossibile caricare gli algoritmi.</div>';
    if (counter) counter.textContent = '0 algoritmi';
  }
}

async function loadCardsIndex(path) {
  if (window.CARDS_INDEX && typeof window.CARDS_INDEX.load === 'function') {
    return window.CARDS_INDEX.load(path);
  }
  const resolved = resolveWithBase(path);
  const response = await fetch(resolved, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`status ${response.status}`);
  }
  return response.json();
}

function resolveWithBase(path) {
  if (!path) return path;
  const value = String(path);
  if (value.startsWith('#') || /^https?:\/\//i.test(value) || value.startsWith('file:')) {
    return value;
  }
  const base = window.CC_BASE?.url;
  if (!base) return value;
  const trimmed = value.startsWith('/') ? value.slice(1) : value.replace(/^\.\//, '');
  return new URL(trimmed, base).toString();
}

async function renderAlgorithms(area, grouped) {
  area.innerHTML = '';
  const gridObservers = [];
  for (const group of grouped) {
    const section = document.createElement('section');
    section.className = 'mt-10';
    section.id = `group-${sanitizeId(group.key)}`;
    section.style.scrollMarginTop = '140px';
    section.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neon/30 bg-neon/5 px-4 py-3 shadow-[0_0_18px_rgba(255,217,102,0.18)]">
        <div class="flex items-center gap-3">
          <span class="rounded-full border border-neon/40 bg-neon/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-neon">Macro area</span>
          <h2 class="text-xl font-semibold text-white">${group.label}</h2>
        </div>
        <p class="text-xs uppercase tracking-[0.2em] text-ash">Totale algoritmi: ${group.items.length}</p>
      </div>
      <div class="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" data-group-grid></div>
    `;

    const grid = section.querySelector('[data-group-grid]');
    const cards = await Promise.all(
      group.items.map((algorithm) => createAlgorithmCard(algorithm, { forceActive: false }))
    );
    cards.forEach((card) => grid.appendChild(card));

    area.appendChild(section);

    if (grid) bindAlgorithmGridLayout(grid, gridObservers);
  }

  enableCardDepthForAll();
  scrollToGroupHash();
}

async function renderSpotlightCards(area, cards) {
  area.innerHTML = '';
  const gridObservers = [];
  if (!Array.isArray(cards) || cards.length === 0) {
    area.innerHTML = '<div class="rounded-2xl border border-dashed border-white/15 bg-transparent p-5 text-sm text-ash">Nessuna tipologia attiva disponibile.</div>';
    return;
  }

  const visibleCards = cards.slice(0, 3);
  const builtCards = await Promise.all(
    visibleCards.map((cardData) => createAlgorithmCard(cardData, { forceActive: false }))
  );
  builtCards.forEach((card) => area.appendChild(card));

  bindAlgorithmGridLayout(area, gridObservers);

  enableCardDepthForAll();
}

async function createAlgorithmCard(algorithm, options = {}) {
  if (window.CARDS && typeof window.CARDS.buildAlgorithmCard === 'function') {
    return window.CARDS.buildAlgorithmCard(algorithm, options);
  }
  const fallback = document.createElement('a');
  fallback.className = 'card-3d algorithm-card is-active';
  fallback.href = resolveWithBase(algorithm.page || '#') || '#';
  fallback.textContent = algorithm.title || 'Algoritmo';
  return fallback;
}

function enableCardDepthForAll() {
  if (window.CARDS && typeof window.CARDS.enableDepth === 'function') {
    window.CARDS.enableDepth(document);
  }
}

function sanitizeId(value) {
  return String(value || 'algoritmo')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sortBySpotlightType(a, b) {
  const order = ['statistici', 'neurale', 'ibrido'];
  const keyA = String(a?.macroGroup || '').toLowerCase();
  const keyB = String(b?.macroGroup || '').toLowerCase();
  const indexA = order.indexOf(keyA);
  const indexB = order.indexOf(keyB);
  if (indexA !== -1 || indexB !== -1) {
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }
  return String(a?.title || '').localeCompare(String(b?.title || ''));
}

function bindAlgorithmGridLayout(grid, observersStore) {
  const getCardMin = () => {
    if (window.CARDS && typeof window.CARDS.getCardSizing === 'function') {
      const sizing = window.CARDS.getCardSizing();
      if (Number.isFinite(sizing?.minPx)) return sizing.minPx;
    }
    return Math.max(1, Math.round(grid.clientWidth || 1));
  };
  const getGap = () => {
    const styles = getComputedStyle(grid);
    const rawGap = styles.columnGap || styles.gap || '0';
    const parsed = Number.parseFloat(rawGap);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const updateColumns = () => {
    const width = grid.clientWidth || grid.getBoundingClientRect().width || 0;
    if (!width) return;
    const cardMin = getCardMin();
    const gap = getGap();
    const columns = Math.max(1, Math.floor((width + gap) / (cardMin + gap)));
    grid.style.setProperty('display', 'grid');
    grid.style.setProperty('width', '100%');
    grid.style.setProperty('grid-template-columns', `repeat(${columns}, minmax(0, 1fr))`, 'important');
  };

  updateColumns();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => updateColumns());
    observer.observe(grid);
    if (Array.isArray(observersStore)) observersStore.push(observer);
  } else {
    window.addEventListener('resize', updateColumns);
  }
}

function scrollToGroupHash() {
  const hash = String(window.location.hash || '').trim();
  if (!hash.startsWith('#group-')) return;
  const fragment = hash.slice(1);
  const parts = fragment.split('&').filter(Boolean);
  const targetId = parts[0];
  const offsetPart = parts.find((part) => part.toLowerCase().startsWith('offset='));
  const offsetValue = offsetPart ? Number.parseInt(offsetPart.split('=')[1], 10) : 0;
  const offset = Number.isFinite(offsetValue) ? offsetValue : 0;

  const tryScroll = (attemptsLeft) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (offset !== 0) {
        window.setTimeout(() => {
          window.scrollBy({ top: offset, left: 0, behavior: 'auto' });
        }, 280);
      }
      return;
    }
    if (attemptsLeft > 0) {
      window.setTimeout(() => tryScroll(attemptsLeft - 1), 50);
    }
  };

  tryScroll(20);
}

function sortByTitle(a, b) {
  const activeA = a.isActive !== false;
  const activeB = b.isActive !== false;
  if (activeA !== activeB) {
    return activeA ? -1 : 1;
  }
  const nameA = String(a.title || '').toLowerCase();
  const nameB = String(b.title || '').toLowerCase();
  return nameA.localeCompare(nameB);
}

function groupByMacro(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = (item.macroGroup || 'algoritmo').toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  });

  const order = ['statistici', 'logici', 'statistica', 'neurale', 'ibrido', 'custom', 'algoritmo', 'storico'];
  const labels = {
    statistici: 'Statistici',
    logici: 'Logici',
    statistica: 'Statistici / Logici',
    neurale: 'Reti neurali',
    ibrido: 'Ibridi / Custom',
    custom: 'Custom',
    algoritmo: 'Algoritmi',
    storico: 'Storico'
  };

  const sorted = Array.from(groups.entries()).map(([key, list]) => ({
    key,
    label: labels[key] || key.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()),
    items: list.sort(sortByTitle)
  }));

  sorted.sort((a, b) => {
    const ia = order.indexOf(a.key);
    const ib = order.indexOf(b.key);
    if (ia === -1 && ib === -1) return a.label.localeCompare(b.label);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return sorted;
}

