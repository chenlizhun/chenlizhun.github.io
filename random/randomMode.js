/**
 * 随机抽签模式模块
 * 实现从18种抽签方式中随机选择一种进行抽奖的功能
 */

// 所有游戏的启动函数映射
const gameStartFunctions = {
    wheel: window.startWheel,
    slot: window.startSlotMachine,
    roller: window.startRoller,
    card: window.startCard,
    grid: window.startGrid,
    list: window.startList,
    ball: window.startBall,
    race: window.startRace,
    balloon: window.startBalloon,
    gift: window.startGift,
    spin: window.startSpin,
    lottery: window.startLottery,
    number: window.startNumber,
    matrix: window.startMatrix,
    light: window.startLight,
    rainbow: window.startRainbow,
    type: window.startType,
    star: window.startStar
};

// 所有游戏的面板ID映射
const gamePanels = {
    wheel: 'wheelPanel',
    slot: 'slotPanel',
    roller: 'rollerPanel',
    card: 'cardPanel',
    grid: 'gridPanel',
    list: 'listPanel',
    ball: 'ballPanel',
    race: 'racePanel',
    balloon: 'balloonPanel',
    gift: 'giftPanel',
    spin: 'spinPanel',
    lottery: 'lotteryPanel',
    number: 'numberPanel',
    matrix: 'matrixPanel',
    light: 'lightPanel',
    rainbow: 'rainbowPanel',
    type: 'typePanel',
    star: 'starPanel'
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
    switchPanel(panelId);
    
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
                btnRandomMode.textContent = '🎲 随机开始抽签';
            }, 1000);
        }
    }, 500);
}

/**
 * 切换到指定的游戏面板
 * @param {string} targetPanelId - 目标面板ID
 */
function switchPanel(targetPanelId) {
    // 移除所有面板的active类
    const panels = window.getElements('.panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 隐藏所有主内容区的非学生管理面板，不影响侧边栏面板
    const gamePanels = window.getElements('.main-content .panel:not(#managePanel)');
    gamePanels.forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // 显示目标面板并添加active类
    const targetPanel = window.getElement(`#${targetPanelId}`);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
        targetPanel.classList.add('active');
    }
    
    // 更新工具栏按钮状态
    const toolbarButtons = window.getElements('.toolbar button');
    toolbarButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.target === targetPanelId) {
            button.classList.add('active');
        }
    });
}