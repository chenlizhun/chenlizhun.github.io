// Main application logic for Algorithm1 Web App

// 全局调试信息
console.log('Algorithm1 Web App loading...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    // Load and display chapters first
    loadChapters();
    setupChapterFilters();

    // Add event listener for back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', showChapterList);
    }
    const pcBtn = document.getElementById('personal-center-btn');
    if (pcBtn) {
        pcBtn.addEventListener('click', showPersonalCenter);
    }
    showMotivationQuote();
    setHeaderSticky(true);
});

// Load and display chapters
function loadChapters() {
    const chapterNav = document.getElementById('chapter-nav');
    const chaptersList = document.getElementById('chapters-list');
    
    if (!chaptersList) {
        console.error('chaptersList not found');
        return;
    }
    
    // Clear existing content
    chaptersList.innerHTML = '';
    
    // Create a grid container for chapter cards
    const gridContainer = document.createElement('div');
    gridContainer.className = 'chapters-grid';
    
    const query = loadSearchQuery();
    const statusFilter = loadFilterStatus();
    const list = Array.isArray(algorithms) ? algorithms : [];
    const filtered = list.filter(ch => chapterMatches(ch, query, statusFilter));
    if (filtered.length > 0) {
        filtered.forEach((chapter, index) => {
            const chapterCard = createChapterCard(chapter, index);
            gridContainer.appendChild(chapterCard);
        });
    } else {
        console.error('algorithms is undefined or empty');
        gridContainer.innerHTML = '<div class="text-gray-500">未找到匹配的课程</div>';
    }
    
    // Append the grid container to the chapters list
    chaptersList.appendChild(gridContainer);

    const s = document.getElementById('search-input');
    const f = document.getElementById('status-filter');
    if (s) s.value = query;
    if (f) f.value = statusFilter;
}

// Create a chapter card element
function createChapterCard(chapter, chapterIndex) {
    const card = document.createElement('div');
    card.className = 'chapter-card cursor-pointer';
    card.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-primary bg-blue-100 px-2 py-1 rounded">第${chapterIndex + 1}课</span>
                <span class="text-xs font-medium text-gray-500">📝 ${chapter.problems.length}道题目</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${chapter.title}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">${chapter.description}</p>
        </div>
    `;
    const mastered = isChapterMastered(chapter);
    if (mastered) {
        const header = card.querySelector('.flex.items-center.justify-between');
        if (header && header.lastElementChild) {
            const dot = document.createElement('span');
            dot.className = 'mastered-dot';
            dot.title = '本课全部掌握';
            header.lastElementChild.appendChild(dot);
        }
    }
    
    // Add click event to show chapter details
    card.addEventListener('click', () => {
        showChapterDetails(chapter.title); // 使用章节标题作为ID查找
    });
    
    return card;
}

// Global variable to track active chapter
let activeChapterIndex = -1;

// Show chapter details with loading state
function showChapterDetails(chapterTitle) {
    // 根据章节标题查找章节
    const chapter = algorithms.find(c => c.title === chapterTitle);
    if (!chapter) return;

    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    const algorithmContent = document.getElementById('algorithm-content');
    
    // Show algorithm detail immediately
    algorithmDetail.classList.remove('hidden');
    
    // Generate HTML for the chapter details
    let html = `
        <div class="detail-sticky">
            <button id="back-btn" class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                返回
            </button>
        </div>
        <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">${chapter.title}</h2>
        </div>
    `;
    
    // Add chapter description
    html += `<p class="text-gray-600 mb-8 px-6">${chapter.description}</p>`;
    
    // Add problems
    chapter.problems.forEach((problem, index) => {
        html += createProblemHTML(problem, index + 1, chapter.title);
    });
    
    // Update content
    algorithmContent.innerHTML = html;
    
    // Hide chapter list
    chapterNav.classList.add('hidden');
    
    // Initialize code highlighting and copy buttons
    initializeCodeHighlighting();
    initializeCopyCodeButtons();
    
    // Add event listener for back button
    document.getElementById('back-btn').addEventListener('click', showChapterList);
    
    // Initialize tabs for each problem
    initializeProblemTabs();
    
    // Initialize step visualizations
    initializeStepVisualizations();
    initializeStatusControls(chapter.title);
    setHeaderSticky(false);
    initializeDemoLinks(chapter.title);

    
}

// Create HTML for a problem
function createProblemHTML(problem, problemIndex, chapterTitle) {
    // Get LeetCode URL from the problem object if it exists
    const leetCodeUrl = problem.leetCodeUrl || '';
    
    const key = `${chapterTitle}::${problem.title}`;
    const currentStatus = getProblemStatus(key) || '';
    const lessonIndex = algorithms.findIndex(c => c.title === chapterTitle) + 1;
    return `
        <div class="algorithm-section">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                题目${problemIndex}: ${problem.title}
                ${leetCodeUrl ? `<a href="${leetCodeUrl}" target="_blank" class="leetcode-link ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    LeetCode
                </a>` : ''}
                <a href="#" target="_blank" rel="noopener" class="leetcode-link ml-2 demo-link hidden" data-demo-id="${lessonIndex}-${problemIndex}">算法推演</a>
                <span class="ml-2 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">第${lessonIndex}课</span>
            </h3>
            <div class="flex items-center justify-between mb-3">
                <div class="status-control" data-key="${key}">
                    <button class="status-btn" data-status="完全掌握">完全掌握</button>
                    <button class="status-btn" data-status="在理解中">在理解中</button>
                    <button class="status-btn" data-status="完全不懂">完全不懂</button>
                </div>
                <div class="status-display" data-status-display data-key="${key}">${currentStatus ? `当前状态：${currentStatus}` : '未标注'}</div>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-600">${problem.description}</p>
            </div>
            
            <!-- Two-column layout: left for tab content, right for fixed code -->
            <div class="flex flex-row gap-6 tab-container">
                <!-- Left column: tab content -->
                <div class="flex-1">
                    <!-- Tab buttons -->
                    <div class="tab-buttons">
                        <button class="tab-button active" data-tab="description" data-problem="${problemIndex}">
                            题目描述
                        </button>
                        <button class="tab-button" data-tab="steps" data-problem="${problemIndex}">
                            步骤说明
                        </button>
                    </div>
                    
                    <!-- Tab contents -->
                    <div class="tab-content-wrapper">
                        <div class="tab-content active" id="description-${problemIndex}">
                            <div class="bg-gray-50 p-4 rounded-lg">
                            ${problem.input ? `
                                <div class="input-output">
                                    <h4>输入:</h4>
                                    <pre>${problem.input}</pre>
                                </div>
                            ` : ''}
                            ${problem.output ? `
                                <div class="input-output">
                                    <h4>输出:</h4>
                                    <pre>${problem.output}</pre>
                                </div>
                            ` : ''}
                            ${problem.essence && problem.essence.length ? `
                                <div class="input-output">
                                    <h4>本质</h4>
                                    <div class="flex flex-wrap gap-2">
                                        ${problem.essence.map(e => `<span class=\"pc-badge\">${e}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${problem.prerequisites && problem.prerequisites.length ? `
                                <div class="input-output">
                                    <h4>关联算法题</h4>
                                    <div class="flex flex-wrap gap-2">
                                        ${problem.prerequisites.map(p => `<a href="${p.url}" target="_blank" class="leetcode-link">${p.title}</a>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            <div class="example-code">
    <h4>示例：</h4>
    <pre><code>${problem.example}</code></pre>
</div>
                        </div>
                        </div>
                        
                        <div class="tab-content" id="steps-${problemIndex}">
                            ${problem.example ? `
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <div class="example-code">
                                        <h4>示例：</h4>
                                        <pre><code>${problem.example}</code></pre>
                                    </div>
                                </div>
                            ` : ''}
                            <div id="steps-container-${problemIndex}" class="steps-grid">
                                ${createStepsHTML(problem.steps)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right column: code area -->
                <div class="flex-1 max-w-2xl sticky top-4 self-start overflow-visible">
                    <div class="rounded-lg shadow-md border border-gray-200">
                        <div class="code-container">
                            <div class="code-header">
                                <span>Dart 代码</span>
                                <button class="copy-btn">复制代码</button>
                            </div>
                            <pre><code class="language-dart line-numbers">${problem.code}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create HTML for steps visualization
function createStepsHTML(steps) {
    let html = '';
    steps.forEach((step, index) => {
        let visualizationHTML = '';
        if (step.visualization) {
            if (step.visualization.startsWith('create') || step.visualization.includes('createArrayVisualization') || step.visualization.includes('createComparisonVisualization')) {
                // Execute the visualization function call
                visualizationHTML = eval(step.visualization);
            } else {
                // Use the visualization as is if it's not a function call
                visualizationHTML = step.visualization;
            }
        }
        html += `
            <div class="step-container">
                <div class="step flex items-start">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <h4 class="font-medium mb-1">${step.title}</h4>
                        <p class="text-gray-600">${step.description}</p>
                        ${visualizationHTML ? `<div class="mt-2">${visualizationHTML}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    return html;
}

// Initialize tab functionality for each problem
function initializeProblemTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            const problemIndex = button.getAttribute('data-problem');
            
            // Remove active class from all buttons in the same problem
            const problemButtons = button.parentElement.querySelectorAll('.tab-button');
            problemButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-600');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            button.classList.remove('text-gray-600');
            
            // Hide all tab contents for this problem except the fixed code area
            const allProblemContents = document.querySelectorAll(`[id$="-${problemIndex}"]`);
            allProblemContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const selectedContent = document.getElementById(`${tab}-${problemIndex}`);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
        });
    });
}

// Initialize step visualizations
function initializeStepVisualizations() {
    // Additional step visualization logic can be added here
}

function initializeDemoLinks(chapterTitle) {
    const links = document.querySelectorAll('.demo-link[data-demo-id]');
    links.forEach(a => {
        const id = a.getAttribute('data-demo-id');
        const href = `src/data/demo/${id}.html`;
        const fullHref = new URL(href, location.href).href;
        a.setAttribute('href', fullHref);
        const show = () => a.classList.remove('hidden');
        const hide = () => a.classList.add('hidden');
        const isHttp = /^https?:$/.test(location.protocol);
        if (!isHttp) {
            hide();
            return;
        }
        fetch(fullHref, { method: 'HEAD', cache: 'no-store' }).then(res => {
            if (res && res.ok) show(); else {
                fetch(fullHref, { method: 'GET', cache: 'no-store' }).then(r2 => {
                    if (r2 && r2.ok) show(); else hide();
                }).catch(hide);
            }
        }).catch(() => {
            fetch(fullHref, { method: 'GET', cache: 'no-store' }).then(r2 => {
                if (r2 && r2.ok) show(); else hide();
            }).catch(hide);
        });
    });
}

function normalizeText(t) {
    return String(t || '').toLowerCase();
}

function loadSearchQuery() {
    try { return localStorage.getItem('algorithm1_search_query') || ''; } catch(_) { return ''; }
}

function saveSearchQuery(q) {
    try { localStorage.setItem('algorithm1_search_query', String(q || '')); } catch(_) {}
}

function loadFilterStatus() {
    try { return localStorage.getItem('algorithm1_filter_status') || ''; } catch(_) { return ''; }
}

function saveFilterStatus(s) {
    try { localStorage.setItem('algorithm1_filter_status', String(s || '')); } catch(_) {}
}

function getProblemStatusOrEmpty(key) {
    const v = getProblemStatus(key);
    return v || '';
}

function chapterMatches(chapter, query, statusFilter) {
    const q = normalizeText(query);
    const hasQuery = !!q;
    const status = String(statusFilter || '');
    const chapterText = normalizeText(chapter.title + ' ' + chapter.description);
    let okQuery = !hasQuery || chapterText.includes(q);
    if (!okQuery && chapter.problems && chapter.problems.length) {
        okQuery = chapter.problems.some(p => {
            const txt = normalizeText(
                p.title + ' ' + p.description + ' ' + (p.example || '') + ' ' + ((p.essence || []).join(' '))
            );
            return txt.includes(q);
        });
    }
    let okStatus = !status;
    if (!okStatus) {
        okStatus = chapter.problems && chapter.problems.some(p => {
            const key = `${chapter.title}::${p.title}`;
            const ps = getProblemStatusOrEmpty(key);
            if (status === '未标注') return !ps;
            return ps === status;
        });
    }
    return okQuery && okStatus;
}

function setupChapterFilters() {
    const s = document.getElementById('search-input');
    const f = document.getElementById('status-filter');
    if (s) {
        s.value = loadSearchQuery();
        s.addEventListener('input', () => { saveSearchQuery(s.value || ''); loadChapters(); });
    }
    if (f) {
        f.value = loadFilterStatus();
        f.addEventListener('change', () => { saveFilterStatus(f.value || ''); loadChapters(); });
    }
}

function setupDetailFilters(chapterTitle) {
    const s = document.getElementById('detail-search');
    const f = document.getElementById('detail-status-filter');
    if (!s || !f) return;
    const q = tryLoad(`algorithm1_detail_search_${chapterTitle}`) || '';
    const st = tryLoad(`algorithm1_detail_status_${chapterTitle}`) || '';
    s.value = q; f.value = st;
    const apply = () => filterProblemsInDetail(chapterTitle, s.value || '', f.value || '');
    s.addEventListener('input', apply);
    f.addEventListener('change', apply);
    apply();
}

function tryLoad(k) {
    try { return localStorage.getItem(k) || ''; } catch(_) { return ''; }
}

function trySave(k, v) {
    try { localStorage.setItem(k, String(v || '')); } catch(_) {}
}

function filterProblemsInDetail(chapterTitle, query, statusFilter) {
    trySave(`algorithm1_detail_search_${chapterTitle}`, query || '');
    trySave(`algorithm1_detail_status_${chapterTitle}`, statusFilter || '');
    const q = normalizeText(query);
    const status = String(statusFilter || '');
    const sections = document.querySelectorAll('.algorithm-section');
    sections.forEach(sec => {
        const titleEl = sec.querySelector('h3');
        const descEl = sec.querySelector('.mb-4 p');
        const titleText = normalizeText(titleEl ? titleEl.textContent : '');
        const descText = normalizeText(descEl ? descEl.textContent : '');
        let okQuery = !q || titleText.includes(q) || descText.includes(q);
        let okStatus = !status;
        if (!okStatus) {
            const displayEl = sec.querySelector('.status-display');
            let key = displayEl ? displayEl.getAttribute('data-key') : '';
            if (!key && titleEl) {
                const title = (titleEl.textContent || '').replace(/^\s*题目\d+:\s*/, '').trim();
                key = `${chapterTitle}::${title}`;
            }
            const ps = getProblemStatusOrEmpty(key);
            if (status === '未标注') okStatus = !ps; else okStatus = ps === status;
        }
        sec.style.display = okQuery && okStatus ? '' : 'none';
    });
}

function getProblemStatus(key) {
    const raw = localStorage.getItem('algorithm1_status');
    if (!raw) return null;
    try {
        const map = JSON.parse(raw);
        const v = map[key];
        if (!v) return null;
        return typeof v === 'string' ? v : v.status || null;
    } catch(e) {
        return null;
    }
}

function setProblemStatus(key, status) {
    const raw = localStorage.getItem('algorithm1_status');
    let map = {};
    if (raw) {
        try { map = JSON.parse(raw) || {}; } catch(e) { map = {}; }
    }
    map[key] = { status, ts: Date.now() };
    localStorage.setItem('algorithm1_status', JSON.stringify(map));
}

function initializeStatusControls(chapterTitle) {
    const controls = document.querySelectorAll('.status-control');
    controls.forEach(control => {
        const key = control.getAttribute('data-key');
        const buttons = control.querySelectorAll('.status-btn');
        const saved = getProblemStatus(key);
        if (saved) {
            buttons.forEach(b => {
                if (b.getAttribute('data-status') === saved) b.classList.add('active');
            });
        }
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const status = btn.getAttribute('data-status');
                setProblemStatus(key, status);
                const display = document.querySelector(`.status-display[data-key="${key}"]`);
                if (display) display.textContent = `当前状态：${status}`;
            });
        });
    });
}

function isChapterMastered(chapter) {
    const raw = localStorage.getItem('algorithm1_status');
    let map = {};
    if (raw) {
        try { map = JSON.parse(raw) || {}; } catch(e) { map = {}; }
    }
    if (!chapter || !chapter.problems || chapter.problems.length === 0) return false;
    for (let i = 0; i < chapter.problems.length; i++) {
        const key = `${chapter.title}::${chapter.problems[i].title}`;
        const rec = map[key];
        const status = typeof rec === 'string' ? rec : (rec && rec.status) || '';
        if (status !== '完全掌握') return false;
    }
    return true;
}

function showPersonalCenter() {
    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    const personalCenter = document.getElementById('personal-center');
    chapterNav.classList.add('hidden');
    algorithmDetail.classList.add('hidden');
    personalCenter.classList.remove('hidden');
    const pcBtn = document.getElementById('personal-center-btn');
    if (pcBtn) pcBtn.classList.add('hidden');
    setHeaderSticky(false);
    renderPersonalCenter();
}

function renderPersonalCenter() {
    const container = document.getElementById('personal-center-content');
    const raw = localStorage.getItem('algorithm1_status');
    let map = {};
    if (raw) {
        try { map = JSON.parse(raw) || {}; } catch(e) { map = {}; }
    }
    let mastered = 0, learning = 0, unknown = 0;
    const items = [];
    algorithms.forEach((ch, ci) => {
        ch.problems.forEach(p => {
            const key = `${ch.title}::${p.title}`;
            const rec = map[key];
            const status = typeof rec === 'string' ? rec : (rec && rec.status) || '';
            if (status === '完全掌握') mastered++;
            else if (status === '在理解中') learning++;
            else if (status === '完全不懂') unknown++;
            const ts = typeof rec === 'object' && rec ? rec.ts || 0 : 0;
            items.push({ chapter: ch.title, title: p.title, status, ts, lesson: ci + 1 });
        });
    });
    const total = items.length;
    const masteryRate = total ? Math.round((mastered / total) * 100) : 0;
    const p1 = mastered / (total || 1);
    const p2 = learning / (total || 1);
    const p3 = unknown / (total || 1);
    const entropy = -[p1, p2, p3].filter(x => x > 0).reduce((a, b) => a + b * Math.log2(b), 0);
    const entropyPct = Math.round((entropy / Math.log2(3)) * 100);
    const recent = items.slice().sort((a,b) => b.ts - a.ts).filter(i => i.ts).slice(0,5);
    const daysSet = new Set(items.filter(i => i.ts).map(i => new Date(i.ts).toDateString()));
    const today = new Date();
    let streak = 0;
    for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
        const k = d.toDateString();
        if (daysSet.has(k)) streak++;
        else break;
    }
    const chapterStats = {};
    items.forEach(i => {
        if (!chapterStats[i.chapter]) chapterStats[i.chapter] = { mastered: 0, learning: 0, unknown: 0, total: 0 };
        const cs = chapterStats[i.chapter];
        cs.total++;
        if (i.status === '完全掌握') cs.mastered++;
        else if (i.status === '在理解中') cs.learning++;
        else if (i.status === '完全不懂') cs.unknown++;
    });
    const recommend = items.filter(i => !i.status || i.status === '完全不懂').sort((a,b) => a.lesson - b.lesson).slice(0,6);
    let html = `
        <div class="pc-header">
            <div class="pc-title">我的学习统计</div>
            <button id="pc-back" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">返回课程列表</button>
        </div>
        <div class="pc-stats">
            <span class="pc-stat pc-gray">总题数：${total}</span>
            <span class="pc-stat pc-green">完全掌握：${mastered}</span>
            <span class="pc-stat pc-yellow">在理解中：${learning}</span>
            <span class="pc-stat pc-red">完全不懂：${unknown}</span>
        </div>
    `;
    container.innerHTML = html;
    const back = document.getElementById('pc-back');
    if (back) back.addEventListener('click', showChapterList);
    
}

// Initialize code highlighting with Prism.js
function initializeCodeHighlighting() {
    // Make sure Prism is loaded
    if (typeof Prism !== 'undefined') {
        // Add line numbers to code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // Add line-numbers class
            block.classList.add('line-numbers');
            // Ensure proper language class is set
            if (!block.classList.contains('language-dart')) {
                block.classList.add('language-dart');
            }
        });
        
        // Apply syntax highlighting
        Prism.highlightAll();
    }
}

// Initialize copy code buttons
function initializeCopyCodeButtons() {
    // Add event listeners to all copy buttons
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const codeBlock = this.closest('.code-container').querySelector('code');
            const codeText = codeBlock.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(codeText).then(() => {
                // Show feedback
                const originalText = this.textContent;
                this.textContent = '已复制!';
                this.style.backgroundColor = '#10b981';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        });
    });
}

// Show chapter list
function showChapterList() {
    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    const personalCenter = document.getElementById('personal-center');
    
    // Hide algorithm detail, show chapter list
    algorithmDetail.classList.add('hidden');
    chapterNav.classList.remove('hidden');
    if (personalCenter) personalCenter.classList.add('hidden');
    const pcBtn = document.getElementById('personal-center-btn');
    if (pcBtn) pcBtn.classList.remove('hidden');
    setHeaderSticky(true);
}

function setHeaderSticky(sticky) {
    const header = document.querySelector('.page-header');
    if (!header) return;
    header.classList.toggle('sticky', !!sticky);
}

function showMotivationQuote() {
    const el = document.getElementById('motivation-quote');
    if (!el) return;
    const quotes = [
        '学习算法如登山，脚踏实地，终见风景。',
        '今天的每一次思考，都是明天的进步。',
        '复杂不过拆解，难题不敌坚持。',
        '当你把问题讲清楚，你就已经解决了一半。',
        '算法是工具，思维是武器。',
        '勤于总结，善于归纳，方能举一反三。'
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    el.textContent = q;
}
