let raceContainer = null;
let raceResult = null;
let btnRace = null;
let raceTimer = null;

function createRaces() {
    if (!raceContainer) {
        console.warn('[Race] raceContainer 元素未找到');
        return;
    }
    raceContainer.innerHTML = '';
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        raceContainer.textContent = '暂无可抽取人员';
        return;
    }
    
    // 使用DocumentFragment优化性能，减少重排
    const fragment = document.createDocumentFragment();
    eligible.forEach(name => {
        const row = window.createElement('div', { className: 'race-row' }, fragment);
        window.createElement('div', { className: 'race-name', textContent: name }, row);
        const wrap = window.createElement('div', { className: 'race-bar-wrap' }, row);
        window.createElement('div', { className: 'race-bar' }, wrap);
    });
    raceContainer.appendChild(fragment);
}

window.startRace = function() {
    if (!raceContainer || !btnRace || !raceResult) {
        console.error('[Race] 必要的DOM元素未找到，请确保已初始化');
        return;
    }
    
    window.switchPanel('racePanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(raceResult, '暂无可抽取人员');
        return;
    }
    
    window.updateButtonState(btnRace, true);
    window.clearResult(raceResult);
    createRaces();
    
    const rows = raceContainer.querySelectorAll('.race-row');
    const bars = raceContainer.querySelectorAll('.race-bar');
    
    if (bars.length === 0) {
        console.error('[Race] 进度条创建失败');
        window.updateButtonState(btnRace, false);
        return;
    }
    
    let progress = new Array(bars.length).fill(0);
    let winnerIndex = -1;
    
    // 增加随机性参数
    let speeds = new Array(bars.length).fill(0).map(() => 0.5 + Math.random() * 1.5);
    
    if (raceTimer) clearInterval(raceTimer);
    raceTimer = setInterval(() => {
        // 偶尔改变速度（冲刺或减速）
        if (Math.random() < 0.1) {
             speeds = speeds.map(s => Math.max(0.2, Math.min(3.0, s + (Math.random() - 0.5))));
        }

        for (let i = 0; i < bars.length; i++) {
            if (winnerIndex !== -1) break;
            
            // 基础增量 + 随机波动
            let increment = speeds[i] + Math.random() * 0.5;
            
            // 领先者稍微减速（增加悬念）
            if (progress[i] > 80 && Math.random() < 0.3) increment *= 0.5;
            
            // 落后者偶尔加速（追赶机制）
            if (progress[i] < 50 && Math.random() < 0.1) increment *= 2.0;

            progress[i] += increment;
            const pct = Math.min(progress[i], 100);
            bars[i].style.width = pct + '%';
            
            // 颜色随进度变化
            if (pct > 90) bars[i].style.background = 'var(--danger)';
            else if (pct > 60) bars[i].style.background = 'var(--warning)';
            else bars[i].style.background = 'var(--accent)';

            if (pct >= 100) {
                winnerIndex = i;
            }
        }
        if (winnerIndex !== -1) {
            clearInterval(raceTimer);
            raceTimer = null;
            if (rows[winnerIndex]) rows[winnerIndex].classList.add('winner');
            const winnerName = eligible[winnerIndex];
            window.showResult(raceResult, '恭喜 ' + winnerName);
            window.updateButtonState(btnRace, false);
        }
    }, 50); // 更流畅的动画帧率
};

window.initRace = function() {
    // 统一在初始化时获取DOM元素
    raceContainer = window.getElement('#raceContainer');
    raceResult = window.getElement('#raceResult');
    btnRace = window.getElement('#btnRace');
    
    if (!raceContainer || !raceResult || !btnRace) {
        console.error('[Race] 初始化失败：必要的DOM元素未找到');
        return;
    }
    
    createRaces();
    
    // 绑定事件监听器
    btnRace.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            window.startRace();
        } catch (error) {
            console.error('[Race] 启动赛跑抽签时出错:', error);
            if (raceResult) {
                window.showResult(raceResult, '抽签过程出错，请重试');
            }
            if (btnRace) {
                window.updateButtonState(btnRace, false);
            }
        }
    });
};

window.updateRace = function() {
    createRaces();
};
