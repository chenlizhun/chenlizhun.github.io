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
    const students = window.getStudents();
    spinContainer.innerHTML = '';
    
    students.forEach((name, index) => {
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
    if (spinSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(spinResult, "请先添加学生名单");
        return;
    }
    
    spinSpinning = true;
    btnSpin.disabled = true;
    window.showResult(spinResult, "");
    
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
            btnSpin.disabled = false;
            
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
    createSpinElements();
    btnSpin.addEventListener("click", startSpin);
};

/**
 * 更新旋转元素（当学生名单改变时调用）
 */
window.updateSpin = function() {
    createSpinElements();
}