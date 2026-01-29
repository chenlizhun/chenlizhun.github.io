const state = {
  raw: { categories: [], products: [] },
  categories: [],
  products: [],
  filtered: [],
  activeCategory: '全部',
  searchText: '',
  currentIndex: -1,
  currentImageIndex: 0,
  showingInfo: false
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
  imgEl.classList.remove('loaded');
  
  const actualSrc = src || PLACEHOLDER_IMG;
  
  imgEl.onerror = () => {
    if (imgEl.src !== PLACEHOLDER_IMG) {
        imgEl.src = PLACEHOLDER_IMG;
        imgEl.classList.add('loaded');
    }
  };

  imgEl.onload = () => {
    imgEl.classList.add('loaded');
  };
  
  imgEl.src = actualSrc;
}

// CloudBase Config
const ENV_ID = 'chenlizhun-projects-2ckab9e1cd47'; // Sync with admin.js
let app, db;

// Data Processing Helper
function processData(data) {
  if (!data || !data.products) return;

  // Pre-compute search strings for performance
  data.products.forEach(p => {
    p._searchStr = [
      p.name, 
      p.origin, 
      p.grade, 
      p.cut,
      p.category,
      ...(p.tags || [])
    ].join(' ').toLowerCase();
  });

  state.raw = data;
  state.products = data.products;
  
  // Always update categories if provided in data
  if (data.categories && data.categories.length > 0) {
    state.categories = ['全部', ...data.categories];
  } else if (!state.categories.length || state.categories.length <= 1) {
    // Only infer if we don't have categories yet
    const cats = new Set(data.products.map(p => p.category));
    state.categories = ['全部', ...Array.from(cats)];
  }

  // Ensure active category is valid
  if (!state.categories.includes(state.activeCategory)) {
      state.activeCategory = '全部';
  }

  applyFilter();
  renderCategories();
  renderProducts();
}

async function loadData() {
  // 0. Optimistic UI: Render Local Data Immediately
  if (typeof LOCAL_DATA !== 'undefined') {
    console.log('Optimistic loading with local data...');
    processData(LOCAL_DATA);
  }

  // 1. Init CloudBase (Try-Catch wrapped to ensure fallback works)
  try {
    if (typeof cloudbase !== 'undefined') {
        app = cloudbase.init({ env: ENV_ID });
        const auth = app.auth();
        const loginState = await auth.getLoginState();
        if (!loginState) await auth.signInAnonymously();
        db = app.database();
        
        // Helper to load collection (Direct -> Cloud Function Fallback)
        const safeLoad = async (collection) => {
            try {
                // Try direct read first
                const res = await db.collection(collection).limit(1000).get();
                return res.data;
            } catch (directErr) {
                console.warn(`Direct read ${collection} failed, trying cloud function...`, directErr);
                const res = await app.callFunction({
                    name: 'food_admin',
                    data: { action: 'get', collection: collection }
                });
                if (res.result && res.result.success) {
                    return res.result.data;
                }
                throw directErr;
            }
        };

        // 2. Load Config (Categories & Titles)
        try {
            const configs = await safeLoad('food_config');
            const config = configs.find(c => c._id === 'global_config');
            
            if (config) {
                // Update page titles
                if (config.appTitle) {
                    document.title = config.appTitle;
                    document.querySelector('.titles h1').textContent = config.appTitle;
                }
                if (config.appSubtitle) {
                    document.querySelector('.titles p').textContent = config.appSubtitle;
                }
                // Update categories
                if (config.categories && Array.isArray(config.categories)) {
                    state.categories = ['全部', ...config.categories.sort((a,b)=>a.order-b.order).map(c=>c.name)];
                }
            }
        } catch(e) {
            console.warn('Failed to load cloud config, using local fallback', e);
        }

        // 3. Load Products
        try {
            const cloudProducts = await safeLoad('food_products');
            
            // If cloud has data, use it.
            if (cloudProducts && cloudProducts.length > 0) {
                console.log('Cloud data loaded, updating UI...');
                processData({
                    categories: state.categories.slice(1), // Remove '全部' to match format
                    products: cloudProducts
                });
                return; // Success!
            }
        } catch(e) {
            console.warn('Failed to load cloud products', e);
        }
    }
  } catch (e) {
      console.warn('CloudBase init failed, falling back to local data.', e);
  }

  // If we already rendered local data and cloud failed, we are good.
  // But if we haven't rendered anything yet (e.g. LOCAL_DATA missing), try JSON fetch.
  if (!state.products.length) {
      try {
        // Fallback: Use JSON Fetch
        const res = await fetch('data/products.json?' + Date.now());
        if (!res.ok) throw new Error('网络错误');
        const data = await res.json();
        processData(data);
      } catch (e) {
        console.error(e);
        // Only alert if we really have nothing
        if (!state.products.length) {
            alert('产品数据加载失败，请检查网络或本地文件配置。');
        }
      }
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
    // Use pre-computed search string
    const text = p._searchStr || [p.name, p.origin, p.grade, ...(p.tags || [])].join(' ').toLowerCase();
    const hitQ = q ? text.includes(q) : true;
    return hitCat && hitQ;
  });
  state.filtered = res;
  state.currentIndex = res.length ? 0 : -1;
}

function renderProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  
  if (state.filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>没有找到相关产品</h3>
        <p>试试其他关键词或分类</p>
      </div>
    `;
    return;
  }

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
  state.showingInfo = false;
  updateDetailLayout();
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
  document.getElementById('detail-price-wholesale').textContent = p.priceWholesale || '询价';
  document.getElementById('detail-price-retail').textContent = p.priceRetail || '询价';
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

  const prevBtn = document.getElementById('img-prev');
  const nextBtn = document.getElementById('img-next');
  const counter = document.getElementById('img-counter');

  if (images.length > 1) {
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    counter.style.display = 'block';
    counter.textContent = `${state.currentImageIndex + 1} / ${images.length}`;
  } else {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    counter.style.display = 'none';
  }

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

function updateDetailLayout() {
  const body = document.querySelector('.detail-body');
  if (state.showingInfo) {
    body.classList.remove('image-only');
  } else {
    body.classList.add('image-only');
  }
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
  
  const images = p.images && p.images.length ? p.images.slice() : [];
  if (!images.length && p.thumb) images.push(p.thumb);
  if (!images.length) images.push('');

  if (state.showingInfo) {
    state.showingInfo = false;
    state.currentImageIndex = 0;
    updateDetailLayout();
    renderDetailImages(p);
  } else {
    if (state.currentImageIndex >= images.length - 1) {
      state.showingInfo = true;
      updateDetailLayout();
    } else {
      state.currentImageIndex++;
      renderDetailImages(p);
    }
  }
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

  const imgPrev = document.getElementById('img-prev');
  const imgNext = document.getElementById('img-next');
  if (imgPrev) {
    imgPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevImage();
    });
  }
  if (imgNext) {
    imgNext.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextImage();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  loadData();
});
