// app.js —— 主记忆记录表逻辑

// ====== 本地存储键 ======
const STATUS_STORAGE_KEY = "poemMemoryStatus_v1";
const DISPLAY_MODE_KEY = "poemDisplayMode_v1";  // full / first
const HIGHLIGHT_MODE_KEY = "poemHighlightMode_v1"; // on / off

// 状态顺序：黑 → 粉 → 绿 → 紫 → 黑
const STATUS_ORDER = ["default", "bomb", "bullet", "unfamiliar"];

// 哪些主题已经有小游戏
// 10 个主题的小游戏（提前占位）
const GAME_THEMES = [
  "flower",   // 花 ✅ 已完成
  "spring",   // 春 ✅ 已完成
  "autumn",   // 秋
  "moon",     // 月
  "mountain", // 山
  "water",    // 水
  "wind",     // 风
  "bird",     // 鸟
  "number",   // 数字
  "color"     // 颜色
];

// ====== 状态 / 模式变量 ======
let statusMap = {};      // { "flower-0": "bomb", ... }
let displayMode = "full";
let highlightOn = true;
let currentThemeId = "flower";

// ====== DOM 引用 ======
const sidebarEl = document.querySelector(".sidebar");
const poemListEl = document.getElementById("poemList");
const currentThemeTitleEl = document.getElementById("currentThemeTitle");
const flowerGameBtn = document.getElementById("flowerGameBtn");

const displayModeButtons = document.querySelectorAll(".mode-btn[data-mode]");
const highlightButtons = document.querySelectorAll(".mode-btn[data-highlight]");

const modalOverlay = document.getElementById("modalOverlay");
const modalDialog = document.getElementById("modalDialog");
const modalTitleEl = document.getElementById("modalTitle");
const modalSentenceEl = document.getElementById("modalSentence");
const modalMetaEl = document.getElementById("modalMeta");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// ====== 点击音效 ======
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
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // 静默失败
  }
}

// ====== 本地存储的读写 ======
function loadState() {
  try {
    const raw = localStorage.getItem(STATUS_STORAGE_KEY);
    if (raw) statusMap = JSON.parse(raw) || {};
  } catch (_) {
    statusMap = {};
  }

  try {
    const m = localStorage.getItem(DISPLAY_MODE_KEY);
    if (m === "full" || m === "first") displayMode = m;
  } catch (_) {}

  try {
    const h = localStorage.getItem(HIGHLIGHT_MODE_KEY);
    if (h === "on" || h === "off") highlightOn = h === "on";
  } catch (_) {}
}

function saveStatus() {
  try {
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
  } catch (_) {}
}

function saveDisplayMode() {
  try {
    localStorage.setItem(DISPLAY_MODE_KEY, displayMode);
  } catch (_) {}
}

function saveHighlightMode() {
  try {
    localStorage.setItem(HIGHLIGHT_MODE_KEY, highlightOn ? "on" : "off");
  } catch (_) {}
}

// ====== 工具函数 ======
function getNextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return STATUS_ORDER[0];
  return STATUS_ORDER[idx + 1];
}

function getStatusKey(themeId, index) {
  return `${themeId}-${index}`;
}

function getStatus(themeId, index) {
  const key = getStatusKey(themeId, index);
  return statusMap[key] || "default";
}

function setStatus(themeId, index, status) {
  const key = getStatusKey(themeId, index);
  statusMap[key] = status;
}

// 简单 HTML 转义
function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 高亮逻辑：根据 HIGHLIGHT_CHARS
function highlightSentence(text) {
  if (!highlightOn) {
    return escapeHtml(text);
  }
  if (!Array.isArray(window.HIGHLIGHT_CHARS) || HIGHLIGHT_CHARS.length === 0) {
    return escapeHtml(text);
  }
  const pattern = new RegExp("[" + HIGHLIGHT_CHARS.join("") + "]", "g");
  const safe = escapeHtml(text);
  return safe.replace(pattern, (m) => `<span class="highlight-word">${m}</span>`);
}

// 根据显示模式生成显示内容
function renderSentenceText(sentence) {
  let t = sentence || "";
  if (displayMode === "first") {
    t = t.charAt(0) || "";
  }
  return highlightSentence(t);
}

// 某主题是否全部为“bomb”
function isThemeCompleted(themeId) {
  const list = (window.POEMS && POEMS[themeId]) || [];
  if (!list.length) return false;
  for (let i = 0; i < list.length; i++) {
    const st = getStatus(themeId, i);
    if (st !== "bomb") return false;
  }
  return true;
}

// ====== 渲染侧边栏 ======
function renderSidebar() {
  if (!window.THEMES) return;

  const titleNode = sidebarEl.querySelector(".sidebar-title");
  sidebarEl.innerHTML = "";
  sidebarEl.appendChild(titleNode);

  THEMES.forEach((theme) => {
    const btn = document.createElement("button");
    btn.className = "theme-btn";
    if (theme.id === currentThemeId) btn.classList.add("active");
    btn.dataset.themeId = theme.id;

    const list = (window.POEMS && POEMS[theme.id]) || [];
    const count = list.length;
    const completed = isThemeCompleted(theme.id);

    const mainSpan = document.createElement("span");
    mainSpan.className = "theme-main";

    const nameSpan = document.createElement("span");
    nameSpan.className = "theme-name";
    nameSpan.textContent = theme.name;

    const countSpan = document.createElement("span");
    countSpan.className = "theme-count";
    countSpan.textContent = `（${count}）`;

    mainSpan.appendChild(nameSpan);
    mainSpan.appendChild(countSpan);

    const rightSpan = document.createElement("span");
    rightSpan.className = "theme-right";
    if (completed) {
      const dot = document.createElement("span");
      dot.className = "theme-complete-dot";
      rightSpan.appendChild(dot);
    }

    btn.appendChild(mainSpan);
    btn.appendChild(rightSpan);
    sidebarEl.appendChild(btn);

    btn.addEventListener("click", () => {
      playClick();
      currentThemeId = theme.id;
      renderSidebar();
      renderPoems();
    });
  });
}

// ====== 渲染显示模式按钮 / 高亮按钮 ======
function renderDisplayModeButtons() {
  displayModeButtons.forEach((btn) => {
    const m = btn.dataset.mode;
    if (m === displayMode) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

function renderHighlightButtons() {
  highlightButtons.forEach((btn) => {
    const h = btn.dataset.highlight;
    const isOn = h === "on";
    if (isOn === highlightOn) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// ====== 渲染诗列表 ======
function renderPoems() {
  const themeMeta = (window.THEMES || []).find((t) => t.id === currentThemeId);
  currentThemeTitleEl.textContent = `主题：${themeMeta ? themeMeta.name : currentThemeId}`;

  // 控制“当前主题小游戏”按钮显隐
  if (flowerGameBtn) {
    if (GAME_THEMES.includes(currentThemeId)) {
      flowerGameBtn.style.display = "inline-flex";
      // 文案跟着主题走，例如：花的小游戏 / 春的小游戏
      const themeName = themeMeta ? themeMeta.name : "";
      flowerGameBtn.textContent = `🎮 ${themeName}的小游戏`;
    } else {
      flowerGameBtn.style.display = "none";
    }
  }

  poemListEl.innerHTML = "";
  const list = (window.POEMS && POEMS[currentThemeId]) || [];

  list.forEach((poem, index) => {
    const key = getStatusKey(currentThemeId, index);
    const currentStatus = statusMap[key] || "default";

    const li = document.createElement("li");
    li.className = `poem-item status-${currentStatus}`;
    li.dataset.key = key;

    const idxDiv = document.createElement("div");
    idxDiv.className = "poem-index";
    idxDiv.textContent = `${index + 1}.`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "poem-content";

    const sentenceDiv = document.createElement("div");
    sentenceDiv.className = "poem-sentence";
    const sentence = poem.sentence || poem.text || "";
    sentenceDiv.innerHTML = renderSentenceText(sentence);

    const metaDiv = document.createElement("div");
    metaDiv.className = "poem-meta";
    const dynasty = poem.dynasty || "";
    const author = poem.author || "";
    const title = poem.title || "";
    metaDiv.textContent = `${dynasty}·${author}《${title}》`;

    contentDiv.appendChild(sentenceDiv);
    contentDiv.appendChild(metaDiv);

    const eyeDiv = document.createElement("div");
    eyeDiv.className = "poem-eye";
    const eyeBtn = document.createElement("button");
    eyeBtn.className = "eye-btn";
    eyeBtn.innerHTML = "👁";
    eyeBtn.title = "放大查看";
    eyeDiv.appendChild(eyeBtn);

    // 点击整行：切换状态
    li.addEventListener("click", () => {
      playClick();
      const oldStatus = statusMap[key] || "default";
      const next = getNextStatus(oldStatus);
      setStatus(currentThemeId, index, next);
      saveStatus();
      li.className = `poem-item status-${next}`;
      renderSidebar(); // 更新左侧完成绿点
    });

    // 眼睛按钮：打开 Modal，阻止冒泡
    eyeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playClick();
      openModal(poem, sentence);
    });

    li.appendChild(idxDiv);
    li.appendChild(contentDiv);
    li.appendChild(eyeDiv);
    poemListEl.appendChild(li);
  });
}

// ====== Modal 操作 ======
function openModal(poem, sentence) {
  const dynasty = poem.dynasty || "";
  const author = poem.author || "";
  const title = poem.title || "";
  const theme = poem.theme || "";

  modalTitleEl.textContent = `${dynasty}·${author}《${title}》`;
  modalSentenceEl.innerHTML = highlightSentence(sentence || "");
  modalMetaEl.textContent = theme ? `主题：${theme}` : "";
  modalOverlay.classList.add("active");
}

function closeModal() {
  modalOverlay.classList.remove("active");
}

modalCloseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  playClick();
  closeModal();
});

modalOverlay.addEventListener("click", () => {
  playClick();
  closeModal();
});

modalDialog.addEventListener("click", (e) => {
  e.stopPropagation(); // 防止点击内容关闭
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    playClick();
    closeModal();
  }
});

// ====== 显示模式 & 高亮模式事件 ======
displayModeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (mode !== displayMode && (mode === "full" || mode === "first")) {
      playClick();
      displayMode = mode;
      saveDisplayMode();
      renderDisplayModeButtons();
      renderPoems();
    }
  });
});

highlightButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const h = btn.dataset.highlight;
    const newOn = h === "on";
    if (newOn !== highlightOn) {
      playClick();
      highlightOn = newOn;
      saveHighlightMode();
      renderHighlightButtons();
      renderPoems();
    }
  });
});

// ====== 当前主题小游戏入口 ======
if (flowerGameBtn) {
  flowerGameBtn.addEventListener("click", () => {
    playClick();

    // 只有在已有小游戏的主题下才响应
    if (!GAME_THEMES.includes(currentThemeId)) return;

    // 根据当前主题跳转，例如：
    // flower -> games/flower/index.html
    // spring -> games/spring/index.html
    const url = `games/${currentThemeId}/index.html`;
    window.location.href = url;
  });
}

// ====== 初始化 ======
loadState();
renderDisplayModeButtons();
renderHighlightButtons();
renderSidebar();
renderPoems();
