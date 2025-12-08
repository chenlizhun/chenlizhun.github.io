// games/color/color.js

const THEME_ID = "color";
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

// ====== 颜色定义 ======
const COLOR_DEFS = [
  // 注意：chars 里是映射到这一类颜色的汉字
  { id: "red", label: "红色", swatchClass: "swatch-red", chars: ["红", "丹"] },
  { id: "yellow", label: "黄色", swatchClass: "swatch-yellow", chars: ["黄", "金"] },
  { id: "green", label: "绿色", swatchClass: "swatch-green", chars: ["绿", "青", "碧", "翠"] },
  { id: "white", label: "白色", swatchClass: "swatch-white", chars: ["白"] },
  { id: "blue", label: "蓝色", swatchClass: "swatch-blue", chars: ["蓝"] },
  { id: "purple", label: "紫色", swatchClass: "swatch-purple", chars: ["紫"] },
  { id: "black", label: "黑色", swatchClass: "swatch-black", chars: ["黑"] }
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

// 生成 4 个颜色选项（包含正确颜色）
function buildColorOptions(mainColorId) {
  const used = new Set();
  used.add(mainColorId);

  const ids = [mainColorId];
  const candidates = shuffle(COLOR_DEFS.map(d => d.id));
  for (const id of candidates) {
    if (ids.length >= 4) break;
    if (!used.has(id)) {
      used.add(id);
      ids.push(id);
    }
  }

  // 如果诗里只出现了一种颜色，且颜色种类很少，也保证至少 3~4 个选项
  if (ids.length < 4) {
    COLOR_DEFS.forEach(def => {
      if (ids.length < 4 && !used.has(def.id)) {
        used.add(def.id);
        ids.push(def.id);
      }
    });
  }

  return shuffle(ids.slice(0, 4));
}

// 根据 colorId 找到 COLOR_DEFS 里的定义
function getColorDef(colorId) {
  return COLOR_DEFS.find(d => d.id === colorId);
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

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;

  sentenceTextEl.innerHTML = renderSentenceNeutral(sentence);
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";

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
    feedbackEl.textContent = "✅ 回答正确！你已经能把颜色词和真实颜色对上号啦～";
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
    feedbackEl.textContent = "❌ 这次还没配对对，下次再试试别的句子～";

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
    colorPoems = POEMS.color.slice();
  }

  loadStatus();

  const total = colorPoems.length;
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
