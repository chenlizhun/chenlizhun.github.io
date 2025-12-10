/**
 * 赛跑比赛游戏模块
 */
;

// DOM元素
const raceContainer = window.getElement("#raceContainer");
const raceResult = window.getElement("#raceResult");
const btnRace = window.getElement("#btnRace");

// 状态变量
let raceRunning = false;

/**
 * 创建跑道
 */
function createRaces() {
    const students = window.getStudents();
    raceContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const raceTrack = document.createElement("div");
        raceTrack.className = "race-track";
        
        const runner = document.createElement("div");
        runner.className = "runner";
        runner.textContent = name;
        
        raceTrack.appendChild(runner);
        raceContainer.appendChild(raceTrack);
    });
};

/**
 * 开始赛跑游戏
 */
window.startRace = function() {
    if (raceRunning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(raceResult, "请先添加学生名单");
        return;
    }
    
    raceRunning = true;
    btnRace.disabled = true;
    window.showResult(raceResult, "");
    
    // 获取所有跑步者
    const runners = raceContainer.querySelectorAll(".runner");
    
    // 初始化进度
    const progresses = new Array(students.length).fill(0);
    const maxProgress = 100;
    
    // 开始比赛
    const interval = setInterval(() => {
        let winner = -1;
        
        // 更新每个跑步者的位置
        runners.forEach((runner, index) => {
            // 随机前进距离
            progresses[index] += Math.random() * 5;
            
            // 设置跑步者位置
            runner.style.width = `${Math.min(progresses[index], maxProgress)}%`;
            
            // 检查是否到达终点
            if (progresses[index] >= maxProgress && winner === -1) {
                winner = index;
            }
        });
        
        // 如果有获胜者，结束比赛
        if (winner !== -1) {
            clearInterval(interval);
            raceRunning = false;
            btnRace.disabled = false;
            
            // 显示结果
            window.showResult(raceResult, `恭喜 ${students[winner]}`);
        }
    }, 100);
};

/**
 * 初始化赛跑游戏
 */
window.initRace = function() {
    createRaces();
    btnRace.addEventListener("click", startRace);
};

/**
 * 更新赛跑（当学生名单改变时调用）
 */
window.updateRace = function() {
    createRaces();
}