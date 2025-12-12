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
    if (!btnRandomMode) {
        console.error('[RandomMode] 初始化失败：按钮元素未找到');
        return;
    }
    
    btnRandomMode.addEventListener('click', handleRandomModeClick);
};

/**
 * 处理随机抽签模式点击事件
 */
function handleRandomModeClick() {
    const btnRandomMode = window.getElement('#btnRandomMode');
    if (!btnRandomMode) {
        console.error('[RandomMode] 按钮元素未找到');
        return;
    }
    
    // 检查是否有可抽取人员
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        alert('暂无可抽取人员，请先更新学生名单或清空已抽中人员');
        return;
    }
    
    // 禁用按钮防止重复点击
    btnRandomMode.disabled = true;
    btnRandomMode.textContent = '🎲 正在选择抽签方式...';
    
    // 随机选择一种游戏
    const gameTypes = Object.keys(gameStartFunctions);
    if (gameTypes.length === 0) {
        console.error('[RandomMode] 没有可用的游戏模式');
        btnRandomMode.disabled = false;
        btnRandomMode.textContent = '🎲 随机抽签';
        return;
    }
    
    const randomGameType = gameTypes[window.randomIndex(gameTypes.length)];
    const startFunction = gameStartFunctions[randomGameType];
    const panelId = gamePanels[randomGameType];
    
    if (!startFunction || typeof startFunction !== 'function') {
        console.error(`[RandomMode] 游戏 ${randomGameType} 的启动函数不存在或不是函数`);
        btnRandomMode.disabled = false;
        btnRandomMode.textContent = '🎲 随机抽签';
        return;
    }
    
    // 切换到对应的游戏面板
    window.switchPanel(panelId);
    
    // 短暂延迟后启动游戏
    setTimeout(() => {
        try {
            startFunction();
        } catch (error) {
            console.error(`[RandomMode] 启动游戏 ${randomGameType} 时出错:`, error);
            alert('抽签过程出错，请重试');
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
