let simpleDisplay = null;
let simpleResult = null;
let btnSimple = null;
let simpleTimer = null;

window.initSimple = function() {
    // 统一在初始化时获取DOM元素
    simpleDisplay = window.getElement('#simpleDisplay');
    simpleResult = window.getElement('#simpleResult');
    btnSimple = window.getElement('#btnSimple');
    
    if (!simpleDisplay || !simpleResult || !btnSimple) {
        console.error('[Simple] 初始化失败：必要的DOM元素未找到');
        return;
    }
    
    window.updateSimple();
    btnSimple.addEventListener('click', window.startSimple);
};

window.updateSimple = function() {
    const eligible = window.getEligibleStudents();
    if (simpleDisplay) {
        if (eligible.length === 0) {
            simpleDisplay.textContent = '暂无可抽取人员';
        } else {
            simpleDisplay.textContent = window.formatStudents(eligible);
        }
    }
};

window.startSimple = function() {
    if (!simpleDisplay || !simpleResult || !btnSimple) {
        console.error('[Simple] 必要的DOM元素未找到');
        return;
    }
    
    window.switchPanel('simplePanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(simpleResult, '暂无可抽取人员');
        return;
    }

    window.updateButtonState(btnSimple, true);
    window.clearResult(simpleResult);

    const totalDuration = 3000; // 总时长
    let startTime = null;
    let lastUpdate = 0;
    let updateInterval = 50; // 初始间隔

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        // 动态调整间隔，实现减速效果
        // 进度 progress: 0 -> 1
        const progress = elapsed / totalDuration;
        
        // 间隔随进度增加，使用二次曲线 easeIn
        // updateInterval = 50 + (progress * progress) * 400; 
        // 或者更简单的分段控制
        
        if (timestamp - lastUpdate > updateInterval) {
            const name = eligible[window.randomIndex(eligible.length)];
            simpleDisplay.textContent = name;
            lastUpdate = timestamp;
            
            // 随着时间推移，间隔变大
            if (progress > 0.6) updateInterval += 20;
            if (progress > 0.8) updateInterval += 50;
        }

        if (elapsed < totalDuration) {
            simpleTimer = requestAnimationFrame(animate);
        } else {
            // 结束
            const winner = eligible[window.randomIndex(eligible.length)];
            simpleDisplay.textContent = winner;
            window.showResult(simpleResult, '恭喜 ' + winner);
            window.updateButtonState(btnSimple, false);
        }
    }

    if (simpleTimer) cancelAnimationFrame(simpleTimer);
    simpleTimer = requestAnimationFrame(animate);
};
