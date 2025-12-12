/**
 * 游戏模式基类工具
 * 提供通用的游戏模式初始化和启动逻辑
 */

/**
 * 游戏模式配置
 * @typedef {Object} GameConfig
 * @property {string} name - 游戏名称（用于日志）
 * @property {string[]} requiredElements - 必需的DOM元素选择器数组
 * @property {string} panelId - 面板ID
 * @property {HTMLElement} displayElement - 显示元素
 * @property {HTMLElement} resultElement - 结果显示元素
 * @property {HTMLElement} buttonElement - 按钮元素
 */

/**
 * 初始化游戏模式
 * @param {GameConfig} config - 游戏配置
 * @param {Function} updateFn - 更新函数
 * @param {Function} startFn - 启动函数
 * @returns {Object|null} 游戏元素对象，如果初始化失败返回null
 */
window.initGameMode = function(config, updateFn, startFn) {
    const { name, requiredElements, buttonElement } = config;
    
    // 获取所有必需的DOM元素
    const elements = {};
    for (const selector of requiredElements) {
        const element = window.getElement(selector);
        if (!element) {
            console.error(`[${name}] 初始化失败：元素 ${selector} 未找到`);
            return null;
        }
        // 使用选择器作为key（去掉#）
        const key = selector.replace('#', '');
        elements[key] = element;
    }
    
    // 调用更新函数
    if (typeof updateFn === 'function') {
        try {
            updateFn(elements);
        } catch (error) {
            console.error(`[${name}] 更新函数执行失败:`, error);
        }
    }
    
    // 绑定按钮事件
    if (buttonElement && typeof startFn === 'function') {
        buttonElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            try {
                startFn(elements);
            } catch (error) {
                console.error(`[${name}] 启动游戏时出错:`, error);
                if (elements.result) {
                    window.showResult(elements.result, '抽签过程出错，请重试');
                }
                if (buttonElement) {
                    window.updateButtonState(buttonElement, false);
                }
            }
        });
    }
    
    return elements;
};

/**
 * 通用的游戏启动前检查
 * @param {string} gameName - 游戏名称
 * @param {Object} elements - 游戏元素对象
 * @param {string} panelId - 面板ID
 * @returns {string[]|null} 可抽取人员列表，如果检查失败返回null
 */
window.validateGameStart = function(gameName, elements, panelId) {
    // 检查必需元素
    if (!elements || !elements.result || !elements.button) {
        console.error(`[${gameName}] 必要的DOM元素未找到`);
        return null;
    }
    
    // 切换到对应面板
    if (panelId) {
        window.switchPanel(panelId);
    }
    
    // 检查可抽取人员
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(elements.result, '暂无可抽取人员');
        return null;
    }
    
    return eligible;
};

/**
 * 通用的游戏启动准备
 * @param {HTMLElement} button - 按钮元素
 * @param {HTMLElement} result - 结果显示元素
 */
window.prepareGameStart = function(button, result) {
    window.updateButtonState(button, true);
    window.clearResult(result);
};

/**
 * 通用的游戏结束处理
 * @param {HTMLElement} button - 按钮元素
 * @param {HTMLElement} result - 结果显示元素
 * @param {string} winnerName - 获胜者姓名
 */
window.finishGame = function(button, result, winnerName) {
    window.showResult(result, '恭喜 ' + winnerName);
    window.updateButtonState(button, false);
};

/**
 * 批量更新DOM样式（性能优化）
 * @param {HTMLElement[]} elements - 元素数组
 * @param {Object} styles - 样式对象
 */
window.batchUpdateStyles = function(elements, styles) {
    if (!elements || elements.length === 0) return;
    
    // 使用DocumentFragment或requestAnimationFrame优化
    requestAnimationFrame(() => {
        elements.forEach(el => {
            if (el) {
                Object.assign(el.style, styles);
            }
        });
    });
};

/**
 * 批量创建DOM元素（性能优化）
 * @param {string} tagName - 标签名
 * @param {number} count - 数量
 * @param {Function} createFn - 创建函数，接收索引和元素
 * @param {HTMLElement} parent - 父元素
 * @returns {HTMLElement[]} 创建的元素数组
 */
window.batchCreateElements = function(tagName, count, createFn, parent) {
    const fragment = document.createDocumentFragment();
    const elements = [];
    
    for (let i = 0; i < count; i++) {
        const element = document.createElement(tagName);
        if (typeof createFn === 'function') {
            createFn(i, element);
        }
        fragment.appendChild(element);
        elements.push(element);
    }
    
    if (parent) {
        parent.appendChild(fragment);
    }
    
    return elements;
};


