/**
 * 卡片翻牌游戏模块
 */
;

// DOM元素
const cardContainer = window.getElement("#cardContainer");
const cardResult = window.getElement("#cardResult");
const btnCard = window.getElement("#btnCard");

// 状态变量
let cardSpinning = false;

/**
 * 创建卡片
 */
function createCards() {
    const students = window.getStudents();
    cardContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.textContent = name;
        cardContainer.appendChild(card);
    });
};

/**
 * 开始翻牌游戏
 */
window.startCard = function() {
    if (cardSpinning) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(cardResult, "请先添加学生名单");
        return;
    }
    
    cardSpinning = true;
    btnCard.disabled = true;
    window.showResult(cardResult, "");
    
    // 获取所有卡片
    const cards = cardContainer.querySelectorAll(".card");
    
    // 快速切换卡片
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有卡片样式
        cards.forEach(card => card.classList.remove("active"));
        
        // 随机选择一张卡片
        const randomIdx = window.randomIndex(students.length);
        const currentCard = cards[randomIdx];
        
        if (currentCard) {
            currentCard.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            cardSpinning = false;
            btnCard.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(cardResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化卡片游戏
 */
window.initCard = function() {
    createCards();
    btnCard.addEventListener("click", startCard);
};

/**
 * 更新卡片（当学生名单改变时调用）
 */
window.updateCard = function() {
    createCards();
}