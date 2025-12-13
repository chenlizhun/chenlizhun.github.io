/**
 * 渲染模块
 * 负责DOM渲染和可视化
 */

const CHART_PALETTE = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48'];

/**
 * 构建柱状图卡片
 * @param {Array} items - 数据项数组 [[name, value], ...]
 * @param {number} maxVal - 最大值
 * @param {string} title - 图表标题
 * @returns {HTMLElement} 卡片元素
 */
function buildBars(items, maxVal, title) {
  const bars = items.slice(0, 8).map(([name, val], i) => {
    const pct = maxVal ? Math.round(val / maxVal * 100) : 0;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    return `
      <div class="mb-2">
        <div class="flex items-center justify-between text-xs text-gray-600">
          <span>${name}</span><span>${val}</span>
        </div>
        <div class="h-2 bg-gray-100 rounded" aria-label="${name} ${val}">
          <div class="h-2 rounded" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');
  
  const card = document.createElement('div');
  card.className = 'card p-3';
  card.setAttribute('aria-label', title);
  card.innerHTML = `<div class="text-sm font-semibold text-gray-800 mb-2">${title}</div>${bars || '<div class="text-xs text-gray-500">暂无数据</div>'}`;
  return card;
}

/**
 * 构建饼图卡片
 * @param {Array} items - 数据项数组 [[name, value], ...]
 * @param {string} title - 图表标题
 * @returns {HTMLElement} 卡片元素
 */
function buildPie(items, title) {
  const total = items.reduce((a, [, v]) => a + v, 0);
  
  if (!total) {
    const card = document.createElement('div');
    card.className = 'card p-3';
    card.innerHTML = `<div class="text-sm font-semibold text-gray-800 mb-2">${title}</div><div class="text-xs text-gray-500">暂无数据</div>`;
    return card;
  }
  
  let start = 0;
  const segments = items.slice(0, 8).map(([, v], i) => {
    const pct = v / total;
    const deg = pct * 360;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    const seg = `${color} ${start}deg ${start + deg}deg`;
    start += deg;
    return seg;
  });
  
  const legend = items.slice(0, 8).map(([name, v], i) => {
    const pct = total ? Math.round((v / total) * 100) : 0;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    return `<div class="flex items-center justify-between text-xs text-gray-600"><span class="inline-block w-3 h-3 rounded mr-2" style="background:${color}"></span><span class="flex-1">${name}</span><span>${v}（${pct}%）</span></div>`;
  }).join('');
  
  const card = document.createElement('div');
  card.className = 'card p-3';
  card.setAttribute('aria-label', title);
  card.innerHTML = `
    <div class="text-sm font-semibold text-gray-800 mb-2">${title}</div>
    <div class="flex items-center gap-4">
      <div class="w-40 h-40 rounded-full" style="background: conic-gradient(${segments.join(',')})" aria-label="饼图"></div>
      <div class="flex-1 space-y-1">${legend}</div>
    </div>
  `;
  return card;
}

/**
 * 渲染统计摘要
 * @param {Object} stats - 统计数据对象
 * @param {Object} filters - 筛选条件对象
 * @returns {HTMLElement} 摘要容器元素
 */
function renderSummary(stats, filters) {
  const gradeCount = stats.grades ? stats.grades.length : 0;
  const cards = [
    { k: '年级', v: String(gradeCount) },
    { k: '单元', v: String(stats.unitCount) },
    { k: '关卡', v: String(stats.gameCount) }
  ].map(c => `<div class="card p-3"><div class="text-xs text-gray-500">${c.k}</div><div class="text-lg font-semibold">${c.v}</div></div>`).join('');
  
  const chartGrid = document.createElement('div');
  chartGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-3';
  
  const unitCard = buildBars(stats.unitSkills, stats.unitMaxVal, '技能词频（单元）');
  const gameCard = buildBars(stats.gameSkills, stats.gameMaxVal, '技能词频（关卡）');
  const typePie = buildPie(stats.types, '类型分布');
  
  chartGrid.appendChild(unitCard);
  chartGrid.appendChild(gameCard);
  chartGrid.appendChild(typePie);
  chartGrid.style.display = 'none';
  
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-3 gap-3';
  grid.innerHTML = cards;
  
  const box = document.createElement('div');
  const filterLine = document.createElement('div');
  filterLine.className = 'md:col-span-3';
  
  const parts = [];
  if (filters) {
    if (filters.grade && filters.grade !== '__all_grade') parts.push(`<span class="pill">${filters.grade} 年级</span>`);
    if (filters.type && filters.type !== '__all_type') parts.push(`<span class="pill">${filters.type}</span>`);
    if (filters.skill && filters.skill !== '__all__') parts.push(`<span class="pill">${filters.skill}</span>`);
  }
  
  filterLine.innerHTML = parts.length ? `<div class="card p-3 text-xs text-gray-600">当前筛选：${parts.join(' ')}</div>` : '';
  
  box.appendChild(grid);
  if (filterLine.innerHTML) box.appendChild(filterLine);
  box.appendChild(chartGrid);
  
  return box;
}

function typeNameCN(t) {
  if (t === 'match') return '连线';
  if (t === 'select') return '选择';
  if (t === 'drag') return '拖拽';
  if (t === 'fill') return '填空';
  if (t === 'click') return '点击';
  return t || '类型';
}

/**
 * 渲染单个年级
 * @param {Object} grade - 年级数据对象
 * @returns {HTMLElement} 年级卡片元素
 */
function renderGrade(grade) {
  const wrap = document.createElement('div');
  wrap.className = 'card p-4';
  wrap.dataset.grade = String(grade.grade);
  
  const units = Array.isArray(grade.units) ? grade.units : [];
  const typeMap = new Map();
  const unitHTML = units.map(u => {
    const games = Array.isArray(u.games) ? u.games : [];
    const typeMap = new Map();
    games.forEach(g => {
      const t = g.type || 'unknown';
      if (!typeMap.has(t)) typeMap.set(t, []);
      typeMap.get(t).push(g);
    });
    const gameHTML = Array.from(typeMap.entries()).map(([type, list]) => {
      const row = list.map(g => {
        const icon = type === 'match' ? '🔗' : type === 'select' ? '✅' : type === 'drag' ? '🧩' : type === 'fill' ? '✏️' : type === 'click' ? '👆' : '🎮';
        return `
          <button class="game-btn hover:bg-gray-50 inline-flex items-center gap-2" data-unit="${u.id}" data-game="${g.id}" title="${type}" aria-label="${g.title}（${type}）">
            <span class="text-base">${icon}</span><span>${g.title}</span>
          </button>
        `;
      }).join(' ');
      return `
        <div class="mb-2">
          <div class="text-xs text-gray-600 mb-1">${typeNameCN(type)}</div>
          <div class="flex flex-wrap gap-2">${row}</div>
        </div>
      `;
    }).join('');
    const skills = (u.skills || []).map(s => `<span class="pill">${s}</span>`).join(' ');
    return `
      <div class="mb-3">
        <div class="flex items-center justify-between">
          <span class="unit-title">${u.title}</span>
          <span class="badge">关卡：${games.length}</span>
        </div>
        <div class="mt-2">${gameHTML}</div>
        <div class="mt-2 flex flex-wrap gap-1">${skills}</div>
      </div>
    `;
  }).join('');
  
  wrap.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">第${grade.grade}年级</span>
        <button class="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50 inline-flex items-center gap-1" data-action="toggle-grade" aria-expanded="true"><span class="toggle-arrow">▾</span><span class="toggle-text">折叠</span></button>
      </div>
      <span class="text-xs text-gray-500">单元：${units.length}</span>
    </div>
    <div class="grade-content">
      ${unitHTML}
    </div>
  `;
  
  const content = wrap.querySelector('.grade-content');
  const toggleBtn = wrap.querySelector('button[data-action="toggle-grade"]');
  const storeKey = `math_grade_collapsed_${grade.grade}`;
  const collapsed = typeof localStorage !== 'undefined' ? localStorage.getItem(storeKey) === '1' : false;
  if (collapsed && content) {
    content.style.display = 'none';
    const arrow = toggleBtn.querySelector('.toggle-arrow');
    const text = toggleBtn.querySelector('.toggle-text');
    if (arrow) arrow.textContent = '▸';
    if (text) text.textContent = '展开';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  toggleBtn.addEventListener('click', () => {
    if (!content) return;
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? '' : 'none';
    const arrow = toggleBtn.querySelector('.toggle-arrow');
    const text = toggleBtn.querySelector('.toggle-text');
    if (arrow) arrow.textContent = isHidden ? '▾' : '▸';
    if (text) text.textContent = isHidden ? '折叠' : '展开';
    toggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storeKey, isHidden ? '0' : '1');
    }
  });
  
  return wrap;
}

/**
 * 渲染空状态
 * @param {HTMLElement} container - 容器元素
 * @param {string} message - 提示消息
 */
function renderEmptyState(container, message = '暂无数据') {
  if (!container) return;
  
  const emptyCard = document.createElement('div');
  emptyCard.className = 'card p-8 text-center';
  emptyCard.innerHTML = `
    <div class="text-gray-400 text-4xl mb-3">📭</div>
    <div class="text-gray-600 font-medium mb-2">${message}</div>
    <div class="text-sm text-gray-500">请尝试调整筛选条件或搜索关键词</div>
  `;
  container.innerHTML = '';
  container.appendChild(emptyCard);
}

/**
 * 渲染所有年级
 * @param {Array} grades - 年级数据数组
 * @param {HTMLElement} container - 容器元素
 */
function renderAll(grades, container) {
  if (!container) {
    console.error('[Renderer] 容器元素未找到');
    return;
  }
  
  // 如果没有数据，显示空状态
  if (!grades || grades.length === 0) {
    renderEmptyState(container, '没有找到匹配的游戏');
    return;
  }
  
  // 使用DocumentFragment优化性能
  const fragment = document.createDocumentFragment();
  grades.forEach(g => fragment.appendChild(renderGrade(g)));
  container.innerHTML = '';
  container.appendChild(fragment);
}

/**
 * 渲染游戏详情
 * @param {Object} game - 游戏数据对象
 * @param {Object} unit - 单元数据对象
 * @returns {HTMLElement} 详情卡片元素
 */
function renderGameDetail(game, unit) {
  const detail = document.createElement('div');
  detail.className = 'card p-4 mt-3';
  const headerHTML = `
    <div class="font-semibold text-gray-800">${game.title}</div>
    <div class="text-sm text-gray-600 mt-1">${unit.title} · 类型：${typeNameCN(game.type)}</div>
    <div class="mt-2">
      <button class="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50" data-action="close-detail" aria-label="关闭详情">关闭详情</button>
    </div>
  `;
  detail.innerHTML = headerHTML;

  let contentEl = null;
  if (game && game.id === 'mul-match' && game.type === 'match' && game.generator && game.generator.mode === 'expression->result') {
    contentEl = buildMulMatchGame(game);
  } else if (game && game.id === 'count-stairs' && game.type === 'select' && game.generator && game.generator.mode === 'target-number') {
    contentEl = buildCountStairsGame(game);
  } else if (game && game.id === 'compare-pairs' && game.type === 'match') {
    contentEl = buildComparePairsGame(game);
  } else if (game && game.id === 'place-value-box' && game.type === 'drag') {
    contentEl = buildPlaceValueBoxGame(game);
  } else if (game && game.id === 'make-ten' && game.type === 'drag') {
    contentEl = buildMakeTenGame(game);
  } else if (game && game.id === 'add-sub-mole' && game.type === 'click') {
    contentEl = buildAddSubMoleGame(game);
  } else if (game && game.id === 'split-combine' && game.type === 'fill') {
    contentEl = buildSplitCombineGame(game);
  } else if (game && game.id === 'clock-half' && game.type === 'drag') {
    contentEl = buildClockHalfGame(game);
  } else if (game && game.id === 'shape-puzzle' && game.type === 'drag') {
    contentEl = buildShapePuzzleGame(game);
  }
  if (contentEl) {
    detail.appendChild(contentEl);
    if (typeof contentEl._cleanup === 'function') {
      detail._cleanup = () => {
        try { contentEl._cleanup(); } catch (_) {}
      };
    }
  } else {
    const pre = document.createElement('pre');
    pre.className = 'text-xs bg-gray-50 border border-gray-200 rounded p-2 mt-2 overflow-auto';
    pre.textContent = JSON.stringify(game, null, 2);
    detail.appendChild(pre);
  }
  return detail;
}

/**
 * 乘法口诀连线互动游戏
 * 规则：左侧随机生成若干乘法表达式，右侧生成对应结果，打乱顺序。
 * 玩家点击左侧一个表达式，再点击右侧一个结果进行配对；配对正确则锁定，错误计数+1。
 * 计时：读取 game.success.timeLimitSec（可选），倒计时结束或全部配对完成后给出成绩。
 */
function buildMulMatchGame(game) {
  const timeLimit = (game.success && game.success.timeLimitSec) ? Number(game.success.timeLimitSec) : null;
  const tables = Array.isArray(game.generator.tables) ? game.generator.tables : [2, 3, 4, 5];
  const PAIRS_COUNT = 6;
  const pairs = [];
  // 生成表达式-结果对
  for (const t of tables) {
    for (let b = 2; b <= 9; b++) {
      pairs.push({ expr: `${t}×${b}`, value: t * b });
    }
  }
  // 随机抽取指定数量的配对
  shuffleArray(pairs);
  const selected = pairs.slice(0, PAIRS_COUNT);
  const left = selected.map((p, i) => ({ id: `L${i}`, text: p.expr, value: p.value }));
  const right = selected.map((p, i) => ({ id: `R${i}`, text: String(p.value), value: p.value }));
  shuffleArray(right);

  // 构建UI
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">点击左侧表达式，再点击右侧结果进行配对</div>
    <div class="space-y-3">
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">表达式</div>
        <div id="mul-left" class="space-y-2"></div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">结果</div>
        <div id="mul-right" class="space-y-2"></div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">进度</div>
        <div class="text-sm">正确：<span id="mul-correct">0</span> / ${PAIRS_COUNT}</div>
        <div class="text-sm mt-1">错误：<span id="mul-wrong">0</span></div>
        <div class="text-sm mt-1">用时：<span id="mul-time">0.0s</span>${timeLimit ? ` / ${timeLimit}s` : ''}</div>
        <button id="mul-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
      </div>
    </div>
  `;

  // 渲染左侧与右侧项
  const leftBox = wrap.querySelector('#mul-left');
  const rightBox = wrap.querySelector('#mul-right');
  left.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-sm px-3 py-2 border rounded hover:bg-gray-50 text-left';
    btn.textContent = item.text;
    btn.dataset.id = item.id;
    btn.dataset.value = String(item.value);
    leftBox.appendChild(btn);
  });
  right.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-sm px-3 py-2 border rounded hover:bg-gray-50 text-left';
    btn.textContent = item.text;
    btn.dataset.id = item.id;
    btn.dataset.value = String(item.value);
    rightBox.appendChild(btn);
  });

  // 状态
  let selectedLeft = null;
  let correct = 0;
  let wrong = 0;
  let startTs = performance.now();
  let timerId = null;
  const correctEl = wrap.querySelector('#mul-correct');
  const wrongEl = wrap.querySelector('#mul-wrong');
  const timeEl = wrap.querySelector('#mul-time');

  // 计时器
  function tick() {
    const elapsed = (performance.now() - startTs) / 1000;
    timeEl.textContent = `${elapsed.toFixed(1)}s`;
    if (timeLimit && elapsed >= timeLimit) {
      endGame(true);
      return;
    }
    timerId = requestAnimationFrame(tick);
  }
  timerId = requestAnimationFrame(tick);

  // 事件绑定
  leftBox.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    if (btn.disabled) return;
    // 选择左侧项
    leftBox.querySelectorAll('button').forEach(b => b.classList.remove('ring', 'ring-indigo-300'));
    btn.classList.add('ring', 'ring-indigo-300');
    selectedLeft = btn;
  });

  rightBox.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    if (btn.disabled) return;
    if (!selectedLeft) return;
    // 判定
    const lv = Number(selectedLeft.dataset.value);
    const rv = Number(btn.dataset.value);
    if (lv === rv) {
      // 正确，锁定两侧项
      selectedLeft.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
      btn.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
      selectedLeft.disabled = true;
      btn.disabled = true;
      selectedLeft.classList.remove('ring', 'ring-indigo-300');
      selectedLeft = null;
      correct++;
      correctEl.textContent = String(correct);
      if (correct >= PAIRS_COUNT) {
        endGame(false);
      }
    } else {
      // 错误，提示动画
      btn.classList.add('bg-red-50', 'border-red-300', 'text-red-700');
      setTimeout(() => {
        btn.classList.remove('bg-red-50', 'border-red-300', 'text-red-700');
      }, 300);
      wrong++;
      wrongEl.textContent = String(wrong);
    }
  });

  // 结束与重开
  function endGame(timeout) {
    if (timerId) cancelAnimationFrame(timerId);
    leftBox.querySelectorAll('button').forEach(b => b.disabled = true);
    rightBox.querySelectorAll('button').forEach(b => b.disabled = true);
    const elapsed = (performance.now() - startTs) / 1000;
    const result = document.createElement('div');
    result.className = 'mt-3 text-sm';
    result.innerHTML = timeout
      ? `<div class="text-red-600 font-medium">时间到！正确 ${correct}/${PAIRS_COUNT}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s</div>`
      : `<div class="text-green-600 font-medium">完成！正确 ${correct}/${PAIRS_COUNT}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s</div>`;
    wrap.appendChild(result);
    setResultFooter(wrap, `正确 ${correct}/${PAIRS_COUNT}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s`);
  }

  wrap.querySelector('#mul-restart').addEventListener('click', () => {
    // 简单刷新同一详情以重开
    const parent = wrap.parentElement;
    if (!parent) return;
    // 重新构建并替换
    const newGame = buildMulMatchGame(game);
    parent.replaceChild(newGame, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  wrap._cleanup = () => {
    if (timerId) cancelAnimationFrame(timerId);
  };
  return wrap;
}

function buildCountStairsGame(game) {
  const range = Array.isArray(game.generator.range) ? game.generator.range : [1, 20];
  const min = Math.max(1, Number(range[0] || 1));
  const max = Math.max(min + 1, Number(range[1] || 20));
  const timeLimit = (game.success && game.success.timeLimitSec) ? Number(game.success.timeLimitSec) : null;
  const target = Math.floor(Math.random() * (max - min + 1)) + min;
  const opts = new Set([target]);
  while (opts.size < 4) {
    const d = Math.floor(Math.random() * 3) - 1;
    const cand = Math.max(min, Math.min(max, target + d + Math.floor(Math.random() * 3)));
    opts.add(cand);
  }
  const options = Array.from(opts).sort((a, b) => a - b);
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">数一数跑道的台阶数，并选择正确的数量</div>
    <div class="card p-3 mb-3">
      <div class="text-xs text-gray-500 mb-2">跑道</div>
      <div class="grid grid-cols-10 gap-1 md:grid-cols-12" aria-label="跑道">
        ${Array.from({ length: max }, (_, i) => {
          const idx = i + 1;
          const filled = idx <= target;
          return `<div class="h-6 rounded ${filled ? 'bg-indigo-500' : 'bg-gray-200'}" title="${idx}"></div>`;
        }).join('')}
      </div>
    </div>
    <div class="card p-3">
      <div class="text-xs text-gray-500 mb-2">选择正确的台阶数</div>
      <div id="stairs-opts" class="grid grid-cols-2 gap-2 md:grid-cols-4"></div>
      <div class="mt-3 text-sm">正确：<span id="stairs-correct">0</span> 错误：<span id="stairs-wrong">0</span> 用时：<span id="stairs-time">0.0s</span>${timeLimit ? ` / ${timeLimit}s` : ''}</div>
      <button id="stairs-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
    </div>
  `;
  const optBox = wrap.querySelector('#stairs-opts');
  options.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'px-3 py-2 border rounded hover:bg-gray-50 text-sm';
    btn.textContent = String(n);
    btn.dataset.value = String(n);
    optBox.appendChild(btn);
  });
  let correct = 0;
  let wrong = 0;
  const correctEl = wrap.querySelector('#stairs-correct');
  const wrongEl = wrap.querySelector('#stairs-wrong');
  const timeEl = wrap.querySelector('#stairs-time');
  let startTs = performance.now();
  let raf = null;
  function tick() {
    const elapsed = (performance.now() - startTs) / 1000;
    timeEl.textContent = `${elapsed.toFixed(1)}s`;
    if (timeLimit && elapsed >= timeLimit) {
      end(true);
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  function end(timeout) {
    optBox.querySelectorAll('button').forEach(b => b.disabled = true);
    if (raf) cancelAnimationFrame(raf);
    const result = document.createElement('div');
    result.className = 'mt-2 text-sm';
    const elapsed = (performance.now() - startTs) / 1000;
    result.innerHTML = timeout
      ? `<span class="text-red-600 font-medium">时间到！</span> 正确 ${correct}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s`
      : `<span class="text-green-600 font-medium">完成！</span> 正确 ${correct}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s`;
    wrap.appendChild(result);
    setResultFooter(wrap, `正确 ${correct}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s`);
  }
  optBox.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    if (btn.disabled) return;
    const v = Number(btn.dataset.value);
    if (v === target) {
      btn.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
      btn.disabled = true;
      correct++;
      correctEl.textContent = String(correct);
      end(false);
    } else {
      btn.classList.add('bg-red-50', 'border-red-300', 'text-red-700');
      setTimeout(() => btn.classList.remove('bg-red-50', 'border-red-300', 'text-red-700'), 300);
      wrong++;
      wrongEl.textContent = String(wrong);
    }
  });
  wrap.querySelector('#stairs-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildCountStairsGame(game);
    parent.replaceChild(fresh, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  wrap._cleanup = () => {
    if (raf) cancelAnimationFrame(raf);
  };
  return wrap;
}

function buildComparePairsGame(game) {
  const timeLimit = (game.success && game.success.timeLimitSec) ? Number(game.success.timeLimitSec) : null;
  const pairsCount = (game.generator && game.generator.pairs) ? Number(game.generator.pairs) : 6;
  const range = Array.isArray(game.generator.range) ? game.generator.range : [1, 100];
  const min = Math.max(0, Number(range[0] || 1));
  const max = Math.max(min + 1, Number(range[1] || 100));
  const comps = Array.isArray(game.generator.comparators) ? game.generator.comparators : ['<', '>', '='];
  const pairs = [];
  for (let i = 0; i < pairsCount; i++) {
    let a = Math.floor(Math.random() * (max - min + 1)) + min;
    let b = Math.floor(Math.random() * (max - min + 1)) + min;
    if (comps.includes('=') && i === 0) b = a;
    const ans = a < b ? '<' : (a > b ? '>' : '=');
    pairs.push({ a, b, ans });
  }
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">点击左侧数对，再点击右侧比较符号完成判断</div>
    <div class="space-y-3">
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">数对</div>
        <div id="cmp-left" class="space-y-2"></div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">比较符号</div>
        <div id="cmp-right" class="grid grid-cols-3 gap-2"></div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">进度</div>
        <div class="text-sm">正确：<span id="cmp-correct">0</span> / ${pairsCount}</div>
        <div class="text-sm mt-1">错误：<span id="cmp-wrong">0</span></div>
        <div class="text-sm mt-1">用时：<span id="cmp-time">0.0s</span>${timeLimit ? ` / ${timeLimit}s` : ''}</div>
        <button id="cmp-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
      </div>
    </div>
  `;
  const leftBox = wrap.querySelector('#cmp-left');
  const rightBox = wrap.querySelector('#cmp-right');
  pairs.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-sm px-3 py-2 border rounded hover:bg-gray-50 text-left';
    btn.textContent = `${p.a} ? ${p.b}`;
    btn.dataset.idx = String(i);
    btn.dataset.answer = p.ans;
    leftBox.appendChild(btn);
  });
  comps.forEach(sym => {
    const btn = document.createElement('button');
    btn.className = 'text-sm px-3 py-2 border rounded hover:bg-gray-50';
    btn.textContent = sym;
    btn.dataset.comp = sym;
    rightBox.appendChild(btn);
  });
  let selectedLeft = null;
  let correct = 0;
  let wrong = 0;
  const correctEl = wrap.querySelector('#cmp-correct');
  const wrongEl = wrap.querySelector('#cmp-wrong');
  const timeEl = wrap.querySelector('#cmp-time');
  let startTs = performance.now();
  let raf = null;
  function tick() {
    const elapsed = (performance.now() - startTs) / 1000;
    timeEl.textContent = `${elapsed.toFixed(1)}s`;
    if (timeLimit && elapsed >= timeLimit) {
      end(true);
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  leftBox.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-idx]');
    if (!btn) return;
    if (btn.disabled) return;
    leftBox.querySelectorAll('button').forEach(b => b.classList.remove('ring', 'ring-indigo-300'));
    btn.classList.add('ring', 'ring-indigo-300');
    selectedLeft = btn;
  });
  rightBox.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-comp]');
    if (!btn) return;
    if (!selectedLeft) return;
    const ans = selectedLeft.dataset.answer;
    const comp = btn.dataset.comp;
    if (ans === comp) {
      selectedLeft.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
      selectedLeft.disabled = true;
      selectedLeft.classList.remove('ring', 'ring-indigo-300');
      selectedLeft = null;
      correct++;
      correctEl.textContent = String(correct);
      if (correct >= pairsCount) end(false);
    } else {
      btn.classList.add('bg-red-50', 'border-red-300', 'text-red-700');
      setTimeout(() => btn.classList.remove('bg-red-50', 'border-red-300', 'text-red-700'), 300);
      wrong++;
      wrongEl.textContent = String(wrong);
    }
  });
  function end(timeout) {
    leftBox.querySelectorAll('button').forEach(b => b.disabled = true);
    if (raf) cancelAnimationFrame(raf);
    const elapsed = (performance.now() - startTs) / 1000;
    const result = document.createElement('div');
    result.className = 'mt-3 text-sm';
    result.innerHTML = timeout
      ? `<div class="text-red-600 font-medium">时间到！正确 ${correct}/${pairsCount}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s</div>`
      : `<div class="text-green-600 font-medium">完成！正确 ${correct}/${pairsCount}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s</div>`;
    wrap.appendChild(result);
    setResultFooter(wrap, `正确 ${correct}/${pairsCount}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s`);
  }
  wrap.querySelector('#cmp-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildComparePairsGame(game);
    parent.replaceChild(fresh, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  wrap._cleanup = () => {
    if (raf) cancelAnimationFrame(raf);
  };
  return wrap;
}

function buildPlaceValueBoxGame(game) {
  const range = Array.isArray(game.generator.range) ? game.generator.range : [10, 99];
  const min = Math.max(10, Number(range[0] || 10));
  const max = Math.max(min + 1, Number(range[1] || 99));
  const boxes = Array.isArray(game.generator.boxes) ? game.generator.boxes : ['十位', '个位'];
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const timeLimit = (game.success && game.success.timeLimitSec) ? Number(game.success.timeLimitSec) : null;
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">将数字的十位与个位分别拖入对应的框中</div>
    <div class="space-y-3">
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">数字</div>
        <div class="text-2xl font-semibold text-indigo-600">${n}</div>
        <div class="mt-3 flex gap-2">
          <div id="pv-tens" class="px-3 py-2 border rounded bg-white text-sm" draggable="true" data-value="${tens}">${tens}</div>
          <div id="pv-ones" class="px-3 py-2 border rounded bg-white text-sm" draggable="true" data-value="${ones}">${ones}</div>
        </div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">位值框</div>
        <div class="grid grid-cols-2 gap-3">
          <div id="box-tens" class="h-16 border-2 border-dashed rounded flex items-center justify-center text-sm text-gray-500" data-target="tens">${boxes[0]}</div>
          <div id="box-ones" class="h-16 border-2 border-dashed rounded flex items-center justify-center text-sm text-gray-500" data-target="ones">${boxes[1]}</div>
        </div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">进度</div>
        <div class="text-sm">正确：<span id="pv-correct">0</span></div>
        <div class="text-sm mt-1">错误：<span id="pv-wrong">0</span></div>
        <div class="text-sm mt-1">用时：<span id="pv-time">0.0s</span>${timeLimit ? ` / ${timeLimit}s` : ''}</div>
        <button id="pv-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
      </div>
    </div>
  `;
  let placedTens = false;
  let placedOnes = false;
  let correct = 0;
  let wrong = 0;
  const correctEl = wrap.querySelector('#pv-correct');
  const wrongEl = wrap.querySelector('#pv-wrong');
  const timeEl = wrap.querySelector('#pv-time');
  let startTs = performance.now();
  let raf = null;
  function tick() {
    const elapsed = (performance.now() - startTs) / 1000;
    timeEl.textContent = `${elapsed.toFixed(1)}s`;
    if (timeLimit && elapsed >= timeLimit) {
      end(true);
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  ['box-tens', 'box-ones'].forEach(id => {
    const box = wrap.querySelector(`#${id}`);
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.classList.add('ring', 'ring-indigo-300');
    });
    box.addEventListener('dragleave', () => {
      box.classList.remove('ring', 'ring-indigo-300');
    });
    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.classList.remove('ring', 'ring-indigo-300');
      const data = e.dataTransfer.getData('text/plain');
      const val = Number(data);
      const target = box.dataset.target;
      const ok = (target === 'tens' && val === tens) || (target === 'ones' && val === ones);
      if (ok) {
        box.textContent = String(val);
        box.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
        box.setAttribute('aria-busy', 'true');
        if (target === 'tens') placedTens = true; else placedOnes = true;
        const srcId = target === 'tens' ? '#pv-tens' : '#pv-ones';
        const src = wrap.querySelector(srcId);
        if (src) {
          src.setAttribute('draggable', 'false');
          src.classList.add('opacity-50');
        }
        if (placedTens && placedOnes) {
          correct++;
          correctEl.textContent = String(correct);
          end(false);
        }
      } else {
        box.classList.add('bg-red-50', 'border-red-300', 'text-red-700');
        setTimeout(() => box.classList.remove('bg-red-50', 'border-red-300', 'text-red-700'), 300);
        wrong++;
        wrongEl.textContent = String(wrong);
      }
    });
  });
  ['pv-tens', 'pv-ones'].forEach(id => {
    const el = wrap.querySelector(`#${id}`);
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', el.dataset.value || '');
    });
  });
  function end(timeout) {
    ['pv-tens', 'pv-ones'].forEach(id => {
      const el = wrap.querySelector(`#${id}`);
      if (el) el.setAttribute('draggable', 'false');
    });
    if (raf) cancelAnimationFrame(raf);
    const elapsed = (performance.now() - startTs) / 1000;
    const result = document.createElement('div');
    result.className = 'mt-3 text-sm';
    result.innerHTML = timeout
      ? `<div class="text-red-600 font-medium">时间到！正确 ${correct}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s</div>`
      : `<div class="text-green-600 font-medium">完成！正确 ${correct}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s</div>`;
    wrap.appendChild(result);
    setResultFooter(wrap, `正确 ${correct}，错误 ${wrong}，用时 ${elapsed.toFixed(1)}s`);
  }
  wrap.querySelector('#pv-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildPlaceValueBoxGame(game);
    parent.replaceChild(fresh, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  wrap._cleanup = () => {
    if (raf) cancelAnimationFrame(raf);
  };
  return wrap;
}

function buildResultFooter(game) {
  const box = document.createElement('div');
  box.className = 'mt-3 text-sm';
  const acc = game && game.success && game.success.accuracy ? Number(game.success.accuracy) : null;
  const tl = game && game.success && game.success.timeLimitSec ? Number(game.success.timeLimitSec) : null;
  const parts = [];
  if (acc) parts.push(`准确率≥${Math.round(acc * 100)}%`);
  if (tl) parts.push(`时间≤${tl}s`);
  const req = parts.length ? parts.join('，') : '无';
  box.innerHTML = `<div class="text-gray-600">达标要求：${req}</div><div class="mt-1" data-role="result"></div>`;
  return box;
}

function setResultFooter(el, text) {
  const r = el.querySelector('div[data-role="result"]');
  if (r) r.textContent = `本次成绩：${text}`;
}

function buildMakeTenGame(game) {
  const target = (game.generator && game.generator.target) ? Number(game.generator.target) : 10;
  const cards = Array.isArray(game.generator.cards) ? game.generator.cards : [1,2,3,4,5,6,7,8,9];
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">将两张卡片拖入目标区域，和为 ${target}</div>
    <div class="space-y-3">
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">卡片</div>
        <div id="mt-cards" class="flex flex-wrap gap-2"></div>
      </div>
      <div class="card p-3">
        <div class="text-xs text-gray-500 mb-2">目标区域</div>
        <div id="mt-drop" class="min-h-[4rem] border-2 border-dashed rounded p-2 flex items-center gap-2"></div>
        <div class="mt-2 text-sm">正确：<span id="mt-correct">0</span> 错误：<span id="mt-wrong">0</span></div>
        <button id="mt-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
      </div>
    </div>
  `;
  const cardsBox = wrap.querySelector('#mt-cards');
  cards.forEach(n => {
    const btn = document.createElement('div');
    btn.className = 'px-3 py-2 border rounded bg-white text-sm cursor-move';
    btn.textContent = String(n);
    btn.setAttribute('draggable', 'true');
    btn.dataset.value = String(n);
    btn.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', btn.dataset.value || '');
    });
    cardsBox.appendChild(btn);
  });
  const drop = wrap.querySelector('#mt-drop');
  const correctEl = wrap.querySelector('#mt-correct');
  const wrongEl = wrap.querySelector('#mt-wrong');
  let held = [];
  function refreshDrop() {
    drop.innerHTML = held.map(v => `<span class="px-2 py-1 border rounded text-sm bg-white">${v}</span>`).join('');
  }
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('ring', 'ring-indigo-300');
  });
  drop.addEventListener('dragleave', () => {
    drop.classList.remove('ring', 'ring-indigo-300');
  });
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('ring', 'ring-indigo-300');
    const val = Number(e.dataTransfer.getData('text/plain'));
    if (held.length < 2) {
      held.push(val);
      refreshDrop();
    }
    if (held.length === 2) {
      const sum = held[0] + held[1];
      if (sum === target) {
        drop.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
        correctEl.textContent = String(Number(correctEl.textContent) + 1);
      } else {
        drop.classList.add('bg-red-50', 'border-red-300', 'text-red-700');
        wrongEl.textContent = String(Number(wrongEl.textContent) + 1);
      }
      const c = Number(correctEl.textContent);
      const w = Number(wrongEl.textContent);
      setResultFooter(wrap, `正确 ${c}，错误 ${w}`);
      setTimeout(() => {
        drop.classList.remove('bg-green-50', 'border-green-300', 'text-green-700', 'bg-red-50', 'border-red-300', 'text-red-700');
        held = [];
        refreshDrop();
      }, 400);
    }
  });
  wrap.querySelector('#mt-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildMakeTenGame(game);
    parent.replaceChild(fresh, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  return wrap;
}

function buildAddSubMoleGame(game) {
  const range = Array.isArray(game.generator.range) ? game.generator.range : [1, 20];
  const ops = Array.isArray(game.generator.ops) ? game.generator.ops : ['+','-'];
  const min = Math.max(0, Number(range[0] || 1));
  const max = Math.max(min + 1, Number(range[1] || 20));
  const timeLimit = (game.success && game.success.timeLimitSec) ? Number(game.success.timeLimitSec) : 45;
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">点击正确答案，限时练习</div>
    <div class="card p-3">
      <div id="asm-question" class="text-lg font-semibold text-indigo-700"></div>
      <div id="asm-options" class="mt-3 flex flex-wrap gap-2"></div>
      <div class="mt-3 text-sm">正确：<span id="asm-correct">0</span> 错误：<span id="asm-wrong">0</span> 用时：<span id="asm-time">0.0s</span> / ${timeLimit}s</div>
      <button id="asm-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
    </div>
  `;
  const qEl = wrap.querySelector('#asm-question');
  const optBox = wrap.querySelector('#asm-options');
  const correctEl = wrap.querySelector('#asm-correct');
  const wrongEl = wrap.querySelector('#asm-wrong');
  const timeEl = wrap.querySelector('#asm-time');
  let startTs = performance.now();
  let raf = null;
  let answer = null;
  function tick() {
    const elapsed = (performance.now() - startTs) / 1000;
    timeEl.textContent = `${elapsed.toFixed(1)}s`;
    if (elapsed >= timeLimit) {
      optBox.querySelectorAll('button').forEach(b => b.disabled = true);
      if (raf) cancelAnimationFrame(raf);
      const c = Number(correctEl.textContent);
      const w = Number(wrongEl.textContent);
      setResultFooter(wrap, `正确 ${c}，错误 ${w}，用时 ${timeLimit}s`);
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  function next() {
    const a = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    const op = ops[Math.floor(Math.random() * ops.length)];
    answer = op === '+' ? a + b : a - b;
    qEl.textContent = `${a} ${op} ${b} = ?`;
    const options = new Set([answer]);
    while (options.size < 4) {
      const delta = Math.floor(Math.random() * 5) - 2;
      options.add(answer + delta);
    }
    optBox.innerHTML = '';
    Array.from(options).sort((x,y)=>x-y).forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'px-3 py-2 border rounded hover:bg-gray-50 text-sm';
      btn.textContent = String(v);
      btn.dataset.value = String(v);
      optBox.appendChild(btn);
    });
  }
  next();
  optBox.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    if (btn.disabled) return;
    const v = Number(btn.dataset.value);
    if (v === answer) {
      btn.classList.add('bg-green-50', 'border-green-300', 'text-green-700');
      correctEl.textContent = String(Number(correctEl.textContent) + 1);
      setTimeout(next, 200);
    } else {
      btn.classList.add('bg-red-50', 'border-red-300', 'text-red-700');
      wrongEl.textContent = String(Number(wrongEl.textContent) + 1);
    }
  });
  wrap.querySelector('#asm-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildAddSubMoleGame(game);
    parent.replaceChild(fresh, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  wrap._cleanup = () => {
    if (raf) cancelAnimationFrame(raf);
  };
  return wrap;
}

function buildSplitCombineGame(game) {
  const range = Array.isArray(game.generator.targetRange) ? game.generator.targetRange : [5, 20];
  const min = Math.max(2, Number(range[0] || 5));
  const max = Math.max(min + 1, Number(range[1] || 20));
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">输入两个数，使其相加等于目标</div>
    <div class="card p-3">
      <div class="text-xs text-gray-500 mb-2">目标</div>
      <div id="sc-target" class="text-xl font-semibold text-indigo-700"></div>
      <div class="mt-3 flex items-center gap-2">
        <input id="sc-a" type="number" class="text-sm border rounded px-2 py-1 w-24" />
        <span class="text-sm">+</span>
        <input id="sc-b" type="number" class="text-sm border rounded px-2 py-1 w-24" />
        <button id="sc-check" class="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-50">确定</button>
      </div>
      <div class="mt-3 text-sm">正确：<span id="sc-correct">0</span> 错误：<span id="sc-wrong">0</span></div>
      <button id="sc-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
    </div>
  `;
  const targetEl = wrap.querySelector('#sc-target');
  const aEl = wrap.querySelector('#sc-a');
  const bEl = wrap.querySelector('#sc-b');
  const correctEl = wrap.querySelector('#sc-correct');
  const wrongEl = wrap.querySelector('#sc-wrong');
  let target = 0;
  function next() {
    target = Math.floor(Math.random() * (max - min + 1)) + min;
    targetEl.textContent = String(target);
    aEl.value = '';
    bEl.value = '';
  }
  next();
  wrap.querySelector('#sc-check').addEventListener('click', () => {
    const a = Number(aEl.value);
    const b = Number(bEl.value);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    if (a + b === target) {
      correctEl.textContent = String(Number(correctEl.textContent) + 1);
      next();
    } else {
      wrongEl.textContent = String(Number(wrongEl.textContent) + 1);
    }
    const c = Number(correctEl.textContent);
    const w = Number(wrongEl.textContent);
    setResultFooter(wrap, `正确 ${c}，错误 ${w}`);
  });
  wrap.querySelector('#sc-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildSplitCombineGame(game);
    parent.replaceChild(fresh, wrap);
  });
  const footer = buildResultFooter(game);
  wrap.appendChild(footer);
  return wrap;
}

function buildClockHalfGame(game) {
  const modes = Array.isArray(game.generator.modes) ? game.generator.modes : ['整点', '半点'];
  const count = (game.generator && game.generator.count) ? Number(game.generator.count) : 10;
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">拖拽时针与分针到对应位置</div>
    <div class="card p-3">
      <div id="ch-task" class="text-sm text-gray-700"></div>
      <div class="mt-3">
        <div class="text-xs text-gray-500 mb-2">指针</div>
        <div class="flex gap-2">
          <div id="ch-hour" class="px-3 py-2 border rounded bg-white text-sm" draggable="true" data-value="hour">时针</div>
          <div id="ch-minute-0" class="px-3 py-2 border rounded bg-white text-sm" draggable="true" data-value="0">分针0</div>
          <div id="ch-minute-30" class="px-3 py-2 border rounded bg-white text-sm" draggable="true" data-value="30">分针30</div>
        </div>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <div id="ch-hour-box" class="h-16 border-2 border-dashed rounded flex items-center justify-center text-sm text-gray-500" data-target="hour">时针位置</div>
        <div id="ch-minute-box" class="h-16 border-2 border-dashed rounded flex items-center justify-center text-sm text-gray-500" data-target="minute">分针位置</div>
      </div>
      <div class="mt-3 text-sm">正确：<span id="ch-correct">0</span> / ${count}</div>
      <button id="ch-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
    </div>
  `;
  const taskEl = wrap.querySelector('#ch-task');
  const hourBox = wrap.querySelector('#ch-hour-box');
  const minuteBox = wrap.querySelector('#ch-minute-box');
  const correctEl = wrap.querySelector('#ch-correct');
  let currentMode = '';
  let currentHour = 1;
  let placedHour = false;
  let placedMinute = false;
  function newTask() {
    currentMode = modes[Math.floor(Math.random() * modes.length)];
    currentHour = Math.floor(Math.random() * 12) + 1;
    taskEl.textContent = `${currentMode} · ${currentHour}点`;
    placedHour = false;
    placedMinute = false;
    hourBox.textContent = '时针位置';
    hourBox.classList.remove('bg-green-50','border-green-300','text-green-700');
    minuteBox.textContent = '分针位置';
    minuteBox.classList.remove('bg-green-50','border-green-300','text-green-700');
  }
  newTask();
  function handleDrop(box, data) {
    const target = box.dataset.target;
    if (target === 'hour' && data === 'hour') {
      box.textContent = `${currentHour} 点`;
      box.classList.add('bg-green-50','border-green-300','text-green-700');
      placedHour = true;
    } else if (target === 'minute') {
      const need = currentMode === '整点' ? '0' : '30';
      if (data === need) {
        box.textContent = `${need} 分`;
        box.classList.add('bg-green-50','border-green-300','text-green-700');
        placedMinute = true;
      } else {
        box.classList.add('bg-red-50','border-red-300','text-red-700');
        setTimeout(() => box.classList.remove('bg-red-50','border-red-300','text-red-700'), 300);
      }
    }
    if (placedHour && placedMinute) {
      correctEl.textContent = String(Number(correctEl.textContent) + 1);
      newTask();
    }
  }
  [hourBox, minuteBox].forEach(box => {
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.classList.add('ring','ring-indigo-300');
    });
    box.addEventListener('dragleave', () => {
      box.classList.remove('ring','ring-indigo-300');
    });
    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.classList.remove('ring','ring-indigo-300');
      const data = e.dataTransfer.getData('text/plain');
      handleDrop(box, data);
    });
  });
  ['ch-hour','ch-minute-0','ch-minute-30'].forEach(id => {
    const el = wrap.querySelector(`#${id}`);
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', el.dataset.value || '');
    });
  });
  wrap.querySelector('#ch-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildClockHalfGame(game);
    parent.replaceChild(fresh, wrap);
  });
  return wrap;
}

function buildShapePuzzleGame(game) {
  const shapes = Array.isArray(game.generator.shapes) ? game.generator.shapes : ['正方形','圆','三角形'];
  const targets = (game.generator && game.generator.targets) ? Number(game.generator.targets) : 6;
  const list = Array.from({ length: targets }, () => shapes[Math.floor(Math.random() * shapes.length)]);
  const wrap = document.createElement('div');
  wrap.className = 'mt-3';
  wrap.innerHTML = `
    <div class="text-sm text-gray-600 mb-2">把形状拖到对应的目标框</div>
    <div class="card p-3">
      <div class="text-xs text-gray-500 mb-2">形状</div>
      <div id="sp-palette" class="flex flex-wrap gap-2"></div>
      <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3" id="sp-targets"></div>
      <div class="mt-3 text-sm">正确：<span id="sp-correct">0</span> / ${targets}</div>
      <button id="sp-restart" class="mt-3 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-sm">重新开始</button>
    </div>
  `;
  const palette = wrap.querySelector('#sp-palette');
  const targetsBox = wrap.querySelector('#sp-targets');
  const correctEl = wrap.querySelector('#sp-correct');
  shapes.forEach(s => {
    const el = document.createElement('div');
    el.className = 'px-3 py-2 border rounded bg-white text-sm';
    el.textContent = s;
    el.dataset.value = s;
    el.setAttribute('draggable','true');
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', s);
    });
    palette.appendChild(el);
  });
  list.forEach((need, i) => {
    const box = document.createElement('div');
    box.className = 'h-20 border-2 border-dashed rounded flex items-center justify-center text-sm text-gray-500';
    box.dataset.need = need;
    box.textContent = `目标：${need}`;
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.classList.add('ring','ring-indigo-300');
    });
    box.addEventListener('dragleave', () => {
      box.classList.remove('ring','ring-indigo-300');
    });
    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.classList.remove('ring','ring-indigo-300');
      const got = e.dataTransfer.getData('text/plain');
      if (got === need) {
        box.textContent = `已放置：${got}`;
        box.classList.add('bg-green-50','border-green-300','text-green-700');
        box.setAttribute('aria-busy','true');
        correctEl.textContent = String(Number(correctEl.textContent) + 1);
      } else {
        box.classList.add('bg-red-50','border-red-300','text-red-700');
        setTimeout(() => box.classList.remove('bg-red-50','border-red-300','text-red-700'), 300);
      }
    });
    targetsBox.appendChild(box);
  });
  wrap.querySelector('#sp-restart').addEventListener('click', () => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const fresh = buildShapePuzzleGame(game);
    parent.replaceChild(fresh, wrap);
  });
  return wrap;
}

// 简单洗牌
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 显示加载状态
 * @param {HTMLElement} container - 容器元素
 */
function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
        <span class="text-sm text-gray-600">加载中...</span>
      </div>
    </div>
  `;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderSummary,
    renderGrade,
    renderAll,
    renderGameDetail,
    renderEmptyState,
    showLoading
  };
} else {
  window.Renderer = {
    renderSummary,
    renderGrade,
    renderAll,
    renderGameDetail,
    renderEmptyState,
    showLoading
  };
}
