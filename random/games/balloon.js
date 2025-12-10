/**
 * 气球爆炸游戏模块
 */
;

// DOM元素
const balloonContainer = window.getElement("#balloonContainer");
const balloonResult = window.getElement("#balloonResult");
const btnBalloon = window.getElement("#btnBalloon");

// 状态变量
let balloonSpinning = false;

/**
 * 创建气球
 */
function createBalloons() {
    const students = window.getStudents();
    balloonContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const balloon = document.createElement("div");
        balloon.className = "balloon";
        balloon.textContent = name;
        balloon.style.backgroundColor = `hsl(${index * 360 / students.length}, 70%, 60%)`;
        balloonContainer.appendChild(balloon);
    });
};

/**
 * 开始气球爆炸游戏
 */
window.startBalloon = function() {
    if (balloonSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(balloonResult, "请先添加学生名单");
        return;
    }
    
    balloonSpinning = true;
    btnBalloon.disabled = true;
    window.showResult(balloonResult, "");
    
    // 获取所有气球
    const balloons = balloonContainer.querySelectorAll(".balloon");
    
    // 快速切换气球
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有气球样式
        balloons.forEach(balloon => balloon.classList.remove("active"));
        
        // 随机选择一个气球
        const randomIdx = window.randomIndex(students.length);
        const currentBalloon = balloons[randomIdx];
        
        if (currentBalloon) {
            currentBalloon.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            balloonSpinning = false;
            btnBalloon.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(balloonResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化气球游戏
 */
window.initBalloon = function() {
    createBalloons();
    btnBalloon.addEventListener("click", startBalloon);
};

/**
 * 更新气球（当学生名单改变时调用）
 */
window.updateBalloon = function() {
    createBalloons();
}