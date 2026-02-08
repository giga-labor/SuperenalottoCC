const CARDS = {
  CARD_SIZE: Object.freeze({
    minPx: 180,
    maxPx: 186,
    fluidWidth: '22vw'
  }),

  _cardSizingReady: false,

  ensureCardSizing() {
    if (this._cardSizingReady) return;
    this._cardSizingReady = true;
    const root = document?.documentElement;
    if (!root) return;
    root.style.setProperty('--card-min', `${this.CARD_SIZE.minPx}px`);
    root.style.setProperty('--card-max', `${this.CARD_SIZE.maxPx}px`);
  },

  getCardSizing() {
    this.ensureCardSizing();
    const minPx = this.CARD_SIZE.minPx;
    const maxPx = this.CARD_SIZE.maxPx;
    const fluidWidth = this.CARD_SIZE.fluidWidth;
    return {
      minPx,
      maxPx,
      fluidWidth,
      min: `${minPx}px`,
      max: `${maxPx}px`,
      clamp: `clamp(${minPx}px, ${fluidWidth}, ${maxPx}px)`
    };
  },

  applyFeatures(area) {
    const cards = area.querySelectorAll('[data-card-id]');
    cards.forEach((card) => {
      const features = (card.dataset.features || '').split(',').map((item) => item.trim()).filter(Boolean);
      if (features.includes('draws-latest')) {
        this.applyDrawsLatest(card);
      }
    });
  },

  async buildAlgorithmCard(algorithm, options = {}) {
    this.ensureCardSizing();
    const size = this.getCardSizing();
    const card = document.createElement('a');
    const imageUrl = this.resolveCardImage(algorithm);
    const imageFallbackUrl = this.resolveCardBackupImage();
    const active = options.forceActive ? true : (algorithm.isActive !== false);
    const noDataShow = algorithm?.no_data_show !== false;
    const typeLabel = this.resolveCardType(algorithm);
    const baseDescription = algorithm.subtitle || algorithm.narrativeSummary || 'Descrizione in arrivo';
    const usesOutData = Boolean(algorithm?.usesOutData === true);
    const [metricsRows, historicalRows, latestArchiveSeq] = usesOutData
      ? await Promise.all([
        this.readCsvRows(this.resolveMetricsUrl(algorithm)),
        this.readCsvRows(this.resolveHistoricalUrl(algorithm)),
        this.getLatestArchiveSeq()
      ])
      : [null, null, null];

    const latestHistoricalDate = this.extractLatestHistoricalDate(historicalRows || []);
    const dateLabel = latestHistoricalDate || 'NO DATA';
    const noDataDate = !latestHistoricalDate;
    const hideNoDataDate = noDataDate && !noDataShow;
    const info = this.extractProposalInfo(metricsRows || []);
    const description = baseDescription;
    const archiveAvailable = Array.isArray(historicalRows) && historicalRows.length > 0 && !noDataDate;
    const proposalNumbers = this.normalizeProposalNumbers(info.proposal);
    const proposalHas6 = proposalNumbers.length === 6;
    const nextSeqValid = Number.isFinite(info.nextSeq);
    const isUpdated = Number.isFinite(latestArchiveSeq) && nextSeqValid && info.nextSeq > latestArchiveSeq;

    let proposalText = '(NO DATA)';
    let proposalClass = 'text-rose-300 border-rose-300/55 bg-rose-300/8';
    if (!archiveAvailable) {
      proposalText = '(NO DATA)';
    } else if (proposalHas6 && nextSeqValid && Number.isFinite(latestArchiveSeq)) {
      if (isUpdated) {
        proposalText = proposalNumbers.join(' ');
        proposalClass = 'text-black border-lime-100/95 bg-lime-300 shadow-[0_0_18px_rgba(163,255,190,0.95),0_0_34px_rgba(134,239,172,0.82),0_0_56px_rgba(74,222,128,0.52),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-2px_6px_rgba(22,101,52,0.35)]';
      } else {
        proposalText = '(NO UPD)';
        proposalClass = 'text-amber-300 border-amber-300/60 bg-amber-300/10 shadow-[0_0_12px_rgba(251,191,36,0.22)]';
      }
    } else {
      proposalText = '(NO DATA)';
    }
    const isNoDataProposal = proposalText === '(NO DATA)';
    const hideNoDataProposal = isNoDataProposal && !noDataShow;

    card.className = `card-3d algorithm-card group relative flex min-h-[330px] flex-col overflow-hidden rounded-2xl border border-white/10 transition hover:border-neon/60${active ? ' is-active shadow-[0_0_22px_rgba(255,217,102,0.22)]' : ' is-inactive bg-black/70 border-white/5'}`;
    card.style.minWidth = size.min;
    card.style.maxWidth = size.max;
    card.style.width = size.clamp;
    card.href = active ? (resolveWithBase(algorithm.page || '#') || '#') : '#';
    if (!active) {
      card.setAttribute('aria-disabled', 'true');
      card.addEventListener('click', (event) => event.preventDefault());
    }

    card.innerHTML = `
      ${active ? '' : '<div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/45"><span class="select-none whitespace-nowrap text-[clamp(0.68rem,2.1vw,1.9rem)] font-semibold uppercase tracking-[clamp(0.16em,0.8vw,0.5em)] text-neon/60 rotate-[-60deg] [text-shadow:0_0_18px_rgba(255,217,102,0.65),0_0_32px_rgba(0,0,0,0.85)]">coming soon</span></div>'}
      <div class="algorithm-card__media algorithm-card__media--third relative overflow-hidden">
        <img class="h-full w-full object-cover" src="${imageUrl}" alt="Anteprima di ${algorithm.title}">
        <span class="card-type-badge">${typeLabel}</span>
        <span class="card-date-badge${noDataDate && !hideNoDataDate ? ' is-no-data' : ''}${hideNoDataDate ? ' hidden' : ''}" data-date-badge>${hideNoDataDate ? '' : dateLabel}</span>
      </div>
      <div class="algorithm-card__body flex flex-1 flex-col gap-1.5 px-4 pt-2.5 pb-10">
        <span class="text-[10px] uppercase tracking-[0.22em] text-neon/90">${algorithm.macroGroup || 'algoritmo'}</span>
        <h3 class="text-[0.98rem] font-semibold leading-tight ${active ? 'group-hover:text-neon' : ''}">${algorithm.title || 'Algoritmo'}</h3>
        <p class="algorithm-card__desc text-[0.74rem] leading-[1.25] text-ash">${description}</p>
      </div>
      <div class="absolute bottom-2 left-3 right-3 w-auto rounded-full border px-2 py-[0.24rem] text-[0.64rem] font-semibold tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_10px_rgba(0,0,0,0.35)] ${proposalClass}${hideNoDataProposal ? ' hidden' : ''}" style="font-size:clamp(0.42rem,0.68vw,0.64rem);text-align:center;" data-proposal-box>${hideNoDataProposal ? '' : proposalText}</div>
    `;

    this.bindCardImageFallback(card, imageFallbackUrl);
    this.fitProposalBadge(card);
    return card;
  },

  fitProposalBadge(card) {
    const badge = card?.querySelector('[data-proposal-box]');
    if (!badge) return;
    const max = 0.64;
    const min = 0.38;
    let size = max;
    badge.style.fontSize = `${size}rem`;
    while (size > min && badge.scrollWidth > badge.clientWidth + 1) {
      size -= 0.02;
      badge.style.fontSize = `${size.toFixed(2)}rem`;
    }
  },

  resolveCardType(card) {
    if (card && (card.hasNews || card.featured || (Array.isArray(card.news) && card.news.length > 0))) {
      return 'NOVITA';
    }
    const id = String(card?.id || '').toLowerCase();
    const macro = String(card?.macroGroup || '').toLowerCase();
    if (id.includes('storico') || macro.includes('storico')) return 'STORICO';
    return 'ALGORITMO';
  },

  resolveCardImage(card) {
    const imageValue = String(card?.image || '').trim();
    if (!imageValue) return resolveWithBase('img/img.webp');
    if (imageValue.startsWith('http://') || imageValue.startsWith('https://') || imageValue.startsWith('/')) {
      return this.appendCacheBuster(imageValue, card.imageVersion);
    }
    if (card.cardBase) {
      return this.appendCacheBuster(resolveWithBase(this.joinCardPath(card.cardBase, imageValue)), card.imageVersion);
    }
    if (card.page) {
      return this.appendCacheBuster(resolveWithBase(this.joinCardPath(card.page, imageValue)), card.imageVersion);
    }
    return this.appendCacheBuster(resolveWithBase(imageValue), card.imageVersion);
  },

  resolveCardBackupImage() {
    return resolveWithBase('img/img_backup.webp');
  },

  joinCardPath(basePath, fileName) {
    const normalized = String(basePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
    const imagePath = String(fileName || '').replace(/^\/+/, '');
    if (!normalized) return imagePath;
    if (normalized.endsWith('/')) return `${normalized}${imagePath}`;
    return `${normalized}/${imagePath}`;
  },

  appendCacheBuster(url, version) {
    if (!version) return url;
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}v=${version}`;
  },

  bindCardImageFallback(cardEl, fallbackUrl) {
    const imageEl = cardEl?.querySelector('img');
    if (!imageEl) return;
    imageEl.addEventListener('error', () => {
      if (imageEl.dataset.fallbackApplied === '1') return;
      imageEl.dataset.fallbackApplied = '1';
      imageEl.src = fallbackUrl;
    });
  },

  async getLatestArchiveSeq() {
    if (this._latestArchiveSeqPromise) return this._latestArchiveSeqPromise;
    this._latestArchiveSeqPromise = (async () => {
      try {
        const response = await fetch(resolveWithBase('archives/draws/draws.csv'), { cache: 'no-store' });
        if (!response.ok) return null;
        const raw = await response.text();
        const rows = this.parseCsvRows(raw);
        if (!rows.length) return null;
        const last = rows[rows.length - 1];
        const seq = Number.parseInt(String(last['NR. SEQUENZIALE'] || '').trim(), 10);
        return Number.isFinite(seq) ? seq : null;
      } catch (error) {
        return null;
      }
    })();
    return this._latestArchiveSeqPromise;
  },

  async readCsvRows(url) {
    if (!url) return null;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return null;
      const raw = await response.text();
      return this.parseCsvRows(raw);
    } catch (error) {
      return null;
    }
  },

  parseCsvRows(raw) {
    const lines = String(raw || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
    if (!lines.length) return [];
    const delimiter = this.detectDelimiter(lines[0]);
    const headers = lines[0].split(delimiter).map((x) => this.stripQuotes(x.trim()));
    return lines.slice(1).map((line) => {
      const parts = line.split(delimiter).map((x) => this.stripQuotes(x.trim()));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] ?? '';
      });
      return row;
    });
  },

  stripQuotes(value) {
    const v = String(value || '').trim();
    if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
      return v.slice(1, -1).replace(/""/g, '"');
    }
    return v;
  },

  resolveMetricsUrl(algorithm) {
    const page = String(algorithm?.page || '').trim();
    if (!page) return null;
    let metricsPath = page;
    if (/\.html?$/i.test(metricsPath)) {
      metricsPath = metricsPath.replace(/[^/]+$/i, 'out/metrics-db.csv');
    } else {
      metricsPath = metricsPath.replace(/\/?$/, '/out/metrics-db.csv');
    }
    return resolveWithBase(metricsPath);
  },

  resolveHistoricalUrl(algorithm) {
    const page = String(algorithm?.page || '').trim();
    if (!page) return null;
    let historicalPath = page;
    if (/\.html?$/i.test(historicalPath)) {
      historicalPath = historicalPath.replace(/[^/]+$/i, 'out/historical-db.csv');
    } else {
      historicalPath = historicalPath.replace(/\/?$/, '/out/historical-db.csv');
    }
    return resolveWithBase(historicalPath);
  },

  parseItalianDate(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const day = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const year = Number.parseInt(match[3], 10);
    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const ts = Date.UTC(year, month - 1, day);
    const date = new Date(ts);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return { ts, label: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
  },

  extractLatestHistoricalDate(rows) {
    let best = null;
    (rows || []).forEach((row) => {
      const parsed = this.parseItalianDate(row?.DATA || row?.Data || row?.data);
      if (!parsed) return;
      if (!best || parsed.ts > best.ts) best = parsed;
    });
    return best ? best.label : null;
  },

  extractProposalInfo(rows) {
    const map = new Map(
      (rows || []).map((row) => [
        String(row.METRICA || '').trim().toLowerCase(),
        { value: String(row.VALORE || '').trim(), note: String(row.NOTE || '').trim() }
      ])
    );
    const next = map.get('concorso successivo stimato');
    const pick = map.get('sestina proposta (prossimo concorso)');
    const nextSeq = Number.parseInt(String(next?.value || '').trim(), 10);
    let proposal = String(pick?.value || '').trim();
    if (!proposal && next?.note) {
      const match = next.note.match(/sestina proposta:\s*(.+)$/i);
      if (match) proposal = String(match[1] || '').trim();
    }
    return { nextSeq: Number.isFinite(nextSeq) ? nextSeq : null, proposal: proposal || null };
  },

  normalizeProposalNumbers(rawProposal) {
    const tokens = String(rawProposal || '')
      .split(/[\s,;|]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    const numbers = [];
    for (const token of tokens) {
      const n = Number.parseInt(token.replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(n)) continue;
      if (n < 1 || n > 90) continue;
      numbers.push(String(n).padStart(2, '0'));
      if (numbers.length === 6) break;
    }
    return numbers;
  },

  enableDepth(root = document) {
    const host = root && root.querySelectorAll ? root : document;
    const cards = host.querySelectorAll('.card-3d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    cards.forEach((card) => {
      if (card.dataset.depthBound === '1') return;
      card.dataset.depthBound = '1';

      const updatePerspectiveEdges = (angleX, angleY) => {
        const nx = 0;
        const ny = Math.max(-1, Math.min(1, angleY / 12));

        const edgeLeft = (0.14 + Math.max(0, -ny) * 0.36 + Math.max(0, -nx) * 0.05).toFixed(3);
        const edgeRight = (0.14 + Math.max(0, ny) * 0.36 + Math.max(0, -nx) * 0.04).toFixed(3);
        const edgeTop = (0.16 + Math.max(0, -nx) * 0.38).toFixed(3);
        const edgeBottom = (0.18 + Math.max(0, nx) * 0.42 + Math.abs(ny) * 0.06).toFixed(3);

        const spread = (5 + Math.abs(ny) * 6).toFixed(2);
        const spreadTop = (4 + Math.max(0, -nx) * 5).toFixed(2);
        const spreadBottom = (6 + Math.max(0, nx) * 7).toFixed(2);

        card.style.setProperty('--edge-left-a', edgeLeft);
        card.style.setProperty('--edge-right-a', edgeRight);
        card.style.setProperty('--edge-top-a', edgeTop);
        card.style.setProperty('--edge-bottom-a', edgeBottom);
        card.style.setProperty('--edge-spread', `${spread}%`);
        card.style.setProperty('--edge-spread-top', `${spreadTop}%`);
        card.style.setProperty('--edge-spread-bottom', `${spreadBottom}%`);
      };

      const reset = () => {
        card.style.setProperty('--card-rotate-x', '0deg');
        card.style.setProperty('--card-rotate-y', '0deg');
        card.style.setProperty('--card-glow-x', '50%');
        card.style.setProperty('--card-glow-y', '8%');
        card.style.setProperty('--card-wobble-x', '0deg');
        card.style.setProperty('--card-wobble-y', '0deg');
        card.style.setProperty('--card-lift', '0px');
        card.style.setProperty('--card-z', '0px');
        updatePerspectiveEdges(0, 0);
      };

      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
        card.style.setProperty('--card-glow-x', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--card-glow-y', `${(y * 100).toFixed(1)}%`);

        if (!card.classList.contains('is-inactive')) {
          const dx = x * 2 - 1;
          const dy = y * 2 - 1;
          const maxTilt = prefersReducedMotion ? 7.5 : 15;
          const rotateX = -(maxTilt / Math.SQRT2) * dy;
          const rotateY = (maxTilt / Math.SQRT2) * dx;
          card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
          card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
          updatePerspectiveEdges(rotateX, rotateY);
        }
      };

      const onEnter = () => {
        card.classList.add('is-hovered');
        if (!card.classList.contains('is-inactive')) {
          card.style.setProperty('--card-lift', '-9px');
          card.style.setProperty('--card-z', '10px');
          card.style.setProperty('--card-wobble-x', '0deg');
          card.style.setProperty('--card-wobble-y', '0deg');
        } else {
          card.style.setProperty('--card-lift', '0px');
          card.style.setProperty('--card-z', '0px');
          card.style.setProperty('--card-wobble-x', '0deg');
          card.style.setProperty('--card-wobble-y', '0deg');
        }
      };

      const onLeave = () => {
        card.classList.remove('is-hovered');
        card.classList.remove('is-grabbed');
        reset();
      };

      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('pointercancel', onLeave);
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('pointerdown', () => card.classList.add('is-grabbed'));
      card.addEventListener('pointerup', () => card.classList.remove('is-grabbed'));
      card.addEventListener('focus', () => card.classList.add('is-selected'));
      card.addEventListener('blur', () => card.classList.remove('is-selected'));
      card.addEventListener('click', () => {
        card.classList.add('is-selected');
        window.setTimeout(() => card.classList.remove('is-selected'), 220);
      });

      reset();
    });
  },

  async applyDrawsLatest(card) {
    try {
      const response = await fetch(resolveWithBase('archives/draws/draws.csv'), { cache: 'no-store' });
      if (!response.ok) throw new Error('draws not found');
      const raw = await response.text();
      const lines = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));
      if (!lines.length) return;
      const lastLine = lines[lines.length - 1];
      const delimiter = this.detectDelimiter(lastLine);
      const parts = lastLine.split(delimiter).map((cell) => cell.trim());
      if (parts.length < 7) return;

      const drawDate = parts[1] || '';
      const numbers = parts.slice(2, 8);

      const updated = card.querySelector('[data-card-updated]');
      if (updated) {
        updated.textContent = drawDate || 'NO DATA';
      }

      const numbersRow = card.querySelector('[data-card-numbers]');
      if (numbersRow) {
        numbersRow.hidden = false;
        numbersRow.innerHTML = numbers
          .map((value) => `<span class="ball-3d">${value}</span>`)
          .join('');
      }
    } catch (error) {
      // no-op
    }
  },

  detectDelimiter(line) {
    const semi = (line.match(/;/g) || []).length;
    const comma = (line.match(/,/g) || []).length;
    if (semi === 0 && comma === 0) return ',';
    return semi >= comma ? ';' : ',';
  }
};

window.CARDS = CARDS;

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

