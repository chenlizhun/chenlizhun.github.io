/**
 * 彩球抽奖游戏模块
 */
;

// DOM元素
const ballContainer = window.getElement("#ballContainer");
const ballResult = window.getElement("#ballResult");
const btnBall = window.getElement("#btnBall");

// 状态变量
let ballSpinning = false;

/**
 * 创建彩球
 */
function createBalls() {
    const students = window.getStudents();
    ballContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const ball = document.createElement("div");
        ball.className = "ball";
        ball.textContent = name;
        ball.style.backgroundColor = `hsl(${index * 360 / students.length}, 70%, 60%)`;
        ballContainer.appendChild(ball);
    });
};

/**
 * 开始彩球游戏
 */
window.startBall = function() {
    if (ballSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(ballResult, "请先添加学生名单");
        return;
    }
    
    ballSpinning = true;
    btnBall.disabled = true;
    window.showResult(ballResult, "");
    
    // 获取所有彩球
    const balls = ballContainer.querySelectorAll(".ball");
    
    // 快速切换彩球
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有彩球样式
        balls.forEach(ball => ball.classList.remove("active"));
        
        // 随机选择一个彩球
        const randomIdx = window.randomIndex(students.length);
        const currentBall = balls[randomIdx];
        
        if (currentBall) {
            currentBall.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            ballSpinning = false;
            btnBall.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(ballResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化彩球游戏
 */
window.initBall = function() {
    createBalls();
    btnBall.addEventListener("click", startBall);
};

/**
 * 更新彩球（当学生名单改变时调用）
 */
window.updateBall = function() {
    createBalls();
};