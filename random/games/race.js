let raceContainer = null;
let raceResult = null;
let btnRace = null;
let raceTimer = null;

// 延迟获取DOM元素，确保DOM已加载
function getRaceElements() {
    if (!raceContainer) raceContainer = window.getElement('#raceContainer');
    if (!raceResult) raceResult = window.getElement('#raceResult');
    if (!btnRace) btnRace = window.getElement('#btnRace');
    return { raceContainer, raceResult, btnRace };
}

function createRaces() {
    getRaceElements();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:12',message:'createRaces called',data:{raceContainerExists:!!raceContainer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!raceContainer) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:10',message:'raceContainer is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return;
    }
    raceContainer.innerHTML = '';
    const eligible = window.getEligibleStudents();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:14',message:'eligible students count',data:{eligibleCount:eligible.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (eligible.length === 0) {
        raceContainer.textContent = '暂无可抽取人员';
        return;
    }
    eligible.forEach(name => {
        const row = window.createElement('div', { className: 'race-row' }, raceContainer);
        window.createElement('div', { className: 'race-name', textContent: name }, row);
        const wrap = window.createElement('div', { className: 'race-bar-wrap' }, row);
        window.createElement('div', { className: 'race-bar' }, wrap);
    });
    // #region agent log
    const createdBars = raceContainer.querySelectorAll('.race-bar');
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:22',message:'race bars created',data:{barsCount:createdBars.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
}

window.startRace = function() {
    getRaceElements();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:45',message:'startRace called',data:{raceContainerExists:!!raceContainer,btnRaceExists:!!btnRace},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    window.switchPanel('racePanel');
    // #region agent log
    const racePanel = document.getElementById('racePanel');
    const raceContainerDiv = document.querySelector('.race-container');
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:28',message:'after switchPanel',data:{racePanelActive:racePanel?.classList.contains('active'),raceContainerDisplay:raceContainerDiv?getComputedStyle(raceContainerDiv).display:'not found'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const eligible = window.getEligibleStudents();
    if (eligible.length === 0) {
        window.showResult(raceResult, '暂无可抽取人员');
        return;
    }
    window.updateButtonState(btnRace, true);
    window.clearResult(raceResult);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:36',message:'before createRaces',data:{raceContainerExists:!!raceContainer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    createRaces();
    const rows = raceContainer ? raceContainer.querySelectorAll('.race-row') : [];
    const bars = raceContainer ? raceContainer.querySelectorAll('.race-bar') : [];
    // #region agent log
    const firstBar = bars[0];
    const firstBarWrap = firstBar ? firstBar.parentElement : null;
    const firstRow = rows[0];
    const raceContainerDiv2 = document.querySelector('.race-container');
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:74',message:'bars found after createRaces detailed',data:{rowsCount:rows.length,barsCount:bars.length,firstBarWidth:firstBar?getComputedStyle(firstBar).width:'none',firstBarWrapWidth:firstBarWrap?getComputedStyle(firstBarWrap).width:'none',firstRowWidth:firstRow?getComputedStyle(firstRow).width:'none',raceContainerWidth:raceContainerDiv2?getComputedStyle(raceContainerDiv2).width:'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    let progress = new Array(bars.length).fill(0);
    let winnerIndex = -1;
    if (raceTimer) clearInterval(raceTimer);
    raceTimer = setInterval(() => {
        for (let i = 0; i < bars.length; i++) {
            if (winnerIndex !== -1) break;
            progress[i] += Math.random() * 8;
            const pct = Math.min(progress[i], 100);
            bars[i].style.width = pct + '%';
            // #region agent log
            if (i === 0 && Math.random() < 0.1) {
                const barStyle = bars[i].style.width;
                const computed = getComputedStyle(bars[i]);
                const parent = bars[i].parentElement;
                const parentComputed = parent ? getComputedStyle(parent) : null;
                fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:48',message:'progress update detailed',data:{barIndex:i,progress:pct,styleWidth:barStyle,computedWidth:computed.width,computedHeight:computed.height,parentWidth:parentComputed?.width,parentHeight:parentComputed?.height,parentDisplay:parentComputed?.display},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            }
            // #endregion
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
    }, 160);
};

window.initRace = function() {
    console.log('[Race] initRace called');
    // 重新获取元素，确保DOM已加载
    raceContainer = window.getElement('#raceContainer');
    raceResult = window.getElement('#raceResult');
    btnRace = window.getElement('#btnRace');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:110',message:'initRace called',data:{btnRaceExists:!!btnRace,raceContainerExists:!!raceContainer,btnRaceId:btnRace?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    createRaces();
    
    if (btnRace) {
        console.log('[Race] Adding click listener to btnRace');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:118',message:'adding click listener',data:{btnDisabled:btnRace.disabled,btnType:btnRace.type,btnId:btnRace.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // 移除旧的事件监听器（如果有）
        const newBtnRace = btnRace.cloneNode(true);
        btnRace.parentNode.replaceChild(newBtnRace, btnRace);
        btnRace = newBtnRace;
        
        btnRace.addEventListener('click', function(e) {
            console.log('[Race] Button clicked!', e);
            e.preventDefault();
            e.stopPropagation();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:127',message:'btnRace clicked',data:{disabled:btnRace.disabled,raceTimerExists:!!raceTimer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            try {
                window.startRace();
            } catch (error) {
                console.error('[Race] startRace error:', error);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:133',message:'startRace error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
            }
        });
    } else {
        console.error('[Race] btnRace is null!');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b866faf6-ffea-4b99-be8e-55511d176c32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'race.js:140',message:'btnRace is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
    }
};

window.updateRace = function() {
    createRaces();
};
