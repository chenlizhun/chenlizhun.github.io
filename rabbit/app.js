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
// 先声明变量，后续在DOMContentLoaded中初始化
let sidebarEl;
let poemListEl;
let currentThemeTitleEl;
let flowerGameBtn;
let gameCenterTopBtn;

// 新添加的DOM引用
let gameCenterBtn;
let rabbitParkBtn;
let gameCenterModal;
let gameCenterCloseBtn;
let rabbitParkModal;
let rabbitParkCloseBtn;

let displayModeButtons;
let highlightButtons;

let modalOverlay;
let modalDialog;
let modalTitleEl;
let modalSentenceEl;
let modalMetaEl;
let modalCloseBtn;
let modalSoundBtn;
 

// 存储当前显示的诗词内容
let currentModalPoem = null;
let currentModalSentence = null;
 

// 萝卜收集系统DOM
let carrotCountEl;
let progressFillEl;
let carrotHintEl;
let achievement1;
let achievement2;
let achievement3;
let achievement4;
let secretGCount = 0;
let secretGTimer = null;
let longPressTimer = null;
let konamiIndex = 0;
const KONAMI_SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let secretFCount = 0;
let secretFTimer = null;
let secretCCount = 0;
let secretCTimer = null;
let secretMCount = 0;
let secretMTimer = null;
let secretRCount = 0;
let secretRTimer = null;
let titleClickCount = 0;
let titleClickTimer = null;
let nightOverlayEl = null;
let hiddenThemeEnabled = false;
let rabbitClickCount = 0;
let rabbitClickTimer = null;
let a1Unlocked = false;
let a2Unlocked = false;
let a3Unlocked = false;
let a4Unlocked = false;
let typeWriterTimer = null;
let typeWriterIndex = 0;
let startHarvestBtn;
let harvestAreaEl;
let harvestScoreEl;
let memoryStartBtn;
let memorySeqEl;
let memoryOptionsEl;
let memoryStatusEl;
let harvestTimer = null;
let harvestScore = 0;
let memorySeq = [];
let memoryInput = [];

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

// 游戏信息配置
const GAME_INFO = {
  "flower": { name: "花朵连连看", icon: "🌸", available: true, description: "找出相同的花朵" },
  "spring": { name: "春天猜谜", icon: "🌱", available: true, description: "猜春天的诗句" },
  "autumn": { name: "秋天拼图", icon: "🍂", available: false, description: "秋天诗句拼图" },
  "moon": { name: "月亮找朋友", icon: "🌙", available: false, description: "月亮主题游戏" },
  "mountain": { name: "山山水水", icon: "⛰️", available: false, description: "山水诗句游戏" },
  "water": { name: "水滴连线", icon: "💧", available: false, description: "水系诗句游戏" },
  "wind": { name: "和风送诗", icon: "💨", available: false, description: "风系诗句游戏" },
  "bird": { name: "小鸟找家", icon: "🐦", available: false, description: "鸟类诗句游戏" },
  "number": { name: "数字诗词", icon: "🔢", available: false, description: "数字诗句游戏" },
  "color": { name: "颜色大挑战", icon: "🎨", available: true, description: "颜色识别游戏" }
};
 

// 兔子乐园的惊喜消息
const SURPRISE_MESSAGES = [
  "哇！你发现了隐藏的胡萝卜！🥕",
  "兔兔送你一个大大的拥抱！🤗",
  "今天天气真好，一起去玩吗？☀️",
  "你是最棒的小朋友！👍",
  "魔法兔子变变变！✨",
  "谢谢你陪兔兔玩！❤️",
  "祝你天天开心！😊",
  "学习诗词真有趣！📚"
];

// 彩虹魔法的颜色效果
const RAINBOW_COLORS = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

// ====== 音效系统扩展 ======
function initAudioContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      audioCtx = new AC();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

 

// 兔子乐园特效音效
function playMagicSound() {
  try {
    initAudioContext();
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    // 静默失败
  }
}

// 彩虹魔法音效
function playRainbowSound() {
  try {
    initAudioContext();
    if (!audioCtx) return;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = 330;
    osc2.frequency.value = 440;
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.0);
    osc2.stop(now + 1.0);
  } catch (e) {
    // 静默失败
  }
}

// ====== 小游戏中心功能 ======
function renderGameCenter() {
  const gameGridEl = document.getElementById("gameGrid");
  if (!gameGridEl) return;
  
  gameGridEl.innerHTML = "";
  
  GAME_THEMES.forEach(theme => {
    const game = GAME_INFO[theme];
    const gameEl = document.createElement("button");
    gameEl.className = "game-item coming-soon";
    gameEl.innerHTML = `
      <span class="game-item-icon">${game.icon}</span>
      <div class="game-item-name">${game.name}</div>
      <div class="game-item-status">� 正在开放中</div>
    `;
    gameEl.addEventListener("click", () => {
      playClick();
      alert(`"${game.name}" 正在开放中，稍后即可体验！🎉`);
    });
    gameGridEl.appendChild(gameEl);
  });
}

// ====== 兔子乐园功能 ======
function changeRabbitEmoji() {
  const magicRabbitEl = document.getElementById("magicRabbit");
  const parkMessageEl = document.getElementById("parkMessage");
  if (!magicRabbitEl || !parkMessageEl) return;
  
  currentRabbitIndex = (currentRabbitIndex + 1) % RABBIT_EMOJIS.length;
  magicRabbitEl.textContent = RABBIT_EMOJIS[currentRabbitIndex];
  magicRabbitEl.classList.add("rabbit-transform");
  playMagicSound();
  
  setTimeout(() => {
    magicRabbitEl.classList.remove("rabbit-transform");
  }, 500);
  
  parkMessageEl.textContent = "兔兔变成了" + RABBIT_EMOJIS[currentRabbitIndex] + "！";
}

function showSurprise() {
  const magicRabbitEl = document.getElementById("magicRabbit");
  const parkMessageEl = document.getElementById("parkMessage");
  if (!magicRabbitEl || !parkMessageEl) return;
  
  const randomMessage = SURPRISE_MESSAGES[Math.floor(Math.random() * SURPRISE_MESSAGES.length)];
  parkMessageEl.textContent = randomMessage;
  magicRabbitEl.classList.add("surprise-effect");
  playMagicSound();
  
  setTimeout(() => {
    magicRabbitEl.classList.remove("surprise-effect");
  }, 600);
}

function activateRainbowMagic() {
  const magicRabbitEl = document.getElementById("magicRabbit");
  const parkMessageEl = document.getElementById("parkMessage");
  if (!magicRabbitEl || !parkMessageEl) return;
  
  playRainbowSound();
  magicRabbitEl.classList.add("rainbow-effect");
  parkMessageEl.textContent = "彩虹魔法激活！🌈✨";
  
  // 改变兔子颜色
  let colorIndex = 0;
  const colorInterval = setInterval(() => {
    magicRabbitEl.style.color = RAINBOW_COLORS[colorIndex];
    colorIndex = (colorIndex + 1) % RAINBOW_COLORS.length;
  }, 100);
  
  setTimeout(() => {
    clearInterval(colorInterval);
    magicRabbitEl.style.color = "";
    magicRabbitEl.classList.remove("rainbow-effect");
    parkMessageEl.textContent = "魔法结束啦！😊";
  }, 2000);
}

function startHarvest(){
  const area=document.getElementById("harvestArea");
  const scoreEl=document.getElementById("harvestScore");
  const msg=document.getElementById("parkMessage");
  if(!area||!scoreEl) return;
  harvestScore=0;
  scoreEl.textContent=harvestScore;
  if(msg) msg.textContent="开始收获！";
  let count=0;
  clearInterval(harvestTimer);
  harvestTimer=setInterval(()=>{
    if(count++>20){clearInterval(harvestTimer);return;}
    const el=document.createElement("div");
    el.className="harvest-carrot";
    el.textContent="🥕";
    const w=area.clientWidth; const h=area.clientHeight;
    el.style.left=Math.floor(Math.random()*(w-40))+"px";
    el.style.top=Math.floor(Math.random()*(h-40))+"px";
    el.addEventListener("click",()=>{harvestScore++;scoreEl.textContent=harvestScore;el.remove();});
    area.appendChild(el);
    setTimeout(()=>{el.remove();},1500);
  },500);
}

function startMemory(){
  const seqEl=document.getElementById("memorySeq");
  const optsEl=document.getElementById("memoryOptions");
  const statusEl=document.getElementById("memoryStatus");
  if(!seqEl||!optsEl||!statusEl) return;
  const pool=["🥕","🌸","🐰","⭐","🍀","🌙"];
  memorySeq=Array.from({length:4},()=>pool[Math.floor(Math.random()*pool.length)]);
  memoryInput=[];
  statusEl.textContent="记忆中…";
  seqEl.textContent="";
  seqEl.style.display="block";
  optsEl.style.display="block";
  optsEl.innerHTML="";
  let idx=0;
  const showTimer=setInterval(()=>{
    if(idx>=memorySeq.length){clearInterval(showTimer);statusEl.textContent="请按顺序点选";renderMemoryOptions(pool);return;}
    seqEl.textContent+=memorySeq[idx];
    idx++;
  },500);
}

function renderMemoryOptions(pool){
  const optsEl=document.getElementById("memoryOptions");
  if(!optsEl) return;
  optsEl.innerHTML="";
  pool.forEach(e=>{
    const b=document.createElement("button");
    b.className="memory-option";
    b.textContent=e;
    b.addEventListener("click",()=>{memoryInput.push(e);checkMemory();});
    optsEl.appendChild(b);
  });
}

function checkMemory(){
  const statusEl=document.getElementById("memoryStatus");
  if(!statusEl) return;
  const ok=memoryInput.length===memorySeq.length && memoryInput.every((v,i)=>v===memorySeq[i]);
  if(memoryInput.length===memorySeq.length){
    statusEl.textContent=ok?"太棒了！":"再试一次";
    if(ok) emojiRain("🌸",20,"flower-fall");
    setTimeout(()=>{
      const seqEl=document.getElementById("memorySeq");
      const optsEl=document.getElementById("memoryOptions");
      if(seqEl) { seqEl.textContent=""; seqEl.style.display="none"; }
      if(optsEl) { optsEl.innerHTML=""; optsEl.style.display="none"; }
      statusEl.textContent="";
    }, 1200);
  }
}

// ====== 模态框控制 ======
// 控制小游戏中心和兔子乐园模态框的函数
function openSpecialModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSpecialModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove("active");
  document.body.style.overflow = "auto";
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
      if (!a1Unlocked) {
        a1Unlocked = true;
        emojiRain("🥕", 20, "carrot-fall");
      }
    } else {
      achievement1.classList.add("locked");
      achievement1.classList.remove("unlocked");
      a1Unlocked = false;
    }
  }

  // 萝卜达人: 50个萝卜
  if (achievement2) {
    if (carrotCount >= 50) {
      achievement2.classList.remove("locked");
      achievement2.classList.add("unlocked");
      if (!a2Unlocked) {
        a2Unlocked = true;
        emojiRain("🥕", 40, "carrot-fall");
      }
    } else {
      achievement2.classList.add("locked");
      achievement2.classList.remove("unlocked");
      a2Unlocked = false;
    }
  }

  // 萝卜大师: 100个萝卜
  if (achievement3) {
    if (carrotCount >= 100) {
      achievement3.classList.remove("locked");
      achievement3.classList.add("unlocked");
      if (!a3Unlocked) {
        a3Unlocked = true;
        emojiRain("🥕", 60, "carrot-fall");
        document.body.classList.add("global-rainbow");
        setTimeout(() => { document.body.classList.remove("global-rainbow"); }, 5000);
      }
    } else {
      achievement3.classList.add("locked");
      achievement3.classList.remove("unlocked");
      a3Unlocked = false;
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
      if (!a4Unlocked) {
        a4Unlocked = true;
        emojiRain("🌈", 30, "flower-fall");
        document.body.classList.add("global-rainbow");
        setTimeout(() => { document.body.classList.remove("global-rainbow"); }, 6000);
      }
    } else {
      achievement4.classList.add("locked");
      achievement4.classList.remove("unlocked");
      a4Unlocked = false;
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

function emojiRain(emoji, count, cls) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.textContent = emoji;
    el.style.position = "fixed";
    el.style.fontSize = "28px";
    el.style.left = `${Math.random() * 80 + 10}%`;
    el.style.top = "-60px";
    el.style.zIndex = "9999";
    el.style.pointerEvents = "none";
    el.className = cls || "carrot-fall";
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 2500);
  }
}

function triggerNightOverlay(ms) {
  if (!nightOverlayEl) return;
  nightOverlayEl.classList.add("active");
  setTimeout(() => { nightOverlayEl.classList.remove("active"); }, ms || 8000);
}

function ensureHiddenPoems() {
  if (!window.POEMS) return;
  if (POEMS.hidden && Array.isArray(POEMS.hidden) && POEMS.hidden.length) return;
  const baseThemes = Object.keys(POEMS);
  const pickTheme = baseThemes.find(k => Array.isArray(POEMS[k]) && POEMS[k].length) || baseThemes[0];
  const src = (POEMS[pickTheme] || []).slice(0, 10);
  POEMS.hidden = src.map(p => ({...p, theme: "隐藏"}));
}

function typeWriter(text) {
  if (!modalSentenceEl) return;
  clearInterval(typeWriterTimer);
  const raw = text || "";
  typeWriterIndex = 0;
  modalSentenceEl.textContent = "";
  typeWriterTimer = setInterval(() => {
    if (typeWriterIndex >= raw.length) {
      clearInterval(typeWriterTimer);
      return;
    }
    modalSentenceEl.textContent += raw.charAt(typeWriterIndex);
    typeWriterIndex++;
  }, 30);
}

// ====== 渲染侧边栏 ======
function renderSidebar() {
  if (!window.THEMES) return;

  const titleNode = sidebarEl.querySelector(".sidebar-title");
  sidebarEl.innerHTML = "";
  sidebarEl.appendChild(titleNode);
  const listThemes = Array.isArray(THEMES) ? THEMES.slice() : [];
  if (hiddenThemeEnabled) {
    listThemes.push({ id: "hidden", name: "隐藏主题" });
  }
  listThemes.forEach((theme) => {
    const btn = document.createElement("button");
    btn.className = "theme-btn";
    if (theme.id === currentThemeId) btn.classList.add("active");
    btn.dataset.themeId = theme.id;

    if (theme.id === "hidden") ensureHiddenPoems();
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
  if (modalDialog) {
    const bg = `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random&color=fff&size=300`;
    modalDialog.style.backgroundImage = `url(${bg})`;
    modalDialog.style.backgroundSize = "cover";
    modalDialog.style.backgroundPosition = "center";
  }
  
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
  avatarEl.addEventListener('click', () => {
    avatarEl.classList.add('rainbow-effect');
    setTimeout(() => { avatarEl.classList.remove('rainbow-effect'); }, 1000);
  });
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

function readPoemSlow() {
  if (!currentModalPoem) return;
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentModalPoem.sentence);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
}

function closeModal() {
  modalOverlay.classList.remove("active");
  // 清空当前存储的诗词内容
  currentModalPoem = null;
  currentModalSentence = null;
}

// ====== 当前主题小游戏入口 ======

// ====== 初始化 ======
// 注意：实际初始化代码已移至DOMContentLoaded事件监听器中
// 请查看文件末尾的DOMContentLoaded事件监听器

// ====== 事件监听器 ======
function initEventListeners() {
  // 小游戏中心按钮
  if (gameCenterBtn) {
    gameCenterBtn.addEventListener("click", () => {
      playClick();
      renderGameCenter();
      openSpecialModal(gameCenterModal);
    });
  }

  if (gameCenterTopBtn) {
    gameCenterTopBtn.addEventListener("click", () => {
      playClick();
      renderGameCenter();
      openSpecialModal(gameCenterModal);
    });
  }

  // 小游戏中心关闭按钮
  if (gameCenterCloseBtn) {
    gameCenterCloseBtn.addEventListener("click", () => {
      playClick();
      closeSpecialModal(gameCenterModal);
    });
  }

  // 兔子乐园按钮
  if (rabbitParkBtn) {
    rabbitParkBtn.addEventListener("click", () => {
      playClick();
      openSpecialModal(rabbitParkModal);
    });
  }

  // 兔子乐园关闭按钮
  if (rabbitParkCloseBtn) {
    rabbitParkCloseBtn.addEventListener("click", () => {
      playClick();
      closeSpecialModal(rabbitParkModal);
      // 重置兔子样式
      const magicRabbitEl = document.getElementById("magicRabbit");
      if (magicRabbitEl) {
        magicRabbitEl.style.color = "";
      }
    });
  }
  
  // 兔子乐园互动按钮 - 注意：HTML中使用的是transformBtn
  
  startHarvestBtn = document.getElementById("startHarvestBtn");
  memoryStartBtn = document.getElementById("memoryStartBtn");
  
  
  
  
  if (startHarvestBtn) {
    startHarvestBtn.addEventListener("click", () => { playClick(); startHarvest(); });
  }
  if (memoryStartBtn) {
    memoryStartBtn.addEventListener("click", () => { playClick(); startMemory(); });
  }
  
  // 兔子logo点击
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
      rabbitClickCount++;
      if (rabbitClickTimer) clearTimeout(rabbitClickTimer);
      rabbitClickTimer = setTimeout(() => { rabbitClickCount = 0; }, 3000);
      if (rabbitClickCount >= 10) {
        rabbitClickCount = 0;
        rabbitLogo.classList.add("rabbit-morph");
        setTimeout(() => { rabbitLogo.classList.remove("rabbit-morph"); }, 800);
      }
    });
    rabbitLogo.addEventListener("dblclick", () => {
      playClick();
      renderGameCenter();
      openSpecialModal(gameCenterModal);
    });
    const startLP = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        playClick();
        openSpecialModal(rabbitParkModal);
      }, 900);
    };
    const cancelLP = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };
    rabbitLogo.addEventListener("mousedown", startLP);
    rabbitLogo.addEventListener("touchstart", startLP);
    rabbitLogo.addEventListener("mouseup", cancelLP);
    rabbitLogo.addEventListener("mouseleave", cancelLP);
    rabbitLogo.addEventListener("touchend", cancelLP);
  }

  const carrotTitle = document.querySelector('.carrot-title');
  if (carrotTitle) {
    carrotTitle.style.cursor = 'pointer';
    carrotTitle.addEventListener('click', () => {
      playClick();
      openSpecialModal(rabbitParkModal);
    });
  }
  if (carrotCountEl && carrotCountEl.parentElement) {
    const carrotCountBox = carrotCountEl.parentElement;
    carrotCountBox.style.cursor = 'pointer';
    carrotCountBox.addEventListener('click', () => {
      playClick();
      openSpecialModal(rabbitParkModal);
    });
  }
    
  // 点击模态框外部关闭
  if (gameCenterModal) {
    gameCenterModal.addEventListener("click", (e) => {
      if (e.target === gameCenterModal) {
        closeSpecialModal(gameCenterModal);
      }
    });
  }

  if (rabbitParkModal) {
    rabbitParkModal.addEventListener("click", (e) => {
      if (e.target === rabbitParkModal) {
        closeSpecialModal(rabbitParkModal);
        const magicRabbitEl = document.getElementById("magicRabbit");
        if (magicRabbitEl) {
          magicRabbitEl.style.color = "";
        }
      }
    });
  }

  // 主要模态框事件
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playClick();
      closeModal();
    });
  }

  // 为声音按钮添加点击事件监听器
  if (modalSoundBtn) {
    modalSoundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playClick();
      readPoem();
    });
    const start = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        playClick();
        readPoemSlow();
      }, 800);
    };
    const cancel = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };
    modalSoundBtn.addEventListener("mousedown", start);
    modalSoundBtn.addEventListener("touchstart", start);
    modalSoundBtn.addEventListener("mouseup", cancel);
    modalSoundBtn.addEventListener("mouseleave", cancel);
    modalSoundBtn.addEventListener("touchend", cancel);
  }


  if (modalOverlay) {
    modalOverlay.addEventListener("click", () => {
      playClick();
      closeModal();
    });
  }

  if (modalDialog) {
    modalDialog.addEventListener("click", (e) => {
      e.stopPropagation(); // 防止点击内容关闭
    });
  }

  // ESC键关闭模态框
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      playClick();
      closeModal();
      if (gameCenterModal && gameCenterModal.classList.contains("active")) {
        closeSpecialModal(gameCenterModal);
      }
      if (rabbitParkModal && rabbitParkModal.classList.contains("active")) {
        closeSpecialModal(rabbitParkModal);
      }
    }
    if ((e.key || "").toLowerCase() === "g") {
      secretGCount++;
      if (secretGTimer) clearTimeout(secretGTimer);
      secretGTimer = setTimeout(() => { secretGCount = 0; }, 1500);
      if (secretGCount >= 3) {
        secretGCount = 0;
        renderGameCenter();
        openSpecialModal(gameCenterModal);
      }
    }
    if ((e.key || "").toLowerCase() === "f") {
      secretFCount++;
      if (secretFTimer) clearTimeout(secretFTimer);
      secretFTimer = setTimeout(() => { secretFCount = 0; }, 1500);
      if (secretFCount >= 4) {
        secretFCount = 0;
        emojiRain("🌸", 30, "flower-fall");
      }
    }
    if ((e.key || "").toLowerCase() === "c") {
      secretCCount++;
      if (secretCTimer) clearTimeout(secretCTimer);
      secretCTimer = setTimeout(() => { secretCCount = 0; }, 1500);
      if (secretCCount >= 4) {
        secretCCount = 0;
        emojiRain("🥕", 30, "carrot-fall");
      }
    }
    if ((e.key || "").toLowerCase() === "m") {
      secretMCount++;
      if (secretMTimer) clearTimeout(secretMTimer);
      secretMTimer = setTimeout(() => { secretMCount = 0; }, 1500);
      if (secretMCount >= 3) {
        secretMCount = 0;
        triggerNightOverlay(8000);
      }
    }
    if ((e.key || "").toLowerCase() === "r") {
      secretRCount++;
      if (secretRTimer) clearTimeout(secretRTimer);
      secretRTimer = setTimeout(() => { secretRCount = 0; }, 1500);
      if (secretRCount >= 3) {
        secretRCount = 0;
        openSpecialModal(rabbitParkModal);
      }
    }
    const expected = KONAMI_SEQ[konamiIndex];
    if (expected && (e.key || "").toLowerCase() === expected.toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === KONAMI_SEQ.length) {
        konamiIndex = 0;
        renderGameCenter();
        openSpecialModal(gameCenterModal);
        for (let i = 0; i < 20; i++) {
          setTimeout(() => { showCarrotAnimation(); }, i * 100);
        }
      }
    } else {
      if ((e.key || "") !== "Shift") konamiIndex = 0;
    }
    if ((e.key || "").toLowerCase() === "h") {
      secretCTimer && clearTimeout(secretCTimer);
      secretCTimer = setTimeout(() => {}, 1);
      if (!hiddenThemeEnabled) ensureHiddenPoems();
      hiddenThemeEnabled = !hiddenThemeEnabled;
      renderSidebar();
    }
  });

  // ====== 显示模式 & 高亮模式事件 ======
  if (displayModeButtons) {
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
  }

  if (highlightButtons) {
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
  }

  if (flowerGameBtn) {
    flowerGameBtn.addEventListener("click", () => {
      playClick();
      if (!GAME_THEMES.includes(currentThemeId)) return;
      const url = `games/${currentThemeId}/index.html`;
      window.location.href = url;
    });
  }
  if (currentThemeTitleEl) {
    currentThemeTitleEl.addEventListener("click", () => {
      titleClickCount++;
      if (titleClickTimer) clearTimeout(titleClickTimer);
      titleClickTimer = setTimeout(() => { titleClickCount = 0; }, 1200);
      if (titleClickCount >= 5) {
        titleClickCount = 0;
        renderGameCenter();
        openSpecialModal(gameCenterModal);
      }
    });
  }

  if (carrotCountEl) {
    const start = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        playClick();
        openSpecialModal(rabbitParkModal);
      }, 1200);
    };
    const cancel = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };
    carrotCountEl.addEventListener("mousedown", start);
    carrotCountEl.addEventListener("touchstart", start);
    carrotCountEl.addEventListener("mouseup", cancel);
    carrotCountEl.addEventListener("mouseleave", cancel);
    carrotCountEl.addEventListener("touchend", cancel);
  }

  if (modalTitleEl) {
    const startTW = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        if (currentModalSentence) typeWriter(currentModalSentence);
      }, 600);
    };
    const cancelTW = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };
    modalTitleEl.addEventListener("mousedown", startTW);
    modalTitleEl.addEventListener("touchstart", startTW);
    modalTitleEl.addEventListener("mouseup", cancelTW);
    modalTitleEl.addEventListener("mouseleave", cancelTW);
    modalTitleEl.addEventListener("touchend", cancelTW);
  }
}

// ====== 初始化 ======
// 确保DOM完全加载后再执行初始化代码
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成，开始初始化');
  
  // 初始化DOM引用
  sidebarEl = document.querySelector(".sidebar");
  poemListEl = document.getElementById("poemList");
  currentThemeTitleEl = document.getElementById("currentThemeTitle");
  flowerGameBtn = document.getElementById("flowerGameBtn");
  gameCenterTopBtn = document.getElementById("gameCenterTopBtn");
  gameCenterBtn = document.getElementById("gameCenterBtn");
  rabbitParkBtn = document.getElementById("rabbitParkBtn");
  gameCenterModal = document.getElementById("gameCenterModal");
  gameCenterCloseBtn = document.getElementById("gameCenterCloseBtn");
  rabbitParkModal = document.getElementById("rabbitParkModal");
  rabbitParkCloseBtn = document.getElementById("rabbitParkCloseBtn");
  displayModeButtons = document.querySelectorAll(".mode-btn[data-mode]");
  highlightButtons = document.querySelectorAll(".mode-btn[data-highlight]");
  modalOverlay = document.getElementById("modalOverlay");
  modalDialog = document.getElementById("modalDialog");
  modalTitleEl = document.getElementById("modalTitle");
  modalSentenceEl = document.getElementById("modalSentence");
  modalMetaEl = document.getElementById("modalMeta");
  modalCloseBtn = document.getElementById("modalCloseBtn");
  modalSoundBtn = document.getElementById("modalSoundBtn");
  carrotCountEl = document.getElementById("carrotCount");
  progressFillEl = document.getElementById("progressFill");
  carrotHintEl = document.getElementById("carrotHint");
  achievement1 = document.getElementById("achievement1");
  achievement2 = document.getElementById("achievement2");
  achievement3 = document.getElementById("achievement3");
  achievement4 = document.getElementById("achievement4");
  
  // 检查关键元素是否存在
  console.log('兔子乐园按钮:', rabbitParkBtn);
  console.log('兔子乐园模态框:', rabbitParkModal);
  
  // 初始加载
  loadState();
  
  carrotCount = calculateCarrotCount(); // 根据现有状态计算萝卜数
  renderDisplayModeButtons();
  renderHighlightButtons();
  renderSidebar();
  renderPoems();
  updateCarrotSystem(); // 初始化萝卜收集系统UI

  // 初始化事件监听器
  initEventListeners();
  nightOverlayEl = document.querySelector(".night-overlay");
  if (!nightOverlayEl) {
    nightOverlayEl = document.createElement("div");
    nightOverlayEl.className = "night-overlay";
    document.body.appendChild(nightOverlayEl);
  }
});
