// ── Theme Count ──
document.getElementById('theme-count').textContent = `${themes.length} VARIANTS`;

// ── Scroll / FAB ──
const header = document.querySelector('header');
const fabTop = document.getElementById('fab-top');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY > 50;
      header.classList.toggle('scrolled', scrolled);
      fabTop.classList.toggle('visible', scrolled);
      ticking = false;
    });
    ticking = true;
  }
});
fabTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Tag Click Filter (grid) ──
let activeTagFilter = null;
document.querySelector('.grid').addEventListener('click', (e) => {
  const tag = e.target.closest('.tag');
  if (!tag) return;
  e.preventDefault();
  e.stopPropagation();
  const tagText = tag.textContent;
  activeTagFilter = activeTagFilter === tagText ? null : tagText;
  applyGridFilter();
});

function applyGridFilter() {
  const cards = document.querySelectorAll('.card');
  let visible = 0;
  cards.forEach((card, i) => {
    const match = !activeTagFilter || themes[i].tags.includes(activeTagFilter);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  document.querySelectorAll('.tag').forEach(t => {
    t.classList.toggle('active', t.textContent === activeTagFilter);
  });
}

// ── Command Palette ──
const backdrop = document.getElementById('palette-backdrop');
const palette = document.getElementById('palette');
const trigger = document.getElementById('search-trigger');
const paletteInput = document.getElementById('palette-search');
const resultsEl = document.getElementById('palette-results');
const escBtn = document.getElementById('palette-esc');

let paletteOpen = false;
let activeIndex = -1;
let filteredThemes = [];

// Extract first solid-ish color from a gradient string for swatch
function swatchColor(gradient) {
  const match = gradient.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : '#e0e0e0';
}

function openPalette() {
  paletteOpen = true;
  backdrop.classList.add('open');
  palette.classList.add('open');
  paletteInput.value = '';
  activeIndex = -1;
  renderResults();
  // Delay focus so transition starts first
  requestAnimationFrame(() => paletteInput.focus());
}

function closePalette() {
  paletteOpen = false;
  backdrop.classList.remove('open');
  palette.classList.remove('open');
  paletteInput.blur();
}

function renderResults() {
  const q = paletteInput.value.toLowerCase().trim();

  filteredThemes = themes.filter(t => {
    if (!q) return true;
    return `${t.name} ${t.desc} ${t.tags.join(' ')}`.toLowerCase().includes(q);
  });

  if (filteredThemes.length === 0) {
    resultsEl.innerHTML = '<div class="palette-empty">No themes found</div>';
    return;
  }

  resultsEl.innerHTML = filteredThemes.map((t, i) => `
    <div class="palette-item${i === activeIndex ? ' active' : ''}" data-index="${i}">
      <div class="palette-swatch" style="background:${t.gradient};"></div>
      <div class="palette-item-name">${t.name}</div>
      <div class="palette-item-tags">${t.tags.slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}</div>
    </div>
  `).join('');

  // Click handler
  resultsEl.querySelectorAll('.palette-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index, 10);
      selectTheme(filteredThemes[idx], false);
    });
  });

  // Scroll active item into view
  const activeEl = resultsEl.querySelector('.palette-item.active');
  if (activeEl) {
    activeEl.scrollIntoView({ block: 'nearest' });
  }
}

function selectTheme(theme, newTab) {
  closePalette();
  if (theme) {
    if (newTab) {
      window.open(theme.href, '_blank');
    } else {
      window.location.href = theme.href;
    }
  }
}

// Input
paletteInput.addEventListener('input', () => {
  activeIndex = -1;
  renderResults();
});

// Keyboard nav inside palette
paletteInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (filteredThemes.length > 0) {
      activeIndex = Math.min(activeIndex + 1, filteredThemes.length - 1);
      renderResults();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (filteredThemes.length > 0) {
      activeIndex = Math.max(activeIndex - 1, 0);
      renderResults();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeIndex >= 0 && filteredThemes[activeIndex]) {
      selectTheme(filteredThemes[activeIndex], e.ctrlKey || e.metaKey);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closePalette();
  }
});

// Open triggers
function onKeyDown(e) {
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    paletteOpen ? closePalette() : openPalette();
  }
}
window.addEventListener('keydown', onKeyDown);
trigger.addEventListener('click', () => paletteOpen ? closePalette() : openPalette());
backdrop.addEventListener('click', closePalette);
escBtn.addEventListener('click', closePalette);
