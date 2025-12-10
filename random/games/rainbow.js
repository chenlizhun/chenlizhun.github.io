/**
 * 彩虹抽奖游戏模块
 */
;

// DOM元素
const rainbowContainer = window.getElement("#rainbowContainer");
const rainbowResult = window.getElement("#rainbowResult");
const btnRainbow = window.getElement("#btnRainbow");

// 状态变量
let rainbowSpinning = false;

/**
 * 创建彩虹元素
 */
function createRainbow() {
    const students = window.getStudents();
    rainbowContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const rainbowItem = document.createElement("div");
        rainbowItem.className = "rainbow-item";
        rainbowItem.textContent = name;
        rainbowItem.style.color = `hsl(${index * 360 / students.length}, 70%, 60%)`;
        rainbowContainer.appendChild(rainbowItem);
    });
};

/**
 * 开始彩虹抽奖游戏
 */
window.startRainbow = function() {
    if (rainbowSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(rainbowResult, "请先添加学生名单");
        return;
    }
    
    rainbowSpinning = true;
    btnRainbow.disabled = true;
    window.showResult(rainbowResult, "");
    
    // 获取所有彩虹元素
    const rainbowItems = rainbowContainer.querySelectorAll(".rainbow-item");
    
    // 快速切换彩虹元素
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有彩虹元素样式
        rainbowItems.forEach(item => item.classList.remove("active"));
        
        // 随机选择一个彩虹元素
        const randomIdx = window.randomIndex(students.length);
        const currentItem = rainbowItems[randomIdx];
        
        if (currentItem) {
            currentItem.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            rainbowSpinning = false;
            btnRainbow.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(rainbowResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化彩虹抽奖游戏
 */
window.initRainbow = function() {
    createRainbow();
    btnRainbow.addEventListener("click", startRainbow);
};

/**
 * 更新彩虹元素（当学生名单改变时调用）
 */
window.updateRainbow = function() {
    createRainbow();
}