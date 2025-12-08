// games/mountain/mountain.js

const THEME_ID = "mountain";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const poemMetaEl = document.getElementById("poemMeta");
const questionHintEl = document.getElementById("questionHint");
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
    osc.frequency.value = 760;
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
let mountainPoems = [];
let distractorSentences = []; // 其它主题的句子，用作干扰项
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;
let correctSentence = "";

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

// 从 distractorSentences 中挑两个不同的干扰句
function pickTwoDistractors(correct) {
  if (distractorSentences.length === 0) {
    return ["——", "——"];
  }
  const filtered = distractorSentences.filter((s) => s && s !== correct);
  const pool = filtered.length > 0 ? filtered : distractorSentences;

  const indices = [];
  for (let i = 0; i < pool.length; i++) indices.push(i);
  const shuffledIdx = shuffle(indices);

  const d1 = pool[shuffledIdx[0]] || "——";
  const d2 = pool[shuffledIdx[1]] || d1;

  return [d1, d2];
}

// ====== 渲染一题 ======
function renderRound() {
  const total = mountainPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无山主题诗词，请检查 data.js";
    poemMetaEl.textContent = "";
    questionHintEl.textContent = "";
    feedbackEl.textContent = "请返回主页面。";
    optionButtons.forEach((btn) => {
      btn.textContent = "";
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
  const poem = mountainPoems[poemIndex];

  const sentence = poem.sentence || poem.text || "";
  correctSentence = sentence;

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  questionHintEl.textContent = "从三个选项中找出真正出自这首诗的一句。";
  feedbackEl.textContent = "";

  // 构造选项：1 正确 + 2 干扰
  const [d1, d2] = pickTwoDistractors(correctSentence);
  const options = shuffle([
    { text: correctSentence, isCorrect: true },
    { text: d1, isCorrect: false },
    { text: d2, isCorrect: false }
  ]);

  optionButtons.forEach((btn, idx) => {
    const opt = options[idx];
    btn.textContent = opt.text || "——";
    btn.dataset.correct = opt.isCorrect ? "1" : "0";
    btn.disabled = false;
    btn.classList.remove("disabled", "correct", "wrong");
  });

  btnNext.disabled = true;
}

// ====== 处理作答 ======
function handleAnswer(btn) {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  const isCorrect = btn.dataset.correct === "1";

  // 所有按钮都禁用，并标出正确/错误
  optionButtons.forEach((b) => {
    b.disabled = true;
    b.classList.add("disabled");
    const ok = b.dataset.correct === "1";
    if (ok) {
      b.classList.add("correct");
    }
  });

  if (isCorrect) {
    btn.classList.add("correct");
    feedbackEl.textContent = "✅ 回答正确！这一句就出自刚才那首诗～";
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
    feedbackEl.textContent = "❌ 这句并不是出自这首诗，再试试下一题吧～";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  // 拿到山主题的诗
  if (!window.POEMS || !Array.isArray(POEMS.mountain)) {
    mountainPoems = [];
  } else {
    mountainPoems = POEMS.mountain.slice();
  }

  // 从其它所有主题里收集干扰项
  distractorSentences = [];
  if (window.POEMS) {
    const themeIds = Object.keys(POEMS);
    themeIds.forEach((tid) => {
      if (tid === THEME_ID) return;
      const arr = Array.isArray(POEMS[tid]) ? POEMS[tid] : [];
      arr.forEach((p) => {
        const s = p.sentence || p.text;
        if (s && typeof s === "string") {
          distractorSentences.push(s);
        }
      });
    });
  }

  loadStatus();

  const total = mountainPoems.length;
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
optionButtons.forEach((btn) => {
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
