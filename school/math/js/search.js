/**
 * 搜索模块
 * 负责搜索功能实现
 */

/**
 * 搜索游戏
 * @param {Array} grades - 年级数据数组
 * @param {string} query - 搜索关键词
 * @returns {Array} 筛选后的年级数据数组
 */
function searchGames(grades, query) {
  if (!query || !query.trim()) {
    return grades;
  }
  
  const searchTerm = query.trim().toLowerCase();
  
  return grades.map(grade => {
    const units = (grade.units || []).map(unit => {
      // 搜索单元标题和技能
      const unitMatches = 
        (unit.title || '').toLowerCase().includes(searchTerm) ||
        (unit.skills || []).some(skill => skill.toLowerCase().includes(searchTerm));
      
      // 搜索游戏
      const games = (unit.games || []).filter(game => {
        const gameMatches = 
          (game.title || '').toLowerCase().includes(searchTerm) ||
          (game.type || '').toLowerCase().includes(searchTerm) ||
          (game.skills || []).some(skill => skill.toLowerCase().includes(searchTerm));
        return gameMatches;
      });
      
      // 如果单元匹配或有匹配的游戏，则包含此单元
      if (unitMatches || games.length > 0) {
        return {
          ...unit,
          games: unitMatches ? unit.games : games
        };
      }
      
      return null;
    }).filter(Boolean);
    
    return units.length > 0 ? { ...grade, units } : null;
  }).filter(Boolean);
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖处理后的函数
 */
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { searchGames, debounce };
} else {
  window.Search = { searchGames, debounce };
}

