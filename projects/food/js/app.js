const state = {
  raw: { categories: [], products: [] },
  categories: [],
  products: [],
  filtered: [],
  activeCategory: '全部',
  searchText: '',
  currentIndex: -1
};

const PLACEHOLDER_IMG = (function () {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#b91c1c'/>
          <stop offset='1' stop-color='#ef4444'/>
        </linearGradient>
      </defs>
      <rect width='512' height='512' fill='#f3f4f6'/>
      <circle cx='256' cy='256' r='180' fill='url(#g)' opacity='0.18'/>
      <text x='256' y='236' text-anchor='middle' font-size='42' fill='#374151' font-family='-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial'>暂无图片</text>
      <text x='256' y='286' text-anchor='middle' font-size='22' fill='#6b7280' font-family='-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial'>Meat Product</text>
    </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
})();

function setImageWithFallback(imgEl, src) {
  imgEl.loading = 'lazy';
  imgEl.decoding = 'async';
  imgEl.src = src || PLACEHOLDER_IMG;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = PLACEHOLDER_IMG;
  };
}

async function loadData() {
  const res = await fetch('data/products.json?' + Date.now());
  const data = await res.json();
  state.raw = data;
  state.categories = ['全部', ...data.categories];
  state.products = data.products;
  applyFilter();
  renderCategories();
  renderProducts();
}

function renderCategories() {
  const el = document.getElementById('category-tabs');
  el.innerHTML = '';
  state.categories.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'tab' + (cat === state.activeCategory ? ' active' : '');
    b.textContent = cat;
    b.onclick = () => {
      state.activeCategory = cat;
      applyFilter();
      renderCategories();
      renderProducts();
    };
    el.appendChild(b);
  });
}

function applyFilter() {
  const cat = state.activeCategory;
  const q = state.searchText.trim().toLowerCase();
  const res = state.products.filter(p => {
    const hitCat = cat === '全部' ? true : p.category === cat;
    const text = [p.name, p.origin, p.grade, ...(p.tags || [])].join(' ').toLowerCase();
    const hitQ = q ? text.includes(q) : true;
    return hitCat && hitQ;
  });
  state.filtered = res;
  state.currentIndex = res.length ? 0 : -1;
}

function renderProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  state.filtered.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.onclick = () => openDetail(i);
    const img = document.createElement('img');
    img.className = 'thumb';
    img.alt = p.name;
    setImageWithFallback(img, p.thumb || (p.images && p.images[0]) || '');
    const body = document.createElement('div');
    body.className = 'body';
    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = p.name;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${p.origin} · ${p.packaging} · ${p.priceRange}`;
    const tags = document.createElement('div');
    tags.className = 'tags';
    (p.tags || []).slice(0, 4).forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tags.appendChild(span);
    });
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(tags);
    card.appendChild(img);
    card.appendChild(body);
    list.appendChild(card);
  });
}

function openDetail(index) {
  state.currentIndex = index;
  const p = state.filtered[index];
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-category').textContent = p.category;
  document.getElementById('detail-cut').textContent = p.cut;
  document.getElementById('detail-origin').textContent = p.origin;
  document.getElementById('detail-grade').textContent = p.grade;
  document.getElementById('detail-packaging').textContent = p.packaging;
  document.getElementById('detail-weights').textContent = (p.weightOptions || []).join(' / ');
  document.getElementById('detail-price').textContent = p.priceRange;
  document.getElementById('detail-temp').textContent = p.temperature;
  document.getElementById('detail-stock').textContent = p.stockStatus;
  document.getElementById('detail-cert').textContent = (p.certificates || []).join('、');
  document.getElementById('detail-desc').textContent = p.description || '';
  const hl = document.getElementById('detail-highlights');
  hl.innerHTML = '';
  (p.highlights || []).forEach(x => {
    const li = document.createElement('li');
    li.textContent = x;
    hl.appendChild(li);
  });
  const img = document.getElementById('detail-image');
  setImageWithFallback(img, p.images && p.images.length ? p.images[0] : (p.thumb || ''));
}

function closeDetail() {
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.add('hidden');
}

function showNext() {
  if (state.currentIndex < 0) return;
  const next = (state.currentIndex + 1) % state.filtered.length;
  openDetail(next);
}
function showPrev() {
  if (state.currentIndex < 0) return;
  const prev = (state.currentIndex - 1 + state.filtered.length) % state.filtered.length;
  openDetail(prev);
}

function bindEvents() {
  const search = document.getElementById('search-input');
  search.addEventListener('input', e => {
    state.searchText = e.target.value || '';
    applyFilter();
    renderProducts();
  });
  document.getElementById('refresh-btn').onclick = () => loadData();
  document.getElementById('close-detail').onclick = () => closeDetail();
  document.getElementById('next-btn').onclick = () => showNext();
  document.getElementById('prev-btn').onclick = () => showPrev();
  const overlay = document.getElementById('detail-overlay');
  let startX = 0;
  let startY = 0;
  let tracking = false;
  overlay.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    tracking = true;
  }, { passive: true });
  overlay.addEventListener('touchmove', e => {
    if (!tracking) return;
  }, { passive: true });
  overlay.addEventListener('touchend', e => {
    if (!tracking) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    tracking = false;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) showNext(); else showPrev();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  loadData();
});
