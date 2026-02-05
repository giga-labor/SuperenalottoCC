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
        updated.textContent = drawDate ? `Ultimo ${drawDate}` : 'Ultimo concorso';
      }

      const numbersRow = card.querySelector('[data-card-numbers]');
      if (numbersRow) {
        numbersRow.hidden = false;
        numbersRow.innerHTML = numbers
          .map((value) => {
            return `<span class="ball-3d">${value}</span>`;
          })
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
