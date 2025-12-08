// games/bird/bird.js

const THEME_ID = "bird";
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
    osc.frequency.value = 800;
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
let birdPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;
let originalSentence = "";

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

// 把诗句里的第一个“鸟”挖空成「□」
function makeBlankSentence(sentence) {
  const s = (sentence || "").trim();
  const idx = s.indexOf("鸟");
  if (idx === -1) {
    // 如果真的没有“鸟”，就不挖空
    return s;
  }
  return s.slice(0, idx) + "□" + s.slice(idx + 1);
}

// 给「□」加一点下划线样式（用 span 包裹）
function renderBlankStyled(sentenceWithBlank) {
  const html = sentenceWithBlank.replace(/□/g, '<span class="blank">□</span>');
  return html;
}

// 生成四个候选字（其中一个永远是“鸟”）
function buildOptions() {
  const CORRECT_CHAR = "鸟";
  const DISTRACTOR_POOL = ["花", "月", "风", "水", "山", "草", "鱼", "云"];

  const used = new Set();
  used.add(CORRECT_CHAR);

  const choices = [CORRECT_CHAR];
  // 随机挑三个干扰项
  const shuffledPool = shuffle(DISTRACTOR_POOL);
  for (let i = 0; i < shuffledPool.length && choices.length < 4; i++) {
    const ch = shuffledPool[i];
    if (!used.has(ch)) {
      used.add(ch);
      choices.push(ch);
    }
  }

  return shuffle(choices);
}

// ====== 渲染一题 ======
function renderRound() {
  const total = birdPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无鸟主题诗词，请检查 data.js";
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
  const poem = birdPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  originalSentence = sentence;

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;

  const blankSentence = makeBlankSentence(sentence);
  sentenceTextEl.innerHTML = renderBlankStyled(blankSentence);
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";

  // 渲染选项
  optionsAreaEl.innerHTML = "";
  const opts = buildOptions();

  opts.forEach((ch) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = ch;
    btn.dataset.char = ch;
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

  const chosenChar = btn.dataset.char || "";
  const isCorrect = chosenChar === "鸟";

  const allBtns = optionsAreaEl.querySelectorAll(".option-btn");
  allBtns.forEach((b) => {
    b.classList.add("disabled");
    b.disabled = true;
    const ch = b.dataset.char || "";
    if (ch === "鸟") {
      b.classList.add("correct");
    }
  });

  if (isCorrect) {
    feedbackEl.textContent = "✅ 回答正确！“鸟”已经飞回诗句里啦～";
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
    feedbackEl.textContent = "❌ 这不是正确的字，再看看下一句吧～";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  if (!window.POEMS || !Array.isArray(POEMS.bird)) {
    birdPoems = [];
  } else {
    birdPoems = POEMS.bird.slice();
  }

  loadStatus();

  const total = birdPoems.length;
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
