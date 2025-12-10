/**
 * 转盘游戏模块
 */;

// DOM元素 - 由于转盘已隐藏，这些元素可能为null
const wheel = window.getElement("#wheel");
const wheelResult = window.getElement("#wheelResult");
const btnWheel = window.getElement("#btnWheel");

// 添加额外的空值检查，确保元素存在才使用
function safeGetElement(selector) {
    const element = window.getElement(selector);
    if (!element) {
        console.warn(`元素 ${selector} 未找到`);
    }
    return element;
}

// 状态变量
let wheelRotation = 0;
let wheelSpinning = false;

/**
 * 创建转盘标签
 */
function createWheelLabels() {
    if (!wheel) return;
    
    const students = window.getStudents();
    if (students.length === 0) return;
    
    // 清空现有标签
    const existingLabels = wheel.querySelectorAll('.wheel-label');
    existingLabels.forEach(label => label.remove());
    
    const sliceAngle = 360 / students.length;
    const radius = 120; // 标签距离中心的距离
    
    students.forEach((student, index) => {
        // 创建文字标签
        const label = document.createElement("div");
        label.className = "wheel-label";
        label.textContent = student;
        
        // 计算标签位置和角度
        const angle = index * sliceAngle - 90;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        
        // 设置标签位置
        label.style.left = `calc(50% + ${x}px)`;
        label.style.top = `calc(50% + ${y}px)`;
        label.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        
        // 根据角度调整文字方向，确保始终朝上
        if (angle > 90 || angle < -90) {
            label.style.transform = `translate(-50%, -50%) rotate(${angle + 270}deg)`;
        }
        
        wheel.appendChild(label);
    });
}

/**
 * 旋转转盘
 */
function spinWheel() {
    if (wheelSpinning || !wheel || !wheelResult || !btnWheel) return;
    
    const students = window.getStudents();
    if (students.length === 0) {
        window.showResult(wheelResult, "请先添加学生名单");
        return;
    }
    
    // 旋转开始前的视觉反馈
    wheelSpinning = true;
    btnWheel.disabled = true;
    btnWheel.textContent = "旋转中...";
    window.showResult(wheelResult, "");
    
    const sliceAngle = 360 / students.length;
    const targetIndex = window.randomIndex(students.length);
    const targetName = students[targetIndex];
    
    // 动态调整旋转圈数和时间，增加随机性
    const extraTurns = 5 + Math.floor(Math.random() * 6); // 5~10 圈
    const rotationTime = 4000 + Math.random() * 2000; // 4~6 秒
    const centerAngleOfSlice = targetIndex * sliceAngle + sliceAngle / 2;
    const offsetToPointer = 90 - centerAngleOfSlice; // 关键修改点
    const finalRotation = extraTurns * 360 + offsetToPointer;
    
    // 使用CSS transition实现平滑旋转动画
    wheel.style.transition = `transform ${rotationTime}ms cubic-bezier(0.15, 0.90, 0.25, 0.95)`;
    wheel.style.transform = `rotate(${wheelRotation + finalRotation}deg)`;
    wheelRotation += finalRotation;
    
    // 等待动画完成
    setTimeout(() => {
        // 旋转完成后，显示结果
        wheel.style.transition = "";
        showWinnerAnimation(targetName);
        
        // 恢复按钮状态
        wheelSpinning = false;
        btnWheel.disabled = false;
        btnWheel.textContent = "开始抽奖";
    }, rotationTime);
}

/**
 * 显示中奖动画
 * @param {string} name - 中奖者姓名
 */
function showWinnerAnimation(name) {
    // 结果显示动画
    wheelResult.style.opacity = "0";
    wheelResult.style.transform = "translateY(20px)";
    
    // 设置结果文本
    window.showResult(wheelResult, `恭喜 ${name}`);
    
    // 应用动画
    setTimeout(() => {
        wheelResult.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        wheelResult.style.opacity = "1";
        wheelResult.style.transform = "translateY(0)";
    }, 100);
}

/**
 * 初始化转盘
 */
window.initWheel = function() {
    if (!wheel || !btnWheel) return;
    
    createWheelLabels();
    btnWheel.addEventListener("click", spinWheel);
    
    // 允许点击转盘中心开始旋转
    const wheelCenter = window.getElement(".wheel-center");
    if (wheelCenter) {
        wheelCenter.addEventListener("click", spinWheel);
    }
    
    // 响应窗口大小变化，重新计算标签位置
    window.addEventListener("resize", createWheelLabels);
};

/**
 * 更新转盘（已重命名禁用）
 */
window.updateWheelDisabled = function() {
    console.warn('updateWheel函数已禁用，转盘模式被隐藏');
    return;
};