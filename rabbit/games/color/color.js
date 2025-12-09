// games/color/color.js

const THEME_ID = "color";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const comboInfoEl = document.getElementById("comboInfo");
const timeInfoEl = document.getElementById("timeInfo");
const progressBarEl = document.getElementById("progressBar");
const sentenceTextEl = document.getElementById("sentenceText");
const poemMetaEl = document.getElementById("poemMeta");
const feedbackEl = document.getElementById("feedback");
const optionsAreaEl = document.getElementById("optionsArea");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const summaryModal = document.getElementById("summaryModal");
const btnPlayAgain = document.getElementById("btnPlayAgain");
const btnBackToMain = document.getElementById("btnBackToMain");
const totalQuestionsEl = document.getElementById("totalQuestions");
const correctAnswersEl = document.getElementById("correctAnswers");
const accuracyEl = document.getElementById("accuracy");
const summaryMessageEl = document.getElementById("summaryMessage");

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
    // 跟其它小游戏稍微错开一点频率
    osc.frequency.value = 740;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (_) {}
}

// 正确答案音效
function playCorrectSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    // 创建两个振荡器，形成和弦效果
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = 523; // C5
    osc2.frequency.value = 659; // E5
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (_) {}
}

// 错误答案音效
function playWrongSound() {
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
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, audioCtx.currentTime);
    osc.frequency.setValueAtTime(247, audioCtx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (_) {}
}

// 游戏完成音效
function playCompleteSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    // 创建多个振荡器形成愉悦的和弦
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const oscillators = [];
    const gain = audioCtx.createGain();
    
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      oscillators.push(osc);
    });
    
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    oscillators.forEach((osc, index) => {
      const delay = index * 0.1;
      osc.start(now + delay);
      osc.stop(now + 1.2);
    });
  } catch (_) {}
}

// ====== 颜色定义 ======
const COLOR_DEFS = [
  // 注意：chars 里是映射到这一类颜色的汉字
  { id: "red", label: "红色", swatchClass: "swatch-red", chars: ["红", "丹"], hex: "#e74c3c" },
  { id: "yellow", label: "黄色", swatchClass: "swatch-yellow", chars: ["黄", "金"], hex: "#f1c40f" },
  { id: "green", label: "绿色", swatchClass: "swatch-green", chars: ["绿", "青", "碧", "翠"], hex: "#2ecc71" },
  { id: "white", label: "白色", swatchClass: "swatch-white", chars: ["白"], hex: "#ecf0f1" },
  { id: "blue", label: "蓝色", swatchClass: "swatch-blue", chars: ["蓝"], hex: "#3498db" },
  { id: "purple", label: "紫色", swatchClass: "swatch-purple", chars: ["紫"], hex: "#9b59b6" },
  { id: "black", label: "黑色", swatchClass: "swatch-black", chars: ["黑"], hex: "#34495e" }
];

// char -> colorId 映射
const CHAR_TO_COLOR = {};
COLOR_DEFS.forEach(def => {
  def.chars.forEach(ch => {
    CHAR_TO_COLOR[ch] = def.id;
  });
});

// 游戏内部数据
let colorPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;
let comboCount = 0;
let highestCombo = 0;
let startTime = 0;
let gameTimer = null;
let difficultyLevel = 1; // 当前难度级别 (1-5)

let currentPoemIndex = -1;
let currentSentence = "";
let currentColorId = ""; // 正确的主颜色 id

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

// 根据诗句找出“第一个出现”的主颜色
function detectMainColorId(sentence) {
  const s = (sentence || "").trim();
  for (const ch of s) {
    if (CHAR_TO_COLOR[ch]) {
      return CHAR_TO_COLOR[ch];
    }
  }
  return null;
}

// 计算诗句的难度值
function calculateDifficulty(sentence) {
  const s = (sentence || "").trim();
  if (!s) return 1;
  
  // 统计颜色字数量
  const colorChars = [];
  for (const ch of s) {
    if (CHAR_TO_COLOR[ch]) {
      colorChars.push(CHAR_TO_COLOR[ch]);
    }
  }
  
  // 统计不同颜色的种类
  const uniqueColors = new Set(colorChars);
  
  // 计算难度得分
  // 基础难度：句子长度/10
  // 颜色数量因子：颜色字数量
  // 颜色复杂度因子：不同颜色种类数
  const baseDifficulty = Math.max(1, Math.floor(s.length / 10));
  const colorCountFactor = Math.min(3, colorChars.length);
  const colorComplexityFactor = Math.min(2, uniqueColors.size - 1);
  
  let totalDifficulty = baseDifficulty + colorCountFactor + colorComplexityFactor;
  
  // 将难度限制在1-5范围内
  return Math.min(5, Math.max(1, totalDifficulty));
}

// 中立样式：只给颜色字加下划线，不上色
function renderSentenceNeutral(sentence) {
  let html = "";
  for (const ch of sentence) {
    const colorId = CHAR_TO_COLOR[ch];
    if (colorId) {
      html += `<span class="color-word">${ch}</span>`;
    } else {
      html += ch;
    }
  }
  return html || "——";
}

// 彩色高亮：按字的颜色类型上色
function renderSentenceColored(sentence) {
  let html = "";
  for (const ch of sentence) {
    const colorId = CHAR_TO_COLOR[ch];
    if (colorId) {
      html += `<span class="color-word color-${colorId}">${ch}</span>`;
    } else {
      html += ch;
    }
  }
  return html || "——";
}

// 生成颜色选项（根据难度调整数量）
function buildColorOptions(mainColorId) {
  // 根据当前难度级别调整选项数量
  const maxOptions = Math.min(7, 4 + Math.floor(difficultyLevel / 2));
  const minOptions = Math.min(4, 2 + difficultyLevel);
  
  const used = new Set();
  used.add(mainColorId);

  const ids = [mainColorId];
  const candidates = shuffle(COLOR_DEFS.map(d => d.id));
  for (const id of candidates) {
    if (ids.length >= maxOptions) break;
    if (!used.has(id)) {
      used.add(id);
      ids.push(id);
    }
  }

  // 如果选项不足，确保至少有minOptions个选项
  if (ids.length < minOptions) {
    COLOR_DEFS.forEach(def => {
      if (ids.length < minOptions && !used.has(def.id)) {
        used.add(def.id);
        ids.push(def.id);
      }
    });
  }

  return shuffle(ids.slice(0, maxOptions));
}

// 根据 colorId 找到 COLOR_DEFS 里的定义
function getColorDef(colorId) {
  return COLOR_DEFS.find(d => d.id === colorId);
}

// 创建得分弹出动画
function createScorePopup(targetElement) {
  const popup = document.createElement("div");
  popup.className = "score-popup";
  popup.textContent = "+1";
  popup.style.color = "#00b894";
  
  // 获取目标元素的位置
  const rect = targetElement.getBoundingClientRect();
  popup.style.left = `${rect.right - 20}px`;
  popup.style.top = `${rect.top}px`;
  
  document.body.appendChild(popup);
  
  // 1秒后移除元素
  setTimeout(() => {
    popup.remove();
  }, 1000);
}

// 格式化时间（秒 -> mm:ss）
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新计时器显示
function updateTimer() {
  if (startTime === 0) return;
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timeInfoEl.textContent = `用时：${formatTime(elapsedSeconds)}`;
}

// ====== 渲染一题 ======
function renderRound() {
  const total = colorPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无颜色主题诗词，请检查 data.js";
    sentenceTextEl.textContent = "——";
    poemMetaEl.textContent = "";
    feedbackEl.textContent = "请返回主页面。";
    optionsAreaEl.innerHTML = "";
    btnNext.disabled = true;
    return;
  }

  if (currentRound >= total) {
    currentRound = 0;
  }

  const poemIndex = orderIndices[currentRound];
  currentPoemIndex = poemIndex;
  const poem = colorPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  currentSentence = sentence;
  const mainColorId = detectMainColorId(sentence) || "red"; // 兜底
  currentColorId = mainColorId;

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题 (难度: ${poem.difficulty}/5)`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  // 更新进度条
  const progress = (currentRound / total) * 100;
  if (progressBarEl) {
    progressBarEl.style.width = `${progress}%`;
  }

  sentenceTextEl.innerHTML = renderSentenceNeutral(sentence);
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

  // 渲染颜色选项
  optionsAreaEl.innerHTML = "";
  const optionIds = buildColorOptions(mainColorId);

  optionIds.forEach(id => {
    const def = getColorDef(id);
    if (!def) return;
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.colorId = def.id;
    btn.innerHTML = `
      <span class="color-swatch ${def.swatchClass}"></span>
      <span class="color-label">${def.label}</span>
    `;
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;
      playClick();
      handleAnswer(btn);
    });
    optionsAreaEl.appendChild(btn);
  });

  btnNext.disabled = true;
}

// ====== 作答处理 ======
function handleAnswer(btn) {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  const chosenId = btn.dataset.colorId;
  const isCorrect = chosenId === currentColorId;

  const allBtns = optionsAreaEl.querySelectorAll(".option-btn");
  allBtns.forEach(b => {
    b.classList.add("disabled");
    b.disabled = true;
    if (b.dataset.colorId === currentColorId) {
      b.classList.add("correct");
    }
  });

  if (isCorrect) {
    // 播放正确音效
    playCorrectSound();
    
    // 增加连击数
    comboCount++;
    highestCombo = Math.max(highestCombo, comboCount);
    comboInfoEl.textContent = `连击：${comboCount}`;
    
    // 根据连击数显示不同的反馈
    let feedbackText = "✅ 回答正确！你已经能把颜色词和真实颜色对上号啦～";
    if (comboCount >= 5 && comboCount < 10) {
      feedbackText = `🎉 连击 ${comboCount} 次！继续保持！`;
    } else if (comboCount >= 10 && comboCount < 15) {
      feedbackText = `🚀 连击 ${comboCount} 次！太棒了！`;
    } else if (comboCount >= 15) {
      feedbackText = `🌟 连击 ${comboCount} 次！你是诗词大师！`;
    }
    
    feedbackEl.textContent = feedbackText;
    feedbackEl.className = "feedback correct";
    correctCount++;
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
    // 播放错误音效
    playWrongSound();
    
    // 重置连击数
    comboCount = 0;
    comboInfoEl.textContent = `连击：${comboCount}`;
    
    btn.classList.add("wrong");
    feedbackEl.textContent = "❌ 这次还没配对对，下次再试试别的句子～";
    feedbackEl.className = "feedback wrong";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  // 作答后，用真正颜色高亮所有颜色字
  sentenceTextEl.innerHTML = renderSentenceColored(currentSentence);
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  if (!window.POEMS || !Array.isArray(POEMS.color)) {
    colorPoems = [];
  } else {
    // 为每首诗添加难度属性
    colorPoems = POEMS.color.map(poem => {
      return {
        ...poem,
        difficulty: calculateDifficulty(poem.sentence || poem.text || "")
      };
    });
  }

  loadStatus();

  const total = colorPoems.length;
  orderIndices = [];
  for (let i = 0; i < total; i++) {
    orderIndices.push(i);
  }
  
  // 根据当前难度级别排序诗句，先简单后复杂
  orderIndices.sort((a, b) => {
    const difficultyA = colorPoems[a].difficulty;
    const difficultyB = colorPoems[b].difficulty;
    
    // 早期游戏以简单题为主，随着难度级别提高，逐渐增加复杂题的比例
    const randomFactor = Math.random() * (3 - difficultyLevel * 0.5);
    
    return difficultyA - difficultyB + randomFactor;
  });

  currentRound = 0;
  correctCount = 0;
  comboCount = 0;
  highestCombo = 0;
  difficultyLevel = 1; // 重置难度级别
  comboInfoEl.textContent = `连击：${comboCount}`;
  
  startTime = Date.now();
  
  // 启动计时器
  if (gameTimer) {
    clearInterval(gameTimer);
  }
  gameTimer = setInterval(updateTimer, 1000);
  updateTimer(); // 立即更新一次

  renderRound();
}

// 事件绑定
btnNext.addEventListener("click", () => {
  playClick();
  currentRound++;
  
  // 每完成5题，增加难度级别
  if (currentRound % 5 === 0) {
    difficultyLevel = Math.min(5, difficultyLevel + 1);
  }
  
  if (currentRound < colorPoems.length) {
    renderRound();
  } else {
    showGameSummary();
  }
})

// 显示游戏总结
function showGameSummary() {
  // 停止计时器
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  
  // 播放游戏完成音效
  playCompleteSound();
  
  const totalQuestions = colorPoems.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  
  totalQuestionsEl.textContent = totalQuestions;
  correctAnswersEl.textContent = correctCount;
  accuracyEl.textContent = `${accuracy}%`;
  
  // 根据正确率生成不同的总结消息
  let summaryMessage = "";
  if (accuracy >= 90) {
    summaryMessage = `🎉 太棒了！你对颜色诗词的理解已经达到了大师级别！\n\n最高连击：${highestCombo} 次\n总用时：${formatTime(totalTime)}`;
  } else if (accuracy >= 70) {
    summaryMessage = `👏 非常好！你已经掌握了大部分颜色诗词的知识，再接再厉！\n\n最高连击：${highestCombo} 次\n总用时：${formatTime(totalTime)}`;
  } else if (accuracy >= 50) {
    summaryMessage = `👍 不错！你已经有了一定的颜色诗词基础，继续练习会更棒！\n\n最高连击：${highestCombo} 次\n总用时：${formatTime(totalTime)}`;
  } else {
    summaryMessage = `💪 不要灰心！通过这次练习，你已经了解了很多颜色诗词的知识，多练习几次一定会进步的！\n\n最高连击：${highestCombo} 次\n总用时：${formatTime(totalTime)}`;
  }
  
  summaryMessageEl.textContent = summaryMessage;
  summaryModal.style.display = "flex";
  
  // 添加动画效果
  summaryModal.classList.add("modal-overlay");
}

// 再玩一次
function playAgain() {
  summaryModal.style.display = "none";
  initGame();
}

// 返回主页面
function backToMain() {
  window.location.href = "../../index.html";
}

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

btnPlayAgain.addEventListener("click", playAgain);
btnBackToMain.addEventListener("click", backToMain);
