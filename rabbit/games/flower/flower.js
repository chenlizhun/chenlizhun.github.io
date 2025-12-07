// games/flower/flower.js

// 使用与主 App 相同的本地存储键，保证状态同步
// 如果你的主 App 用的是别的 key，请把下面这行改成同一个
const STORAGE_KEY = "poemMemoryStatus_v1";

// 状态枚举：和主 App 内部约定保持一致
// default: 黑色（未标记）
// bomb:    粉色（完全记住）
// bullet:  绿色（差不多记住）
// unfamiliar: 紫色（非常不熟悉）
const STATUS_TYPES = {
  PINK: "bomb",
  GREEN: "bullet",
  PURPLE: "unfamiliar"
};

let statusMap = {};
let flowerPoems = [];  // 实际的“花”主题诗句集合
let currentIndex = 0;
let showFullSentence = false;

// ========= 点击音效 =========
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
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    // 静默失败
  }
}

// ========= localStorage 状态读写 =========
function loadStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      statusMap = JSON.parse(raw) || {};
    } else {
      statusMap = {};
    }
  } catch (e) {
    statusMap = {};
  }
}

function saveStatus() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
  } catch (e) {}
}

// ========= 工具函数 =========
function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 关键字高亮（沿用主 App 的 HIGHLIGHT_CHARS，如果没有就退化为不高亮）
function highlightSentence(sentence) {
  const text = sentence || "";
  const safe = escapeHtml(text);

  if (!Array.isArray(window.HIGHLIGHT_CHARS) || HIGHLIGHT_CHARS.length === 0) {
    return safe;
  }
  const pattern = new RegExp("[" + HIGHLIGHT_CHARS.join("") + "]", "g");
  return safe.replace(pattern, m => `<span class="highlight-word">${m}</span>`);
}

// 当前诗句的存储 key：与主 App 约定保持一致
function poemKey(index) {
  // 在主 App 里每条诗的 key 采用 `${themeId}-${index}` 的方式
  // 这里对应 themeId = "flower"
  return `flower-${index}`;
}

// 读当前诗句状态
function getCurrentStatus(index) {
  const key = poemKey(index);
  return statusMap[key] || "default";
}

// 写当前诗句状态
function setCurrentStatus(index, status) {
  const key = poemKey(index);
  statusMap[key] = status;
  saveStatus();
}

// 统计“花”主题下各状态数量
function countStatuses() {
  let pink = 0;
  let green = 0;
  let purple = 0;

  flowerPoems.forEach((_, i) => {
    const st = getCurrentStatus(i);
    if (st === STATUS_TYPES.PINK) pink++;
    else if (st === STATUS_TYPES.GREEN) green++;
    else if (st === STATUS_TYPES.PURPLE) purple++;
  });

  return { pink, green, purple };
}

// 随机打乱数组（如果你后面想要随机顺序可以用）
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========= 关键：根据 data.js 的真实结构找到“花”主题的诗 =========
function detectFlowerPoemsFromPOEMS() {
  if (!window.POEMS) {
    console.warn("未找到全局变量 POEMS（请确认 data.js 是否正确加载）");
    return [];
  }

  // 情况 1：POEMS 是对象形式，带有 POEMS.flower
  if (Array.isArray(POEMS.flower)) {
    console.log("POEMS 结构：对象形式，有 .flower，使用 POEMS.flower");
    return POEMS.flower.slice();
  }

  // 情况 2：POEMS 是一个大数组，通过 topic/theme 过滤
  if (Array.isArray(POEMS)) {
    console.log("POEMS 结构：数组形式，通过 topic/theme 过滤 'flower'");
    return POEMS.filter(p =>
      p.topic === "flower" ||    // 例如 topic: "flower"
      p.theme === "花" ||        // 例如 theme: "花"
      p.theme === "flower"       // 兼容 theme: "flower"
    );
  }

  console.warn("POEMS 结构未知，无法获取 flower 主题：", POEMS);
  return [];
}

// ========= 渲染整体状态 =========
function renderStatus() {
  const progressTextEl = document.getElementById("progressText");
  const countPinkEl = document.getElementById("countPink");
  const countGreenEl = document.getElementById("countGreen");
  const countPurpleEl = document.getElementById("countPurple");

  const total = flowerPoems.length;
  const idx = total === 0 ? 0 : currentIndex + 1;

  progressTextEl.textContent = `${idx} / ${total}`;

  const { pink, green, purple } = countStatuses();
  countPinkEl.textContent = pink;
  countGreenEl.textContent = green;
  countPurpleEl.textContent = purple;
}

// ========= 渲染当前卡片 =========
function renderCard() {
  const metaEl = document.getElementById("cardMeta");
  const sentenceEl = document.getElementById("cardSentence");
  const btnToggleShow = document.getElementById("btnToggleShow");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const total = flowerPoems.length;
  if (total === 0) {
    metaEl.textContent = "未找到“花”主题的诗句，请检查 data.js 中的 POEMS 结构。";
    sentenceEl.textContent = "——";
    btnToggleShow.disabled = true;
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }

  // 修正索引范围
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= total) currentIndex = total - 1;

  const poem = flowerPoems[currentIndex];
  metaEl.textContent = `${poem.dynasty || ""}·${poem.author || ""}《${poem.title || ""}》`;

  if (showFullSentence) {
    sentenceEl.innerHTML = highlightSentence(poem.text || poem.sentence || "");
    btnToggleShow.textContent = "隐藏为首字";
  } else {
    const s = poem.text || poem.sentence || "";
    const firstChar = s.charAt(0) || "？";
    sentenceEl.textContent = firstChar;
    btnToggleShow.textContent = "显示完整诗句";
  }

  // 按钮状态
  btnToggleShow.disabled = false;
  btnPrev.disabled = (currentIndex === 0);
  btnNext.disabled = (currentIndex === total - 1);

  renderStatus();
}

// ========= 标记当前诗句记忆程度 =========
function markCurrent(statusType) {
  const total = flowerPoems.length;
  if (total === 0) return;

  setCurrentStatus(currentIndex, statusType);
  renderStatus();
}

// ========= 启动 / 继续练习 =========
function startPractice() {
  if (flowerPoems.length === 0) return;
  showFullSentence = false;
  renderCard();
}

// ========= 返回主诗词库 =========
function backToMain() {
  try {
    // 如果嵌在 iframe 中，尝试通知父页面关闭游戏
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "closeGame", from: "flower-game" }, "*");
    } else {
      // 否则直接尝试回退或跳转到根目录
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "../../index.html";
      }
    }
  } catch (e) {
    window.location.href = "../../index.html";
  }
}

// ========= 初始化 =========
function initFlowerGame() {
  // 自动根据 data.js 的 POEMS 结构，拿到“花”主题诗句
  flowerPoems = detectFlowerPoemsFromPOEMS();

  loadStatus();

  const btnStart = document.getElementById("btnStart");
  const btnBack = document.getElementById("btnBack");
  const btnToggleShow = document.getElementById("btnToggleShow");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnMarkPink = document.getElementById("btnMarkPink");
  const btnMarkGreen = document.getElementById("btnMarkGreen");
  const btnMarkPurple = document.getElementById("btnMarkPurple");

  btnStart.addEventListener("click", () => {
    playClick();
    startPractice();
  });

  btnBack.addEventListener("click", () => {
    playClick();
    backToMain();
  });

  btnToggleShow.addEventListener("click", () => {
    playClick();
    showFullSentence = !showFullSentence;
    renderCard();
  });

  btnPrev.addEventListener("click", () => {
    playClick();
    currentIndex--;
    showFullSentence = false;
    renderCard();
  });

  btnNext.addEventListener("click", () => {
    playClick();
    currentIndex++;
    showFullSentence = false;
    renderCard();
  });

  btnMarkPink.addEventListener("click", () => {
    playClick();
    markCurrent(STATUS_TYPES.PINK);
  });

  btnMarkGreen.addEventListener("click", () => {
    playClick();
    markCurrent(STATUS_TYPES.GREEN);
  });

  btnMarkPurple.addEventListener("click", () => {
    playClick();
    markCurrent(STATUS_TYPES.PURPLE);
  });

  // 初始只渲染统计，不自动显示诗句
  renderStatus();
}

document.addEventListener("DOMContentLoaded", initFlowerGame);
