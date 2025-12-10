/**
 * 主应用模块
 * 初始化所有功能模块
 */

// 默认学生名单
const defaultStudents = [
  "赵子杰", "陈金浩", "钟浩翔", "何军标", "温彬泓", "许增灿", "李浩文", "刘家祈",
  "吴卓希", "张尚岳", "林承熙"
];

/**
 * 初始化应用
 */
function initApp() {
    // 设置默认学生名单
    window.setStudents(defaultStudents);
    
    // 初始化学生管理模块
    window.initStudents();
    
    // 初始化UI
    window.initUI();
    
    // 初始化游戏
    window.initGames();
    
    // 初始化随机抽签模式
    window.initRandomMode();
    
    // 初始化已抽中人员列表管理
    const btnClearSelected = document.getElementById('btnClearSelected');
    if (btnClearSelected) {
        btnClearSelected.addEventListener('click', window.clearSelectedStudents);
    }
    
    console.log('应用初始化完成');
}

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}