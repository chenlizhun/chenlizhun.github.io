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
    // 移除所有面板的active类
    const allPanels = document.querySelectorAll('.vertical-modes-container .panel');
    allPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 添加active类到选中的面板
    const targetPanel = document.getElementById(modeName);
    if (targetPanel) {
        targetPanel.classList.add('active');
        if (modeName === 'simplePanel' && typeof window.updateSimple === 'function') {
            window.updateSimple();
        }
        if (modeName === 'groupPanel' && typeof window.updateGroup === 'function') {
            window.updateGroup();
        }
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