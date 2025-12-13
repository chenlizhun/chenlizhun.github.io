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
    if (typeof window.initWheel === 'function') window.initWheel();
    if (typeof window.initSlotMachine === 'function') window.initSlotMachine();
    if (typeof window.initLottery === 'function') window.initLottery();
    if (typeof window.initCard === 'function') window.initCard();
    if (typeof window.initSpin === 'function') window.initSpin();
};

/**
 * 更新所有游戏的学生名单
 */
window.updateGames = function() {
    try {
        if (typeof window.updateSimple === 'function') window.updateSimple();
        if (typeof window.updateGroup === 'function') window.updateGroup();
        if (typeof window.updateRace === 'function') window.updateRace();
        if (typeof window.updateWheel === 'function') window.updateWheel();
        if (typeof window.updateSlotMachine === 'function') window.updateSlotMachine();
        if (typeof window.updateLottery === 'function') window.updateLottery();
        if (typeof window.updateCard === 'function') window.updateCard();
        if (typeof window.updateSpin === 'function') window.updateSpin();
    } catch (error) {
        console.error('更新游戏学生名单时出错:', error);
    }
};
