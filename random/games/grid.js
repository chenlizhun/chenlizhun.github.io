/**
 * 网格闪烁游戏模块
 */
;

// DOM元素
const gridContainer = window.getElement("#gridContainer");
const gridResult = window.getElement("#gridResult");
const btnGrid = window.getElement("#btnGrid");

// 状态变量
let gridSpinning = false;

/**
 * 创建网格
 */
function createGrid() {
    const students = window.getStudents();
    gridContainer.innerHTML = '';
    
    // 创建一个合理大小的网格
    const gridSize = Math.ceil(Math.sqrt(students.length));
    
    students.forEach((name, index) => {
        const gridItem = document.createElement("div");
        gridItem.className = "grid-item";
        gridItem.textContent = name;
        gridContainer.appendChild(gridItem);
    });
    
    // 设置网格样式
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
};

/**
 * 开始网格闪烁游戏
 */
window.startGrid = function() {
    if (gridSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(gridResult, "请先添加学生名单");
        return;
    }
    
    gridSpinning = true;
    btnGrid.disabled = true;
    window.showResult(gridResult, "");
    
    // 获取所有网格项
    const gridItems = gridContainer.querySelectorAll(".grid-item");
    
    // 快速切换网格项
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有网格项样式
        gridItems.forEach(item => item.classList.remove("active"));
        
        // 随机选择一个网格项
        const randomIdx = window.randomIndex(students.length);
        const currentItem = gridItems[randomIdx];
        
        if (currentItem) {
            currentItem.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            gridSpinning = false;
            btnGrid.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(gridResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化网格游戏
 */
window.initGrid = function() {
    createGrid();
    btnGrid.addEventListener("click", startGrid);
};

/**
 * 更新网格（当学生名单改变时调用）
 */
window.updateGrid = function() {
    createGrid();
}