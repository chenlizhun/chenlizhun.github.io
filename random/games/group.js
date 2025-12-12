let groupContainer = null;
let groupResult = null;
let btnGroup = null;

const GROUP_SIZE = 4;
let groupCycleTimer = null;

window.initGroup = function() {
    // 统一在初始化时获取DOM元素
    groupContainer = window.getElement('#groupContainer');
    groupResult = window.getElement('#groupResult');
    btnGroup = window.getElement('#btnGroup');
    
    if (!groupContainer || !groupResult || !btnGroup) {
        console.error('[Group] 初始化失败：必要的DOM元素未找到');
        return;
    }
    
    window.updateGroup();
    btnGroup.addEventListener('click', window.startGroup);
};

window.updateGroup = function() {
    if (!groupContainer) return;
    groupContainer.innerHTML = '';
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        groupContainer.textContent = '暂无可抽取人员';
        return;
    }
    const candidates = window.shuffle(eligible).slice(0, Math.min(GROUP_SIZE, eligible.length));
    renderCandidates(candidates);
};

function renderCandidates(names) {
    if (!groupContainer) return;
    groupContainer.innerHTML = '';
    names.forEach(name => {
        const item = window.createElement('div', { className: 'group-item', textContent: name });
        item.style.padding = '8px 12px';
        item.style.margin = '6px 0';
        item.style.borderRadius = '8px';
        item.style.background = '#f1f2f6';
        item.style.transition = 'all .2s';
        groupContainer.appendChild(item);
    });
}

window.startGroup = function() {
    if (!groupContainer || !groupResult || !btnGroup) {
        console.error('[Group] 必要的DOM元素未找到');
        return;
    }
    
    window.switchPanel('groupPanel');
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(groupResult, '暂无可抽取人员');
        return;
    }

    window.updateButtonState(btnGroup, true);
    window.clearResult(groupResult);

    const candidates = window.shuffle(eligible).slice(0, Math.min(GROUP_SIZE, eligible.length));
    const items = renderCandidates(candidates);
    if (items.length === 0) {
        console.error('[Group] 候选列表创建失败');
        window.updateButtonState(btnGroup, false);
        return;
    }
    
    let idx = 0;
    let elapsed = 0;
    const duration = 2000;
    const interval = 150;

    if (groupCycleTimer) clearInterval(groupCycleTimer);
    groupCycleTimer = setInterval(() => {
        // 使用批量更新优化性能
        window.batchUpdateStyles(Array.from(items), {
            background: '#f1f2f6',
            transform: 'scale(1)'
        });
        const current = items[idx % items.length];
        if (current) {
            current.style.background = '#ffeaa7';
            current.style.transform = 'scale(1.03)';
        }
        idx++;
        elapsed += interval;
        if (elapsed >= duration) {
            clearInterval(groupCycleTimer);
            const winner = candidates[window.randomIndex(candidates.length)];
            items.forEach(el => {
                el.style.background = el.textContent === winner ? '#55efc4' : '#f1f2f6';
                el.style.transform = el.textContent === winner ? 'scale(1.05)' : 'scale(1)';
            });
            window.showResult(groupResult, '恭喜 ' + winner);
            window.updateButtonState(btnGroup, false);
        }
    }, interval);
};
