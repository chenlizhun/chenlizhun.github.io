/**
 * 统计计算模块
 * 负责计算和生成统计数据
 */

/**
 * 收集统计数据
 * @param {Array} grades - 年级数据数组
 * @returns {Object} 统计数据对象
 */
function collectStats(grades) {
  const unitCount = grades.reduce((acc, g) => acc + (g.units || []).length, 0);
  const gameCount = grades.reduce((acc, g) => {
    return acc + (g.units || []).reduce((a, u) => a + (u.games || []).length, 0);
  }, 0);
  
  const unitSkillMap = new Map();
  const gameSkillMap = new Map();
  const typeMap = new Map();
  
  grades.forEach(g => {
    (g.units || []).forEach(u => {
      (u.skills || []).forEach(s => {
        unitSkillMap.set(s, (unitSkillMap.get(s) || 0) + 1);
      });
      (u.games || []).forEach(m => {
        (m.skills || []).forEach(s => {
          gameSkillMap.set(s, (gameSkillMap.get(s) || 0) + 1);
        });
        if (m.type) {
          typeMap.set(m.type, (typeMap.get(m.type) || 0) + 1);
        }
      });
    });
  });
  
  const unitSkills = Array.from(unitSkillMap.entries()).sort((a, b) => b[1] - a[1]);
  const gameSkills = Array.from(gameSkillMap.entries()).sort((a, b) => b[1] - a[1]);
  const types = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]);
  
  const unitMaxVal = unitSkills.length ? Math.max(...unitSkills.map(([_, v]) => v)) : 0;
  const gameMaxVal = gameSkills.length ? Math.max(...gameSkills.map(([_, v]) => v)) : 0;
  const typeMaxVal = types.length ? Math.max(...types.map(([_, v]) => v)) : 0;
  
  return {
    unitCount,
    gameCount,
    unitSkills,
    gameSkills,
    unitMaxVal,
    gameMaxVal,
    types,
    typeMaxVal
  };
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { collectStats };
} else {
  window.Stats = { collectStats };
}
