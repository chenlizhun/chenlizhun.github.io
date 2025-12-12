const simpleDisplay = window.getElement('#simpleDisplay');
const simpleResult = window.getElement('#simpleResult');
const btnSimple = window.getElement('#btnSimple');

let simpleTimer = null;

window.initSimple = function() {
    window.updateSimple();
    if (btnSimple) {
        btnSimple.addEventListener('click', window.startSimple);
    }
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
        if (simpleDisplay) simpleDisplay.textContent = name;
        elapsed += interval;
        if (elapsed >= duration) {
            clearInterval(simpleTimer);
            const winner = eligible[window.randomIndex(eligible.length)];
            if (simpleDisplay) simpleDisplay.textContent = winner;
            window.showResult(simpleResult, '恭喜 ' + winner);
            window.updateButtonState(btnSimple, false);
        }
    }, interval);
};
