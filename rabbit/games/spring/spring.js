// games/spring/spring.js

const THEME_ID = "spring";
const STORAGE_KEY = "poemMemoryStatus_v1";

// 本小游戏内部状态
let springPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;  // 在 springPoems 中的索引
let correctChar = "";
let optionsChars = [];

// DOM
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const maskedSentenceEl = document.getElementById("maskedSentence");
const poemMetaEl = document.getElementById("poemMeta");
const feedbackEl = document.getElementById("feedback");
const optionButtons = document.querySelectorAll(".option-btn");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");

// 本地存储的状态 map（与主 App 共用）
let statusMap = {};

// 点击音效
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
    osc.frequency.value = 900;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (_) {}
}

// ====== 本地存储读写 ======
function loadStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      statusMap = JSON.parse(raw) || {};
    } else {
      statusMap = {};
    }
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
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 选一个要挖掉的字符：优先“春风花草”等，找不到就随机一个汉字
const SPRING_KEY_CHARS = ["春", "风", "花", "草", "雨", "江", "山"];

function pickMissingChar(sentence) {
  const s = sentence || "";
  if (!s) {
    return { masked: "——", missingChar: "" };
  }

  // 优先从 SPRING_KEY_CHARS 中找
  let candidates = [];
  for (const ch of s) {
    if (SPRING_KEY_CHARS.includes(ch)) {
      candidates.push(ch);
    }
  }

  let charToRemove = "";
  if (candidates.length > 0) {
    charToRemove = candidates[Math.floor(Math.random() * candidates.length)];
  } else {
    // 如果没有这些关键字，就从汉字中随便挑一个
    const hanChars = s.split("").filter((ch) => /[\u4e00-\u9fa5]/.test(ch));
    if (hanChars.length > 0) {
      charToRemove = hanChars[Math.floor(Math.random() * hanChars.length)];
    } else {
      charToRemove = s.charAt(0);
    }
  }

  const safe = escapeHtml(s);
  // 注意：这里只替换第一个匹配到的字，用一个 span.blank 包裹
  let replaced = "";
  let replacedOnce = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const htmlCh = escapeHtml(ch);
    if (!replacedOnce && ch === charToRemove) {
      replaced += `<span class="blank">□</span>`;
      replacedOnce = true;
    } else {
      replaced += htmlCh;
    }
  }

  return { masked: replaced, missingChar: charToRemove };
}

// 构造选项（1 个正确 + 2 个干扰）
const SPRING_OPTION_POOL = ["春", "秋", "夏", "冬", "风", "花", "草", "雨", "江", "山", "水"];

function buildOptions(correct) {
  const set = new Set();
  set.add(correct);

  const pool = SPRING_OPTION_POOL.slice();
  // 打乱池子
  const shuffledPool = shuffle(pool);

  for (const ch of shuffledPool) {
    if (set.size >= 3) break;
    if (ch !== correct) set.add(ch);
  }

  // 如果还不够，就随便找一些中文补足
  while (set.size < 3) {
    const extra = SPRING_OPTION_POOL[Math.floor(Math.random() * SPRING_OPTION_POOL.length)];
    set.add(extra);
  }

  return shuffle(Array.from(set));
}

// ====== 渲染一题 ======
function renderRound() {
  const total = springPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无春主题诗词，请检查 data.js";
    maskedSentenceEl.textContent = "——";
    poemMetaEl.textContent = "";
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
  const poem = springPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  const { masked, missingChar } = pickMissingChar(sentence);
  correctChar = missingChar;
  optionsChars = buildOptions(correctChar);

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;

  maskedSentenceEl.innerHTML = masked;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;
  feedbackEl.textContent = "";

  optionButtons.forEach((btn, i) => {
    btn.textContent = optionsChars[i] || "";
    btn.disabled = false;
    btn.classList.remove("disabled");
    btn.dataset.char = optionsChars[i] || "";
  });

  btnNext.disabled = true;
}

// ====== 回答处理 ======
function handleAnswer(chosen) {
  const poemIdx = currentPoemIndex;
  if (poemIdx < 0) return;

  const isCorrect = chosen === correctChar;

  optionButtons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("disabled");
  });

  if (isCorrect) {
    correctCount++;
    feedbackEl.textContent = `✅ 太棒啦！这里应该是「${correctChar}」。`;

    // 正确：default / unfamiliar -> bullet，bullet -> bomb
    const old = getStatus(THEME_ID, poemIdx);
    let next = old;
    if (old === "default" || old === "unfamiliar") {
      next = "bullet";
    } else if (old === "bullet") {
      next = "bomb";
    }
    setStatus(THEME_ID, poemIdx, next);
    saveStatus();
  } else {
    feedbackEl.textContent = `❌ 再想想，这里应该是「${correctChar}」。`;

    // 错误：标记为非常不熟悉
    setStatus(THEME_ID, poemIdx, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  // 读取数据
  if (!window.POEMS || !Array.isArray(POEMS.spring)) {
    springPoems = [];
  } else {
    springPoems = POEMS.spring.slice();
  }

  loadStatus();

  const total = springPoems.length;
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
    const ch = btn.dataset.char || "";
    handleAnswer(ch);
  });
});

btnNext.addEventListener("click", () => {
  playClick();
  currentRound++;
  renderRound();
});

// 返回主应用
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
