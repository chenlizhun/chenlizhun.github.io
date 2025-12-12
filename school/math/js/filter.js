/**
 * 筛选模块
 * 负责数据筛选逻辑
 */

/**
 * 应用筛选条件
 * @param {Array} grades - 原始年级数据数组
 * @param {Object} filters - 筛选条件对象
 * @param {string} filters.skill - 技能筛选
 * @param {string} filters.grade - 年级筛选
 * @param {string} filters.type - 类型筛选
 * @returns {Array} 筛选后的年级数据数组
 */
function applyFilter(grades, filters) {
  const skill = filters && filters.skill !== '__all__' ? filters.skill : null;
  const grade = filters && filters.grade !== '__all_grade' ? filters.grade : null;
  const type = filters && filters.type !== '__all_type' ? filters.type : null;
  
  // 先按年级筛选
  const base = grade ? grades.filter(g => String(g.grade) === String(grade)) : grades;
  
  // 如果没有技能和类型筛选，直接返回深拷贝
  if (!skill && !type) {
    return JSON.parse(JSON.stringify(base));
  }
  
  // 应用技能和类型筛选
  return base.map(g => {
    const units = (g.units || []).map(u => {
      let games = (u.games || []);
      
      // 按技能筛选游戏
      if (skill) {
        games = games.filter(m => (m.skills || []).includes(skill));
      }
      
      // 按类型筛选游戏
      if (type) {
        games = games.filter(m => m.type === type);
      }
      
      // 判断单元是否匹配（单元技能匹配或包含匹配的游戏）
      const unitMatch = (skill ? (u.skills || []).includes(skill) : false) || games.length > 0;
      
      return unitMatch ? {
        id: u.id,
        title: u.title,
        skills: u.skills,
        games
      } : null;
    }).filter(Boolean);
    
    return { grade: g.grade, units };
  }).filter(g => (g.units || []).length > 0);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyFilter };
} else {
  window.Filter = { applyFilter };
}

