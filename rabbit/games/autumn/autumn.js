// games/autumn/autumn.js

const THEME_ID = "autumn";
const STORAGE_KEY = "poemMemoryStatus_v1";

// DOM 引用
const roundInfoEl = document.getElementById("roundInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const poemMetaEl = document.getElementById("poemMeta");
const assembledTextEl = document.getElementById("assembledText");
const feedbackEl = document.getElementById("feedback");
const fragmentsAreaEl = document.getElementById("fragmentsArea");
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
    osc.frequency.value = 820;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (_) {}
}

// 本小游戏数据
let autumnPoems = [];
let orderIndices = [];
let currentRound = 0;
let correctCount = 0;

let currentPoemIndex = -1;
let correctFragments = [];   // 正确顺序的碎片
let chosenFragments = [];    // 孩子当前选择的碎片（按顺序）

// 与主 App 共用的状态表
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

// 按标点拆分为碎片：优先“，” “、” “；”，否则按字数切分
function splitSentenceIntoFragments(sentence) {
  const s = (sentence || "").trim();
  if (!s) return [];

  // 去掉句末句号等
  let trimmed = s.replace(/[。？！.!?；;]+$/g, "");

  // 如果有“，” 或 “、” 或 “；” 就按这些拆
  if (/[，、；]/.test(trimmed)) {
    const parts = trimmed
      .split(/[，、；]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length >= 2) return parts;
  }

  // 否则按汉字长度做均分（2～4 个碎片）
  const pure = trimmed.replace(/[，。？！,.!?；;]/g, "");
  const chars = pure.split("");
  const len = chars.length;

  if (len <= 4) {
    return [pure];
  }

  // 尽量切成 2 或 3 或 4 片
  const targetPieces = len <= 8 ? 2 : len <= 12 ? 3 : 4;
  const size = Math.floor(len / targetPieces);
  const fragments = [];
  for (let i = 0; i < targetPieces; i++) {
    const start = i * size;
    const end = i === targetPieces - 1 ? len : (i + 1) * size;
    fragments.push(chars.slice(start, end).join(""));
  }
  return fragments.filter((p) => p.length > 0);
}

// 显示组装好的句子
function updateAssembledText() {
  if (!chosenFragments.length) {
    assembledTextEl.textContent = "（尚未选择）";
  } else {
    assembledTextEl.textContent = chosenFragments.join(" / ");
  }
}

// ====== 渲染某一题 ======
function renderRound() {
  const total = autumnPoems.length;
  if (total === 0) {
    roundInfoEl.textContent = "暂无秋主题诗词，请检查 data.js";
    assembledTextEl.textContent = "——";
    poemMetaEl.textContent = "";
    feedbackEl.textContent = "请返回主页面。";
    fragmentsAreaEl.innerHTML = "";
    btnCheck.disabled = true;
    btnNext.disabled = true;
    btnReset.disabled = true;
    return;
  }

  if (currentRound >= total) {
    currentRound = 0;
  }

  const poemIndex = orderIndices[currentRound];
  currentPoemIndex = poemIndex;
  const poem = autumnPoems[poemIndex];
  const sentence = poem.sentence || poem.text || "";

  const fragments = splitSentenceIntoFragments(sentence);
  correctFragments = fragments.slice();
  chosenFragments = [];

  roundInfoEl.textContent = `第 ${currentRound + 1} / ${total} 题`;
  scoreInfoEl.textContent = `已答对：${correctCount} 题`;
  poemMetaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;

  updateAssembledText();
  feedbackEl.textContent = "";

  // 渲染碎片按钮
  fragmentsAreaEl.innerHTML = "";
  const shuffledFragments = shuffle(fragments);

  shuffledFragments.forEach((frag, idx) => {
    const btn = document.createElement("button");
    btn.className = "fragment-btn";
    btn.textContent = frag;
    btn.dataset.fragIndex = String(idx);
    btn.dataset.fragText = frag;

    btn.addEventListener("click", () => {
      playClick();
      if (btn.classList.contains("used")) return;
      btn.classList.add("used");
      chosenFragments.push(frag);
      updateAssembledText();
      feedbackEl.textContent = "";
    });

    fragmentsAreaEl.appendChild(btn);
  });

  btnReset.disabled = false;
  btnCheck.disabled = false;
  btnNext.disabled = true;
}

// ====== 重置本题 ======
function resetCurrentRound() {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;
  renderRound(); // 重新渲染当前题
}

// ====== 检查答案 ======
function checkAnswer() {
  const poemIndex = currentPoemIndex;
  if (poemIndex < 0) return;

  const totalFrag = correctFragments.length;
  if (chosenFragments.length < totalFrag) {
    feedbackEl.textContent = "还没有选完所有碎片哦，再想一想～";
    return;
  }

  // 忽略“/”和空格，只比较汉字
  const correctPlain = correctFragments.join("").replace(/\s/g, "");
  const userPlain = chosenFragments.join("").replace(/\s/g, "");

  const isCorrect = correctPlain === userPlain;

  if (isCorrect) {
    correctCount++;
    feedbackEl.textContent = "✅ 太棒啦！你拼对了这句秋天的诗～";

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
      "❌ 这次顺序还不太对，可以点“重置本题”再试一试。";

    setStatus(THEME_ID, poemIndex, "unfamiliar");
    saveStatus();
  }

  scoreInfoEl.textContent = `已答对：${correctCount} 题`;

  // 禁止继续选碎片
  const allBtns = fragmentsAreaEl.querySelectorAll(".fragment-btn");
  allBtns.forEach((btn) => {
    btn.disabled = true;
  });

  btnNext.disabled = false;
}

// ====== 初始化 ======
function initGame() {
  if (!window.POEMS || !Array.isArray(POEMS.autumn)) {
    autumnPoems = [];
  } else {
    autumnPoems = POEMS.autumn.slice();
  }

  loadStatus();

  const total = autumnPoems.length;
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
