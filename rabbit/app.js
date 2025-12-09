// app.js —— 主记忆记录表逻辑

// ====== 本地存储键 ======
const STATUS_STORAGE_KEY = "poemMemoryStatus_v1";
const DISPLAY_MODE_KEY = "poemDisplayMode_v1";  // full / first
const HIGHLIGHT_MODE_KEY = "poemHighlightMode_v1"; // on / off
const CARROT_COUNT_KEY = "carrotCount_v1"; // 萝卜数量

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
let carrotCount = 0;     // 萝卜数量

// 兔子表情数组
const RABBIT_EMOJIS = ["🐰", "🐇", "🥕", "🌸", "🎉", "😊", "💕", "⭐", "🌈", "🎈"];
let currentRabbitIndex = 0;

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
const modalSoundBtn = document.getElementById("modalSoundBtn");

// 存储当前显示的诗词内容
let currentModalPoem = null;
let currentModalSentence = null;

// 萝卜收集系统DOM
const carrotCountEl = document.getElementById("carrotCount");
const progressFillEl = document.getElementById("progressFill");
const carrotHintEl = document.getElementById("carrotHint");
const achievement1 = document.getElementById("achievement1");
const achievement2 = document.getElementById("achievement2");
const achievement3 = document.getElementById("achievement3");
const achievement4 = document.getElementById("achievement4");

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
  } catch (_) { }

  try {
    const h = localStorage.getItem(HIGHLIGHT_MODE_KEY);
    if (h === "on" || h === "off") highlightOn = h === "on";
  } catch (_) { }

  try {
    const c = localStorage.getItem(CARROT_COUNT_KEY);
    if (c) carrotCount = parseInt(c, 10) || 0;
  } catch (_) { }
}

function saveStatus() {
  try {
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
  } catch (_) { }
}

function saveCarrotCount() {
  try {
    localStorage.setItem(CARROT_COUNT_KEY, carrotCount.toString());
  } catch (_) { }
}

function saveDisplayMode() {
  try {
    localStorage.setItem(DISPLAY_MODE_KEY, displayMode);
  } catch (_) { }
}

function saveHighlightMode() {
  try {
    localStorage.setItem(HIGHLIGHT_MODE_KEY, highlightOn ? "on" : "off");
  } catch (_) { }
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

// ====== 萝卜收集系统 ======
// 计算当前萝卜数量(基于所有"bomb"状态的诗句)
function calculateCarrotCount() {
  let count = 0;
  for (const key in statusMap) {
    if (statusMap[key] === "bomb") {
      count++;
    }
  }
  return count;
}

// 更新萝卜收集系统UI
function updateCarrotSystem() {
  if (!carrotCountEl) return;

  // 更新萝卜数量
  carrotCountEl.textContent = carrotCount;

  // 更新进度条
  const maxCarrots = 100; // 最大目标
  const percentage = Math.min(100, Math.floor((carrotCount / maxCarrots) * 100));
  if (progressFillEl) {
    progressFillEl.style.width = `${percentage}%`;
    progressFillEl.textContent = `${percentage}%`;
  }

  // 更新提示文本
  if (carrotHintEl) {
    if (carrotCount >= 100) {
      carrotHintEl.textContent = "🎉 恭喜!你已经收集了100个萝卜!";
    } else if (carrotCount >= 50) {
      carrotHintEl.textContent = `再收集 ${100 - carrotCount} 个萝卜就能成为萝卜大师!`;
    } else if (carrotCount >= 10) {
      carrotHintEl.textContent = `再收集 ${50 - carrotCount} 个萝卜解锁"萝卜达人"徽章! 🏆`;
    } else {
      carrotHintEl.textContent = `再收集 ${10 - carrotCount} 个萝卜解锁"萝卜新手"徽章!`;
    }
  }

  // 更新成就状态
  updateAchievements();
}

// 更新成就徽章状态
function updateAchievements() {
  // 萝卜新手: 10个萝卜
  if (achievement1) {
    if (carrotCount >= 10) {
      achievement1.classList.remove("locked");
      achievement1.classList.add("unlocked");
    } else {
      achievement1.classList.add("locked");
      achievement1.classList.remove("unlocked");
    }
  }

  // 萝卜达人: 50个萝卜
  if (achievement2) {
    if (carrotCount >= 50) {
      achievement2.classList.remove("locked");
      achievement2.classList.add("unlocked");
    } else {
      achievement2.classList.add("locked");
      achievement2.classList.remove("unlocked");
    }
  }

  // 萝卜大师: 100个萝卜
  if (achievement3) {
    if (carrotCount >= 100) {
      achievement3.classList.remove("locked");
      achievement3.classList.add("unlocked");
    } else {
      achievement3.classList.add("locked");
      achievement3.classList.remove("unlocked");
    }
  }

  // 诗词兔兔: 完成全部10个主题
  if (achievement4 && window.THEMES) {
    let allCompleted = true;
    for (const theme of THEMES) {
      if (!isThemeCompleted(theme.id)) {
        allCompleted = false;
        break;
      }
    }
    if (allCompleted) {
      achievement4.classList.remove("locked");
      achievement4.classList.add("unlocked");
    } else {
      achievement4.classList.add("locked");
      achievement4.classList.remove("unlocked");
    }
  }
}

// 添加萝卜飘落动画
function showCarrotAnimation() {
  const carrotSystem = document.getElementById("carrotSystem");
  if (!carrotSystem) return;

  // 创建飘落的萝卜
  const carrot = document.createElement("div");
  carrot.textContent = "🥕";
  carrot.style.position = "fixed";
  carrot.style.fontSize = "30px";
  carrot.style.left = `${Math.random() * 80 + 10}%`;
  carrot.style.top = "-50px";
  carrot.style.zIndex = "9999";
  carrot.style.pointerEvents = "none";
  carrot.className = "carrot-fall";

  document.body.appendChild(carrot);

  // 2秒后移除
  setTimeout(() => {
    if (carrot.parentNode) {
      carrot.parentNode.removeChild(carrot);
    }
  }, 2000);

  // 萝卜计数添加脉冲动画
  if (carrotCountEl) {
    carrotCountEl.classList.add("pulse");
    setTimeout(() => {
      carrotCountEl.classList.remove("pulse");
    }, 500);
  }
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
  const themeName = themeMeta ? themeMeta.name : currentThemeId;
  currentThemeTitleEl.textContent = themeName;

  // 控制“当前主题小游戏”按钮显隐
  if (flowerGameBtn) {
    if (GAME_THEMES.includes(currentThemeId)) {
      flowerGameBtn.style.display = "inline-flex";
      // 只显示游戏手柄图标
      flowerGameBtn.textContent = "🎮";
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
    eyeBtn.innerHTML = "🔍";
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

      // 萝卜收集逻辑
      const oldCarrotCount = carrotCount;
      carrotCount = calculateCarrotCount();

      // 如果萝卜数量增加,显示动画
      if (carrotCount > oldCarrotCount) {
        showCarrotAnimation();
      }

      saveCarrotCount();
      updateCarrotSystem();
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
  
  // 添加诗人头像
  addPoetAvatar(author);
  
  // 掉落更多萝卜
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      showCarrotAnimation();
    }, i * 100);
  }
  
  // 存储当前显示的诗词内容
  currentModalPoem = poem;
  currentModalSentence = sentence;
}

// 为模态窗口添加诗人头像
function addPoetAvatar(author) {
  // 这里可以根据诗人名字添加不同的头像
  // 暂时使用默认头像，后续可以扩展为根据诗人名字加载不同头像
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random&color=fff&size=128`;
  
  // 检查是否已有头像，如果有则更新，没有则添加
  let avatarEl = modalDialog.querySelector('.modal-avatar');
  if (!avatarEl) {
    avatarEl = document.createElement('div');
    avatarEl.className = 'modal-avatar';
    avatarEl.style.position = 'relative';
    avatarEl.style.margin = '0 auto 20px';
    avatarEl.style.width = '80px';
    avatarEl.style.height = '80px';
    avatarEl.style.borderRadius = '50%';
    avatarEl.style.border = '3px solid white';
    avatarEl.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    avatarEl.style.zIndex = '1001';
    
    // 将头像插入到模态框内容的最前面
    modalDialog.insertBefore(avatarEl, modalTitleEl);
  }
  
  avatarEl.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
}

// 朗读诗词函数
function readPoem() {
  if (!currentModalPoem) return;
  
  // 检查浏览器是否支持语音合成
  if ('speechSynthesis' in window) {
    // 先停止当前可能正在进行的朗读
    speechSynthesis.cancel();
    
    // 创建语音合成对象
    const utterance = new SpeechSynthesisUtterance(currentModalPoem.sentence);
    utterance.lang = 'zh-CN'; // 设置为中文
    utterance.rate = 0.9; // 设置语速
    
    // 开始朗读
    speechSynthesis.speak(utterance);
  }
}

function closeModal() {
  modalOverlay.classList.remove("active");
  // 清空当前存储的诗词内容
  currentModalPoem = null;
  currentModalSentence = null;
}

modalCloseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  playClick();
  closeModal();
});

// 为声音按钮添加点击事件监听器
if (modalSoundBtn) {
  modalSoundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    playClick();
    readPoem();
  });
}

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
carrotCount = calculateCarrotCount(); // 根据现有状态计算萝卜数
renderDisplayModeButtons();
renderHighlightButtons();
renderSidebar();
renderPoems();
updateCarrotSystem(); // 初始化萝卜收集系统UI

// ====== 兔子Logo点击切换表情 ======
const rabbitLogo = document.querySelector(".sidebar-rabbit");
if (rabbitLogo) {
  rabbitLogo.style.cursor = "pointer";
  rabbitLogo.addEventListener("click", () => {
    playClick();
    currentRabbitIndex = (currentRabbitIndex + 1) % RABBIT_EMOJIS.length;
    rabbitLogo.textContent = RABBIT_EMOJIS[currentRabbitIndex];
    // 添加跳跃动画
    rabbitLogo.classList.add("rabbit-hop");
    setTimeout(() => {
      rabbitLogo.classList.remove("rabbit-hop");
    }, 600);
  });
}
