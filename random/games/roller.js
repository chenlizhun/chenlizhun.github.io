/**
 * 滚轮游戏模块
 */
;

// DOM元素
const rollerInner = window.getElement("#rollerInner");
const rollerResult = window.getElement("#rollerResult");
const btnRoller = window.getElement("#btnRoller");

// 状态变量
let rollerTimer = null;

/**
 * 生成滚轮文本
 */
function makeRollerText() {
    const students = window.getStudents();
    return students.join("   ◆   ");
};

/**
 * 开始滚轮游戏
 */
window.startRoller = function() {
    if (rollerTimer) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(rollerResult, "请先添加学生名单");
        return;
    }
    
    btnRoller.disabled = true;
    window.showResult(rollerResult, "");
    
    let currentName = "";
    let timePassed = 0;
    let interval = 60;
    
    // 生成滚轮文本
    rollerInner.textContent = makeRollerText();
    
    // 启动滚轮
    rollerTimer = setInterval(() => {
        const randomIdx = window.randomIndex(students.length);
        currentName = students[randomIdx];
        rollerInner.textContent = currentName;
        
        timePassed += interval;
        interval += 4;
        
        if (interval > 200) {
            clearInterval(rollerTimer);
            rollerTimer = null;
            window.showResult(rollerResult, `恭喜 ${currentName}`);
            btnRoller.disabled = false;
        }
    }, interval);
};

/**
 * 初始化滚轮游戏
 */
window.initRoller = function() {
    // 初始设置滚轮文本
    rollerInner.textContent = makeRollerText();
    
    // 添加事件监听
    btnRoller.addEventListener("click", startRoller);
};

/**
 * 更新滚轮（当学生名单改变时调用）
 */
window.updateRoller = function() {
    // 更新滚轮文本
    rollerInner.textContent = makeRollerText();
}