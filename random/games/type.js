/**
 * 打字抽奖游戏模块
 */
;

// DOM元素
const typeDisplay = window.getElement("#typeDisplay");
const typeResult = window.getElement("#typeResult");
const btnType = window.getElement("#btnType");

// 状态变量
let typeSpinning = false;
let typeTimer = null;

/**
 * 开始打字抽奖游戏
 */
window.startType = function() {
    if (typeSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(typeResult, "请先添加学生名单");
        return;
    }
    
    typeSpinning = true;
    btnType.disabled = true;
    window.showResult(typeResult, "");
    
    let currentIndex = 0;
    let timePassed = 0;
    let interval = 60;
    
    // 启动打字
    typeTimer = setInterval(() => {
        // 随机选择一个学生姓名
        const randomIdx = window.randomIndex(students.length);
        const currentName = students[randomIdx];
        
        // 显示姓名
        typeDisplay.textContent = currentName;
        
        timePassed += interval;
        interval += 4;
        
        if (interval > 200) {
            clearInterval(typeTimer);
            typeTimer = null;
            typeSpinning = false;
            btnType.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(typeResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, interval);
};

/**
 * 初始化打字抽奖游戏
 */
window.initType = function() {
    btnType.addEventListener("click", startType);
};

/**
 * 更新打字抽奖（当学生名单改变时调用）
 */
window.updateType = function() {
    // 打字抽奖不需要更新显示
}