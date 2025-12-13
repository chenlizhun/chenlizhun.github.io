/**
 * 老虎机游戏模块
 */
;

// DOM元素
const slotCol1 = window.getElement("#slotCol1");
const slotCol2 = window.getElement("#slotCol2");
const slotCol3 = window.getElement("#slotCol3");
const slotResult = window.getElement("#slotResult");
const btnSlot = window.getElement("#btnSlot");

// 状态变量
const slotScrollTarget = new Map();
let slotSpinning = false;

/**
 * 填充老虎机列
 * @param {HTMLElement} col - 列元素
 * @param {string} winnerName - 中奖者姓名（可选）
 */
function fillSlotColumn(col, winnerName = null) {
    const students = window.getEligibleStudents();
    const total = 20;
    let winnerRowIndex = -1;
    
    // 清空列
    col.innerHTML = '';
    
    // 填充列
    for (let i = 0; i < total; i++) {
        let name;
        if (winnerName && i === Math.floor(total / 2)) {
            name = winnerName;
            winnerRowIndex = i;
        } else {
            name = students[window.randomIndex(students.length)];
        }
        
        const item = document.createElement("div");
        item.className = "slot-item";
        item.textContent = name;
        col.appendChild(item);
    }
    
    // 计算滚动目标位置
    if (winnerRowIndex !== -1) {
        const maxScroll = col.scrollHeight - col.clientHeight;
        const itemEl = col.firstElementChild;
        const itemHeight = itemEl ? itemEl.offsetHeight : 36;
        const finalScroll = winnerRowIndex * itemHeight - (col.clientHeight - itemHeight) / 2;
        slotScrollTarget.set(col, Math.min(finalScroll, maxScroll));
    }
};

/**
 * 旋转老虎机列
 * @param {HTMLElement} col - 列元素
 * @param {number} duration - 旋转持续时间（毫秒）
 * @returns {Promise} 旋转完成后的Promise
 */
function spinColumn(col, duration) {
    return new Promise(resolve => {
        const start = performance.now();
        const finalScroll = slotScrollTarget.get(col) ?? (col.scrollHeight - col.clientHeight);
        
        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            col.scrollTop = easeOut * finalScroll;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        
        requestAnimationFrame(step);
    });
};

/**
 * 开始老虎机游戏
 */
window.startSlot = async function() {
    if (slotSpinning || !slotCol1 || !slotCol2 || !slotCol3 || !slotResult || !btnSlot) return;
    
    window.switchPanel('slotPanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(slotResult, '暂无可抽取人员');
        return;
    }
    
    const students = eligible;
    if (students.length === 0) {
        window.showResult(slotResult, "请先添加学生名单");
        return;
    }
    
    window.updateButtonState(btnSlot, true);
    window.clearResult(slotResult);
    slotSpinning = true;
    
    // 选择中奖者
    const targetIndex = window.randomIndex(students.length);
    const name = students[targetIndex];
    
    // 填充列
    fillSlotColumn(slotCol1, name);
    fillSlotColumn(slotCol2, name);
    fillSlotColumn(slotCol3, name);
    
    // 依次旋转列
    await spinColumn(slotCol1, 2500);
    await new Promise(resolve => setTimeout(resolve, 300));
    await spinColumn(slotCol2, 2500);
    await new Promise(resolve => setTimeout(resolve, 300));
    await spinColumn(slotCol3, 2500);
    
    // 显示结果
    window.showResult(slotResult, `恭喜 ${name}`);
    slotSpinning = false;
    window.updateButtonState(btnSlot, false);
};

/**
 * 初始化老虎机游戏
 */
window.initSlotMachine = function() {
    if (!slotCol1 || !slotCol2 || !slotCol3 || !slotResult || !btnSlot) {
        console.error('[Slot] 初始化失败：必要的DOM元素未找到');
        return;
    }
    window.updateSlotMachine();
    btnSlot.addEventListener("click", window.startSlot);
};

/**
 * 更新老虎机（当学生名单改变时调用）
 */
window.updateSlotMachine = function() {
    // 重新填充列
    fillSlotColumn(slotCol1);
    fillSlotColumn(slotCol2);
    fillSlotColumn(slotCol3);
};