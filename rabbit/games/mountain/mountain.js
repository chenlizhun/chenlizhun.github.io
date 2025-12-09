// 山主题小游戏 - 核心逻辑

// 常量定义
const THEME_ID = 'mountain';
const STORAGE_KEY = `rabbit_game_${THEME_ID}`;
const MAX_ROUNDS = 10;
const MOUNTAIN_TOTAL_HEIGHT = 8848; // 模拟珠穆朗玛峰高度
const CORRECT_POINTS = 1;

// DOM 元素引用
let DOM = {
    roundInfo: document.getElementById('roundInfo'),
    scoreInfo: document.getElementById('scoreInfo'),
    mountainHeight: document.getElementById('mountainHeight'),
    progressFill: document.getElementById('progressFill'),
    progressCount: document.getElementById('progressCount'),
    poemMeta: document.getElementById('poemMeta'),
    feedback: document.getElementById('feedback'),
    optionBtns: Array.from(document.querySelectorAll('.option-btn')),
    btnNext: document.getElementById('btnNext'),
    btnBack: document.getElementById('btnBack'),
    gameCompletionModal: document.getElementById('gameCompletionModal'),
    totalQuestions: document.getElementById('totalQuestions'),
    correctQuestions: document.getElementById('correctQuestions'),
    accuracy: document.getElementById('accuracy'),
    modalMountainHeight: document.getElementById('modalMountainHeight'),
    restartGame: document.getElementById('restartGame'),
    returnHome: document.getElementById('returnHome')
};

// 游戏状态
let gameState = {
    currentRound: 0,
    correctCount: 0,
    totalQuestions: 0,
    usedPoems: [],
    allPoems: [],
    allDistractors: [],
    currentPoem: null,
    currentOptions: [],
    selectedOption: null,
    isAnswered: false
};

// 山主题的测试诗词数据
const TEST_POEMS = [
    {
        title: "望岳",
        author: "杜甫",
        content: [
            "岱宗夫如何？齐鲁青未了。",
            "造化钟神秀，阴阳割昏晓。",
            "荡胸生曾云，决眦入归鸟。",
            "会当凌绝顶，一览众山小。"
        ],
        theme: "山",
        difficulty: 1,
        tags: ["山", "自然", "豪情"]
    },
    {
        title: "登鹳雀楼",
        author: "王之涣",
        content: [
            "白日依山尽，黄河入海流。",
            "欲穷千里目，更上一层楼。"
        ],
        theme: "山",
        difficulty: 1,
        tags: ["山", "自然", "哲理"]
    },
    {
        title: "题西林壁",
        author: "苏轼",
        content: [
            "横看成岭侧成峰，远近高低各不同。",
            "不识庐山真面目，只缘身在此山中。"
        ],
        theme: "山",
        difficulty: 2,
        tags: ["山", "哲理", "观察"]
    },
    {
        title: "独坐敬亭山",
        author: "李白",
        content: [
            "众鸟高飞尽，孤云独去闲。",
            "相看两不厌，只有敬亭山。"
        ],
        theme: "山",
        difficulty: 2,
        tags: ["山", "孤独", "自然"]
    },
    {
        title: "早发白帝城",
        author: "李白",
        content: [
            "朝辞白帝彩云间，千里江陵一日还。",
            "两岸猿声啼不住，轻舟已过万重山。"
        ],
        theme: "山",
        difficulty: 1,
        tags: ["山", "自然", "旅行"]
    },
    {
        title: "终南山",
        author: "王维",
        content: [
            "太乙近天都，连山接海隅。",
            "白云回望合，青霭入看无。",
            "分野中峰变，阴晴众壑殊。",
            "欲投人处宿，隔水问樵夫。"
        ],
        theme: "山",
        difficulty: 3,
        tags: ["山", "自然", "隐居"]
    },
    {
        title: "山行",
        author: "杜牧",
        content: [
            "远上寒山石径斜，白云生处有人家。",
            "停车坐爱枫林晚，霜叶红于二月花。"
        ],
        theme: "山",
        difficulty: 1,
        tags: ["山", "自然", "秋天"]
    },
    {
        title: "枫桥夜泊",
        author: "张继",
        content: [
            "月落乌啼霜满天，江枫渔火对愁眠。",
            "姑苏城外寒山寺，夜半钟声到客船。"
        ],
        theme: "山",
        difficulty: 2,
        tags: ["山", "夜晚", "思乡"]
    },
    {
        title: "九月九日忆山东兄弟",
        author: "王维",
        content: [
            "独在异乡为异客，每逢佳节倍思亲。",
            "遥知兄弟登高处，遍插茱萸少一人。"
        ],
        theme: "山",
        difficulty: 1,
        tags: ["山", "节日", "思乡"]
    },
    {
        title: "登飞来峰",
        author: "王安石",
        content: [
            "飞来山上千寻塔，闻说鸡鸣见日升。",
            "不畏浮云遮望眼，自缘身在最高层。"
        ],
        theme: "山",
        difficulty: 2,
        tags: ["山", "哲理", "豪情"]
    }
];

// 干扰项句子
const TEST_DISTRACTORS = [
    "床前明月光，疑是地上霜。",
    "举头望明月，低头思故乡。",
    "春眠不觉晓，处处闻啼鸟。",
    "夜来风雨声，花落知多少。",
    "锄禾日当午，汗滴禾下土。",
    "谁知盘中餐，粒粒皆辛苦。",
    "白日依山尽，黄河入海流。",
    "欲穷千里目，更上一层楼。",
    "离离原上草，一岁一枯荣。",
    "野火烧不尽，春风吹又生。",
    "红豆生南国，春来发几枝。",
    "愿君多采撷，此物最相思。",
    "春种一粒粟，秋收万颗子。",
    "四海无闲田，农夫犹饿死。",
    "千山鸟飞绝，万径人踪灭。",
    "孤舟蓑笠翁，独钓寒江雪。"
];

// 工具函数：打乱数组
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 工具函数：获取随机诗句作为干扰项
function getRandomDistractors(count = 2) {
    const distractors = [];
    const availableDistractors = [...gameState.allDistractors];
    
    while (distractors.length < count && availableDistractors.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableDistractors.length);
        const distractor = availableDistractors.splice(randomIndex, 1)[0];
        
        // 确保干扰项不是当前诗中的句子
        const isCurrentPoemSentence = gameState.currentPoem.content.some(sentence => 
            sentence.trim() === distractor.trim()
        );
        
        if (!isCurrentPoemSentence && !distractors.includes(distractor)) {
            distractors.push(distractor);
        }
    }
    
    return distractors;
}

// 工具函数：获取随机诗
function getRandomPoem() {
    const availablePoems = gameState.allPoems.filter(poem => 
        !gameState.usedPoems.includes(poem)
    );
    
    if (availablePoems.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePoems.length);
    const selectedPoem = availablePoems[randomIndex];
    gameState.usedPoems.push(selectedPoem);
    
    return selectedPoem;
}

// 渲染当前回合
function renderRound() {
    // 重置状态
    gameState.isAnswered = false;
    gameState.selectedOption = null;
    DOM.btnNext.disabled = true;
    DOM.feedback.style.display = 'none';
    
    // 重置选项按钮
    DOM.optionBtns.forEach(btn => {
        btn.disabled = false;
        btn.textContent = '';
        btn.className = 'option-btn';
        btn.innerHTML = '';
    });
    
    // 如果已经完成所有回合，显示游戏结束
    if (gameState.currentRound >= MAX_ROUNDS || gameState.currentRound >= gameState.totalQuestions) {
        showGameCompletion();
        return;
    }
    
    // 更新回合信息
    DOM.roundInfo.textContent = `第 ${gameState.currentRound + 1} / ${Math.min(MAX_ROUNDS, gameState.totalQuestions)} 题`;
    DOM.scoreInfo.textContent = `已答对：${gameState.correctCount} 题`;
    
    // 计算并更新登山高度和进度
    const currentHeight = Math.round((gameState.currentRound / Math.min(MAX_ROUNDS, gameState.totalQuestions)) * MOUNTAIN_TOTAL_HEIGHT);
    const progressPercent = Math.round((gameState.currentRound / Math.min(MAX_ROUNDS, gameState.totalQuestions)) * 100);
    
    DOM.mountainHeight.textContent = `高度：${currentHeight}m`;
    DOM.progressFill.style.width = `${progressPercent}%`;
    DOM.progressCount.textContent = `${progressPercent}% 完成`;
    
    // 获取当前诗
    gameState.currentPoem = getRandomPoem();
    if (!gameState.currentPoem) {
        showGameCompletion();
        return;
    }
    
    // 更新诗词信息
    DOM.poemMeta.textContent = `《${gameState.currentPoem.title}》—— ${gameState.currentPoem.author}`;
    
    // 选择一个正确的句子作为答案
    const correctSentence = gameState.currentPoem.content[Math.floor(Math.random() * gameState.currentPoem.content.length)];
    
    // 获取干扰项
    const distractors = getRandomDistractors(2);
    
    // 创建选项
    gameState.currentOptions = shuffleArray([correctSentence, ...distractors]);
    
    // 渲染选项
    DOM.optionBtns.forEach((btn, index) => {
        btn.innerHTML = `<span>${gameState.currentOptions[index]}</span>`;
        btn.onclick = () => selectOption(index);
    });
}

// 选择选项
function selectOption(index) {
    if (gameState.isAnswered) return;
    
    gameState.isAnswered = true;
    gameState.selectedOption = index;
    
    // 禁用所有选项按钮
    DOM.optionBtns.forEach(btn => btn.disabled = true);
    
    // 检查答案是否正确
    const correctAnswer = gameState.currentOptions.indexOf(gameState.currentPoem.content.find(sentence => 
        gameState.currentOptions.includes(sentence)
    ));
    
    const isCorrect = index === correctAnswer;
    
    // 更新选项样式
    DOM.optionBtns.forEach((btn, i) => {
        if (i === correctAnswer) {
            btn.classList.add('correct');
        } else if (i === index && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // 显示反馈
    if (isCorrect) {
        gameState.correctCount += CORRECT_POINTS;
        DOM.feedback.textContent = '✓ 回答正确！';
        DOM.feedback.className = 'feedback correct';
        DOM.feedback.style.display = 'block';
    } else {
        DOM.feedback.textContent = '✗ 回答错误。';
        DOM.feedback.className = 'feedback incorrect';
        DOM.feedback.style.display = 'block';
    }
    
    // 更新分数信息
    DOM.scoreInfo.textContent = `已答对：${gameState.correctCount} 题`;
    
    // 启用下一题按钮
    DOM.btnNext.disabled = false;
}

// 下一题
function nextRound() {
    gameState.currentRound++;
    renderRound();
}

// 显示游戏完成模态框
function showGameCompletion() {
    // 计算最终数据
    const totalQuestions = Math.min(MAX_ROUNDS, gameState.totalQuestions);
    const accuracyPercent = totalQuestions > 0 ? Math.round((gameState.correctCount / totalQuestions) * 100) : 0;
    const finalHeight = Math.round((gameState.currentRound / totalQuestions) * MOUNTAIN_TOTAL_HEIGHT);
    
    // 更新模态框内容
    DOM.totalQuestions.textContent = totalQuestions;
    DOM.correctQuestions.textContent = gameState.correctCount;
    DOM.accuracy.textContent = `${accuracyPercent}%`;
    DOM.modalMountainHeight.textContent = `${finalHeight}m`;
    
    // 更新最终进度
    DOM.progressFill.style.width = '100%';
    DOM.progressCount.textContent = '100% 完成';
    
    // 显示模态框
    DOM.gameCompletionModal.classList.add('show');
    
    // 保存游戏结果到本地存储
    saveGameResult();
}

// 保存游戏结果
function saveGameResult() {
    const result = {
        theme: THEME_ID,
        completedAt: new Date().toISOString(),
        rounds: gameState.currentRound,
        correct: gameState.correctCount,
        total: Math.min(MAX_ROUNDS, gameState.totalQuestions),
        accuracy: Math.round((gameState.correctCount / Math.min(MAX_ROUNDS, gameState.totalQuestions)) * 100)
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (e) {
        console.error('保存游戏结果失败:', e);
    }
}

// 加载游戏结果
function loadGameResult() {
    try {
        const result = localStorage.getItem(STORAGE_KEY);
        return result ? JSON.parse(result) : null;
    } catch (e) {
        console.error('加载游戏结果失败:', e);
        return null;
    }
}

// 初始化游戏
function initGame() {
    // 初始化诗词数据
    gameState.allPoems = TEST_POEMS;
    gameState.allDistractors = TEST_DISTRACTORS;
    gameState.totalQuestions = gameState.allPoems.length;
    
    // 确保使用不超过最大回合数的诗词
    if (gameState.totalQuestions > MAX_ROUNDS) {
        gameState.totalQuestions = MAX_ROUNDS;
    }
    
    // 重置游戏状态
    gameState.currentRound = 0;
    gameState.correctCount = 0;
    gameState.usedPoems = [];
    
    // 渲染第一回合
    renderRound();
}

// 事件监听
function setupEventListeners() {
    // 下一题按钮
    DOM.btnNext.addEventListener('click', nextRound);
    
    // 返回按钮
    DOM.btnBack.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
    
    // 游戏完成模态框按钮
    DOM.restartGame.addEventListener('click', () => {
        DOM.gameCompletionModal.classList.remove('show');
        initGame();
    });
    
    DOM.returnHome.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
    
    // 点击模态框外部关闭
    DOM.gameCompletionModal.addEventListener('click', (e) => {
        if (e.target === DOM.gameCompletionModal) {
            DOM.gameCompletionModal.classList.remove('show');
        }
    });
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initGame();
});

// 导出函数（用于调试）
if (typeof window !== 'undefined') {
    window.mountainGame = {
        initGame,
        renderRound,
        selectOption,
        nextRound,
        gameState
    };
}