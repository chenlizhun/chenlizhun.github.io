/**
 * 主入口模块
 * 负责应用初始化和事件绑定
 */

/**
 * 初始化应用
 */
async function init() {
  try {
    // 获取DOM元素
    const content = document.getElementById('content');
    const summaryEl = document.getElementById('summary');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchInput = document.getElementById('searchInput');
    const skillEl = document.getElementById('skillFilter');
    const gradeEl = document.getElementById('gradeFilter');
    const typeEl = document.getElementById('typeFilter');
    const clearEl = document.getElementById('clearFilter');
    const exportEl = document.getElementById('exportJson');
    
    if (!content || !summaryEl || !skillEl || !gradeEl || !typeEl || !clearEl || !exportEl) {
      throw new Error('必要的DOM元素未找到');
    }
    
    // 显示加载状态
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (content) window.Renderer.showLoading(content);
    
    // 加载数据
    const grades = await window.DataLoader.loadData();
    
    // 隐藏加载状态
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    
    // 验证数据
    if (!window.DataLoader.validateData(grades)) {
      throw new Error('数据格式验证失败');
    }
    
    // 初始化筛选选项
    const skills = window.Utils.getUniqueSkills(grades);
    const gradeOptions = window.Utils.getUniqueGrades(grades);
    const typeOptions = window.Utils.getUniqueGameTypes(grades);
    
    gradeEl.innerHTML = ['<option value="__all_grade">全部年级</option>', 
      ...gradeOptions.map(s => `<option value="${s}">${s}</option>`)].join('');
    typeEl.innerHTML = ['<option value="__all_type">全部类型</option>', 
      ...typeOptions.map(s => `<option value="${s}">${s}</option>`)].join('');
    skillEl.innerHTML = ['<option value="__all__">全部技能</option>', 
      ...skills.map(s => `<option value="${s}">${s}</option>`)].join('');
    
    // 从URL读取筛选参数
    const urlFilters = window.Utils.getFiltersFromURL();
    if (urlFilters.grade !== '__all_grade' && gradeOptions.includes(urlFilters.grade)) {
      gradeEl.value = urlFilters.grade;
    }
    if (urlFilters.type !== '__all_type' && typeOptions.includes(urlFilters.type)) {
      typeEl.value = urlFilters.type;
    }
    if (urlFilters.skill !== '__all__' && skills.includes(urlFilters.skill)) {
      skillEl.value = urlFilters.skill;
    }
    
    // 当前筛选条件
    let currentFilters = {
      skill: skillEl.value,
      grade: gradeEl.value,
      type: typeEl.value,
      search: searchInput ? searchInput.value : ''
    };
    
    // 原始数据备份
    const originalGrades = window.Utils.deepClone(grades);
    
    // 当前显示的数据
    let currentGrades = applyFiltersAndSearch(originalGrades, currentFilters);
    
    // 应用筛选和搜索
    function applyFiltersAndSearch(data, filters) {
      // 先应用筛选
      let filtered = window.Filter.applyFilter(data, filters);
      
      // 再应用搜索
      if (filters.search && filters.search.trim()) {
        filtered = window.Search.searchGames(filtered, filters.search);
      }
      
      return filtered;
    }
    
    // 更新函数
    function update() {
      currentFilters = {
        skill: skillEl.value,
        grade: gradeEl.value,
        type: typeEl.value,
        search: searchInput ? searchInput.value : ''
      };
      
      currentGrades = applyFiltersAndSearch(originalGrades, currentFilters);
      window.Renderer.renderAll(currentGrades, content);
      
      if (!summaryEl.classList.contains('hidden')) {
        const stats = window.Stats.collectStats(currentGrades);
        stats.grades = window.Utils.getUniqueGrades(currentGrades);
        summaryEl.innerHTML = '';
        summaryEl.appendChild(window.Renderer.renderSummary(stats, currentFilters));
      } else {
        summaryEl.innerHTML = '';
      }
      
      // URL更新（不包含搜索关键词，避免URL过长）
      window.Utils.updateURL({
        skill: currentFilters.skill,
        grade: currentFilters.grade,
        type: currentFilters.type
      });
    }
    
    // 清除筛选
    function clearFilters() {
      skillEl.value = '__all__';
      gradeEl.value = '__all_grade';
      typeEl.value = '__all_type';
      if (searchInput) searchInput.value = '';
      currentFilters = {
        skill: '__all__',
        grade: '__all_grade',
        type: '__all_type',
        search: ''
      };
      currentGrades = window.Utils.deepClone(originalGrades);
      window.Renderer.renderAll(currentGrades, content);
      
      const stats = window.Stats.collectStats(currentGrades);
      stats.grades = window.Utils.getUniqueGrades(currentGrades);
      summaryEl.innerHTML = '';
      summaryEl.appendChild(window.Renderer.renderSummary(stats, currentFilters));
      
      window.Utils.updateURL({});
    }
    
    // 导出数据
    function exportData() {
      const payload = {
        filters: currentFilters,
        data: currentGrades
      };
      window.Utils.exportJSON(payload, 'math-view.json');
    }
    
    // 绑定游戏详情点击事件
    function bindGameInteractions() {
      content.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-unit][data-game]');
        if (!btn) return;
        
        const unitId = btn.getAttribute('data-unit');
        const gameId = btn.getAttribute('data-game');
        
        const grade = currentGrades.find(g => (g.units || []).some(u => u.id === unitId));
        const unit = grade ? (grade.units || []).find(u => u.id === unitId) : null;
        const game = unit ? (unit.games || []).find(g => g.id === gameId) : null;
        
        if (!game) return;
        
        // 先处理当前按钮所在区域的切换：如果本区域已有详情，则移除并返回（切换关闭）
        const existingDetail = btn.parentElement.querySelector('.card.mt-3');
        if (existingDetail) {
          if (typeof existingDetail._cleanup === 'function') {
            try { existingDetail._cleanup(); } catch (_) {}
          }
          existingDetail.remove();
          return;
        }
        // 保证同一时间仅显示一个详情：移除页面上其它详情
        const allDetails = content.querySelectorAll('.card.mt-3');
        allDetails.forEach(d => {
          if (typeof d._cleanup === 'function') {
            try { d._cleanup(); } catch (_) {}
          }
          d.remove();
        });
        
        // 显示详情
        const detail = window.Renderer.renderGameDetail(game, unit);
        btn.parentElement.appendChild(detail);
        // 展示后滚动进视口
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      // 关闭详情按钮
      content.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('button[data-action="close-detail"]');
        if (!closeBtn) return;
        const card = closeBtn.closest('.card.mt-3');
        if (card) {
          if (typeof card._cleanup === 'function') {
            try { card._cleanup(); } catch (_) {}
          }
          card.remove();
        }
      });
    }
    
    // 绑定事件
    skillEl.addEventListener('change', update);
    gradeEl.addEventListener('change', update);
    typeEl.addEventListener('change', update);
    clearEl.addEventListener('click', clearFilters);
    exportEl.addEventListener('click', exportData);
    // 折叠全部/展开全部
    const toggleAllEl = document.getElementById('toggleAllGrades');
    if (toggleAllEl) {
      toggleAllEl.addEventListener('click', () => {
        const gradeCards = content.querySelectorAll('.card.p-4');
        if (!gradeCards.length) return;
        let anyVisible = false;
        gradeCards.forEach(card => {
          const gc = card.querySelector('.grade-content');
          if (gc && gc.style.display !== 'none') anyVisible = true;
        });
        const targetHidden = anyVisible; // 如果当前有可见，则目标是全部隐藏
        gradeCards.forEach(card => {
          const gc = card.querySelector('.grade-content');
          const toggleBtn = card.querySelector('button[data-action="toggle-grade"]');
          const arrow = toggleBtn ? toggleBtn.querySelector('.toggle-arrow') : null;
          const text = toggleBtn ? toggleBtn.querySelector('.toggle-text') : null;
          if (gc) gc.style.display = targetHidden ? 'none' : '';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', targetHidden ? 'false' : 'true');
          if (arrow) arrow.textContent = targetHidden ? '▸' : '▾';
          if (text) text.textContent = targetHidden ? '展开' : '折叠';
          // 写入存储
          const gradeLabel = card.dataset.grade;
          if (typeof localStorage !== 'undefined' && gradeLabel) {
            localStorage.setItem(`math_grade_collapsed_${gradeLabel}`, targetHidden ? '1' : '0');
          }
        });
        toggleAllEl.textContent = targetHidden ? '展开全部' : '折叠全部';
      });
    }
    
    // 搜索功能（防抖处理）
    if (searchInput) {
      const debouncedUpdate = window.Search.debounce(update, 300);
      searchInput.addEventListener('input', debouncedUpdate);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          update();
        }
      });
    }
    
    bindGameInteractions();
    
    // 初始渲染
    update();
    
  } catch (error) {
    console.error('[Main] 初始化失败:', error);
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = `
        <div class="card p-4">
          <div class="text-red-600 font-semibold">加载失败</div>
          <div class="text-sm text-gray-600 mt-2">${error.message}</div>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            重新加载
          </button>
        </div>
      `;
    }
  }
}

// 确保所有模块都已加载
function waitForModules() {
  if (window.DataLoader && window.Utils && window.Stats && window.Filter && window.Search && window.Renderer) {
    // 所有模块已加载，可以初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } else {
    // 等待模块加载
    setTimeout(waitForModules, 50);
  }
}

// 开始等待模块加载
waitForModules();
