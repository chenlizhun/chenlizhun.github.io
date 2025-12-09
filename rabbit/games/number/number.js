// games/number/number.js

const THEME_ID = "number";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const sentenceTextEl = document.getElementById("sentenceText");
const poemMetaEl = document.getElementById("poemMeta");
const feedbackEl = document.getElementById("feedback");
const optionsAreaEl = document.getElementById("optionsArea");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const progressBarEl = document.getElementById("progressBar");

// 游戏总结模态框
const gameCompletionModal = document.getElementById("gameCompletionModal");
const totalQuestionsEl = document.getElementById("totalQuestions");
const correctAnswersEl = document.getElementById("correctAnswers");
const wrongAnswersEl = document.getElementById("wrongAnswers");
const accuracyEl = document.getElementById("accuracy");
const restartGameBtn = document.getElementById("restartGameBtn");
const backToMainBtn = document.getElementById("backToMainBtn");

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
    osc.frequency.value = 680; // 和其他小游戏略有区别
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
let numberPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;
let currentSentence = "";
let currentCount = 0;

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

// ====== 工具函数 ======
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 生成随机整数（包含 min 和 max）
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成合理的选项数组
function buildOptions(correctAnswer) {
  // 确保选项在合理范围内
  const minRange = Math.max(0, correctAnswer - 3);
  const maxRange = correctAnswer + 3;
  
  const options = new Set();
  options.add(correctAnswer);
  
  // 生成3个不同的错误选项
  while (options.size < 4) {
    const randomOption = getRandomInt(minRange, maxRange);
    if (randomOption !== correctAnswer) {
      options.add(randomOption);
    }
  }
  
  return shuffle(Array.from(options));
}

const DIGIT_CHARS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "万"];

// 统计诗句中“数字字”的数量
function countDigitChars(sentence) {
  let cnt = 0;
  for (const ch of sentence) {
    if (DIGIT_CHARS.includes(ch)) {
      cnt++;
    }
  }
  return cnt;
}

// 把“数字字”用 span 包起来，高亮展示
function renderWithDigitHighlight(sentence) {
  let html = "";
  for (const ch of sentence) {
    if (DIGIT_CHARS.includes(ch)) {
      html += `<span class="digit-char">${ch}</span>`;
    } else {
      html += ch;
    }
  }
  return html;
}

// ====== 渲染一题 ======
function renderRound() {
  const total = numberPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无数字主题诗词，请检查 data.js";
    sentenceTextEl.textContent = "——";
    poemMetaEl.textContent = "";
    feedbackEl.textContent = "请返回主页面。";
    optionsAreaEl.innerHTML = "";
    btnNext.disabled = true;
    if (progressBarEl) {
      progressBarEl.style.width = "0%";
    }
    return;
  }

  if (currentRound >= total) {
    currentRound = 0;
  }

  const poemIndex = orderIndices[currentRound];
  currentPoemIndex = poemIndex;
  const poem = numberPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  currentSentence = sentence;
  currentCount = countDigitChars(sentence);

  // 计算并更新进度条
  const progress = (currentRound / total) * 100;
  progressBarEl.style.width = `${progress}%`;

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;

  // 初始展示不高亮（让孩子自己数）
  sentenceTextEl.textContent = sentence;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";
  feedbackEl.className = 'feedback';

  // 渲染选项
  optionsAreaEl.innerHTML = "";
  const opts = buildOptions(currentCount);

  opts.forEach((num, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.value = String(num);
    btn.innerHTML = `<span class="num">${num}</span><span class="unit"> 个</span>`;
    btn.style.animationDelay = `${index * 0.1}s`;
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(20px)';
    
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;
      playClick();
      handleAnswer(btn);
    });
    optionsAreaEl.appendChild(btn);
    
    // 触发动画
    setTimeout(() => {
      btn.style.transition = 'all 0.5s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 10);
  });

  btnNext.disabled = true;
}

// ====== 作答处理 ======
function handleAnswer(btn) {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  const chosen = Number(btn.dataset.value || "0");
  const isCorrect = chosen === currentCount;

  // 统一禁用按钮，标出正确 / 错误
  const allBtns = optionsAreaEl.querySelectorAll(".option-btn");
  allBtns.forEach((b) => {
    b.classList.add("disabled");
    b.disabled = true;
    const v = Number(b.dataset.value || "0");
    if (v === currentCount) {
      b.classList.add("correct");
    }
  });

  // 检查结果
  if (isCorrect) {
    feedbackEl.textContent = `✅ 回答正确！这句诗里一共有 ${currentCount} 个数字字。`;
    feedbackEl.className = 'feedback correct';
    correctCount++;

    // 创建得分弹出动画
    createScorePopup(scoreInfoEl);

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
    feedbackEl.textContent = `❌ 这次没数对，再看看下一句吧～（正确答案是 ${currentCount} 个）`;
    feedbackEl.className = 'feedback wrong';
    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }
  
  // 如果是最后一题，进度条显示100%
  if (currentRound + 1 >= numberPoems.length) {
    progressBarEl.style.width = "100%";
  }

  // 作答后，重新高亮显示数字字，帮助复盘
  sentenceTextEl.innerHTML = renderWithDigitHighlight(currentSentence);
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  if (!window.POEMS || !Array.isArray(POEMS.number)) {
    numberPoems = [];
  } else {
    numberPoems = POEMS.number.slice();
  }

  loadStatus();

  const total = numberPoems.length;
  orderIndices = [];
  for (let i = 0; i < total; i++) {
    orderIndices.push(i);
  }
  orderIndices = shuffle(orderIndices);

  currentRound = 0;
  correctCount = 0;

  renderRound();
  
  // 绑定游戏总结模态框事件
  bindModalEvents();
  
  // 初始化数字气泡动画
  createNumberBubbles();
}

// 事件绑定
btnNext.addEventListener("click", () => {
  playClick();
  currentRound++;
  
  // 检查是否完成所有题目
  if (currentRound >= numberPoems.length) {
    // 显示游戏总结
    showGameCompletionSummary();
    return;
  }
  
  // 渲染下一题
  renderRound();
});

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

// 显示游戏总结
function showGameCompletionSummary() {
  const total = numberPoems.length;
  const wrong = total - correctCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  
  // 更新统计数据
  totalQuestionsEl.textContent = total;
  correctAnswersEl.textContent = correctCount;
  wrongAnswersEl.textContent = wrong;
  accuracyEl.textContent = `${accuracy}%`;
  
  // 显示模态框
  gameCompletionModal.classList.add('show');
}

// 重新开始游戏
function restartGame() {
  // 重置游戏状态
  currentRound = 0;
  correctCount = 0;
  
  // 隐藏模态框
  gameCompletionModal.classList.remove('show');
  
  // 重置进度条
  progressBarEl.style.width = "0%";
  
  // 重新洗牌
  orderIndices = shuffle(Array.from(Array(numberPoems.length).keys()));
  
  // 渲染第一题
  renderRound();
}

// 绑定模态框事件
function bindModalEvents() {
  // 重新开始按钮
  restartGameBtn.onclick = () => {
    restartGame();
  };
  
  // 返回主页面按钮
  backToMainBtn.onclick = () => {
    window.location.href = '../../index.html';
  };
  
  // 点击模态框外部关闭
  gameCompletionModal.addEventListener('click', (e) => {
    if (e.target === gameCompletionModal) {
      gameCompletionModal.classList.remove('show');
    }
  });
}

// 创建得分弹出动画
function createScorePopup(element) {
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = '+1';
  
  // 获取元素位置
  const rect = element.getBoundingClientRect();
  popup.style.left = `${rect.left + rect.width / 2}px`;
  popup.style.top = `${rect.top + rect.height / 2}px`;
  
  document.body.appendChild(popup);
  
  // 动画结束后移除
  setTimeout(() => {
    popup.remove();
  }, 1000);
}

// 创建数字气泡动画
function createNumberBubbles() {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const mathSymbols = ['+', '-', '×', '÷', '=', '√', 'π', '∞'];
  const totalElements = 8;
  
  for (let i = 0; i < totalElements; i++) {
    setTimeout(() => {
      let element;
      if (i % 2 === 0) {
        // 创建数字气泡
        element = document.createElement('div');
        element.className = 'number-bubble';
        element.textContent = numbers[Math.floor(Math.random() * numbers.length)];
      } else {
        // 创建数学符号
        element = document.createElement('div');
        element.className = 'math-symbol';
        element.textContent = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
      }
      
      // 随机位置和动画
      element.style.left = `${Math.random() * 100}vw`;
      element.style.animationDelay = `${Math.random() * 2}s`;
      element.style.animationDuration = `${6 + Math.random() * 6}s`;
      
      document.body.appendChild(element);
      
      // 动画结束后移除元素
      element.addEventListener('animationend', () => {
        element.remove();
      });
    }, i * 1000);
  }
  
  // 循环创建
  setTimeout(createNumberBubbles, totalElements * 1000);
}

document.addEventListener("DOMContentLoaded", initGame);
