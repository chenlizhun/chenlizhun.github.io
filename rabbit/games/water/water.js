// games/water/water.js

const THEME_ID = "water";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const headLineEl = document.getElementById("headLine");
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
    osc.frequency.value = 720;
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
let waterPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;
let currentHead = "";
let currentTail = "";

// 存储所有可用“尾句”（干扰项池）
let tailPool = [];

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

// 把一句诗拆成上、下两半：优先按标点拆
function splitSentence(sentence) {
  const s = (sentence || "").trim();
  if (!s) return { head: "——", tail: "——" };

  // 去掉末尾句号感叹号等
  let trimmed = s.replace(/[。！？!?\s]+$/g, "");

  // 优先按 "，" 或 "、" 或 "；" 拆成两部分
  const parts = trimmed.split(/[，,、；;]/).map(p => p.trim()).filter(p => p.length > 0);
  if (parts.length >= 2) {
    return { head: parts[0], tail: parts.slice(1).join("，") };
  }

  // 否则按长度一分为二
  const chars = trimmed.split("");
  const len = chars.length;
  if (len <= 4) {
    // 太短就不拆
    return { head: trimmed, tail: trimmed };
  }
  const mid = Math.floor(len / 2);
  const head = chars.slice(0, mid).join("");
  const tail = chars.slice(mid).join("");
  return { head, tail };
}

// 从 tailPool 中选两个不同的干扰下半句
function pickTwoDistractors(correctTail) {
  if (tailPool.length === 0) {
    return ["——", "——"];
  }
  const filtered = tailPool.filter(t => t && t !== correctTail);
  const pool = filtered.length > 0 ? filtered : tailPool;

  const indices = [];
  for (let i = 0; i < pool.length; i++) indices.push(i);
  const shuffledIdx = shuffle(indices);

  const d1 = pool[shuffledIdx[0]] || "——";
  const d2 = pool[shuffledIdx[1]] || d1;
  return [d1, d2];
}

// ====== 渲染一题 ======
function renderRound() {
  const total = waterPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无水主题诗词，请检查 data.js";
    headLineEl.textContent = "——";
    poemMetaEl.textContent = "";
    feedbackEl.textContent = "请返回主页面。";
    optionButtons.forEach(btn => {
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
  const poem = waterPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  const { head, tail } = splitSentence(sentence);
  currentHead = head;
  currentTail = tail;

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  headLineEl.textContent = head;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";

  const [d1, d2] = pickTwoDistractors(currentTail);
  const options = shuffle([
    { text: currentTail, isCorrect: true },
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

// ====== 作答处理 ======
function handleAnswer(btn) {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  const isCorrect = btn.dataset.correct === "1";

  optionButtons.forEach(b => {
    b.disabled = true;
    b.classList.add("disabled");
    if (b.dataset.correct === "1") {
      b.classList.add("correct");
    }
  });

  if (isCorrect) {
    feedbackEl.textContent = "✅ 回答正确！完整句子你已经记住啦～";
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
    feedbackEl.textContent = "❌ 这不是正确的下半句，再看看下一题吧～";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  // 1. 拿到水主题的诗
  if (!window.POEMS || !Array.isArray(POEMS.water)) {
    waterPoems = [];
  } else {
    waterPoems = POEMS.water.slice();
  }

  // 2. 构建下半句干扰池：从所有主题里收集“尾句”
  tailPool = [];
  if (window.POEMS) {
    const themeIds = Object.keys(POEMS);
    themeIds.forEach(tid => {
      const arr = Array.isArray(POEMS[tid]) ? POEMS[tid] : [];
      arr.forEach(p => {
        const s = p.sentence || p.text;
        if (!s || typeof s !== "string") return;
        const { tail } = splitSentence(s);
        if (tail && tail.length > 0) {
          tailPool.push(tail);
        }
      });
    });
  }

  loadStatus();

  const total = waterPoems.length;
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
