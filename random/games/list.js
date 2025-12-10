/**
 * 列表滚动游戏模块
 */
;

// DOM元素
const listContainer = window.getElement("#listContainer");
const listResult = window.getElement("#listResult");
const btnList = window.getElement("#btnList");

// 状态变量
let listScrolling = false;
let listTimer = null;

/**
 * 创建列表
 */
function createList() {
    const students = window.getStudents();
    listContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.textContent = name;
        listContainer.appendChild(listItem);
    });
};

/**
 * 开始列表滚动游戏
 */
window.startList = function() {
    if (listScrolling) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(listResult, "请先添加学生名单");
        return;
    }
    
    listScrolling = true;
    btnList.disabled = true;
    window.showResult(listResult, "");
    
    // 获取所有列表项
    const listItems = listContainer.querySelectorAll(".list-item");
    
    let currentIndex = 0;
    let timePassed = 0;
    let interval = 60;
    
    // 启动滚动
    listTimer = setInterval(() => {
        // 重置所有列表项样式
        listItems.forEach(item => item.classList.remove("active"));
        
        // 高亮当前列表项
        listItems[currentIndex].classList.add("active");
        
        // 更新索引
        currentIndex = (currentIndex + 1) % students.length;
        
        timePassed += interval;
        interval += 4;
        
        if (interval > 200) {
            clearInterval(listTimer);
            listTimer = null;
            listScrolling = false;
            btnList.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(listResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, interval);
};

/**
 * 初始化列表游戏
 */
window.initList = function() {
    createList();
    btnList.addEventListener("click", startList);
};

/**
 * 更新列表（当学生名单改变时调用）
 */
window.updateList = function() {
    createList();
}