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
    if (!cardContainer) return;
    const eligible = window.getEligibleStudents();
    cardContainer.innerHTML = '';
    
    if (eligible.length === 0) {
        cardContainer.textContent = '暂无可抽取人员';
        return;
    }
    
    eligible.forEach((name, index) => {
        const card = document.createElement("div");
        card.className = "card";
        
        const inner = document.createElement("div");
        inner.className = "card-inner";
        
        const front = document.createElement("div");
        front.className = "card-front";
        front.textContent = "❓"; // 或者用图标
        
        const back = document.createElement("div");
        back.className = "card-back";
        back.textContent = name;
        
        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);
        
        cardContainer.appendChild(card);
    });
};

/**
 * 开始翻牌游戏
 */
window.startCard = function() {
    if (cardSpinning || !cardContainer || !cardResult || !btnCard) return;
    
    window.switchPanel('cardPanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(cardResult, '暂无可抽取人员');
        return;
    }
    
    const students = eligible;
    
    window.updateButtonState(btnCard, true);
    window.clearResult(cardResult);
    cardSpinning = true;
    
    // 提前确定中奖者
    const winnerIdx = window.randomIndex(students.length);
    
    // 获取所有卡片
    const cards = cardContainer.querySelectorAll(".card");
    
    // 重置状态
    cards.forEach(c => {
        c.classList.remove('flipped', 'active', 'winner-pulse');
    });

    // 动画参数
    let speed = 50; 
    let steps = 0;
    const minSteps = 30;
    let currentIdx = -1;
    let timer = null;

    function nextStep() {
        // 重置所有卡片高亮
        cards.forEach(card => card.classList.remove("active"));
        
        // 随机选择下一个
        let nextIdx;
        do {
            nextIdx = window.randomIndex(students.length);
        } while (nextIdx === currentIdx && students.length > 1);
        
        currentIdx = nextIdx;
        const currentCard = cards[currentIdx];
        if (currentCard) {
            currentCard.classList.add("active");
        }
        
        steps++;
        
        // 减速
        if (steps > minSteps) {
            speed += 20;
        }
        
        // 结束条件
        if (steps > minSteps && speed > 300 && currentIdx === winnerIdx) {
            finishGame();
            return;
        }
        
        // 强制结束
        if (speed > 400 && currentIdx !== winnerIdx) {
             setTimeout(() => {
                 cards.forEach(card => card.classList.remove("active"));
                 currentIdx = winnerIdx;
                 if (cards[winnerIdx]) cards[winnerIdx].classList.add("active");
                 finishGame();
             }, speed);
             return;
        }

        timer = setTimeout(nextStep, speed);
    }

    function finishGame() {
        cardSpinning = false;
        window.updateButtonState(btnCard, false);
        
        const winnerCard = cards[winnerIdx];
        if (winnerCard) {
            // 翻转显示名字
            winnerCard.classList.add('flipped');
            // 延迟一点显示脉冲和结果
            setTimeout(() => {
                winnerCard.classList.add('winner-pulse');
                window.showResult(cardResult, `恭喜 ${students[winnerIdx]}`);
            }, 600);
        }
    }

    nextStep();
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