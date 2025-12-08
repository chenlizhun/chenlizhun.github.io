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

// 根据正确数量生成 3 个备选数字（包含正确值）
function buildOptions(count) {
  const options = new Set();
  options.add(count);

  // 尝试加上附近的数字
  function tryAdd(n) {
    if (n >= 0 && n <= 10) {
      options.add(n);
    }
  }

  if (count === 0) {
    tryAdd(1);
    tryAdd(2);
  } else {
    tryAdd(count - 1);
    tryAdd(count + 1);
  }

  // 不足 3 个就补一些常见数字
  const fillCandidates = [0, 1, 2, 3, 4, 5, 6];
  for (const n of fillCandidates) {
    if (options.size >= 3) break;
    tryAdd(n);
  }

  return shuffle(Array.from(options)).slice(0, 3);
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

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;

  // 初始展示不高亮（让孩子自己数）
  sentenceTextEl.textContent = sentence;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";

  // 渲染选项
  optionsAreaEl.innerHTML = "";
  const opts = buildOptions(currentCount);

  opts.forEach((num) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.value = String(num);
    btn.innerHTML = `<span class="num">${num}</span><span class="unit"> 个</span>`;
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
    feedbackEl.textContent = `❌ 这次没数对，再看看下一句吧～（正确答案是 ${currentCount} 个）`;
    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
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
}

// 事件绑定
btnNext.addEventListener("click", () => {
  playClick();
  currentRound++;
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

document.addEventListener("DOMContentLoaded", initGame);
