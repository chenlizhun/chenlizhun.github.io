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
    feedbackEl.textContent = "还没有选任何「月」字哦，试着找一找～";
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
    feedbackEl.textContent = "✅ 太棒啦！所有的「月」字都被你找到了～";
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
    feedbackEl.textContent =
      "❌ 这次还没完全找对，可以点“重置本题”再试一次。";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
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

  renderRound();
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
