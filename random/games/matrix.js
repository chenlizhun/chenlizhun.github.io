/**
 * 矩阵闪烁游戏模块
 */
;

// DOM元素
const matrixContainer = window.getElement("#matrixContainer");
const matrixResult = window.getElement("#matrixResult");
const btnMatrix = window.getElement("#btnMatrix");

// 状态变量
let matrixSpinning = false;

/**
 * 创建矩阵
 */
function createMatrix() {
    const students = window.getStudents();
    matrixContainer.innerHTML = '';
    
    // 创建一个合理大小的矩阵
    const matrixSize = Math.ceil(Math.sqrt(students.length));
    
    students.forEach((name, index) => {
        const matrixItem = document.createElement("div");
        matrixItem.className = "matrix-item";
        matrixItem.textContent = name;
        matrixContainer.appendChild(matrixItem);
    });
    
    // 设置矩阵样式
    matrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, 1fr)`;
};

/**
 * 开始矩阵闪烁游戏
 */
window.startMatrix = function() {
    if (matrixSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(matrixResult, "请先添加学生名单");
        return;
    }
    
    matrixSpinning = true;
    btnMatrix.disabled = true;
    window.showResult(matrixResult, "");
    
    // 获取所有矩阵项
    const matrixItems = matrixContainer.querySelectorAll(".matrix-item");
    
    // 快速切换矩阵项
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有矩阵项样式
        matrixItems.forEach(item => item.classList.remove("active"));
        
        // 随机选择一个矩阵项
        const randomIdx = window.randomIndex(students.length);
        const currentItem = matrixItems[randomIdx];
        
        if (currentItem) {
            currentItem.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            matrixSpinning = false;
            btnMatrix.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(matrixResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化矩阵闪烁游戏
 */
window.initMatrix = function() {
    createMatrix();
    btnMatrix.addEventListener("click", startMatrix);
};

/**
 * 更新矩阵（当学生名单改变时调用）
 */
window.updateMatrix = function() {
    createMatrix();
}