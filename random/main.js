function initApp() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:1',message:'initApp started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    window.initStudents();
    window.initUI();
    window.initGames();
    window.initRandomMode();
    
    // #region agent log
    setTimeout(() => {
        const panels = document.querySelectorAll('.vertical-modes-container .panel');
        const panelInfo = Array.from(panels).map(panel => {
            const containers = {
                wheel: panel.querySelector('.wheel-container'),
                slot: panel.querySelector('.slot-container'),
                lottery: panel.querySelector('.lottery-container, .lottery-box'),
                card: panel.querySelector('.card-container'),
                spin: panel.querySelector('.spin-container'),
                race: panel.querySelector('.race-container'),
                simple: panel.querySelector('.simple-display'),
                group: panel.querySelector('.group-container')
            };
            const containerInfo = {};
            Object.keys(containers).forEach(key => {
                const container = containers[key];
                if (container) {
                    const computed = window.getComputedStyle(container);
                    const parentComputed = window.getComputedStyle(container.parentElement);
                    containerInfo[key] = {
                        display: computed.display,
                        visibility: computed.visibility,
                        width: computed.width,
                        height: computed.height,
                        margin: computed.margin,
                        padding: computed.padding,
                        flexBasis: computed.flexBasis,
                        order: computed.order,
                        className: container.className,
                        id: container.id,
                        parentDisplay: parentComputed.display,
                        parentFlexDirection: parentComputed.flexDirection,
                        parentFlexWrap: parentComputed.flexWrap
                    };
                }
            });
            return {
                id: panel.id,
                classes: Array.from(panel.classList),
                hasActive: panel.classList.contains('active'),
                panelDisplay: window.getComputedStyle(panel).display,
                panelFlexDirection: window.getComputedStyle(panel).flexDirection,
                panelFlexWrap: window.getComputedStyle(panel).flexWrap,
                containers: containerInfo
            };
        });
        fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:25',message:'Initial panel and container computed styles',data:{panelCount:panels.length,panelInfo},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
    }, 500);
    // #endregion
    
    const btnClearSelected = document.getElementById('btnClearSelected');
    if (btnClearSelected) {
        btnClearSelected.addEventListener('click', window.clearSelectedStudents);
    }
    if (typeof window.initSelectedList === 'function') {
        window.initSelectedList();
    }
}

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
