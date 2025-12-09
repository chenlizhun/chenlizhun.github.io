// games/moon/moon.js

const THEME_ID = "moon";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const poemMetaEl = document.getElementById("poemMeta");
const charGridEl = document.getElementById("charGrid");
const feedbackEl = document.getElementById("feedback");
const btnReset = document.getElementById("btnReset");
const btnCheck = document.getElementById("btnCheck");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const totalProgressEl = document.getElementById("totalProgress");
const progressFillEl = document.getElementById("progressFill");

// 模态窗口DOM引用
let gameCompletionModalEl;
let summaryTotalEl;
let summaryPinkEl;
let summaryGreenEl;
let summaryPurpleEl;
let btnReturnHomeEl;
let btnRestartGameEl;

let audioCtx = null;
function playClick() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (_) {}
}

// 游戏内部数据
let moonPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;
let gameProgress = 0;
let moonPhase = 0; // 月亮相位，0-7代表不同月相
let collectedStars = 0; // 收集的星星数

let currentPoemIndex = -1;
let correctIndices = []; // 句子中所有「月」字的索引
let selectedIndices = new Set();

// 与主 App 共用的记忆状态
let statusMap = {};

// ====== 本地存储读写 ======
function loadStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    statusMap = raw ? JSON.parse(raw) || {} : {};
  } catch (_) {
    statusMap = {};
  }
}

function saveStatus() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
  } catch (_) {}
}

function statusKey(themeId, index) {
  return `${themeId}-${index}`;
}

function getStatus(themeId, index) {
  const key = statusKey(themeId, index);
  return statusMap[key] || "default";
}

function setStatus(themeId, index, status) {
  const key = statusKey(themeId, index);
  statusMap[key] = status;
}

// 更新进度条
function updateProgress() {
  const total = moonPoems.length;
  const percentage = Math.min(100, (gameProgress / total) * 100);
  totalProgressEl.textContent = total;
  
  // 进度条动画效果
  progressFillEl.style.transition = 'width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  progressFillEl.style.width = `${percentage}%`;
  
  // 检查游戏是否完成
  checkGameCompletion();
}

// 更新月相
function updateMoonPhase() {
  moonPhase = Math.min(Math.floor((gameProgress / moonPoems.length) * 8), 7);
}

// 创建月尘粒子效果
function createMoonDustEffect() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '999';
  document.body.appendChild(container);
  
  // 创建100个粒子
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    particle.textContent = '✨';
    particle.style.position = 'absolute';
    particle.style.fontSize = Math.random() * 12 + 8 + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = Math.random() * 0.8 + 0.2;
    particle.style.transform = 'translate(-50%, -50%) scale(0)';
    particle.style.transition = 'all 1s ease-out';
    container.appendChild(particle);
    
    // 触发动画
    setTimeout(() => {
      particle.style.transform = 'translate(-50%, -50%) scale(1) translateY(-50px)';
      particle.style.opacity = '0';
    }, 50);
  }
  
  // 移除粒子容器
  setTimeout(() => {
    document.body.removeChild(container);
  }, 1000);
}

// 游戏完成检测
function checkGameCompletion() {
  const total = moonPoems.length;
  
  // 当游戏进度达到或超过总题目数时，显示完成模态框
  if (gameProgress >= total && total > 0) {
    showGameCompletionSummary();
  }
}

// 显示游戏完成汇总模态窗口
function showGameCompletionSummary() {
  // 确保DOM元素已获取
  if (!gameCompletionModalEl) {
    // 初始化模态窗口DOM引用
    gameCompletionModalEl = document.getElementById("gameCompletionModal");
    summaryTotalEl = document.getElementById("summaryTotal");
    summaryPinkEl = document.getElementById("summaryPink");
    summaryGreenEl = document.getElementById("summaryGreen");
    summaryPurpleEl = document.getElementById("summaryPurple");
    btnReturnHomeEl = document.getElementById("btnReturnHome");
    btnRestartGameEl = document.getElementById("btnRestartGame");
    
    // 添加事件监听器
    btnReturnHomeEl.addEventListener("click", returnHomeHandler);
    btnRestartGameEl.addEventListener("click", restartGameHandler);
  }
  
  // 计算总学习诗句数
  const totalPoems = moonPoems.length;
  
  // 计算不同记忆状态的诗句数量
  let pinkCount = 0;
  let greenCount = 0;
  let purpleCount = 0;
  
  moonPoems.forEach((poem, index) => {
    const storedStatus = getStatus(THEME_ID, index);
    if (storedStatus === 'bomb') {
      pinkCount++;
    } else if (storedStatus === 'bullet') {
      greenCount++;
    } else {
      // default或unfamiliar状态
      purpleCount++;
    }
  });
  
  // 更新模态窗口内容
  summaryTotalEl.textContent = totalPoems;
  summaryPinkEl.textContent = pinkCount;
  summaryGreenEl.textContent = greenCount;
  summaryPurpleEl.textContent = purpleCount;
  
  // 添加星星收集信息和月相完成信息
  const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  
  // 找到或创建额外信息区域
  let additionalInfoEl = document.getElementById('additionalGameInfo');
  if (!additionalInfoEl) {
    additionalInfoEl = document.createElement('div');
    additionalInfoEl.id = 'additionalGameInfo';
    additionalInfoEl.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(100, 181, 246, 0.3);
    `;
    
    const starsInfo = document.createElement('div');
    starsInfo.style.cssText = `
      font-size: 16px;
      margin-bottom: 10px;
      color: #e0e0e0;
    `;
    starsInfo.innerHTML = `<span style="font-weight: bold;">收集的星星:</span> ${collectedStars} ⭐`;
    
    const moonPhaseInfo = document.createElement('div');
    moonPhaseInfo.style.cssText = `
      font-size: 16px;
      color: #e0e0e0;
    `;
    moonPhaseInfo.innerHTML = `<span style="font-weight: bold;">月相变化:</span> ${moonPhases[Math.min(moonPhase, 7)]} 完成`;
    
    additionalInfoEl.appendChild(starsInfo);
    additionalInfoEl.appendChild(moonPhaseInfo);
    
    // 插入到模态窗口内容中
    const modalContent = gameCompletionModalEl.querySelector('.modal-content');
    const modalFooter = modalContent.querySelector('.modal-footer');
    modalContent.insertBefore(additionalInfoEl, modalFooter);
  } else {
    // 更新现有信息
    additionalInfoEl.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 10px; color: #e0e0e0;">
        <span style="font-weight: bold;">收集的星星:</span> ${collectedStars} ⭐
      </div>
      <div style="font-size: 16px; color: #e0e0e0;">
        <span style="font-weight: bold;">月相变化:</span> ${moonPhases[Math.min(moonPhase, 7)]} 完成
      </div>
    `;
  }
  
  // 显示模态窗口
  gameCompletionModalEl.style.display = "flex";
}

// 返回首页处理函数
function returnHomeHandler() {
  // 返回诗词库首页
  window.location.href = "../../index.html";
}

// 重新开始游戏处理函数
function restartGameHandler() {
  // 隐藏模态窗口
  if (gameCompletionModalEl) {
    gameCompletionModalEl.style.display = "none";
  }
  
  // 重置游戏
  initGame();
}

// ====== 工具函数 ======
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ====== 渲染一题 ====== 
function renderRound() {
  const total = moonPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无月主题诗词，请检查 data.js";
    poemMetaEl.textContent = "";
    charGridEl.innerHTML = "";
    feedbackEl.textContent = "请返回主页面。";
    btnReset.disabled = true;
    btnCheck.disabled = true;
    btnNext.disabled = true;
    return;
  }

  if (currentRound >= total) {
    currentRound = 0;
  }

  const poemIndex = orderIndices[currentRound];
  currentPoemIndex = poemIndex;
  const poem = moonPoems[poemIndex];
  const sentence = (poem.sentence || poem.text || "").trim();

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;

  charGridEl.innerHTML = "";
  feedbackEl.textContent = "";

  correctIndices = [];
  selectedIndices = new Set();

  // 添加文字淡入效果
  roundInfoEl.style.opacity = '0';
  scoreInfoEl.style.opacity = '0';
  poemMetaEl.style.opacity = '0';
  
  setTimeout(() => {
    roundInfoEl.style.transition = 'opacity 0.5s ease';
    scoreInfoEl.style.transition = 'opacity 0.5s ease';
    poemMetaEl.style.transition = 'opacity 0.5s ease';
    roundInfoEl.style.opacity = '1';
    scoreInfoEl.style.opacity = '1';
    poemMetaEl.style.opacity = '1';
  }, 100);

  const s = sentence;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const isChinese = /[\u4e00-\u9fa5]/.test(ch);
    const btn = document.createElement("button");
    btn.className = "char-tile";
    btn.textContent = ch;
    btn.dataset.index = String(i);
    btn.dataset.char = ch;
    btn.dataset.chinese = isChinese ? "1" : "0";
    btn.dataset.selected = "0";
    
    // 添加字符块动画效果
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0.8)';
    btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    if (!isChinese) {
      btn.classList.add("nonchinese");
      btn.disabled = true;
    } else {
      if (ch === "月") {
        correctIndices.push(i);
      }
      btn.addEventListener("click", () => {
        playClick();
        toggleSelect(btn);
      });
    }

    charGridEl.appendChild(btn);
    
    // 依次显示字符块
    setTimeout(() => {
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    }, 100 + i * 30);
  }

  // 保险：如果真的没有「月」字，就默认第一个汉字为目标（极少发生）
  if (correctIndices.length === 0) {
    const tiles = charGridEl.querySelectorAll(".char-tile");
    for (const t of tiles) {
      if (t.dataset.chinese === "1") {
        const idx = Number(t.dataset.index);
        correctIndices.push(idx);
        break;
      }
    }
  }

  btnReset.disabled = false;
  btnCheck.disabled = false;
  btnNext.disabled = true;
}

// 切换选中状态
function toggleSelect(btn) {
  const idx = Number(btn.dataset.index);
  const selected = btn.dataset.selected === "1";
  if (selected) {
    btn.dataset.selected = "0";
    btn.classList.remove("selected");
    selectedIndices.delete(idx);
  } else {
    btn.dataset.selected = "1";
    btn.classList.add("selected");
    selectedIndices.add(idx);
  }
}

// ====== 重置本题 ======
function resetCurrentRound() {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;
  renderRound();
}

// ====== 检查答案 ====== 
function checkAnswer() {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  if (selectedIndices.size === 0) {
    showFeedback("还没有选任何「月」字哦，试着找一找～", 'warning');
    return;
  }

  const correctSet = new Set(correctIndices);
  let allCorrect = true;
  // 选的每一个都必须是真正的「月」
  for (const idx of selectedIndices) {
    if (!correctSet.has(idx)) {
      allCorrect = false;
      break;
    }
  }
  // 同时，所有的「月」必须都被选中
  if (selectedIndices.size !== correctSet.size) {
    allCorrect = false;
  }

  const tiles = charGridEl.querySelectorAll(".char-tile");

  // 结果展示：高亮正确和错误
  tiles.forEach((btn) => {
    const idx = Number(btn.dataset.index);
    const isChinese = btn.dataset.chinese === "1";
    if (!isChinese) return;

    const isCorrectChar = correctSet.has(idx);
    const isSelected = selectedIndices.has(idx);

    btn.disabled = true; // 检查后不允许再点

    if (isCorrectChar && isSelected) {
      btn.classList.remove("selected");
      btn.classList.add("correct");
    } else if (!isCorrectChar && isSelected) {
      btn.classList.remove("selected");
      btn.classList.add("wrong");
    } else if (isCorrectChar && !isSelected) {
      // 漏掉的「月」
      btn.classList.add("correct");
    }
  });

  if (allCorrect) {
    showFeedback("🌙 太棒啦！所有的「月」字都被你找到了～", 'correct');
    correctCount++;
    
    // 播放正确答案动画
    createMoonDustEffect();
    
    // 更新月相
    updateMoonPhase();
    
    // 收集星星
    collectedStars += Math.floor(Math.random() * 3) + 1;

    const old = getStatus(THEME_ID, poemIndex);
    let next = old;
    if (old === "default" || old === "unfamiliar") {
      next = "bullet";
    } else if (old === "bullet") {
      next = "bomb";
    }
    setStatus(THEME_ID, poemIndex, next);
    saveStatus();
  } else {
    showFeedback("🌚 这次还没完全找对，可以点“重置本题”再试一次。", 'wrong');

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  
  // 更新进度
  gameProgress++;
  updateProgress();
  
  btnNext.disabled = false;
  btnCheck.disabled = true;
  btnReset.disabled = false;
}

// ====== 初始化 ====== 
function initGame() {
  if (!window.POEMS || !Array.isArray(POEMS.moon)) {
    moonPoems = [];
  } else {
    moonPoems = POEMS.moon.slice();
  }

  loadStatus();

  const total = moonPoems.length;
  orderIndices = [];
  for (let i = 0; i < total; i++) {
    orderIndices.push(i);
  }
  orderIndices = shuffle(orderIndices);

  currentRound = 0;
  correctCount = 0;
  gameProgress = 0;
  moonPhase = 0;
  collectedStars = 0;

  // 添加游戏开始动画
  const gamePage = document.querySelector('.game-page');
  gamePage.style.opacity = '0';
  gamePage.style.transform = 'translateY(20px)';
  gamePage.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  
  setTimeout(() => {
    gamePage.style.opacity = '1';
    gamePage.style.transform = 'translateY(0)';
  }, 100);
  
  renderRound();
  
  // 初始化进度条
  updateProgress();
}

// 显示反馈信息
function showFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
  feedbackEl.style.display = 'block';
  feedbackEl.style.opacity = '0';
  feedbackEl.style.transform = 'translateY(-10px)';
  feedbackEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  // 动画显示反馈
  setTimeout(() => {
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    feedbackEl.style.opacity = '0';
    feedbackEl.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      feedbackEl.style.display = 'none';
    }, 300);
  }, 2000);
}

// 事件绑定
btnReset.addEventListener("click", () => {
  playClick();
  resetCurrentRound();
});

btnCheck.addEventListener("click", () => {
  playClick();
  checkAnswer();
});

btnNext.addEventListener("click", () => {
  playClick();
  currentRound++;
  renderRound();
});

// 返回主页面
btnBack.addEventListener("click", () => {
  playClick();
  try {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "../../index.html";
    }
  } catch (_) {
    window.location.href = "../../index.html";
  }
});

document.addEventListener("DOMContentLoaded", initGame);
