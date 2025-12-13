/**
 * 抽奖箱游戏模块
 */
;

// DOM元素
const lotteryBox = window.getElement("#lotteryBox");
const lotteryResult = window.getElement("#lotteryResult");
const btnLottery = window.getElement("#btnLottery");

// 状态变量
let lotteryDrawing = false;

/**
 * 创建抽奖券
 */
function createLotteryTickets() {
    if (!lotteryBox) return;
    const eligible = window.getEligibleStudents();
    lotteryBox.innerHTML = '';
    
    if (eligible.length === 0) {
        lotteryBox.textContent = '暂无可抽取人员';
        return;
    }
    
    eligible.forEach((name, index) => {
        const ticket = document.createElement("div");
        ticket.className = "lottery-ticket";
        ticket.textContent = name;
        lotteryBox.appendChild(ticket);
    });
};

/**
 * 开始抽奖箱游戏
 */
window.startLottery = function() {
    if (lotteryDrawing || !lotteryBox || !lotteryResult || !btnLottery) return;
    
    window.switchPanel('lotteryPanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(lotteryResult, '暂无可抽取人员');
        return;
    }
    
    const students = eligible;
    if (students.length === 0) {
        window.showResult(lotteryResult, "请先添加学生名单");
        return;
    }
    
    window.updateButtonState(btnLottery, true);
    window.clearResult(lotteryResult);
    lotteryDrawing = true;
    
    // 获取所有抽奖券
    const tickets = lotteryBox.querySelectorAll(".lottery-ticket");
    
    // 快速切换抽奖券
    let count = 0;
    const maxCount = 50;
    const interval = setInterval(() => {
        // 重置所有抽奖券样式
        tickets.forEach(ticket => ticket.classList.remove("active"));
        
        // 随机选择一个抽奖券
        const randomIdx = window.randomIndex(students.length);
        const currentTicket = tickets[randomIdx];
        
        if (currentTicket) {
            currentTicket.classList.add("active");
        }
        
        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            lotteryDrawing = false;
            window.updateButtonState(btnLottery, false);
            
            // 显示结果
            const winnerIdx = window.randomIndex(students.length);
            window.showResult(lotteryResult, `恭喜 ${students[winnerIdx]}`);
        }
    }, 50);
};

/**
 * 初始化抽奖箱游戏
 */
window.initLottery = function() {
    if (!lotteryBox || !lotteryResult || !btnLottery) {
        console.error('[Lottery] 初始化失败：必要的DOM元素未找到');
        return;
    }
    window.updateLottery();
    btnLottery.addEventListener("click", window.startLottery);
};

/**
 * 更新抽奖券（当学生名单改变时调用）
 */
window.updateLottery = function() {
    createLotteryTickets();
}