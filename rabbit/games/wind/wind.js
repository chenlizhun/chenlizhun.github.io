// games/wind/wind.js

const THEME_ID = "wind";
const STORAGE_KEY = "poemMemoryStatus_v1";

// 云动画相关常量
const CLOUD_CLASSES = ["small", "medium", "large"];
const MAX_CLOUDS = 6;

// 鸟动画相关常量
const BIRD_CLASSES = ["small", "medium", "large"];
const BIRD_COLORS = ["red", "blue", "yellow"];
const MAX_BIRDS = 3;

// 创建飘动的云
function createCloud() {
  const cloud = document.createElement("div");
  const cloudSize = CLOUD_CLASSES[Math.floor(Math.random() * CLOUD_CLASSES.length)];
  cloud.className = `cloud ${cloudSize}`;
  
  // 随机设置云的垂直位置
  const top = Math.random() * 50 + 10; // 10% - 60% 高度
  cloud.style.top = `${top}%`;
  
  // 设置随机的动画延迟
  const delay = Math.random() * 5;
  cloud.style.animationDelay = `${delay}s`;
  
  return cloud;
}

// 创建飞鸟
function createBird() {
  const bird = document.createElement("div");
  const birdSize = BIRD_CLASSES[Math.floor(Math.random() * BIRD_CLASSES.length)];
  const birdColor = BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)];
  bird.className = `bird ${birdSize} ${birdColor}`;
  
  // 创建翅膀
  const leftWing = document.createElement("div");
  leftWing.className = "wing left";
  
  const rightWing = document.createElement("div");
  rightWing.className = "wing right";
  
  // 把翅膀添加到鸟身上
  bird.appendChild(leftWing);
  bird.appendChild(rightWing);
  
  // 随机设置鸟的垂直位置
  const top = Math.random() * 50 + 20; // 20% - 70% 高度
  bird.style.top = `${top}%`;
  
  // 设置随机的动画延迟
  const delay = Math.random() * 10;
  bird.style.animationDelay = `${delay}s`;
  
  return bird;
}

// 初始化云动画
function initCloudAnimation() {
  const container = document.body;
  
  // 创建多个云
  for (let i = 0; i < MAX_CLOUDS; i++) {
    const cloud = createCloud();
    container.appendChild(cloud);
  }
}

// 初始化鸟动画
function initBirdAnimation() {
  const container = document.body;
  
  // 创建多个鸟
  for (let i = 0; i < MAX_BIRDS; i++) {
    const bird = createBird();
    container.appendChild(bird);
  }
}

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const sentenceTextEl = document.getElementById("sentenceText");
const poemMetaEl = document.getElementById("poemMeta");
const feedbackEl = document.getElementById("feedback");
const progressBarEl = document.getElementById("progressBar");
const optionButtons = document.querySelectorAll(".option-btn");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");

// 游戏结束模态框相关元素
const gameCompletionModalEl = document.getElementById("gameCompletionModal");
const totalQuestionsEl = document.getElementById("totalQuestions");
const correctAnswersEl = document.getElementById("correctAnswers");
const wrongAnswersEl = document.getElementById("wrongAnswers");
const accuracyRateEl = document.getElementById("accuracyRate");
const btnRestartGameEl = document.getElementById("btnRestartGame");
const btnReturnHomeEl = document.getElementById("btnReturnHome");

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
    osc.frequency.value = 780;
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
let windPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;
let currentSentence = "";
let currentType = ""; // spring / east / none / other

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

// 判定这句诗里的“风”类型
function detectWindType(sentence) {
  const s = (sentence || "").trim();
  if (!s) return "other";

  if (s.includes("春风")) {
    return "spring"; // 例如：春风吹又生、春风送暖入屠苏
  }
  if (s.includes("东风")) {
    return "east"; // 例如：忙趁东风放纸鸢、等闲识得东风面
  }
  if (s.includes("无风")) {
    return "none"; // 例如：潭面无风镜未磨
  }
  if (s.includes("风")) {
    return "other"; // 其它所有“风吹草低”“夜来风雨声”等
  }
  // 安全兜底
  return "other";
}

// ====== 渲染一题 ======
function renderRound() {
  const total = windPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无风主题诗词，请检查 data.js";
    sentenceTextEl.textContent = "——";
    poemMetaEl.textContent = "";
    feedbackEl.textContent = "请返回主页面。";
    progressBarEl.style.width = "0%";
    optionButtons.forEach(btn => {
      btn.disabled = true;
      btn.classList.add("disabled");
    });
    btnNext.disabled = true;
    return;
  }

  if (currentRound >= total) {
    currentRound = 0;
  }

  const poemIndex = orderIndices[currentRound];
  currentPoemIndex = poemIndex;
  const poem = windPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  currentSentence = sentence;
  currentType = detectWindType(sentence);

  // 计算并更新进度条
  const progress = (currentRound / total) * 100;
  progressBarEl.style.width = `${progress}%`;

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  sentenceTextEl.textContent = sentence;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";

  optionButtons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("disabled", "correct", "wrong");
  });

  btnNext.disabled = true;
}

// ====== 作答处理 ======
function handleAnswer(btn) {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  const chosenType = btn.dataset.type;
  const isCorrect = chosenType === currentType;

  optionButtons.forEach(b => {
    b.disabled = true;
    b.classList.add("disabled");
    if (b.dataset.type === currentType) {
      b.classList.add("correct");
    }
  });

  if (isCorrect) {
    feedbackEl.textContent = "✅ 回答正确！你已经分清这种“风”的感觉啦～";
    correctCount++;

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
    btn.classList.add("wrong");
    feedbackEl.textContent = "❌ 这次分类还不太对，再试试下一句吧～";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  // 如果是最后一题，进度条显示100%
  if (currentRound + 1 >= windPoems.length) {
    progressBarEl.style.width = "100%";
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  if (!window.POEMS || !Array.isArray(POEMS.wind)) {
    windPoems = [];
  } else {
    windPoems = POEMS.wind.slice();
  }

  loadStatus();

  const total = windPoems.length;
  orderIndices = [];
  for (let i = 0; i < total; i++) {
    orderIndices.push(i);
  }
  orderIndices = shuffle(orderIndices);

  currentRound = 0;
  correctCount = 0;

  // 初始化动画
  initCloudAnimation();
  initBirdAnimation();

  renderRound();
}

// 事件绑定
optionButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    playClick();
    handleAnswer(btn);
  });
});

btnNext.addEventListener("click", () => {
  playClick();
  currentRound++;
  
  // 检查是否完成了所有题目
  if (currentRound >= windPoems.length) {
    // 显示游戏完成总结模态框
    showGameCompletionSummary();
  } else {
    renderRound();
  }
});

// 显示游戏完成总结
function showGameCompletionSummary() {
  const totalQuestions = windPoems.length;
  const wrongAnswers = totalQuestions - correctCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  
  // 更新模态框中的统计数据
  totalQuestionsEl.textContent = totalQuestions;
  correctAnswersEl.textContent = correctCount;
  wrongAnswersEl.textContent = wrongAnswers;
  accuracyRateEl.textContent = `${accuracy}%`;
  
  // 显示模态框
  gameCompletionModalEl.style.display = "flex";
}

// 重新开始游戏
function restartGame() {
  playClick();
  
  // 隐藏模态框
  gameCompletionModalEl.style.display = "none";
  
  // 重置游戏状态
  currentRound = 0;
  correctCount = 0;
  
  // 重新洗牌
  orderIndices = shuffle(orderIndices);
  
  // 重新渲染第一题
  renderRound();
}

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

// 重新开始游戏按钮事件
btnRestartGameEl.addEventListener("click", restartGame);

// 返回主页面按钮事件
btnReturnHomeEl.addEventListener("click", () => {
  playClick();
  window.location.href = "../../index.html";
});

document.addEventListener("DOMContentLoaded", initGame);
