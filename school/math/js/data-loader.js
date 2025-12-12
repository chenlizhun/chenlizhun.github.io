/**
 * 数据加载模块
 * 负责从服务器加载和验证数据
 */

/**
 * 加载游戏数据
 * @returns {Promise<Array>} 年级数据数组
 * @throws {Error} 数据加载失败时抛出错误
 */
async function loadData() {
  try {
    // 根据当前页面路径确定数据文件路径
    const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
    const paths = [
      './data/grades.json',
      'data/grades.json',
      basePath + '/data/grades.json',
      '/school/math/data/grades.json'
    ];
    
    let lastError = null;
    for (const path of paths) {
      try {
        const res = await fetch(path, { cache: 'no-store' });
        
        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status}: ${path}`);
          continue;
        }
        
        const json = await res.json();
        
        if (!json || !Array.isArray(json.grades)) {
          lastError = new Error('数据格式错误: 缺少 grades 数组');
          continue;
        }
        
        console.log('[DataLoader] 成功加载数据，路径:', path);
        return json.grades;
      } catch (err) {
        // 网络错误或JSON解析错误
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          lastError = new Error('无法访问数据文件，请确保通过HTTP服务器运行（不能使用file://协议）');
        } else {
          lastError = err;
        }
        continue;
      }
    }
    
    throw lastError || new Error('无法加载数据文件');
  } catch (error) {
    console.error('[DataLoader] 加载数据失败:', error);
    throw error;
  }
}

/**
 * 验证数据格式
 * @param {Array} grades - 年级数据数组
 * @returns {boolean} 数据是否有效
 */
function validateData(grades) {
  if (!Array.isArray(grades)) {
    return false;
  }
  
  return grades.every(grade => {
    return grade && 
           typeof grade.grade === 'number' && 
           Array.isArray(grade.units);
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadData, validateData };
} else {
  window.DataLoader = { loadData, validateData };
}

