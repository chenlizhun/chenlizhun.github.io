/**
 * UI管理模块
 * 处理界面切换和更新
 */

// DOM元素 - 将在initUI中初始化
let toolbarButtons;
let allPanels;
let modal;

/**
 * 切换到指定面板（垂直布局模式 - 显示选中模式的完整UI）
 * @param {string} targetPanelName - 目标面板名称
 */
window.switchPanel = function(targetPanelName) {
    try {
        // 获取所有工具栏按钮并更新状态
        const buttons = document.querySelectorAll(".toolbar button");
        buttons.forEach(btn => {
            if (btn && btn.classList) {
                btn.classList.remove("active");
                if (btn.getAttribute && btn.getAttribute("data-target") === targetPanelName) {
                    btn.classList.add("active");
                }
            }
        });
        
        // 垂直布局模式：显示选中模式的完整UI
        showModeDetails(targetPanelName);
        console.log(`切换到面板: ${targetPanelName}（垂直布局模式）`);
    } catch (error) {
        console.error("切换面板时出错:", error);
    }
};

/**
 * 显示选中模式的详细UI
 * @param {string} modeName - 模式名称
 */
function showModeDetails(modeName) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui.js:40',message:'showModeDetails called',data:{modeName},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 移除所有面板的active类
    const allPanels = document.querySelectorAll('.vertical-modes-container .panel');
    allPanels.forEach(panel => {
        panel.classList.remove('active');
        // #region agent log
        const containers = panel.querySelectorAll('.wheel-container, .slot-container, .race-container, .lottery-container, .card-container, .spin-container, .result');
        const containerStates = Array.from(containers).map(c => ({
            className: c.className,
            display: window.getComputedStyle(c).display
        }));
        fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui.js:48',message:'Panel deactivated',data:{panelId:panel.id,containerStates},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    });
    
    // 添加active类到选中的面板
    const targetPanel = document.getElementById(modeName);
    if (targetPanel) {
        targetPanel.classList.add('active');
        
        // #region agent log
        setTimeout(() => {
            const gameContainers = {
                wheel: targetPanel.querySelector('.wheel-container'),
                slot: targetPanel.querySelector('.slot-container'),
                lottery: targetPanel.querySelector('.lottery-container, .lottery-box'),
                card: targetPanel.querySelector('.card-container'),
                spin: targetPanel.querySelector('.spin-container'),
                race: targetPanel.querySelector('.race-container'),
                simple: targetPanel.querySelector('.simple-display'),
                group: targetPanel.querySelector('.group-container')
            };
            const containerStyles = {};
            Object.keys(gameContainers).forEach(key => {
                const container = gameContainers[key];
                if (container) {
                    const computed = window.getComputedStyle(container);
                    const parentComputed = window.getComputedStyle(container.parentElement);
                    containerStyles[key] = {
                        display: computed.display,
                        visibility: computed.visibility,
                        width: computed.width,
                        height: computed.height,
                        margin: computed.margin,
                        padding: computed.padding,
                        flexBasis: computed.flexBasis,
                        order: computed.order,
                        position: computed.position,
                        className: container.className,
                        id: container.id,
                        parentDisplay: parentComputed.display,
                        parentFlexDirection: parentComputed.flexDirection,
                        parentFlexWrap: parentComputed.flexWrap
                    };
                }
            });
            const allActivePanels = document.querySelectorAll('.vertical-modes-container .panel.active');
            const panelComputed = window.getComputedStyle(targetPanel);
            fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui.js:75',message:'Panel activated with computed styles',data:{modeName,panelId:targetPanel.id,hasActive:targetPanel.classList.contains('active'),containerStyles,panelClasses:Array.from(targetPanel.classList),activePanelCount:allActivePanels.length,panelDisplay:panelComputed.display,panelFlexDirection:panelComputed.flexDirection,panelFlexWrap:panelComputed.flexWrap},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B'})}).catch(()=>{});
        }, 100);
        // #endregion
        
        if (modeName === 'simplePanel' && typeof window.updateSimple === 'function') {
            window.updateSimple();
        }
        if (modeName === 'groupPanel' && typeof window.updateGroup === 'function') {
            window.updateGroup();
        }
        if (modeName === 'racePanel' && typeof window.updateRace === 'function') {
            window.updateRace();
        }
    } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui.js:95',message:'Target panel not found',data:{modeName},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
    }
}

/**
 * 初始化UI管理模块
 */
window.initUI = function() {
    try {
        // 初始化DOM元素
        toolbarButtons = window.getElements(".toolbar button");
        allPanels = window.getElements(".panel");
        
        // 安全获取模态窗口元素
        try {
            modal = window.getElement('#celebrationModal');
        } catch (error) {
            console.warn('获取模态窗口元素失败:', error);
            modal = null;
        }
        
        // 添加工具栏按钮事件监听
        toolbarButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-target");
                window.switchPanel(target);
            });
        });
        
        // 垂直布局模式：显示所有面板，不隐藏任何面板
        // 移除所有面板的hidden类
        const panels = document.querySelectorAll(".main-content .panel");
        panels.forEach(panel => {
            if (panel && panel.classList) {
                panel.classList.remove("hidden");
            }
        });
        
        // 默认激活第一个按钮并显示其详细内容
        const firstButton = toolbarButtons[0];
        if (firstButton) {
            firstButton.classList.add("active");
            const firstPanel = firstButton.getAttribute("data-target");
            showModeDetails(firstPanel);
        }
        
        // 添加模态窗口关闭事件监听
        try {
            const closeModalBtn = window.getElement('#closeModal');
            
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    window.hideCelebrationModal();
                });
            }
            
            if (modal) {
                // 点击模态窗口外部关闭模态窗口
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        window.hideCelebrationModal();
                    }
                });
            }
        } catch (error) {
            console.warn('初始化模态窗口事件监听失败:', error);
        }
    } catch (error) {
        console.error('初始化UI管理模块失败:', error);
    }
};

/**
 * 显示加载状态
 * @param {HTMLElement} element - 要显示加载状态的元素
 */
window.showLoading = function(element) {
    element.textContent = "加载中...";
    element.classList.add("loading");
};

/**
 * 隐藏加载状态
 * @param {HTMLElement} element - 要隐藏加载状态的元素
 */
window.hideLoading = function(element) {
    element.classList.remove("loading");
};

/**
 * 更新按钮状态
 * @param {HTMLElement} button - 按钮元素
 * @param {boolean} disabled - 是否禁用
 */
window.updateButtonState = function(button, disabled) {
    button.disabled = disabled;
    if (disabled) {
        button.classList.add("disabled");
    } else {
        button.classList.remove("disabled");
    }
};

/**
 * 重置所有面板状态
 */
window.resetAllPanels = function() {
    // 停止所有动画，清除结果显示等
    window.hideCelebrationModal();
};
