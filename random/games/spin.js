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
    
    // 提前确定中奖者
    const winnerIdx = window.randomIndex(students.length);
    
    // 获取所有旋转元素
    const spinItems = spinContainer.querySelectorAll(".spin-item");
    const totalItems = spinItems.length;
    
    // 动画逻辑：顺序旋转
    // 计算总步数：至少转3圈 + 到达中奖者的步数
    // 假设当前从0开始（或者从上次结束位置开始，这里简化为从0或随机开始）
    let currentIdx = 0;
    // 找到当前active的元素，如果没找到则从0开始
    spinItems.forEach((item, idx) => {
        if (item.classList.contains('active')) currentIdx = idx;
    });

    // 目标索引是 winnerIdx
    // 计算顺时针距离
    let distance = winnerIdx - currentIdx;
    if (distance <= 0) distance += totalItems;
    
    // 总步数 = 基础圈数 * 总数 + 距离
    // 基础圈数设为 4 圈
    const baseRounds = 4;
    const totalSteps = baseRounds * totalItems + distance;
    
    let stepCount = 0;
    let speed = 50; // 初始速度
    
    function spinAnimate() {
        // 清除旧的高亮
        if (spinItems[currentIdx]) spinItems[currentIdx].classList.remove("active");
        
        // 移动到下一个
        currentIdx = (currentIdx + 1) % totalItems;
        
        // 高亮新的
        if (spinItems[currentIdx]) spinItems[currentIdx].classList.add("active");
        
        stepCount++;
        
        // 速度控制算法
        // 前 20% 加速，中间 50% 匀速，后 30% 减速
        if (stepCount < totalSteps * 0.2) {
             speed = Math.max(30, speed - 2); // 加速
        } else if (stepCount > totalSteps * 0.7) {
             // 减速曲线：剩余步数越少，速度越慢
             const remaining = totalSteps - stepCount;
             // 简单的线性减速或者指数减速
             // remaining: 30 -> 1, speed: 50 -> 300+
             speed += (300 - speed) / remaining * 2 + 5;
        }

        if (stepCount < totalSteps) {
            setTimeout(spinAnimate, speed);
        } else {
            // 结束
            spinSpinning = false;
            window.updateButtonState(btnSpin, false);
            window.showResult(spinResult, `恭喜 ${students[winnerIdx]}`);
            if (spinItems[winnerIdx]) spinItems[winnerIdx].classList.add('winner-pulse');
        }
    }

    spinAnimate();
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