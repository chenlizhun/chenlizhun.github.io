// games/wind/wind.js

const THEME_ID = "wind";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const sentenceTextEl = document.getElementById("sentenceText");
const poemMetaEl = document.getElementById("poemMeta");
const feedbackEl = document.getElementById("feedback");
const optionButtons = document.querySelectorAll(".option-btn");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");

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
