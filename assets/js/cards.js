const CARDS = {
  applyFeatures(area) {
    const cards = area.querySelectorAll('[data-card-id]');
    cards.forEach((card) => {
      const features = (card.dataset.features || '').split(',').map((item) => item.trim()).filter(Boolean);
      if (features.includes('draws-latest')) {
        this.applyDrawsLatest(card);
      }
    });
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