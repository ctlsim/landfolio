document.getElementById('theme-count').textContent = `${themes.length} VARIANTS`;

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

const searchInput = document.getElementById('search');
const resultCount = document.getElementById('result-count');

const searchClear = document.getElementById('search-clear');

let activeTagFilter = null;

function updateFilter() {
  const q = searchInput.value.toLowerCase().trim();
  searchClear.style.display = q ? 'block' : 'none';

  const cards = document.querySelectorAll('.card');
  let visible = 0;

  cards.forEach((card, i) => {
    const theme = themes[i];
    const searchMatch = !q || `${theme.name} ${theme.desc} ${theme.tags.join(' ')}`.toLowerCase().includes(q);
    const tagMatch = !activeTagFilter || theme.tags.includes(activeTagFilter);
    const match = searchMatch && tagMatch;
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  // Update active tag highlight
  document.querySelectorAll('.tag').forEach(tag => {
    tag.classList.toggle('active', tag.textContent === activeTagFilter);
  });

  const parts = [];
  if (activeTagFilter) parts.push(`"${activeTagFilter}"`);
  if (q) parts.push(q);
  resultCount.textContent = parts.length ? `${parts.join(' + ')} — ${visible} of ${themes.length}` : '';
}

// Tag click filter (event delegation)
document.querySelector('.grid').addEventListener('click', (e) => {
  const tag = e.target.closest('.tag');
  if (!tag) return;
  e.preventDefault();
  e.stopPropagation();

  const tagText = tag.textContent;
  activeTagFilter = activeTagFilter === tagText ? null : tagText;
  updateFilter();
});

searchInput.addEventListener('input', updateFilter);
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  updateFilter();
});
