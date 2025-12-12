function initApp() {
    window.initStudents();
    window.initUI();
    window.initGames();
    window.initRandomMode();
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
