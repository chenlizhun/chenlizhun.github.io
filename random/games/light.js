/**
 * 光点闪烁游戏模块
 */
;

// DOM元素
const lightContainer = window.getElement("#lightContainer");
const lightResult = window.getElement("#lightResult");
const btnLight = window.getElement("#btnLight");

// 状态变量
let lightSpinning = false;

/**
 * 创建光点
 */
function createLights() {
    const students = window.getStudents();
    lightContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const light = document.createElement("div");
        light.className = "light";
        light.textContent = "💡";
        light.dataset.name = name;
        lightContainer.appendChild(light);
    });
};

/**
 * 开始光点闪烁游戏
 */
window.startLight = function() {
    if (lightSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(lightResult, "请先添加学生名单");
        return;
    }
    
    lightSpinning = true;
    btnLight.disabled = true;
    window.showResult(lightResult, "");
    
    // 获取所有光点
    const lights = lightContainer.querySelectorAll(".light");
    
    // 快速切换光点
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有光点样式
        lights.forEach(light => light.classList.remove("active"));
        
        // 随机选择一个光点
        const randomIdx = window.randomIndex(students.length);
        const currentLight = lights[randomIdx];
        
        if (currentLight) {
            currentLight.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            lightSpinning = false;
            btnLight.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(lightResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化光点闪烁游戏
 */
window.initLight = function() {
    createLights();
    btnLight.addEventListener("click", startLight);
};

/**
 * 更新光点（当学生名单改变时调用）
 */
window.updateLight = function() {
    createLights();
}