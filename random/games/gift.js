/**
 * 礼物盒游戏模块
 */
;

// DOM元素
const giftContainer = window.getElement("#giftContainer");
const giftResult = window.getElement("#giftResult");
const btnGift = window.getElement("#btnGift");

// 状态变量
let giftOpening = false;

/**
 * 创建礼物盒
 */
function createGifts() {
    const students = window.getStudents();
    giftContainer.innerHTML = '';
    
    students.forEach((name, index) => {
        const gift = document.createElement("div");
        gift.className = "gift";
        gift.textContent = "🎁";
        gift.dataset.name = name;
        giftContainer.appendChild(gift);
    });
};

/**
 * 开始礼物盒游戏
 */
window.openGift = function() {
    if (giftOpening) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(giftResult, "请先添加学生名单");
        return;
    }
    
    giftOpening = true;
    btnGift.disabled = true;
    window.showResult(giftResult, "");
    
    // 获取所有礼物盒
    const gifts = giftContainer.querySelectorAll(".gift");
    
    // 快速切换礼物盒
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有礼物盒样式
        gifts.forEach(gift => gift.classList.remove("active"));
        
        // 随机选择一个礼物盒
        const randomIdx = window.randomIndex(students.length);
        const currentGift = gifts[randomIdx];
        
        if (currentGift) {
            currentGift.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            giftOpening = false;
            btnGift.disabled = false;
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(giftResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化礼物盒游戏
 */
window.initGift = function() {
    createGifts();
    btnGift.addEventListener("click", openGift);
};

/**
 * 更新礼物盒（当学生名单改变时调用）
 */
window.updateGift = function() {
    createGifts();
}