/**
 * 星星抽签游戏模块
 */
;

// DOM元素
const starsContainer = window.getElement("#stars");
const starResult = window.getElement("#starResult");
const btnStar = window.getElement("#btnStar");

// 状态变量
let starSpinning = false;

/**
 * 创建星星
 */
function createStars() {
    const students = window.getStudents();
    starsContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const star = document.createElement("div");
        star.className = "star";
        star.textContent = "⭐";
        star.dataset.name = name;
        starsContainer.appendChild(star);
    });
};

/**
 * 开始星星抽签游戏
 */
window.startStar = function() {
    if (starSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(starResult, "请先添加学生名单");
        return;
    }
    
    starSpinning = true;
    btnStar.disabled = true;
    window.showResult(starResult, "");
    
    // 获取所有星星
    const stars = starsContainer.querySelectorAll(".star");
    
    // 快速切换星星
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有星星样式
        stars.forEach(star => star.classList.remove("active"));
        
        // 随机选择一个星星
        const randomIdx = window.randomIndex(students.length);
        const currentStar = stars[randomIdx];
        
        if (currentStar) {
            currentStar.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            starSpinning = false;
            btnStar.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(starResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化星星抽签游戏
 */
window.initStar = function() {
    createStars();
    btnStar.addEventListener("click", startStar);
};

/**
 * 更新星星（当学生名单改变时调用）
 */
window.updateStar = function() {
    createStars();
}