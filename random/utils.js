/**
 * 工具函数模块
 * 包含通用的工具函数，供其他模块使用
 */

// 已抽中人员列表
let selectedStudents = [];
const STORAGE_KEY_SELECTED = 'random_selected_students';

/**
 * 添加已抽中人员
 * @param {string} name - 抽中人员姓名
 */
window.addSelectedStudent = function(name) {
    // 避免重复添加
    if (!selectedStudents.includes(name)) {
        selectedStudents.push(name);
        updateSelectedList();
    }
};

/**
 * 移除已抽中人员
 * @param {number} index - 要移除的人员索引
 */
window.removeSelectedStudent = function(index) {
    if (index >= 0 && index < selectedStudents.length) {
        selectedStudents.splice(index, 1);
        updateSelectedList();
    }
};

/**
 * 清空已抽中人员列表
 */
window.clearSelectedStudents = function() {
    selectedStudents = [];
    updateSelectedList();
};

/**
 * 获取已抽中人员列表
 * @returns {string[]} 已抽中人员数组
 */
window.getSelectedStudents = function() {
    return [...selectedStudents];
};

window.getEligibleStudents = function() {
    const all = window.getStudents();
    const selected = selectedStudents;
    return all.filter(name => !selected.includes(name));
};

/**
 * 更新已抽中人员列表显示
 */
function updateSelectedList() {
    const selectedList = window.getElement('#selectedList');
    if (!selectedList) return;
    
    // 清空列表
    selectedList.innerHTML = '';
    
    // 无论是否为空，先同步存储与按钮状态
    try {
        localStorage.setItem(STORAGE_KEY_SELECTED, JSON.stringify(selectedStudents));
    } catch (e) {}
    const btn = document.getElementById('btnClearSelected');
    if (btn) {
        btn.disabled = selectedStudents.length === 0;
    }
    
    // 如果没有抽中人员，显示提示
    if (selectedStudents.length === 0) {
        const emptyTip = window.createElement('div', {
            className: 'selected-list-empty',
            textContent: '暂无抽中人员',
            style: 'text-align: center; color: #999; padding: 20px 0; font-size: 14px;'
        });
        selectedList.appendChild(emptyTip);
        return;
    }
    
    // 显示已抽中人员列表
    selectedStudents.forEach((name, index) => {
        const listItem = window.createElement('div', {
            className: 'selected-list-item'
        });
        
        const nameSpan = window.createElement('span', {
            textContent: name
        });
        
        const removeBtn = window.createElement('button', {
            className: 'remove-item-btn',
            textContent: '×',
            title: '移除'
        });
        
        // 添加移除事件监听
        removeBtn.addEventListener('click', () => {
            window.removeSelectedStudent(index);
        });
        
        listItem.appendChild(nameSpan);
        listItem.appendChild(removeBtn);
        selectedList.appendChild(listItem);
    });
}

/**
 * 生成随机索引
 * @param {number} length - 数组长度
 * @returns {number} 随机索引
 */
window.randomIndex = function(length) {
    return Math.floor(Math.random() * length);
};

/**
 * 解析学生输入文本
 * @param {string} text - 输入的学生名单文本
 * @returns {string[]} 解析后的学生数组
 */
window.parseStudentInput = function(text) {
    return text
        .split(/[,，、\n\s]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
};

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖处理后的函数
 */
window.debounce = function(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * 随机打乱数组（Fisher-Yates算法）
 * @param {Array} array - 要打乱的数组
 * @returns {Array} 打乱后的新数组
 */
window.shuffle = function(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

/**
 * 格式化学生名字显示
 * @param {string[]} students - 学生数组
 * @returns {string} 格式化后的学生名单
 */
window.formatStudents = function(students) {
    return students.join(', ');
};

/**
 * 显示庆祝模态窗口
 * @param {string} winner - 中奖者姓名
 */
window.showCelebrationModal = function(winner) {
    const modal = window.getElement('#celebrationModal');
    const winnerElement = window.getElement('#celebrationWinner');
    
    if (modal && winnerElement) {
        winnerElement.textContent = winner;
        modal.classList.add('show');
        
        // 生成五彩纸屑效果
        createConfetti();
    }
};

/**
 * 隐藏庆祝模态窗口
 */
window.hideCelebrationModal = function() {
    const modal = window.getElement('#celebrationModal');
    const confettiContainer = window.getElement('#confettiContainer');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    if (confettiContainer) {
        confettiContainer.innerHTML = ''; // 清除五彩纸屑
    }
};

window.initSelectedList = function() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_SELECTED);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                selectedStudents = parsed;
            }
        }
    } catch (e) {}
    updateSelectedList();
};

/**
 * 生成五彩纸屑效果
 */
function createConfetti() {
    const confettiContainer = window.getElement('#confettiContainer');
    if (!confettiContainer) return;
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff9900'];
    const confettiCount = 100;
    
    // 清除之前的五彩纸屑
    confettiContainer.innerHTML = '';
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = window.createElement('div', {
            className: 'confetti'
        });
        
        // 设置随机颜色
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 设置随机位置和大小
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        
        // 设置随机动画延迟和持续时间
        const delay = Math.random() * 5 + 's';
        const duration = Math.random() * 5 + 5 + 's';
        confetti.style.animationDelay = delay;
        confetti.style.animationDuration = duration;
        
        confettiContainer.appendChild(confetti);
    }
}

/**
 * 显示结果
 * @param {HTMLElement} element - 结果显示元素
 * @param {string} message - 结果消息
 */
window.showResult = function(element, message) {
    element.textContent = message;
    
    // 解析结果消息，记录已抽中人员
    if (message.startsWith('恭喜 ')) {
        const name = message.substring(3).trim();
        window.addSelectedStudent(name);
        
        // 显示庆祝模态窗口
        window.showCelebrationModal(name);
    }
};

/**
 * 清除结果显示
 * @param {HTMLElement} element - 结果显示元素
 */
window.clearResult = function(element) {
    element.textContent = '';
};

/**
 * 获取DOM元素
 * @param {string} selector - CSS选择器
 * @returns {HTMLElement|null} DOM元素
 */
window.getElement = function(selector) {
    return document.querySelector(selector);
};

/**
 * 获取多个DOM元素
 * @param {string} selector - CSS选择器
 * @returns {NodeList} DOM元素列表
 */
window.getElements = function(selector) {
    return document.querySelectorAll(selector);
};

/**
 * 创建DOM元素
 * @param {string} tagName - 标签名
 * @param {Object} attributes - 属性对象
 * @param {HTMLElement} parent - 父元素
 * @returns {HTMLElement} 创建的DOM元素
 */
window.createElement = function(tagName, attributes = {}, parent = null) {
    const element = document.createElement(tagName);
    
    // 设置属性
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // 添加到父元素
    if (parent) {
        parent.appendChild(element);
    }
    
    return element;
};
