/**
 * 游戏模块
 * 管理所有游戏模式
 */

// 转盘已隐藏，定义空函数防止调用出错
window.updateWheel = function() {
    return;
};
window.initWheel = function() {
    return;
};

/**
 * 初始化所有游戏
 */
window.initGames = function() {
    // 转盘已隐藏，跳过初始化
    window.initSlotMachine();
    window.initRoller();
    window.initCard();
    window.initGrid();
    window.initList();
    window.initBall();
    window.initRace();
    window.initBalloon();
    window.initGift();
    window.initSpin();
    window.initLottery();
    window.initNumber();
    window.initMatrix();
    window.initLight();
    window.initRainbow();
    window.initType();
    window.initStar();
};

/**
 * 更新所有游戏的学生名单
 */
window.updateGames = function() {
    try {
        // 只调用已经定义的游戏更新函数
        if (typeof window.updateSlotMachine === 'function') window.updateSlotMachine();
        if (typeof window.updateRoller === 'function') window.updateRoller();
        if (typeof window.updateCard === 'function') window.updateCard();
        if (typeof window.updateGrid === 'function') window.updateGrid();
        if (typeof window.updateList === 'function') window.updateList();
        if (typeof window.updateBall === 'function') window.updateBall();
        if (typeof window.updateRace === 'function') window.updateRace();
        if (typeof window.updateBalloon === 'function') window.updateBalloon();
        if (typeof window.updateGift === 'function') window.updateGift();
        if (typeof window.updateSpin === 'function') window.updateSpin();
        if (typeof window.updateLottery === 'function') window.updateLottery();
        if (typeof window.updateNumber === 'function') window.updateNumber();
        if (typeof window.updateMatrix === 'function') window.updateMatrix();
        if (typeof window.updateLight === 'function') window.updateLight();
        if (typeof window.updateRainbow === 'function') window.updateRainbow();
        if (typeof window.updateType === 'function') window.updateType();
        if (typeof window.updateStar === 'function') window.updateStar();
        // 转盘已隐藏，不再调用updateWheel
    } catch (error) {
        console.error('更新游戏学生名单时出错:', error);
    }
};