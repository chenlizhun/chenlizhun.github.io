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

    const duration = 2000;
    const interval = 120;
    let elapsed = 0;

    if (simpleTimer) clearInterval(simpleTimer);
    simpleTimer = setInterval(() => {
        const name = eligible[window.randomIndex(eligible.length)];
        simpleDisplay.textContent = name;
        elapsed += interval;
        if (elapsed >= duration) {
            clearInterval(simpleTimer);
            const winner = eligible[window.randomIndex(eligible.length)];
            simpleDisplay.textContent = winner;
            window.showResult(simpleResult, '恭喜 ' + winner);
            window.updateButtonState(btnSimple, false);
        }
    }, interval);
};
