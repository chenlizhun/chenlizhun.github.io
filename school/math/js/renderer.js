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

/**
 * 渲染单个年级
 * @param {Object} grade - 年级数据对象
 * @returns {HTMLElement} 年级卡片元素
 */
function renderGrade(grade) {
  const wrap = document.createElement('div');
  wrap.className = 'card p-4';
  
  const units = Array.isArray(grade.units) ? grade.units : [];
  const unitHTML = units.map(u => {
    const games = Array.isArray(u.games) ? u.games : [];
    const gameHTML = games.map(g => `
      <button class="game-btn hover:bg-gray-50" data-unit="${u.id}" data-game="${g.id}" title="${g.type}">
        ${g.title} <span class="pill ml-2">${g.type}</span>
      </button>
    `).join(' ');
    const skills = (u.skills || []).map(s => `<span class="pill">${s}</span>`).join(' ');
    return `
      <div class="mb-3">
        <div class="flex items-center justify-between">
          <span class="unit-title">${u.title}</span>
          <span class="badge">关卡：${games.length}</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-2">${gameHTML}</div>
        <div class="mt-2 flex flex-wrap gap-1">${skills}</div>
      </div>
    `;
  }).join('');
  
  wrap.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">第${grade.grade}年级</span>
      <span class="text-xs text-gray-500">单元：${units.length}</span>
    </div>
    ${unitHTML}
  `;
  
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
  detail.innerHTML = `
    <div class="font-semibold text-gray-800">关卡详情</div>
    <div class="text-sm text-gray-600 mt-1">${unit.title} · ${game.title}</div>
    <pre class="text-xs bg-gray-50 border border-gray-200 rounded p-2 mt-2 overflow-auto">${JSON.stringify(game, null, 2)}</pre>
  `;
  return detail;
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

