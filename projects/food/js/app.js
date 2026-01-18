const state = {
  raw: { categories: [], products: [] },
  categories: [],
  products: [],
  filtered: [],
  activeCategory: '全部',
  searchText: '',
  currentIndex: -1,
  currentImageIndex: 0
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
  try {
    const res = await fetch('data/products.json?' + Date.now());
    if (!res.ok) throw new Error('网络错误');
    const data = await res.json();
    state.raw = data;
    state.categories = ['全部', ...data.categories];
    state.products = data.products;
    applyFilter();
    renderCategories();
    renderProducts();
  } catch (e) {
    console.error(e);
    alert('产品数据加载失败，请稍后重试。');
  }
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
  state.currentImageIndex = 0;
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
  renderDetailImages(p);
}

function renderDetailImages(p) {
  const images = p.images && p.images.length ? p.images.slice() : [];
  if (!images.length && p.thumb) images.push(p.thumb);
  if (!images.length) images.push('');
  if (state.currentImageIndex >= images.length) state.currentImageIndex = 0;
  const main = document.getElementById('detail-image');
  setImageWithFallback(main, images[state.currentImageIndex] || images[0]);
  const wrap = document.getElementById('detail-thumbs');
  wrap.innerHTML = '';
  images.forEach((src, i) => {
    const box = document.createElement('button');
    box.type = 'button';
    box.className = 'detail-thumb' + (i === state.currentImageIndex ? ' active' : '');
    box.dataset.index = String(i);
    const img = document.createElement('img');
    img.alt = p.name + ' 图 ' + (i + 1);
    setImageWithFallback(img, src);
    box.onclick = () => {
      state.currentImageIndex = i;
      renderDetailImages(p);
    };
    box.appendChild(img);
    wrap.appendChild(box);
  });
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

function showNextImage() {
  if (state.currentIndex < 0) return;
  const p = state.filtered[state.currentIndex];
  if (!p) return;
  const images = p.images && p.images.length ? p.images : (p.thumb ? [p.thumb] : []);
  if (!images.length || images.length <= 1) return;
  state.currentImageIndex = (state.currentImageIndex + 1) % images.length;
  renderDetailImages(p);
}

function showPrevImage() {
  if (state.currentIndex < 0) return;
  const p = state.filtered[state.currentIndex];
  if (!p) return;
  const images = p.images && p.images.length ? p.images : (p.thumb ? [p.thumb] : []);
  if (!images.length || images.length <= 1) return;
  state.currentImageIndex = (state.currentImageIndex - 1 + images.length) % images.length;
  renderDetailImages(p);
}

function bindEvents() {
  const search = document.getElementById('search-input');
  search.addEventListener('input', e => {
    state.searchText = e.target.value || '';
    applyFilter();
    renderProducts();
  });
  const refreshBtn = document.getElementById('refresh-btn');
  const closeBtn = document.getElementById('close-detail');
  if (refreshBtn) refreshBtn.onclick = () => loadData();
  if (closeBtn) closeBtn.onclick = () => closeDetail();
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  if (nextBtn) nextBtn.onclick = () => showNext();
  if (prevBtn) prevBtn.onclick = () => showPrev();
  const overlay = document.getElementById('detail-overlay');
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeDetail();
  });
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
  const imageBox = document.getElementById('detail-image-box');
  if (imageBox) {
    let ix = 0;
    let iy = 0;
    let moving = false;
    imageBox.addEventListener('touchstart', e => {
      if (!e.touches[0]) return;
      const t = e.touches[0];
      ix = t.clientX;
      iy = t.clientY;
      moving = true;
      e.stopPropagation();
    }, { passive: true });
    imageBox.addEventListener('touchend', e => {
      if (!moving) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - ix;
      const dy = t.clientY - iy;
      moving = false;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showNextImage(); else showPrevImage();
      }
      e.stopPropagation();
    }, { passive: true });
  }
  const mainImage = document.getElementById('detail-image');
  if (mainImage) {
    mainImage.addEventListener('click', () => {
      showNextImage();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  loadData();
});
