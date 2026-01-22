
// State
const state = {
    user: null,
    family: null,
    kids: [], // Array of kid objects
    
    // State
    showPoster: false,
    posterFamily: null,

    // UI State
    currentTab: 'home',
    dashboardRange: '7d',
    charts: {},
    showLoginModal: false,
    loginPin: '',
    loginRole: null, 
    
    // Family Selection
    isDemo: false,
    availableFamilies: [], // Joined families
    allFamilies: [], // Directory of all families
    allFamiliesLoading: false,
    prefillFamilyId: '', // For join flow
    currentOpenId: null, // For owner check
    
    // Forms
    authMode: 'login', // login, register, join
    authForm: {
        familyName: '',
        nickname: '',
        pin: ''
    },
    addKidForm: {
        name: '',
        gender: 'boy',
        points: 0
    },

    // Legacy support for points view
    pendingAction: null,
    reasonQuery: {}, // Map kidId -> query
    pointMode: {}, // Map kidId -> 'add' | 'use'
    reasons: { add: [], use: [] },
    deletingReasonMode: false,
    
    // History/Dashboard
    history: [],
    historyLoading: false,
    historyPage: 1,
    historyHasMore: false
};

// Constants
const REASONS_KEY = 'kids_management_reasons';
const FAMILIES_CACHE_KEY = 'kids_management_families_cache';

const DEMO_FAMILY_ID = 'demo_family_example';
const DEMO_FAMILY_DATA = {
    info: {
        _id: DEMO_FAMILY_ID,
        name: '示例家庭 (演示)',
        owner_id: 'system_demo',
        created_at: new Date().toISOString()
    },
    user: {
        family_id: DEMO_FAMILY_ID,
        nickname: '访客',
        role: 'guest',
        _openid: 'guest_openid',
        joined_at: new Date().toISOString()
    },
    kids: [
        { _id: 'demo_kid_1', name: '宝宝', gender: 'boy', current_points: 150 }
    ]
};

// Default Data
const DEFAULT_REASONS_ADD = ['认真作业', '阅读打卡', '作业按时完成', '做家务', '早睡早起'];
const DEFAULT_REASONS_USE = ['买玩具', '看电视', '吃零食', '买文具', '去游乐场'];

// Series Data
const SERIES_CONFIG = {
    3: { id: 3, name: '宇宙系列', icons: ['🌙', '🌍', '⭐️', '🌞'], desc: '月亮、地球、星星、太阳' },
    1: { id: 1, name: '动物系列', icons: ['🐭', '🦁', '🐷', '🐲'], desc: '老鼠、狮子、猪、龙' },
    2: { id: 2, name: '植物系列', icons: ['🌱', '🌸', '💐', '🌳'], desc: '芽苗、小花、花簇、大树花' }
};
const LEVEL_THRESHOLDS = [1, 10, 100, 1000];

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

// Family Cache Manager
const FamilyCache = {
    load() {
        try {
            const raw = localStorage.getItem(FAMILIES_CACHE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load family cache', e);
            return [];
        }
    },
    save(families) {
        try {
            // Only save valid families
            const valid = families.filter(f => f && f.info && f.info._id);
            localStorage.setItem(FAMILIES_CACHE_KEY, JSON.stringify(valid));
        } catch (e) {
            console.error('Failed to save family cache', e);
        }
    },
    merge(newFamilies) {
        const current = this.load();
        const map = new Map();
        
        // Priority: New > Old
        current.forEach(f => {
            if (f && f.info && f.info._id) map.set(f.info._id, f);
        });
        
        newFamilies.forEach(f => {
             if (f && f.info && f.info._id) map.set(f.info._id, f);
        });
        
        const merged = Array.from(map.values());
        this.save(merged);
        return merged;
    }
};

// Utils
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
}

// --- Views ---

function render() {
    if (DataStore.isLoading() && !state.user) {
        app.innerHTML = `<div class="text-gray-500">加载中...</div>`;
        return;
    }

    if (state.showPoster && state.posterFamily) {
        app.innerHTML = renderPosterView();
        return;
    }

    if (!state.user || !state.family) {
        // If not in a family, show family list (directory)
        // If we haven't loaded the directory yet, trigger load
        if (state.allFamilies.length === 0 && !state.allFamiliesLoading) {
            loadAllFamilies();
        }
        
        if (state.authMode !== 'login') {
             app.innerHTML = renderAuthView();
        } else {
             app.innerHTML = renderFamilyListView();
        }
        return;
    }

    // Main App
    app.innerHTML = `
        <div class="w-full max-w-4xl mx-auto">
            ${renderHeader()}
            ${state.currentTab === 'home' ? renderHomeSimple() : ''}
            
            <div class="mb-20">
                ${state.currentTab === 'dashboard' ? renderDashboardView() : ''}
                ${state.currentTab === 'points' ? renderPointsView() : ''}
                ${state.currentTab === 'stats' ? renderStatsView() : ''}
                ${state.currentTab === 'review' ? renderReviewView() : ''}
                ${state.currentTab === 'display' ? '' : ''}
                ${state.currentTab === 'settings' ? renderSettingsView() : ''}
            </div>

            ${renderBottomNav()}
            ${renderLoginModal()} <!-- Legacy modal for pin entry if needed -->
        </div>
    `;
    
    // Post-render effects
    if (state.currentTab === 'stats') initChart();
    if (state.currentTab === 'dashboard') initDashboardCharts();
}

async function loadAllFamilies() {
    state.allFamiliesLoading = true;
    render(); // Update UI to show loading
    
    try {
        const res = await DataStore.getAllFamilies();
        if (res.success) {
            state.allFamilies = res.data.families;
        }
    } catch (e) {
        console.error('Failed to load families', e);
    } finally {
        state.allFamiliesLoading = false;
        render();
    }
}

function renderFamilyListView() {
    // Check which families I have joined
    const myFamilyIds = new Set(state.availableFamilies.map(f => {
        if (!f.info || !f.info._id) {
            console.warn('Invalid family record in availableFamilies:', f);
            return null;
        }
        return f.info._id;
    }).filter(id => id));

    // Sort families: Joined ones first
    const sortedFamilies = [...state.allFamilies].sort((a, b) => {
        const aJoined = myFamilyIds.has(a._id);
        const bJoined = myFamilyIds.has(b._id);
        if (aJoined && !bJoined) return -1;
        if (!aJoined && bJoined) return 1;
        return 0;
    });

    return `
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h1 class="text-2xl font-bold text-center text-primary mb-6">选择家庭</h1>
            
            <div onclick="enterDemoFamily()" class="mb-6 border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition flex items-center justify-between">
                <div>
                    <div class="font-bold text-blue-800">✨ 快速体验</div>
                    <div class="text-xs text-blue-600">点击进入示例家庭查看演示数据</div>
                </div>
                <span class="text-xl">👉</span>
            </div>

            ${state.allFamiliesLoading ? '<div class="text-center text-gray-500 py-4">加载家庭列表中...</div>' : ''}
            
            <div class="space-y-4 mb-8 max-h-[60vh] overflow-y-auto">
                ${sortedFamilies.map(f => {
                    const isJoined = myFamilyIds.has(f._id);
                    return `
                    <div onclick="${isJoined ? `selectFamily('${f._id}')` : ''}" class="border ${isJoined ? 'border-green-200 bg-green-50' : 'border-gray-200'} rounded-xl p-4 ${isJoined ? 'cursor-pointer hover:bg-green-100' : ''} transition relative">
                        ${isJoined ? '<div class="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">已加入</div>' : ''}
                        
                        <div class="flex justify-between items-center mb-2 ${isJoined ? 'pr-14' : ''}">
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-lg text-gray-800">${f.name}</span>
                                <button onclick="
                                    openPoster('${f._id}');
                                    event.stopPropagation();
                                " class="text-xs text-gray-400 hover:text-purple-600 border border-transparent hover:border-purple-200 rounded px-1.5 py-0.5 transition">
                                    展示
                                </button>
                            </div>
                            ${state.currentOpenId && f.owner_id === state.currentOpenId ? 
                                `<button onclick="handleDeleteFamily('${f._id}'); event.stopPropagation();" class="text-xs text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">删除</button>` 
                                : ''}
                        </div>
                        
                        <div class="text-xs text-gray-500 mb-2">ID: ${f._id}</div>

                        <div class="flex gap-2 flex-wrap mb-3">
                            ${f.kids && f.kids.length > 0 ? f.kids.map(k => `
                                <span class="text-xs px-2 py-1 rounded-full ${k.gender === 'girl' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}">
                                    ${k.name}: ${k.current_points}
                                </span>
                            `).join('') : '<span class="text-xs text-gray-400">暂无孩子信息</span>'}
                        </div>

                        ${!isJoined && state.availableFamilies.length === 0 ? `
                            <button onclick="
                                state.prefillFamilyId='${f._id}';
                                setAuthMode('join');
                                event.stopPropagation();
                            " class="w-full py-2 bg-white border border-primary text-primary text-sm rounded-lg font-bold hover:bg-blue-50">
                                加入此家庭
                            </button>
                        ` : ''}

                        ${isJoined ? `
                            <button class="w-full py-2 bg-white border border-green-500 text-green-600 text-sm rounded-lg font-bold hover:bg-green-50 flex items-center justify-center gap-1">
                                <span>进入家庭</span>
                                <span class="text-lg">➡️</span>
                            </button>
                        ` : ''}
                    </div>
                `}).join('')}
                
                ${!state.allFamiliesLoading && sortedFamilies.length === 0 ? '<div class="text-center text-gray-400">暂无家庭，快去创建一个吧！</div>' : ''}
            </div>

            ${state.availableFamilies.length === 0 ? `
            <div class="space-y-3 pt-4 border-t border-gray-100">
                 <button onclick="setAuthMode('register')" class="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                    + 创建新家庭
                 </button>
            </div>
            ` : ''}
        </div>
    `;
}

window.selectFamily = (familyId) => {
    // Note: selectFamily expects the full family object from 'availableFamilies' usually
    // But here we are passing ID.
    // Let's find it in availableFamilies
    const family = state.availableFamilies.find(f => f.info._id === familyId);
    if (family) {
        // Fix: Check if we have fresher info in allFamilies (directory) and update cache
        // This solves the issue where directory shows new name but entering family shows old name
        const freshInfo = state.allFamilies.find(f => f._id === familyId);
        if (freshInfo && freshInfo.name !== family.info.name) {
            console.log(`Updating family name from directory cache: ${family.info.name} -> ${freshInfo.name}`);
            family.info.name = freshInfo.name;
            // Persist the update to local cache
            FamilyCache.save(state.availableFamilies);
        }

        DataStore.selectFamily(family);
    } else {
        // Should not happen if UI is correct (only clickable if joined)
        alert('您尚未加入该家庭');
    }
}

window.handleDeleteFamily = async (familyId) => {
    if (state.isDemo || familyId === DEMO_FAMILY_ID) return alert('这仅为示例，无法删除。');

    const pin = prompt('请输入管理密码(PIN)以确认删除此家庭:');
    if (!pin) return;
    
    if (confirm('警告：删除操作不可恢复！将删除所有家庭成员、孩子和积分记录。确定要删除吗？')) {
        const res = await DataStore.deleteFamily(familyId, pin);
        if (res.success) {
            alert('删除成功');
            loadAllFamilies();
        } else {
            alert('删除失败: ' + res.message);
        }
    }
}

function renderAuthView() {
    const isRegister = state.authMode === 'register';
    const isJoin = state.authMode === 'join';
    
    return `
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h1 class="text-2xl font-bold text-center text-primary mb-6">
                ${isRegister ? '创建新家庭' : (isJoin ? '加入现有家庭' : '欢迎使用')}
            </h1>
            
            ${state.authMode === 'login' ? `
                <div class="space-y-4">
                    <p class="text-gray-600 text-center mb-4">请选择操作以开始</p>
                    <button onclick="setAuthMode('register')" class="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition">创建新家庭</button>
                    <button onclick="setAuthMode('join')" class="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">加入现有家庭</button>
                </div>
            ` : `
                <div class="space-y-4">
                    ${isRegister ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">家庭名称</label>
                            <input type="text" id="auth-family-name" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="例如：快乐一家人">
                        </div>
                    ` : ''}
                    
                    ${isJoin ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">家庭 ID</label>
                            <input type="text" id="auth-family-id" value="${state.prefillFamilyId || ''}" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="向管理员索要">
                        </div>
                    ` : ''}

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">您的昵称</label>
                        <input type="text" id="auth-nickname" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="例如：爸爸">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">管理密码 (PIN)</label>
                        <input type="tel" id="auth-pin" maxlength="6" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="设置6位数字密码">
                    </div>

                    <button onclick="handleAuthSubmit('${state.authMode}')" class="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition mt-6">
                        ${isRegister ? '创建并登录' : '加入并登录'}
                    </button>
                    
                    <button onclick="setAuthMode('login')" class="w-full py-2 text-gray-500 text-sm hover:text-gray-700">返回</button>
                </div>
            `}
        </div>
    `;
}

window.setAuthMode = (mode) => {
    state.authMode = mode;
    render();
}

window.handleAuthSubmit = async (mode) => {
    const nickname = document.getElementById('auth-nickname').value;
    const pin = document.getElementById('auth-pin').value;
    
    if (!nickname || !pin) return alert('请填写完整信息');
    
    let res;
    if (mode === 'register') {
        const familyName = document.getElementById('auth-family-name').value;
        if (!familyName) return alert('请输入家庭名称');
        res = await DataStore.createFamily(familyName, pin, nickname);
    } else if (mode === 'join') {
        const familyId = document.getElementById('auth-family-id').value;
        if (!familyId) return alert('请输入家庭ID');
        res = await DataStore.joinFamily(familyId, pin, nickname);
    }
    
    if (res.success) {
        // Optimistic Update: Manually add the new family to joined list
        // This ensures it appears as "Joined" immediately even if DB is slow
        let familyToEnter = res.newFamily;
        
        // Fallback for old backend or if newFamily is missing but we have ID
        if (!familyToEnter && res.familyId) {
            if (mode === 'register') {
                console.warn('Backend did not return full family object, constructing locally...');
                const familyName = document.getElementById('auth-family-name').value;
                familyToEnter = {
                    info: {
                        _id: res.familyId,
                        name: familyName,
                        admin_pin: pin,
                        owner_id: state.currentOpenId, // Best guess
                        created_at: new Date().toISOString()
                    },
                    user: {
                        family_id: res.familyId,
                        nickname: nickname,
                        role: 'admin',
                        _openid: state.currentOpenId,
                        joined_at: new Date().toISOString()
                    },
                    kids: []
                };
            } else if (mode === 'join') {
                 // Try to construct from backend response (Best)
                 if (res.family) {
                     console.log('Constructing local family object from backend response...', res.family);
                     familyToEnter = {
                         info: {
                             _id: res.family.info._id,
                             name: res.family.info.name,
                             owner_id: res.family.info.owner_id,
                             created_at: res.family.info.created_at
                         },
                         user: {
                             family_id: res.familyId,
                             nickname: nickname,
                             role: 'member',
                             _openid: state.currentOpenId,
                             joined_at: new Date().toISOString()
                         },
                         kids: res.family.kids || []
                     };
                 } 
                 // Fallback: Try to find in directory
                 else {
                     const dirFamily = state.allFamilies.find(f => f._id === res.familyId);
                     if (dirFamily) {
                         console.log('Constructing local family object from directory cache for join...');
                         familyToEnter = {
                             info: {
                                 _id: dirFamily._id,
                                 name: dirFamily.name,
                                 owner_id: dirFamily.owner_id,
                                 created_at: dirFamily.created_at
                             },
                             user: {
                                 family_id: res.familyId,
                                 nickname: nickname,
                                 role: 'member',
                                 _openid: state.currentOpenId,
                                 joined_at: new Date().toISOString()
                             },
                             kids: dirFamily.kids || [] 
                         };
                     }
                 }
            }
        }

        if (familyToEnter) {
            console.log('Optimistically adding new family:', familyToEnter);
            // Avoid duplicates
            if (!state.availableFamilies.find(f => f.info._id === familyToEnter.info._id)) {
                state.availableFamilies.push(familyToEnter);
                // Save to cache!
                FamilyCache.save(state.availableFamilies);
            }
        }
        
        // Reload directory to show the new card
        loadAllFamilies();
        
        // Auto-enter logic
        const targetId = res.familyId || (mode === 'join' ? document.getElementById('auth-family-id').value : null);
        
        if (targetId) {
            // Because we optimistically updated state.availableFamilies, 
            // we can try to enter immediately without waiting for checkLoginStatus
            const found = state.availableFamilies.find(f => f.info._id === targetId);
            if (found) {
                console.log('Found family locally, entering immediately:', found);
                DataStore.selectFamily(found);
                
                // Only alert AFTER we have initiated entry, to make it feel smoother?
                // Or Alert first? 
                // Let's alert first as before, but ensure render happens.
                if (mode === 'join') {
                    alert('加入成功！');
                } else {
                    alert('创建成功！正在进入家庭...');
                }
                state.authMode = 'login';
                return; // selectFamily triggers render, so we are done
            }
        }
        
        // Fallback if not auto-entered
        if (mode === 'join') {
            alert('加入成功！');
        } else {
            alert('创建成功！');
        }
        state.authMode = 'login';
        render();

    } else {
        alert(res.message || '操作失败');
    }
}

function renderHeader() {
    return `
        <div id="page-header" class="flex justify-between items-center mb-4">
            <div>
                <div class="text-2xl font-black tracking-tight text-gray-900">${state.family.name}</div>
                <div class="text-xs text-gray-500">ID: ${state.family._id}</div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm text-gray-600">${state.user.nickname}</span>
                <button onclick="handleLogout()" class="text-xs text-gray-500 hover:text-danger">退出</button>
            </div>
        </div>
    `;
}

window.handleLogout = async () => {
    if (state.isDemo) {
        state.isDemo = false;
        state.user = null;
        state.family = null;
        state.kids = [];
        state.authMode = 'login';
        render();
        return;
    }

    if (confirm('确定要退出当前家庭登录吗？')) {
        await DataStore.logout();
        state.user = null;
        state.family = null;
        state.kids = [];
        state.authMode = 'login';
        render();
    }
}

function renderBottomNav() {
    const tabs = [
        { id: 'home', label: '首页', icon: '🏠' },
        { id: 'points', label: '加减分', icon: '✨' },
        { id: 'dashboard', label: '报表', icon: '📊' },
        { id: 'settings', label: '设置', icon: '⚙️' }
    ];
    return `
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
            <div class="flex justify-around items-center p-2">
                ${tabs.map(tab => `
                    <button onclick="switchTab('${tab.id}')" class="flex flex-col items-center p-2 ${state.currentTab === tab.id ? 'text-primary' : 'text-gray-400'}">
                        <span class="text-xl mb-1">${tab.icon}</span>
                        <span class="text-[10px] font-medium">${tab.label}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

window.switchTab = (tab) => {
    state.currentTab = tab;
    if (tab === 'dashboard') {
        loadHistory();
        if (!state.isDemo) {
            DataStore.refresh();
        }
    }
    render();
}

window.loadHistory = async (append = false) => {
    if (!append) state.historyPage = 1;
    state.historyLoading = true;
    render();
    
    const res = await DataStore.getHistory(null, state.historyPage);
    state.historyLoading = false;
    
    if (res.success && res.data) {
        if (append) {
            state.history = [...state.history, ...(res.data.logs || [])];
        } else {
            state.history = res.data.logs || [];
        }
        state.historyHasMore = res.data.hasMore;
    } else {
        if (!append) state.history = [];
    }
    render();
}

window.loadMoreHistory = () => {
    state.historyPage++;
    loadHistory(true);
}


function renderHomeSimple() {
    if (state.kids.length === 0) {
        return `
            <div class="text-center py-10">
                <p class="text-gray-500 mb-4">还没有添加孩子信息</p>
                <button onclick="switchTab('settings')" class="bg-primary text-white px-4 py-2 rounded-lg">去添加</button>
            </div>
        `;
    }

    // Special layout for single kid to maximize visibility
    if (state.kids.length === 1) {
        const kid = state.kids[0];
        const icon = getSeriesIcon(kid.current_points);
        return `
            <div class="mb-4">
                <div class="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[50vh]">
                    <div class="absolute top-0 left-0 w-full h-4 bg-gradient-to-r ${kid.gender === 'girl' ? 'from-pink-400 to-pink-200' : 'from-blue-400 to-blue-200'}"></div>
                    <div class="text-3xl text-gray-500 mb-6 font-bold tracking-wider">${kid.name}</div>
                    <div class="flex-1 flex flex-col items-center justify-center w-full my-4">
                        ${icon ? `<div class="text-[8rem] mb-4 animate-bounce">${icon}</div>` : ''}
                        <div class="font-extrabold tracking-tighter ${kid.gender === 'girl' ? 'text-pink-600' : 'text-blue-600'}" 
                             style="font-size: clamp(6rem, 40vw, 12rem); line-height: 0.9; text-shadow: 2px 2px 0px rgba(0,0,0,0.05);">
                            ${kid.current_points}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Grid layout for multiple kids
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            ${state.kids.map(kid => {
                const icon = getSeriesIcon(kid.current_points);
                return `
                <div class="bg-white rounded-2xl shadow p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[240px]">
                    <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${kid.gender === 'girl' ? 'from-pink-400 to-pink-200' : 'from-blue-400 to-blue-200'}"></div>
                    <div class="text-xl text-gray-500 mb-2 font-bold">${kid.name}</div>
                    <div class="flex-1 flex flex-col items-center justify-center w-full">
                        ${icon ? `<div class="text-6xl mb-2">${icon}</div>` : ''}
                        <div class="font-extrabold tracking-tight ${kid.gender === 'girl' ? 'text-pink-600' : 'text-blue-600'}" style="font-size: clamp(3rem, 15vw, 6rem); line-height: 1;">
                            ${kid.current_points}
                        </div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

window.quickAdd = (kidId, delta) => {
    if (state.isDemo) return alert('这仅为示例，请创建自己的家庭。');
    DataStore.updatePoints(kidId, delta, '快速加分', state.user.nickname);
}

function renderPointsView() {
    if (!state.kids.length) return `<div class="text-center p-8 text-gray-500">请先在设置中添加孩子</div>`;

    return `
        <div class="grid gap-6">
            ${state.kids.map(kid => {
                // Init view state for kid if missing
                if (!state.pointMode[kid._id]) state.pointMode[kid._id] = 'add';
                
                const mode = state.pointMode[kid._id];
                const isAdd = mode === 'add';
                const colorClass = kid.gender === 'girl' ? 'text-pink-600' : 'text-blue-600';
                
                return `
                <div class="bg-white rounded-xl shadow p-6">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold ${colorClass}">${kid.name}</h2>
                        <div class="text-4xl font-extrabold tracking-tight text-gray-900">${kid.current_points}<span class="ml-1 text-sm text-gray-400 font-semibold">分</span></div>
                    </div>

                    <!-- Mode Toggle -->
                    <div class="flex bg-gray-100 p-1 rounded-lg mb-4">
                        <button onclick="setPointMode('${kid._id}', 'add')" class="flex-1 py-2 text-sm font-bold rounded-md transition ${isAdd ? 'bg-white text-green-600 shadow' : 'text-gray-500 hover:text-gray-700'}">🌟 奖励</button>
                        <button onclick="setPointMode('${kid._id}', 'use')" class="flex-1 py-2 text-sm font-bold rounded-md transition ${!isAdd ? 'bg-white text-red-600 shadow' : 'text-gray-500 hover:text-gray-700'}">🎁 支出</button>
                    </div>

                    <!-- Reasons -->
                    <div class="mb-4">
                        <div class="flex flex-wrap gap-2 mb-3">
                            ${(isAdd ? state.reasons.add : state.reasons.use).map(r => `
                                <button onclick="${state.deletingReasonMode ? `deleteReason('${isAdd ? 'add' : 'use'}', '${r}')` : `setReason('${kid._id}', '${r}')`}" 
                                        class="px-3 py-1 ${state.deletingReasonMode ? 'bg-gray-100 text-gray-400 border-gray-300 line-through' : (isAdd ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100')} border text-xs font-bold rounded-full hover:brightness-95 relative">
                                    ${r} ${state.deletingReasonMode ? '<span class="ml-1 text-red-500 font-bold">×</span>' : ''}
                                </button>
                            `).join('')}
                            <button onclick="addCustomReason('${isAdd ? 'add' : 'use'}')" class="px-3 py-1 border border-dashed border-gray-300 rounded-full text-xs text-gray-400" ${state.deletingReasonMode ? 'disabled style="opacity:0.3"' : ''}>+ 添加</button>
                            <button onclick="toggleDeleteReasonMode()" class="px-3 py-1 border border-transparent rounded-full text-xs ${state.deletingReasonMode ? 'text-red-500 bg-red-50 font-bold' : 'text-gray-400 hover:text-gray-600'}">
                                ${state.deletingReasonMode ? '完成' : '- 删除'}
                            </button>
                        </div>
                        
                        <input type="text" id="reason-${kid._id}" 
                            value="${state.reasonQuery[kid._id] || ''}"
                            oninput="onReasonInput('${kid._id}', this.value)"
                            placeholder="${isAdd ? '输入奖励理由...' : '输入支出用途...'}" 
                            class="w-full p-3 border border-gray-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary outline-none transition">
                        
                        <!-- Buttons -->
                        <div class="mt-4 grid grid-cols-4 gap-2">
                            ${isAdd ? `
                                <button onclick="doUpdatePoints('${kid._id}', 1)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+1</button>
                                <button onclick="doUpdatePoints('${kid._id}', 2)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+2</button>
                                <button onclick="doUpdatePoints('${kid._id}', 5)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+5</button>
                                <button onclick="doUpdatePoints('${kid._id}', 10)" class="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm transition">+10</button>
                            ` : `
                                <button onclick="doUpdatePoints('${kid._id}', -10)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-10</button>
                                <button onclick="doUpdatePoints('${kid._id}', -50)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-50</button>
                                <button onclick="doUpdatePoints('${kid._id}', -100)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-100</button>
                                <button onclick="doUpdatePoints('${kid._id}', -200)" class="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 shadow-sm transition">-200</button>
                            `}
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

window.setPointMode = (kidId, mode) => {
    state.pointMode[kidId] = mode;
    render();
}

window.onReasonInput = (kidId, val) => {
    state.reasonQuery[kidId] = val;
}

window.setReason = (kidId, reason) => {
    state.reasonQuery[kidId] = reason;
    const el = document.getElementById(`reason-${kidId}`);
    if (el) el.value = reason;
}

window.addCustomReason = (type) => {
    const r = prompt('请输入新理由:');
    if (r) ReasonManager.add(type, r);
}

window.toggleDeleteReasonMode = () => {
    state.deletingReasonMode = !state.deletingReasonMode;
    render();
}

window.deleteReason = (type, reason) => {
    if (confirm(`确定要删除理由“${reason}”吗？`)) {
        ReasonManager.remove(type, reason);
    }
}

window.doUpdatePoints = (kidId, delta) => {
    if (state.isDemo) return alert('这仅为示例，请创建自己的家庭。');

    const reasonInput = document.getElementById(`reason-${kidId}`);
    const reason = (reasonInput ? reasonInput.value : '').trim();
    
    if (!reason && !confirm('确定不写原因直接加减分吗？')) return;
    
    DataStore.updatePoints(kidId, delta, reason, state.user.nickname);
    
    if (reasonInput) {
        reasonInput.value = '';
        state.reasonQuery[kidId] = '';
    }
}

window.handleEditFamilyName = async () => {
    if (state.isDemo) return alert('这仅为示例，无法修改。');

    const nameInput = document.getElementById('setting-family-name');
    if (!nameInput) return;
    
    const currentName = state.family.name;
    const newName = nameInput.value;
    
    if (!newName || newName.trim() === '') return;
    if (newName === currentName) return;
    
    // Client-side duplicate check (against loaded families)
    const exists = state.allFamilies.some(f => f.name === newName && f._id !== state.family._id);
    if (exists) {
        alert('该家庭名称已被使用，请换一个名称。');
        return;
    }
    
    const res = await DataStore.updateFamilyName(newName);
    if (res.success) {
        alert('修改成功');
        render();
    } else {
        alert('修改失败: ' + res.message);
    }
}

window.handleUpdateFamilyPin = async () => {
    if (state.isDemo) return alert('这仅为示例，无法修改。');
    
    const oldPinInput = document.getElementById('setting-family-pin-old');
    const newPinInput = document.getElementById('setting-family-pin-new');
    
    const oldPin = oldPinInput ? oldPinInput.value : '';
    const newPin = newPinInput ? newPinInput.value : '';

    if (!oldPin) return alert('请输入旧密码');
    if (!newPin || newPin.trim() === '') return alert('请输入新密码');
    
    if (newPin.length < 4) {
         return alert('PIN 码长度不能少于4位');
    }

    const res = await DataStore.updateFamilyPin(oldPin, newPin);
    if (res.success) {
        alert('修改成功，请记住新的 PIN 码');
        oldPinInput.value = '';
        newPinInput.value = '';
    } else {
        alert('修改失败: ' + (res.message || '旧密码错误或网络问题'));
    }
}

function getSeriesIcon(points) {
    const seriesId = (state.family && state.family.display_series) || 3;
    const series = SERIES_CONFIG[seriesId] || SERIES_CONFIG[3];
    
    // Thresholds: 1, 10, 100, 1000
    // Index 0: 1 <= p < 10
    // Index 1: 10 <= p < 100
    // Index 2: 100 <= p < 1000
    // Index 3: p >= 1000
    
    let index = -1;
    if (points >= 1000) index = 3;
    else if (points >= 100) index = 2;
    else if (points >= 10) index = 1;
    else if (points >= 1) index = 0;
    
    if (index === -1) return null;
    return series.icons[index];
}

function renderDisplayView() {
    const currentSeriesId = (state.family && state.family.display_series) || 3;
    
    return `
        <div class="space-y-6">
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">展示系列设置</h3>
                <p class="text-sm text-gray-500 mb-6">选择不同的主题系列，孩子的积分将展示为对应的图标。</p>
                
                <div class="space-y-4">
                    ${Object.values(SERIES_CONFIG).map(s => `
                        <div onclick="handleSetSeries(${s.id})" 
                             class="border-2 rounded-xl p-4 cursor-pointer transition relative ${currentSeriesId == s.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'}">
                            
                            ${currentSeriesId == s.id ? '<div class="absolute top-2 right-2 text-primary">✅</div>' : ''}
                            
                            <div class="font-bold text-lg mb-2">${s.name}</div>
                            <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                ${s.icons.map((icon, idx) => `
                                    <div class="flex flex-col items-center">
                                        <span class="text-2xl mb-1">${icon}</span>
                                        <span class="text-xs text-gray-400">≥${LEVEL_THRESHOLDS[idx]}</span>
                                    </div>
                                `).join('<div class="text-gray-300">→</div>')}
                            </div>
                            <div class="mt-2 text-xs text-gray-500">${s.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

window.handleSetSeries = async (seriesId) => {
    if (state.isDemo) return alert('这仅为示例，无法修改。');
    
    // Optimistic update
    state.family.display_series = seriesId;
    render();
    
    const res = await DataStore.updateFamilySeries(seriesId);
    if (!res.success) {
        alert('设置失败: ' + res.message);
        // Rollback or re-fetch
        DataStore.refresh();
    }
}

// --- Poster Logic ---

window.openPoster = (familyId) => {
    // Try to find in directory first
    const family = state.allFamilies.find(f => f._id === familyId);
    if (family) {
        state.posterFamily = family;
        state.showPoster = true;
        render();
    } else {
        alert('未找到家庭数据');
    }
}

window.closePoster = () => {
    state.showPoster = false;
    state.posterFamily = null;
    render();
}

function renderPosterView() {
    const family = state.posterFamily;
    if (!family) return '';

    // If we have display_series in the family directory object, use it.
    // However, getAllFamilies might not return 'display_series' unless we update the backend.
    // If not present, default to 3 (Universe).
    const seriesId = family.display_series || 3;
    const series = SERIES_CONFIG[seriesId] || SERIES_CONFIG[3];

    return `
        <div class="fixed inset-0 bg-gray-900 text-white z-50 overflow-y-auto">
            <div class="min-h-screen flex flex-col p-4 md:p-8">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                        ${family.name}
                    </h1>
                    <button onclick="closePoster()" class="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition">
                        ✕ 关闭
                    </button>
                </div>

                <!-- Kids Grid -->
                <div class="flex-1 grid grid-cols-1 md:grid-cols-${Math.min(family.kids.length, 3)} gap-8 content-center">
                    ${family.kids.map(kid => {
                        const icons = getSeriesIconsDecomposed(kid.current_points, series);
                        return `
                        <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-white/20 shadow-2xl flex flex-col items-center">
                            <div class="text-2xl md:text-4xl font-bold mb-4 ${kid.gender === 'girl' ? 'text-pink-300' : 'text-blue-300'}">
                                ${kid.name}
                            </div>
                            
                            <div class="text-5xl md:text-7xl font-black mb-8 font-mono tracking-wider text-yellow-400 drop-shadow-lg">
                                ${kid.current_points}
                            </div>

                            <div class="w-full bg-black/20 rounded-2xl p-6 min-h-[200px] flex flex-wrap justify-center content-center gap-4">
                                ${icons.length > 0 ? icons.map(icon => `
                                    <div class="text-5xl md:text-7xl animate-bounce-slow filter drop-shadow-md transform hover:scale-110 transition duration-300 cursor-default" title="${icon.val}">
                                        ${icon.char}
                                    </div>
                                `).join('') : '<div class="text-gray-400 text-xl">继续加油！</div>'}
                            </div>
                            
                            <!-- Legend -->
                            <div class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                                ${icons.length > 0 ? `
                                    <div class="flex gap-2">
                                       ${Object.values(series.icons).map((char, i) => `<span>${char}=${LEVEL_THRESHOLDS[i]}</span>`).join(' ')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>

                <!-- Footer -->
                <div class="text-center text-gray-500 mt-8 text-sm">
                    EduTogether Points Display System • ${series.name}
                </div>
            </div>
            
            <style>
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); }
                    50% { transform: translateY(5%); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            </style>
        </div>
    `;
}

function getSeriesIconsDecomposed(points, series) {
    // Thresholds: 1, 10, 100, 1000
    // Icons: [0]=1, [1]=10, [2]=100, [3]=1000
    
    let remaining = points;
    const result = [];
    
    // 1000s (Index 3)
    const count1000 = Math.floor(remaining / 1000);
    for(let i=0; i<count1000; i++) result.push({char: series.icons[3], val: 1000});
    remaining %= 1000;
    
    // 100s (Index 2)
    const count100 = Math.floor(remaining / 100);
    for(let i=0; i<count100; i++) result.push({char: series.icons[2], val: 100});
    remaining %= 100;
    
    // 10s (Index 1)
    const count10 = Math.floor(remaining / 10);
    for(let i=0; i<count10; i++) result.push({char: series.icons[1], val: 10});
    remaining %= 10;
    
    // 1s (Index 0)
    const count1 = remaining;
    for(let i=0; i<count1; i++) result.push({char: series.icons[0], val: 1});
    
    return result;
}

function renderSettingsView() {
    return `
        <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h2 class="text-xl font-bold mb-4">家庭设置</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">家庭名称</label>
                    <div class="flex gap-2">
                        <input type="text" id="setting-family-name" value="${state.family.info.name}" class="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary outline-none">
                        <button onclick="handleEditFamilyName()" class="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-700">修改</button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">管理密码 (PIN)</label>
                    <div class="flex gap-2">
                         <input type="password" id="setting-family-pin-old" placeholder="旧密码" class="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary outline-none">
                         <input type="tel" maxlength="6" id="setting-family-pin-new" placeholder="新密码" class="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary outline-none">
                        <button onclick="handleUpdateFamilyPin()" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">修改</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-bold mb-4">展示系列设置</h3>
            <p class="text-sm text-gray-500 mb-6">选择不同的主题系列，展示页面将使用对应的图标。</p>
            
            <div class="space-y-4">
                ${Object.values(SERIES_CONFIG).map(s => {
                    const currentSeriesId = state.family.display_series || 3;
                    return `
                    <div onclick="handleSetSeries(${s.id})" 
                            class="border-2 rounded-xl p-4 cursor-pointer transition relative ${currentSeriesId == s.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'}">
                        
                        ${currentSeriesId == s.id ? '<div class="absolute top-2 right-2 text-primary">✅</div>' : ''}
                        
                        <div class="font-bold text-lg mb-2">${s.name}</div>
                        <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                            ${s.icons.map((icon, idx) => `
                                <div class="flex flex-col items-center">
                                    <span class="text-2xl mb-1">${icon}</span>
                                    <span class="text-xs text-gray-400">≥${LEVEL_THRESHOLDS[idx]}</span>
                                </div>
                            `).join('<div class="text-gray-300">→</div>')}
                        </div>
                        <div class="mt-2 text-xs text-gray-500">${s.desc}</div>
                    </div>
                `}).join('')}
            </div>
        </div>


            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">添加孩子</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">孩子昵称</label>
                        <input type="text" id="add-kid-name" class="w-full p-3 border rounded-lg" placeholder="例如：大宝">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">性别</label>
                        <div class="flex gap-4">
                            <label class="flex items-center"><input type="radio" name="add-kid-gender" value="boy" checked class="mr-2"> 男孩</label>
                            <label class="flex items-center"><input type="radio" name="add-kid-gender" value="girl" class="mr-2"> 女孩</label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">初始积分</label>
                        <input type="number" id="add-kid-points" class="w-full p-3 border rounded-lg" value="0">
                    </div>
                    <button id="btn-add-kid" onclick="handleAddKid()" class="w-full py-3 bg-secondary text-white rounded-xl font-bold hover:bg-green-600 transition">添加孩子</button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow p-6">
                 <h3 class="text-lg font-bold mb-4">已有成员</h3>
                 <div class="space-y-2">
                    ${state.kids.map(k => `
                         <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center gap-2">
                                <span class="${k.gender === 'girl' ? 'text-pink-600' : 'text-blue-600'} font-bold">${k.name}</span>
                                <button onclick="handleUpdateKidName('${k._id}', '${k.name}')" class="text-xs text-gray-400 hover:text-blue-500">✏️</button>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 text-sm">当前: ${k.current_points}</span>
                                <button onclick="handleSetPoints('${k._id}', ${k.current_points})" class="text-xs text-blue-500 underline">修改</button>
                            </div>
                        </div>
                    `).join('')}
                 </div>
            </div>
        </div>
    `;
}

window.handleAddKid = async () => {
    if (state.isDemo) return alert('这仅为示例，请创建自己的家庭。');

    const nameInput = document.getElementById('add-kid-name');
    const pointsInput = document.getElementById('add-kid-points');
    const genderInput = document.querySelector('input[name="add-kid-gender"]:checked');
    
    if (!nameInput || !pointsInput || !genderInput) {
        console.error('Form elements not found');
        return;
    }

    const name = nameInput.value;
    const gender = genderInput.value;
    const points = pointsInput.value;
    
    if (!name) return alert('请输入孩子昵称');
    
    // Show loading state
    const btn = document.getElementById('btn-add-kid');
    let originalText = '';
    if (btn) {
        originalText = btn.innerText;
        btn.innerText = '正在添加...';
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    try {
        const res = await DataStore.addKid(name, gender, points);
        if (res.success) {
            alert('添加成功');
            nameInput.value = '';
            pointsInput.value = '0';
            // Refresh view
            render();
        } else {
            alert('添加失败: ' + res.message);
        }
    } catch (e) {
        console.error('Add kid error:', e);
        alert('操作出错: ' + (e.message || '未知错误'));
    } finally {
        // Restore button state (if view wasn't re-rendered)
        if (btn && document.body.contains(btn)) {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

function renderReviewView() {
    return `<div class="p-8 text-center text-gray-500">功能开发中...</div>`;
}

function renderDashboardView() {
    return `
        <div class="space-y-6 p-4">
            <div class="bg-white rounded-xl shadow p-4">
                 <h3 class="font-bold mb-4">当前积分对比</h3>
                 <div class="relative h-64 w-full">
                    <canvas id="dashboard-chart"></canvas>
                 </div>
            </div>

            <div class="bg-white rounded-xl shadow p-4">
                <h3 class="font-bold mb-4">最近动态</h3>
                ${state.historyLoading && (!state.history || state.history.length === 0) ? '<div class="text-center text-gray-400 py-4">加载中...</div>' : ''}
                
                <div class="space-y-3">
                    ${(!state.history || state.history.length === 0) && !state.historyLoading ? '<div class="text-center text-gray-400 py-4">暂无记录</div>' : ''}
                    
                    ${(state.history || []).map(log => `
                        <div class="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                            <div>
                                <div class="font-medium text-gray-900">${log.reason || '无理由'}</div>
                                <div class="text-xs text-gray-500">
                                    ${formatDate(log.timestamp)} · ${log.operator_name} -> 
                                    <span class="font-bold">${state.kids.find(k => k._id === log.kid_id)?.name || '未知'}</span>
                                </div>
                            </div>
                            <div class="font-bold ${log.delta > 0 ? 'text-green-600' : 'text-red-600'}">
                                ${log.delta > 0 ? '+' : ''}${log.delta}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${state.historyHasMore ? `
                    <div class="mt-4 text-center">
                        <button onclick="loadMoreHistory()" class="text-sm text-primary py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            ${state.historyLoading ? '加载中...' : '加载更多'}
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderStatsView() {
     return `<div class="p-8 text-center text-gray-500">更多统计功能敬请期待</div>`;
}

// Charts
let dashboardChart = null;

function initChart() {}

function initDashboardCharts() {
    const ctx = document.getElementById('dashboard-chart');
    if (!ctx) return;
    
    if (dashboardChart) {
        dashboardChart.destroy();
        dashboardChart = null;
    }

    // Optimization for Single Kid: Show Trend Line
    if (state.kids.length === 1) {
        const kid = state.kids[0];
        // Prepare data from history
        // We need to reconstruct the points over time
        // Start from current points and go backwards
        
        let current = kid.current_points;
        const trendData = [];
        
        // Add current state as the last point
        trendData.push({ x: new Date(), y: current });

        // Iterate history (assuming sorted desc)
        const relevantHistory = (state.history || [])
            .filter(h => h.kid_id === kid._id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Ensure desc

        relevantHistory.forEach(log => {
            // The point BEFORE this log was: current - delta
            current = current - log.delta;
            trendData.push({ x: new Date(log.timestamp), y: current });
        });

        // Reverse to be chronological for the chart
        trendData.reverse();

        // If not enough data, just show current point
        if (trendData.length < 2) {
             trendData.unshift({ x: new Date(new Date().getTime() - 86400000), y: current });
        }

        dashboardChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: '积分趋势',
                    data: trendData.map(d => ({ x: d.x.toLocaleDateString(), y: d.y })), // Simplify x for now
                    borderColor: kid.gender === 'girl' ? '#F472B6' : '#60A5FA',
                    backgroundColor: kid.gender === 'girl' ? 'rgba(244, 114, 182, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
        return;
    }
    
    // Multiple Kids: Bar Chart Comparison
    dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: state.kids.map(k => k.name),
            datasets: [{
                label: '当前积分',
                data: state.kids.map(k => k.current_points),
                backgroundColor: state.kids.map(k => k.gender === 'girl' ? '#F472B6' : '#60A5FA'),
                borderRadius: 8,
                barThickness: 40,
                maxBarThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return '当前积分: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

window.enterDemoFamily = () => {
    state.isDemo = true;
    state.user = DEMO_FAMILY_DATA.user;
    state.family = DEMO_FAMILY_DATA.info;
    state.kids = JSON.parse(JSON.stringify(DEMO_FAMILY_DATA.kids));
    
    // Generate Fake History for Demo to show nice charts
    const fakeHistory = [];
    const now = new Date();
    const kidId = state.kids[0]._id;
    // Generate last 7 days activity
    for (let i = 0; i < 15; i++) {
        const time = new Date(now.getTime() - i * 86400000 / 2); // some points every half day
        const isAdd = Math.random() > 0.3;
        const delta = isAdd ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 10) - 1;
        fakeHistory.push({
            family_id: DEMO_FAMILY_ID,
            kid_id: kidId,
            delta: delta,
            reason: isAdd ? '表现良好' : '兑换奖励',
            operator_name: '访客',
            timestamp: time.toISOString(),
            _openid: 'guest'
        });
    }
    state.history = fakeHistory.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    state.historyLoading = false;
    state.historyHasMore = false;

    state.currentTab = 'home';
    render();
}

window.handleSetPoints = (kidId, current) => {
    if (state.isDemo) return alert('这仅为示例，请创建自己的家庭。');
    
    const input = prompt('请输入新的总分:', current);
    if (input === null) return;
    
    const newPoints = parseInt(input);
    if (isNaN(newPoints)) return alert('请输入有效的数字');
    
    const delta = newPoints - current;
    if (delta === 0) return;
    
    const reason = '管理员修正总分';
    DataStore.updatePoints(kidId, delta, reason, state.user.nickname);
}

window.handleUpdateKidName = async (kidId, currentName) => {
    if (state.isDemo) return alert('这仅为示例，请创建自己的家庭。');

    const newName = prompt('请输入新的孩子昵称:', currentName);
    if (!newName || !newName.trim()) return;
    if (newName === currentName) return;

    try {
        const res = await DataStore.updateKidName(kidId, newName.trim());
        if (res.success) {
            alert('修改成功');
            // update local state immediately for better ux, though datastore refresh will handle it
            const kid = state.kids.find(k => k._id === kidId);
            if (kid) kid.name = newName.trim();
            render();
        } else {
            alert('修改失败: ' + res.message);
        }
    } catch (e) {
        console.error(e);
        alert('修改出错');
    }
}

// Dummy Modal functions to prevent errors
function renderLoginModal() { return ''; }

// Init
const initApp = async () => {
    ReasonManager.load();
    
    // Load cached families immediately to avoid empty list on reload
    state.availableFamilies = FamilyCache.load();
    
    render(); // Initial render to show loading
    
    await DataStore.init({
        env: 'chenlizhun-projects-2ckab9e1cd47',
        onDataChange: (event) => {
            if (!event) {
                render();
                return;
            }
            
            // Handle loading states
            if (event.type === 'loading_start' || event.type === 'loading_end' || event.type === 'init_finished') {
                render();
                return;
            }

            if (event.type === 'login_success') {
                // Merge backend families with cache
                // If backend returns empty (e.g. old version), we keep our cache
                const backendFamilies = event.families || [];
                
                if (backendFamilies.length > 0) {
                     state.availableFamilies = FamilyCache.merge(backendFamilies);
                } else {
                     // If backend is empty, maybe we rely on cache? 
                     // Or maybe user really has no families.
                     // But given the "old backend" issue, safer to keep cache if we have it.
                     const cached = FamilyCache.load();
                     if (cached.length > 0) {
                         state.availableFamilies = cached;
                     } else {
                         state.availableFamilies = [];
                     }
                }
                
                state.currentOpenId = event.openId;
                
                // Auto-select if URL param exists
                const urlParams = new URLSearchParams(window.location.search);
                const targetFamilyId = urlParams.get('familyId');
                
                if (targetFamilyId) {
                    const target = state.availableFamilies.find(f => f.info._id === targetFamilyId);
                    if (target) {
                        DataStore.selectFamily(target);
                        return;
                    }
                }
                
                render();
                return;
            }

            if (event.type === 'unregistered') {
                state.user = null;
                state.family = null;
                state.kids = [];
                // Do not clear availableFamilies if we have cache, 
                // but unregistered means user has no families in DB?
                // Actually 'unregistered' means 'active' status check failed or user not in USERS collection.
                // If user is not in USERS collection, they have no families.
                // But for safety against flaky backend, let's keep cache for now?
                // No, if explicit unregistered, we should probably clear.
                // But let's check cache first.
                state.availableFamilies = FamilyCache.load(); 
                state.currentOpenId = event.openId;
                render();
                return;
            }
            
            // Standard data update
            if (event.user !== undefined || event.family !== undefined) {
                state.user = event.user;
                state.family = event.family;
                state.kids = event.kids || [];

                // Sync family updates to availableFamilies cache to prevent stale data
                if (state.family && state.availableFamilies.length > 0) {
                    const cached = state.availableFamilies.find(f => f.info._id === state.family._id);
                    if (cached) {
                        // Check if name or other critical info changed
                        if (cached.info.name !== state.family.name) {
                            console.log(`Syncing family name update to cache: ${cached.info.name} -> ${state.family.name}`);
                            cached.info.name = state.family.name;
                            FamilyCache.save(state.availableFamilies);
                        }
                    }
                }

                render();
            }
        }
    });
};

initApp();
