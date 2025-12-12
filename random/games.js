/**
 * 游戏模块
 * 管理所有游戏模式
 */

 

/**
 * 初始化所有游戏
 */
window.initGames = function() {
    if (typeof window.initSimple === 'function') window.initSimple();
    if (typeof window.initGroup === 'function') window.initGroup();
    if (typeof window.initRace === 'function') window.initRace();
};

/**
 * 更新所有游戏的学生名单
 */
window.updateGames = function() {
    try {
        if (typeof window.updateSimple === 'function') window.updateSimple();
        if (typeof window.updateGroup === 'function') window.updateGroup();
        if (typeof window.updateRace === 'function') window.updateRace();
    } catch (error) {
        console.error('更新游戏学生名单时出错:', error);
    }
};
