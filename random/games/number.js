/**
 * 数字抽奖游戏模块
 */
;

// DOM元素
const numberDisplay = window.getElement("#numberDisplay");
const numberResult = window.getElement("#numberResult");
const btnNumber = window.getElement("#btnNumber");

// 状态变量
let numberSpinning = false;
let numberTimer = null;

/**
 * 开始数字抽奖游戏
 */
window.startNumber = function() {
    if (numberSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(numberResult, "请先添加学生名单");
        return;
    }
    
    numberSpinning = true;
    btnNumber.disabled = true;
    window.showResult(numberResult, "");
    
    let currentNumber = 0;
    let timePassed = 0;
    let interval = 60;
    
    // 启动数字滚动
    numberTimer = setInterval(() => {
        // 随机生成数字
        currentNumber = Math.floor(Math.random() * students.length);
        numberDisplay.textContent = currentNumber + 1;
        
        timePassed += interval;
        interval += 4;
        
        if (interval > 200) {
            clearInterval(numberTimer);
            numberTimer = null;
            numberSpinning = false;
            btnNumber.disabled = false;
            
            // 显示结果
            const winnerIdx = currentNumber;
            window.showResult(numberResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, interval);
};

/**
 * 初始化数字抽奖游戏
 */
window.initNumber = function() {
    btnNumber.addEventListener("click", startNumber);
};

/**
 * 更新数字抽奖（当学生名单改变时调用）
 */
window.updateNumber = function() {
    // 数字抽奖不需要更新显示
}