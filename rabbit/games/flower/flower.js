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
let gameProgress = 0;  // 当前游戏会话的进度（已完成的诗句数量）

// ========= 增强声效系统 =========
let audioCtx = null;

// 创建音效
function createSound(frequency, duration, type = 'sine') {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    // 静默失败
  }
}

// 点击音效
function playClick() {
  createSound(880, 0.06, 'square');
}

// 翻页音效(花朵轻柔声)
function playFlip() {
  createSound(660, 0.1, 'sine');
  setTimeout(() => createSound(880, 0.08, 'sine'), 50);
}

// 标记音效(花朵绽放)
function playMark() {
  createSound(523, 0.1, 'sine');  // C
  setTimeout(() => createSound(659, 0.1, 'sine'), 80);  // E
  setTimeout(() => createSound(784, 0.15, 'sine'), 160); // G
}

// 完成音效(春天鸟鸣)
function playComplete() {
  createSound(784, 0.15, 'sine');
  setTimeout(() => createSound(988, 0.15, 'sine'), 100);
  setTimeout(() => createSound(1175, 0.2, 'sine'), 200);
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
  } catch (e) { }
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
  
  // 使用游戏进度来显示当前进度
  progressTextEl.textContent = `${gameProgress} / ${total}`;

  // 仍然显示各种状态的数量统计
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
  // 重置游戏进度为0
  gameProgress = 0;
  showFullSentence = false;
  renderCard();
  renderStatus();
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

  // 初始化花瓣系统
  initPetalSystem();
  
  // 初始化游戏结束相关事件
  initGameCompletionEvents();
}

document.addEventListener("DOMContentLoaded", initFlowerGame);

// ========= 花瓣飘落动画 =========
function createPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.textContent = ['🌸', '🌺', '🌼', '🌻'][Math.floor(Math.random() * 4)];
  petal.style.left = Math.random() * 100 + '%';
  petal.style.animationDuration = (Math.random() * 3 + 4) + 's';
  document.body.appendChild(petal);

  setTimeout(() => {
    if (petal.parentNode) {
      petal.parentNode.removeChild(petal);
    }
  }, 7000);
}

// 持续创建花瓣
function startPetalFall() {
  createPetal();
  // 每0.5-1.5秒生成一片花瓣,让飘落更频繁
  setTimeout(startPetalFall, Math.random() * 1000 + 500);
}

// 花朵绽放效果
function createBloomEffect(x, y) {
  const bloom = document.createElement('div');
  bloom.className = 'bloom-effect';
  bloom.textContent = '🌸';
  bloom.style.left = x + 'px';
  bloom.style.top = y + 'px';
  document.body.appendChild(bloom);

  setTimeout(() => {
    if (bloom.parentNode) {
      bloom.parentNode.removeChild(bloom);
    }
  }, 1000);
}

// ========= 花瓣收集系统 =========
let petalCount = 0;

function updatePetalProgress() {
  const petalCountEl = document.getElementById('petalCount');
  const petalFillEl = document.getElementById('petalFill');

  // 使用游戏进度作为花瓣数量
  petalCount = gameProgress;

  if (petalCountEl) {
    petalCountEl.textContent = petalCount;
  }

  if (petalFillEl) {
    const maxPetals = flowerPoems.length;
    const percentage = maxPetals > 0 ? Math.min(100, (petalCount / maxPetals) * 100) : 0;
    petalFillEl.style.width = percentage + '%';
  }
}

function collectPetal() {
  // 直接更新进度,会重新计算粉色数量
  updatePetalProgress();

  // 创建花瓣飘落到收集区
  const collection = document.querySelector('.petal-collection');
  if (collection) {
    const rect = collection.getBoundingClientRect();
    createBloomEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}

// 初始化花瓣系统
function initPetalSystem() {
  // 初始化时更新进度
  updatePetalProgress();

  // 立即启动花瓣飘落动画
  startPetalFall();
}

// 检查游戏是否完成
function checkGameCompletion() {
  // 基于进度是否达到100%来判断游戏是否结束
  if (gameProgress === flowerPoems.length && flowerPoems.length > 0) {
    // 游戏完成，显示汇总
    showGameCompletionSummary();
  }
}

// 显示游戏完成汇总
function showGameCompletionSummary() {
  // 统计各种标记状态的数量
  let pinkCount = 0;
  let greenCount = 0;
  let purpleCount = 0;
  
  flowerPoems.forEach((_, i) => {
    const status = getCurrentStatus(i);
    if (status === STATUS_TYPES.PINK) pinkCount++;
    if (status === STATUS_TYPES.GREEN) greenCount++;
    if (status === STATUS_TYPES.PURPLE) purpleCount++;
  });
  
  // 更新汇总显示
  document.getElementById("summaryTotal").textContent = flowerPoems.length;
  document.getElementById("summaryPink").textContent = pinkCount;
  document.getElementById("summaryGreen").textContent = greenCount;
  document.getElementById("summaryPurple").textContent = purpleCount;
  
  // 显示模态框
  const modal = document.getElementById("gameCompletionModal");
  modal.classList.add("show");
}

// 初始化游戏结束相关事件
function initGameCompletionEvents() {
  // 返回首页按钮
  document.getElementById("btnReturnHome").addEventListener("click", () => {
    window.location.href = "../../index.html";
  });
  
  // 重新开始按钮
  document.getElementById("btnRestartGame").addEventListener("click", () => {
    // 重新加载页面
    window.location.reload();
  });
}

// 增强标记函数,添加花瓣收集和自动推进
const originalMarkCurrent = markCurrent;
markCurrent = function (statusType) {
  const oldStatus = getCurrentStatus(currentIndex);
  originalMarkCurrent(statusType);

  // 每标记一句增加游戏进度
  gameProgress++;

  // 如果标记为粉色(完全记住),播放音效和动画
  if (statusType === STATUS_TYPES.PINK && oldStatus !== STATUS_TYPES.PINK) {
    collectPetal();
    playMark();
  } else if (oldStatus === STATUS_TYPES.PINK && statusType !== STATUS_TYPES.PINK) {
    // 如果取消粉色标记,更新进度
    updatePetalProgress();
  } else {
    // 其他情况也更新进度,确保同步
    updatePetalProgress();
  }
  
  // 更新进度显示
  renderStatus();
  
  // 标记完成后自动推进到下一句
  if (currentIndex < flowerPoems.length - 1) {
    currentIndex++;
    showFullSentence = false;
    renderCard();
  } else {
    // 如果已经是最后一句，检查是否所有诗句都已标记
    checkGameCompletion();
  }
};

// 增强渲染卡片,添加翻页音效
const originalRenderCard = renderCard;
renderCard = function () {
  originalRenderCard();
  playFlip();
};
