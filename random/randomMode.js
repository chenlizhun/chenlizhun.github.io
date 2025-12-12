/**
 * 随机抽签模式模块
 * 实现从两种抽签方式中随机选择一种进行抽奖的功能
 */

const gameStartFunctions = {
    simple: window.startSimple,
    group: window.startGroup,
    race: window.startRace,
};

const gamePanels = {
    simple: 'simplePanel',
    group: 'groupPanel',
    race: 'racePanel',
};

/**
 * 初始化随机抽签模式
 */
window.initRandomMode = function() {
    const btnRandomMode = window.getElement('#btnRandomMode');
    const randomModeContainer = window.getElement('.random-mode-container');
    
    btnRandomMode.addEventListener('click', handleRandomModeClick);
    
    console.log('随机抽签模式初始化完成');
};

/**
 * 处理随机抽签模式点击事件
 */
function handleRandomModeClick() {
    const btnRandomMode = window.getElement('#btnRandomMode');
    
    // 禁用按钮防止重复点击
    btnRandomMode.disabled = true;
    btnRandomMode.textContent = '🎲 正在选择抽签方式...';
    
    // 随机选择一种游戏
    const gameTypes = Object.keys(gameStartFunctions);
    const randomGameType = gameTypes[window.randomIndex(gameTypes.length)];
    const startFunction = gameStartFunctions[randomGameType];
    const panelId = gamePanels[randomGameType];
    
    // 切换到对应的游戏面板
    window.switchPanel(panelId);
    
    // 短暂延迟后启动游戏
    setTimeout(() => {
        try {
            // 启动选中的游戏
            if (typeof startFunction === 'function') {
                startFunction();
            } else {
                console.error(`游戏 ${randomGameType} 的启动函数不存在或不是函数`);
            }
        } catch (error) {
            console.error(`启动游戏 ${randomGameType} 时出错:`, error);
        } finally {
            // 恢复按钮状态
            setTimeout(() => {
                btnRandomMode.disabled = false;
                btnRandomMode.textContent = '🎲 随机抽签';
            }, 1000);
        }
    }, 500);
}

/**
 * 切换到指定的游戏面板
 * @param {string} targetPanelId - 目标面板ID
 */
// 使用UI模块的切换逻辑，无需重复实现
