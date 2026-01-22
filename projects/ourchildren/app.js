
// State
const state = {
    currentUser: null,
    currentTab: 'home',
    dashboardRange: '7d',
    charts: {},
    showLoginModal: false,
    loginPin: '',
    loginRole: null,
    pendingAction: null,
    reasonQuery: { '猪姐姐': '', '牛弟弟': '' },
    pointMode: { '猪姐姐': 'add', '牛弟弟': 'add' }, // add | use
    reasons: { add: [], use: [] },
    data: {
        kids: {
            '猪姐姐': { points: 0, history: [] },
            '牛弟弟': { points: 0, history: [] }
        }
    }
};

// Constants
const PASSWORD_HASH = '6c0f3412848008d49d186d5fad7fd1482656cfb62ad3c060a14e41c3fb3f1b43';
const STORAGE_KEY = 'kids_management_data';
const SESSION_KEY = 'kids_management_session';
const REASONS_KEY = 'kids_management_reasons';

// Default Data
const DEFAULT_REASONS_ADD = ['认真作业', '阅读打卡', '作业按时完成', '做家务', '早睡早起'];
const DEFAULT_REASONS_USE = ['买玩具', '看电视', '吃零食', '买文具', '去游乐场'];

// DOM Elements
const app = document.getElementById('app');

// Reason Manager
const ReasonManager = {
    load() {
        try {
            const raw = localStorage.getItem(REASONS_KEY);
            if (raw) {
                state.reasons = JSON.parse(raw);
            } else {
                state.reasons = {
                    add: [...DEFAULT_REASONS_ADD],
                    use: [...DEFAULT_REASONS_USE]
                };
                this.save();
            }
        } catch (e) {
            state.reasons = { add: [...DEFAULT_REASONS_ADD], use: [...DEFAULT_REASONS_USE] };
        }
    },
    save() {
        localStorage.setItem(REASONS_KEY, JSON.stringify(state.reasons));
    },
    add(type, text) {
        if (!text) return;
        if (!state.reasons[type].includes(text)) {
            state.reasons[type].push(text);
            this.save();
            render();
        }
    },
    remove(type, text) {
        state.reasons[type] = state.reasons[type].filter(r => r !== text);
        this.save();
        render();
    }
};

// Utils
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
}

// Components / Views

function renderLoginModal() {
    if (!state.showLoginModal) return '';
    const pinMasked = state.loginPin.replace(/./g, '•');
    return `
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-lg font-bold text-gray-800">家长登录</div>
                    <button onclick="closeLoginModal()" class="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div class="mb-4">
                    <div class="text-sm text-gray-600 mb-2">选择身份</div>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="selectRole('爸爸')" class="p-3 border rounded-lg ${state.loginRole==='爸爸'?'border-primary bg-blue-50 text-primary':'border-gray-200 text-gray-700'}">👨 爸爸</button>
                        <button onclick="selectRole('妈妈')" class="p-3 border rounded-lg ${state.loginRole==='妈妈'?'border-pink-500 bg-pink-50 text-pink-600':'border-gray-200 text-gray-700'}">👩 妈妈</button>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="text-sm text-gray-600 mb-2">输入密码</div>
                    <div class="w-full p-3 border border-gray-300 rounded-lg text-center tracking-widest text-xl">${pinMasked || '— — —'}</div>
                </div>
                <div class="grid grid-cols-3 gap-3 mb-4 select-none">
                    ${[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="loginAppendDigit(${n})" class="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold">${n}</button>`).join('')}
                    <button onclick="loginClear()" class="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">清空</button>
                    <button onclick="loginAppendDigit(0)" class="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold">0</button>
                    <button onclick="loginBackspace()" class="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">退格</button>
                </div>
                <button onclick="handleLogin()" class="w-full ${state.loginRole && state.loginPin.length > 0 ? 'bg-primary hover:bg-indigo-700' : 'bg-gray-300'} text-white p-3 rounded-lg font-bold transition">进入管理</button>
            </div>
        </div>
    `;
}

function renderHeader() {
    const left = `<div class="text-2xl font-black tracking-tight text-gray-900">猪姐姐与牛弟弟积分榜</div>`;
    const right = state.currentUser
        ? `<div class="flex items-center gap-3"><span class="text-sm text-gray-600">已登录：${state.currentUser}</span><button onclick="handleLogout()" class="text-xs text-gray-500 hover:text-danger">退出</button></div>`
        : `<button onclick="openLoginModal()" class="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">管理</button>`;
    return `<div id="page-header" class="flex justify-between items-center mb-4">${left}${right}</div>`;
}

function renderTabs() {
    const tabs = [
        { id: 'dashboard', label: '孩子数据', icon: '📈' },
        { id: 'points', label: '积分管理', icon: '✨' },
        { id: 'stats', label: '统计图表', icon: '📊' },
        { id: 'review', label: '历史复盘', icon: '📝' },
    ];
    
    return `
        <div class="flex bg-gray-100 p-1 rounded-lg mb-6">
            ${tabs.map(tab => `
                <button onclick="switchTab('${tab.id}')" class="flex-1 py-2 text-sm font-medium rounded-md transition ${state.currentTab === tab.id ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}">
                    <span class="mr-1">${tab.icon}</span> ${tab.label}
                </button>
            `).join('')}
        </div>
    `;
}

function renderPointsView() {
    const kids = ['猪姐姐', '牛弟弟'];
    // Ensure state exists
    if (!state.pointMode) state.pointMode = { '猪姐姐': 'add', '牛弟弟': 'add' };

    return `
        <div class="grid gap-6">
            ${kids.map(kid => {
                const kidData = state.data.kids[kid];
                const mode = state.pointMode[kid];
                const isAdd = mode === 'add';
                const colorClass = kid === '猪姐姐' ? 'text-pink-600' : 'text-blue-600';
                const bgGradient = kid === '猪姐姐' ? 'from-pink-100 to-pink-50' : 'from-blue-100 to-blue-50';
                
                return `
                <div class="bg-gradient-to-br ${bgGradient} rounded-2xl p-1">
                    <div class="bg-white rounded-xl shadow p-6">
                        <!-- Header -->
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold ${colorClass}">${kid}</h2>
                            <div class="text-4xl font-extrabold tracking-tight text-gray-900">${kidData.points}<span class="ml-1 text-sm text-gray-400 font-semibold">分</span></div>
                        </div>

                        <!-- Mode Toggle -->
                        <div class="flex bg-gray-100 p-1 rounded-lg mb-4">
                            <button onclick="setPointMode('${kid}', 'add')" class="flex-1 py-2 text-sm font-bold rounded-md transition ${isAdd ? 'bg-white text-green-600 shadow' : 'text-gray-500 hover:text-gray-700'}">🌟 奖励加分</button>
                            <button onclick="setPointMode('${kid}', 'use')" class="flex-1 py-2 text-sm font-bold rounded-md transition ${!isAdd ? 'bg-white text-red-600 shadow' : 'text-gray-500 hover:text-gray-700'}">🎁 积分支出</button>
                        </div>

                        <!-- Input Area -->
                        <div class="mb-4">
                            <div class="mb-3">
                                <div class="flex flex-wrap gap-2 mb-2">
                                    ${(isAdd ? state.reasons.add : state.reasons.use).map(r => `
                                        <div class="group relative inline-flex items-center">
                                            <button onclick="setReason('${kid}', '${r}')" class="px-3 py-1 ${isAdd ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'} text-xs font-bold rounded-l-full border-y border-l transition whitespace-nowrap hover:brightness-95">
                                                ${r}
                                            </button>
                                            <button onclick="removeReason('${isAdd ? 'add' : 'use'}', '${r}', event)" class="px-1.5 py-1 ${isAdd ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} border-y border-r rounded-r-full flex items-center justify-center hover:bg-gray-200 transition" title="删除">
                                                <span class="text-[10px] text-gray-400 hover:text-red-500">✕</span>
                                            </button>
                                        </div>
                                    `).join('')}
                                    <button onclick="addCustomReason('${isAdd ? 'add' : 'use'}')" class="px-3 py-1 bg-gray-50 text-gray-400 border border-dashed border-gray-300 rounded-full text-xs hover:bg-gray-100 hover:text-gray-600 transition">+ 添加</button>
                                </div>
                            </div>
                            
                            <input type="text" id="reason-${kid}" oninput="onReasonInput('${kid}', this.value)" 
                                value="${state.reasonQuery[kid] || ''}"
                                placeholder="${isAdd ? '输入奖励理由...' : '输入支出用途...'}" 
                                class="w-full p-3 border border-gray-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary outline-none transition">
                            
                            <!-- Action Buttons -->
                            <div class="mt-4 grid grid-cols-4 gap-2">
                                ${isAdd ? `
                                    <button onclick="updatePoints('${kid}', 1)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+1</button>
                                    <button onclick="updatePoints('${kid}', 2)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+2</button>
                                    <button onclick="updatePoints('${kid}', 5)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+5</button>
                                    <button onclick="promptCustomPoints('${kid}')" class="bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition">...</button>
                                ` : `
                                    <button onclick="updatePoints('${kid}', -10)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-10</button>
                                    <button onclick="updatePoints('${kid}', -50)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-50</button>
                                    <button onclick="updatePoints('${kid}', -100)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-100</button>
                                    <button onclick="promptCustomPoints('${kid}')" class="bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition">...</button>
                                `}
                            </div>
                            <div class="mt-3 flex justify-end">
                                <button onclick="promptSetTotal('${kid}')" class="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition flex items-center gap-1">
                                    <span>🔧</span> 设置总分
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderStatsView() {
    return `
        <div class="bg-white rounded-xl shadow p-4 h-64 relative">
            <canvas id="statsChart"></canvas>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-xl shadow text-center">
                <div class="text-sm text-gray-500">猪姐姐总分</div>
                <div class="text-2xl font-bold text-pink-600">${state.data.kids['猪姐姐'].points}</div>
            </div>
            <div class="bg-white p-4 rounded-xl shadow text-center">
                <div class="text-sm text-gray-500">牛弟弟总分</div>
                <div class="text-2xl font-bold text-blue-600">${state.data.kids['牛弟弟'].points}</div>
            </div>
        </div>
    `;
}

function renderHomeSimple() {
    const d = (typeof DataStore !== 'undefined') ? DataStore.getData() : state.data;
    const cta = state.currentUser
        ? `<div id="home-cta" class="mt-3"><button onclick="switchTab('dashboard')" class="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-indigo-700">进入管理</button></div>`
        : `<div id="home-cta" class="mt-3 text-center text-xs text-gray-500">登录后可查看更多数据并进行加减分
                <div class="mt-3"><button onclick="openLoginModal()" class="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">管理</button></div>
           </div>`;
    return `
        <div class="space-y-2">
            <div id="home-boxes" class="flex flex-col gap-2 items-center">
                <div class="score-box bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center w-full">
                    <div class="text-sm text-gray-500 mb-2">猪姐姐总分</div>
                    <div class="score-number font-extrabold tracking-tight text-pink-600">${d.kids['猪姐姐'].points}</div>
                </div>
                <div class="score-box bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center w-full">
                    <div class="text-sm text-gray-500 mb-2">牛弟弟总分</div>
                    <div class="score-number font-extrabold tracking-tight text-blue-600">${d.kids['牛弟弟'].points}</div>
                </div>
            </div>
            ${cta}
        </div>
    `;
}

function getRangeStart(range) {
    const now = Date.now();
    if (range === '7d') return now - 7 * 24 * 60 * 60 * 1000;
    if (range === '30d') return now - 30 * 24 * 60 * 60 * 1000;
    return 0;
}

function getDates(range) {
    const start = new Date(getRangeStart(range));
    const today = new Date();
    const dates = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    while (cursor <= end) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

function aggregateDaily(kid, range) {
    const labels = getDates(range);
    const map = Object.create(null);
    labels.forEach(l => map[l] = 0);
    state.data.kids[kid].history.forEach(h => {
        if (h.timestamp >= getRangeStart(range)) {
            const dt = new Date(h.timestamp);
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const d = String(dt.getDate()).padStart(2, '0');
            const key = `${y}-${m}-${d}`;
            if (map[key] !== undefined) map[key] += h.delta;
        }
    });
    return labels.map(l => map[l]);
}

function computeKpis(range) {
    const start = getRangeStart(range);
    const kids = ['猪姐姐', '牛弟弟'];
    const kpis = {};
    kids.forEach(k => {
        const history = state.data.kids[k].history.filter(h => h.timestamp >= start);
        const net = history.reduce((s, h) => s + h.delta, 0);
        const days = Math.max(1, getDates(range).length);
        kpis[k] = {
            total: state.data.kids[k].points,
            events: history.length,
            net,
            avgPerDay: +(net / days).toFixed(2)
        };
    });
    return kpis;
}

function computeOperatorStats(range) {
    const start = getRangeStart(range);
    const res = { 爸爸: 0, 妈妈: 0 };
    Object.keys(state.data.kids).forEach(k => {
        state.data.kids[k].history.forEach(h => {
            if (h.timestamp >= start) {
                if (h.operator && res[h.operator] !== undefined) res[h.operator] += 1;
            }
        });
    });
    return res;
}

function reasonFrequency(range) {
    const start = getRangeStart(range);
    const pos = Object.create(null);
    const neg = Object.create(null);
    Object.keys(state.data.kids).forEach(k => {
        state.data.kids[k].history.forEach(h => {
            if (h.timestamp >= start) {
                const r = (h.reason || '').trim();
                if (!r) return;
                const bucket = h.delta >= 0 ? pos : neg;
                bucket[r] = (bucket[r] || 0) + 1;
            }
        });
    });
    function top5(obj) {
        return Object.entries(obj).sort((a,b) => b[1]-a[1]).slice(0,5);
    }
    return { pos: top5(pos), neg: top5(neg) };
}

function renderDashboardView() {
    const range = state.dashboardRange;
    const kpis = computeKpis(range);
    const ops = computeOperatorStats(range);
    const rf = reasonFrequency(range);
    return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <div class="text-lg font-bold text-gray-800">孩子数据概览</div>
                <div class="bg-gray-100 p-1 rounded-lg">
                    <button onclick="dashboardSetRange('7d')" class="px-3 py-1 text-sm rounded ${range==='7d'?'bg-white text-primary shadow':'text-gray-600'}">近7天</button>
                    <button onclick="dashboardSetRange('30d')" class="px-3 py-1 text-sm rounded ${range==='30d'?'bg-white text-primary shadow':'text-gray-600'}">近30天</button>
                    <button onclick="dashboardSetRange('all')" class="px-3 py-1 text-sm rounded ${range==='all'?'bg-white text-primary shadow':'text-gray-600'}">全部</button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-xl shadow">
                    <div class="text-xs text-gray-500 mb-1">猪姐姐总分</div>
                    <div class="text-2xl font-bold text-pink-600">${kpis['猪姐姐'].total}</div>
                    <div class="text-xs text-gray-400 mt-1">事件: ${kpis['猪姐姐'].events}｜净增: ${kpis['猪姐姐'].net}｜日均: ${kpis['猪姐姐'].avgPerDay}</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow">
                    <div class="text-xs text-gray-500 mb-1">牛弟弟总分</div>
                    <div class="text-2xl font-bold text-blue-600">${kpis['牛弟弟'].total}</div>
                    <div class="text-xs text-gray-400 mt-1">事件: ${kpis['牛弟弟'].events}｜净增: ${kpis['牛弟弟'].net}｜日均: ${kpis['牛弟弟'].avgPerDay}</div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow p-4 h-64 relative">
                <canvas id="trendChart"></canvas>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-xl shadow">
                    <div class="text-sm font-bold mb-2">常见正向原因 Top5</div>
                    ${rf.pos.length===0?'<div class="text-xs text-gray-400">暂无数据</div>':rf.pos.map(([r,c])=>`<div class="flex justify-between text-sm"><span class="text-gray-700">${r}</span><span class="text-green-600 font-bold">${c}</span></div>`).join('')}
                </div>
                <div class="bg-white p-4 rounded-xl shadow">
                    <div class="text-sm font-bold mb-2">积分支出</div>
                    ${rf.neg.length===0?'<div class="text-xs text-gray-400">暂无数据</div>':rf.neg.map(([r,c])=>`<div class="flex justify-between text-sm"><span class="text-gray-700">${r}</span><span class="text-red-600 font-bold">${c}</span></div>`).join('')}
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-xl shadow text-center">
                    <div class="text-sm text-gray-500">爸爸操作次数</div>
                    <div class="text-2xl font-bold text-gray-800">${ops['爸爸']}</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow text-center">
                    <div class="text-sm text-gray-500">妈妈操作次数</div>
                    <div class="text-2xl font-bold text-gray-800">${ops['妈妈']}</div>
                </div>
            </div>
        </div>
    `;
}

function renderReviewView() {
    // Merge histories and sort by date desc
    const allHistory = [];
    Object.keys(state.data.kids).forEach(kid => {
        state.data.kids[kid].history.forEach(item => {
            allHistory.push({ ...item, kid });
        });
    });
    
    allHistory.sort((a, b) => b.timestamp - a.timestamp);

    if (allHistory.length === 0) {
        content = `<div class="text-center text-gray-400 py-10">暂无记录</div>`;
    } else {
        content = `
        <div class="bg-white rounded-xl shadow overflow-hidden">
            <div class="divide-y divide-gray-100">
                ${allHistory.map(item => `
                    <div class="p-4 flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs font-bold px-2 py-0.5 rounded-full ${item.kid === '猪姐姐' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}">${item.kid}</span>
                                <span class="text-xs text-gray-400">${formatDate(item.timestamp)}</span>
                                <span class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">by ${item.operator}</span>
                            </div>
                            <div class="text-gray-800 text-sm">${item.reason || '未填写原因'}</div>
                        </div>
                        <div class="font-bold ${item.delta > 0 ? 'text-green-600' : 'text-red-600'}">
                            ${item.delta > 0 ? '+' : ''}${item.delta}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    return `
        ${content}
        <div class="mt-8 pt-8 border-t border-gray-200">
            <h3 class="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">数据管理</h3>
            <div class="grid grid-cols-2 gap-4">
                <button onclick="exportData()" class="bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">📤 导出数据</button>
                <button onclick="importData()" class="bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">📥 导入数据</button>
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">
                如果需要多设备同步，请使用导出/导入功能，或者在同一局域网下访问。
            </p>
        </div>
    `;
}

function renderMain() {
    let content = '';
    if (state.currentTab === 'home') content = renderHomeSimple();
    else if (state.currentTab === 'dashboard') content = renderDashboardView();
    else if (state.currentTab === 'points') content = renderPointsView();
    else if (state.currentTab === 'stats') content = renderStatsView();
    else if (state.currentTab === 'review') content = renderReviewView();

    return `
        <div class="w-full ${state.currentTab === 'home' ? 'max-w-2xl' : 'max-w-md'}">
            ${renderHeader()}
            ${state.currentTab === 'home' ? '' : renderTabs()}
            ${content}
        </div>
    `;
}

function render() {
    app.innerHTML = renderMain() + renderLoginModal();
    if (state.currentTab === 'dashboard') {
        initDashboardCharts();
    }
    if (state.currentTab === 'stats') {
        initChart();
    }
    adjustHomeLayout();
    adjustScoreSize();
}

// Actions

window.selectRole = function(role) { state.loginRole = role; render(); }

window.handleLogin = async function() {
    if (!state.loginRole) { alert('请先选择爸爸或妈妈'); return; }
    
    const hash = await sha256(state.loginPin);

    if (hash === PASSWORD_HASH) {
        state.currentUser = state.loginRole;
        
        // Persist session (30 days)
        try {
            const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
            localStorage.setItem(SESSION_KEY, JSON.stringify({ 
                role: state.currentUser, 
                expires 
            }));
        } catch (e) { console.error('Save session failed', e); }

        state.loginRole = null;
        state.loginPin = '';
        state.showLoginModal = false;
        render();
        if (state.pendingAction) {
            const { kid, delta, reason } = state.pendingAction;
            state.pendingAction = null;
            updatePoints(kid, delta, reason);
        }
    } else {
        alert('密码错误');
    }
}

window.handleLogout = function() {
    state.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    render();
}

window.switchTab = function(tab) {
    state.currentTab = tab;
    render();
}

window.setPointMode = function(kid, mode) {
    if (!state.pointMode) state.pointMode = {};
    state.pointMode[kid] = mode;
    state.reasonQuery[kid] = ''; // Clear reason when switching modes
    render();
}

window.setReason = function(kid, reason) {
    const input = document.getElementById(`reason-${kid}`);
    if (input) {
        input.value = reason;
        state.reasonQuery[kid] = reason;
    }
}

window.addCustomReason = function(type) {
    const text = prompt(type === 'add' ? '添加新的奖励理由:' : '添加新的支出用途:');
    if (text) {
        ReasonManager.add(type, text.trim());
    }
}

window.removeReason = function(type, text, event) {
    if (event) event.stopPropagation();
    if (confirm(`确定要删除"${text}"吗？`)) {
        ReasonManager.remove(type, text);
    }
}

function adjustHomeLayout() {
    if (state.currentTab !== 'home') return;
    const header = document.getElementById('page-header');
    const cta = document.getElementById('home-cta');
    const boxesWrap = document.getElementById('home-boxes');
    const boxes = document.querySelectorAll('.score-box');
    if (!boxesWrap || boxes.length !== 2) return;
    const headerH = header ? header.offsetHeight : 0;
    const ctaH = cta ? cta.offsetHeight : 0;
    const gap = 16;
    const sidePadding = 32;
    const availH = Math.max(320, window.innerHeight - headerH - ctaH - 24 - 24);
    const perH = Math.floor((availH - gap) / 2);
    const containerW = boxesWrap.clientWidth;
    const side = Math.max(140, Math.min(perH, containerW - sidePadding));
    boxes.forEach(box => {
        box.style.width = side + 'px';
        box.style.height = side + 'px';
    });
}

function adjustScoreSize() {
    const boxes = document.querySelectorAll('.score-box');
    boxes.forEach(box => {
        const numEl = box.querySelector('.score-number');
        if (!numEl) return;
        const maxPx = 200;
        const minPx = 48;
        let size = maxPx;
        numEl.style.lineHeight = '1';
        numEl.style.wordBreak = 'keep-all';
        numEl.style.whiteSpace = 'nowrap';
        numEl.style.fontSize = size + 'px';
        const padX = 24;
        const padY = 48;
        const maxW = box.clientWidth - padX * 2;
        const maxH = box.clientHeight - padY;
        let safety = 100;
        while (safety-- > 0 && size > minPx && (numEl.scrollWidth > maxW || numEl.scrollHeight > maxH)) {
            size -= 4;
            numEl.style.fontSize = size + 'px';
        }
    });
}

window.addEventListener('resize', adjustScoreSize);
window.addEventListener('resize', adjustHomeLayout);

window.updatePoints = function(kid, delta, reason = null) {
    const reasonInput = document.getElementById(`reason-${kid}`);
    const finalReason = (reason || (reasonInput ? reasonInput.value : '')).trim();
    
    if (!state.currentUser) {
        state.pendingAction = { kid, delta, reason: finalReason };
        openLoginModal();
        return;
    }
    if (!finalReason && !confirm('确定不写原因直接加减分吗？')) return;
    
    DataStore.updatePoints(kid, delta, finalReason, state.currentUser);
    state.data = DataStore.getData();

    if (reasonInput) reasonInput.value = ''; // Clear input
    render();
}

window.openLoginModal = function() { state.showLoginModal = true; state.loginPin = ''; render(); }
window.closeLoginModal = function() { state.showLoginModal = false; render(); }
window.loginAppendDigit = function(d) { if (state.loginPin.length < 6) { state.loginPin += String(d); render(); } }
window.loginBackspace = function() { state.loginPin = state.loginPin.slice(0, -1); render(); }
window.loginClear = function() { state.loginPin = ''; render(); }

window.promptCustomPoints = function(kid) {
    const val = prompt('输入分数 (正数加分，负数减分):');
    const delta = parseInt(val);
    if (!isNaN(delta) && delta !== 0) {
        updatePoints(kid, delta);
    }
}

window.promptSetTotal = function(kid) {
    const currentPoints = state.data.kids[kid].points;
    const input = prompt(`当前 ${kid} 的总分为 ${currentPoints}。\n请输入新的总分：`, currentPoints);
    if (input === null) return;
    
    const newTotal = parseInt(input, 10);
    if (isNaN(newTotal)) {
        alert('请输入有效的数字');
        return;
    }
    
    const delta = newTotal - currentPoints;
    if (delta === 0) return;
    
    const reason = '管理员修正总分';
    updatePoints(kid, delta, reason);
}

function collectReasonFrequency() {
    const freq = Object.create(null);
    Object.keys(state.data.kids).forEach(k => {
        state.data.kids[k].history.forEach(h => {
            const r = (h.reason || '').trim();
            if (!r) return;
            freq[r] = (freq[r] || 0) + 1;
        });
    });
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([r])=>r);
}

function getReasonSuggestions(query='') {
    const all = collectReasonFrequency();
    if (!query) return all.slice(0,6);
    const q = query.toLowerCase();
    return all.filter(r=>r.toLowerCase().includes(q)).slice(0,6);
}

function renderReasonSuggestions(kid) {
    const sug = getReasonSuggestions(state.reasonQuery && state.reasonQuery[kid] || '');
    if (!sug.length) return '';
    return `<div class=\"flex flex-wrap gap-2\">${sug.map(r=>`<button onclick=\"applySuggestion('${kid}', '${encodeURIComponent(r)}')\" class=\"px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200\">${r}</button>`).join('')}</div>`;
}

window.onReasonInput = function(kid, val) { if (!state.reasonQuery) state.reasonQuery = {}; state.reasonQuery[kid] = val; };
window.applySuggestion = function(kid, enc) {
    const r = decodeURIComponent(enc);
    const input = document.getElementById(`reason-${kid}`);
    if (input) { input.value = r; if (!state.reasonQuery) state.reasonQuery = {}; state.reasonQuery[kid] = r; }
}

function initChart() {
    const ctx = document.getElementById('statsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['猪姐姐', '牛弟弟'],
            datasets: [{
                label: '当前积分',
                data: [state.data.kids['猪姐姐'].points, state.data.kids['牛弟弟'].points],
                backgroundColor: [
                    'rgba(236, 72, 153, 0.5)',
                    'rgba(59, 130, 246, 0.5)'
                ],
                borderColor: [
                    'rgba(236, 72, 153, 1)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initDashboardCharts() {
    const el = document.getElementById('trendChart');
    if (!el) return;
    if (state.charts.trend) {
        state.charts.trend.destroy();
        state.charts.trend = null;
    }
    const labels = getDates(state.dashboardRange);
    const dataSis = aggregateDaily('猪姐姐', state.dashboardRange);
    const dataBro = aggregateDaily('牛弟弟', state.dashboardRange);
    state.charts.trend = new Chart(el, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '猪姐姐',
                    data: dataSis,
                    borderColor: 'rgba(236, 72, 153, 1)',
                    backgroundColor: 'rgba(236, 72, 153, 0.2)',
                    tension: 0.3
                },
                {
                    label: '牛弟弟',
                    data: dataBro,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            stacked: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

window.dashboardSetRange = function(range) {
    state.dashboardRange = range;
    render();
}

window.exportData = function() {
    const dataStr = (typeof DataStore !== 'undefined') ? DataStore.export() : JSON.stringify(state.data);
    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(dataStr).then(() => {
            alert('数据已复制到剪贴板！请发送给另一位家长。');
        }).catch(() => {
            prompt('复制下方数据:', dataStr);
        });
    } else {
        prompt('复制下方数据:', dataStr);
    }
}

window.importData = function() {
    const dataStr = prompt('请粘贴数据 JSON:');
    if (!dataStr) return;
    
    try {
        DataStore.import(dataStr);
        state.data = DataStore.getData();
        alert('数据导入成功！');
        render();
    } catch (e) {
        alert('数据解析失败');
    }
}

// Init
const initApp = async () => {
    // Check Session
    try {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session.expires > Date.now()) {
                state.currentUser = session.role;
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    } catch(e) { console.error('Session load error', e); }

    ReasonManager.load();

    // Initial render with local data (if any) or empty structure
    state.data = DataStore.getData();
    render();

    // Init CloudBase
    await DataStore.init({
        env: 'chenlizhun-projects-2ckab9e1cd47',
        onDataChange: (newData) => {
            state.data = newData;
            render();
        }
    });
};

initApp();
