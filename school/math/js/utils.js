/**
 * 工具函数模块
 * 提供通用的工具函数
 */

/**
 * 获取唯一的技能列表
 * @param {Array} grades - 年级数据数组
 * @returns {Array<string>} 排序后的技能列表
 */
function getUniqueSkills(grades) {
  const set = new Set();
  grades.forEach(g => (g.units || []).forEach(u => {
    (u.skills || []).forEach(s => set.add(s));
    (u.games || []).forEach(m => (m.skills || []).forEach(s => set.add(s)));
  }));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/**
 * 获取唯一的年级列表
 * @param {Array} grades - 年级数据数组
 * @returns {Array<string>} 排序后的年级列表
 */
function getUniqueGrades(grades) {
  const set = new Set();
  grades.forEach(g => set.add(String(g.grade)));
  return Array.from(set).sort((a, b) => Number(a) - Number(b));
}

/**
 * 获取唯一的游戏类型列表
 * @param {Array} grades - 年级数据数组
 * @returns {Array<string>} 排序后的类型列表
 */
function getUniqueGameTypes(grades) {
  const set = new Set();
  grades.forEach(g => (g.units || []).forEach(u => (u.games || []).forEach(m => set.add(m.type))));
  return Array.from(set).sort();
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 更新URL参数
 * @param {Object} filters - 筛选条件对象
 */
function updateURL(filters) {
  const params = new URLSearchParams();
  if (filters.skill && filters.skill !== '__all__') params.set('skill', filters.skill);
  if (filters.grade && filters.grade !== '__all_grade') params.set('grade', filters.grade);
  if (filters.type && filters.type !== '__all_type') params.set('type', filters.type);
  
  const qs = params.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, '', url);
}

/**
 * 从URL读取筛选参数
 * @returns {Object} 筛选条件对象
 */
function getFiltersFromURL() {
  const qp = new URLSearchParams(location.search);
  return {
    grade: qp.get('grade') || '__all_grade',
    type: qp.get('type') || '__all_type',
    skill: qp.get('skill') || '__all__'
  };
}

/**
 * 导出JSON数据
 * @param {Object} data - 要导出的数据
 * @param {string} filename - 文件名
 */
function exportJSON(data, filename = 'math-view.json') {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[Utils] 导出失败:', error);
    alert('导出失败，请重试');
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getUniqueSkills,
    getUniqueGrades,
    getUniqueGameTypes,
    deepClone,
    updateURL,
    getFiltersFromURL,
    exportJSON
  };
} else {
  window.Utils = {
    getUniqueSkills,
    getUniqueGrades,
    getUniqueGameTypes,
    deepClone,
    updateURL,
    getFiltersFromURL,
    exportJSON
  };
}

