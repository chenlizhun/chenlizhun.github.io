/**
 * 旋转抽奖游戏模块
 */
;

// DOM元素
const spinContainer = window.getElement("#spinContainer");
const spinResult = window.getElement("#spinResult");
const btnSpin = window.getElement("#btnSpin");

// 状态变量
let spinSpinning = false;

/**
 * 创建旋转元素
 */
function createSpinElements() {
    if (!spinContainer) return;
    const eligible = window.getEligibleStudents();
    spinContainer.innerHTML = '';
    
    if (eligible.length === 0) {
        spinContainer.textContent = '暂无可抽取人员';
        return;
    }
    
    eligible.forEach((name, index) => {
        const spinItem = document.createElement("div");
        spinItem.className = "spin-item";
        spinItem.textContent = name;
        spinContainer.appendChild(spinItem);
    });
};

/**
 * 开始旋转抽奖游戏
 */
window.startSpin = function() {
    if (spinSpinning || !spinContainer || !spinResult || !btnSpin) return;
    
    window.switchPanel('spinPanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(spinResult, '暂无可抽取人员');
        return;
    }
    
    const students = eligible;
    if (students.length === 0) {
        window.showResult(spinResult, "请先添加学生名单");
        return;
    }
    
    window.updateButtonState(btnSpin, true);
    window.clearResult(spinResult);
    spinSpinning = true;
    
    // 获取所有旋转元素
    const spinItems = spinContainer.querySelectorAll(".spin-item");
    
    // 快速切换旋转元素
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有旋转元素样式
        spinItems.forEach(item => item.classList.remove("active"));
        
        // 随机选择一个旋转元素
        const randomIdx = window.randomIndex(students.length);
        const currentItem = spinItems[randomIdx];
        
        if (currentItem) {
            currentItem.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            spinSpinning = false;
            window.updateButtonState(btnSpin, false);
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(spinResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化旋转抽奖游戏
 */
window.initSpin = function() {
    if (!spinContainer || !spinResult || !btnSpin) {
        console.error('[Spin] 初始化失败：必要的DOM元素未找到');
        return;
    }
    window.updateSpin();
    btnSpin.addEventListener("click", window.startSpin);
};

/**
 * 更新旋转元素（当学生名单改变时调用）
 */
window.updateSpin = function() {
    createSpinElements();
}