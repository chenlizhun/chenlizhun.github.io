// 花朵连连看
const EMOJIS = ["🌸","🌺","🌼","🌻","💮","🌷","🥀","🌹"];

let deck = [];
let firstPick = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;
let timer = null;
let elapsed = 0;
let stage = 0;

let audioCtx = null;
function initAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
}
function playTone(freq, dur, type='sine') {
  try {
    initAudio(); if (!audioCtx) return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq; osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime; gain.gain.setValueAtTime(0.14, now); gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.start(now); osc.stop(now + dur);
  } catch(_) {}
}
const sClick = () => playTone(900, 0.05, 'square');
const sMatch = () => { playTone(659, 0.12); setTimeout(()=>playTone(784,0.12),100); };
const sWrong = () => playTone(220, 0.18);
const sStart = () => { playTone(523,0.12); setTimeout(()=>playTone(659,0.12),100); setTimeout(()=>playTone(784,0.14),200); };
const sComplete = () => { playTone(784,0.15); setTimeout(()=>playTone(988,0.15),120); setTimeout(()=>playTone(1175,0.2),240); };

function formatTime(sec) {
  const m = Math.floor(sec/60); const s = sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function startTimer() {
  stopTimer(); elapsed = 0; updateTime();
  timer = setInterval(()=>{ elapsed++; updateTime(); }, 1000);
}
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
function updateTime() { document.getElementById('timeText').textContent = formatTime(elapsed); }

function shuffle(arr) { const a = arr.slice(); for (let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function getGridForStage() {
  if (stage === 0) return { rows: 2, cols: 2 };
  if (stage === 1) return { rows: 3, cols: 3 };
  return { rows: 4, cols: 4 };
}

function buildDeck() {
  const g = getGridForStage();
  const cells = g.rows * g.cols;
  const pairsCount = Math.floor(cells / 2);
  const pairs = [];
  for (let i = 0; i < pairsCount; i++) {
    const emoji = EMOJIS[i % EMOJIS.length];
    pairs.push({ id: `${i}-a`, emoji, pair: i });
    pairs.push({ id: `${i}-b`, emoji, pair: i });
  }
  deck = shuffle(pairs);
  if (cells % 2 === 1) {
    deck.push({ id: `placeholder`, emoji: "", pair: "", placeholder: true });
  }
  totalPairs = pairsCount;
  matchedPairs = 0; moves = 0; firstPick = null; lockBoard = false;
  document.getElementById('moveCount').textContent = moves;
  document.getElementById('matchedCount').textContent = matchedPairs;
  document.getElementById('totalPairs').textContent = totalPairs;
}

function renderBoard() {
  const board = document.getElementById('board'); board.innerHTML = '';
  const g = getGridForStage();
  board.style.gridTemplateColumns = `repeat(${g.cols}, 1fr)`;
  deck.forEach(card => {
    const el = document.createElement('div');
    el.className = 'fm-card' + (card.placeholder ? ' placeholder' : '');
    el.dataset.id = card.id; el.dataset.pair = String(card.pair);
    el.innerHTML = `
      <div class="fm-card-inner">
        <div class="fm-face front"></div>
        <div class="fm-face back">${card.emoji}</div>
      </div>`;
    if (!card.placeholder) {
      el.addEventListener('click', () => onCardClick(el));
    }
    board.appendChild(el);
  });
}

function onCardClick(el) {
  if (lockBoard) return; if (el.classList.contains('is-flipped')) return; if (el.classList.contains('placeholder')) return;
  sClick(); el.classList.add('is-flipped');
  if (!firstPick) { firstPick = el; return; }
  // second pick
  moves++; document.getElementById('moveCount').textContent = moves;
  const same = firstPick.dataset.pair === el.dataset.pair;
  if (same) {
    sMatch();
    firstPick.classList.add('is-matched'); el.classList.add('is-matched');
    matchedPairs++; document.getElementById('matchedCount').textContent = matchedPairs;
    firstPick = null;
    if (matchedPairs === totalPairs) finishGame();
  } else {
    sWrong(); lockBoard = true;
    setTimeout(() => {
      firstPick.classList.remove('is-flipped'); el.classList.remove('is-flipped');
      firstPick = null; lockBoard = false;
    }, 600);
  }
}

function previewAll(ms=1200) {
  const cards = Array.from(document.querySelectorAll('.fm-card')).filter(c => !c.classList.contains('placeholder'));
  cards.forEach(c => c.classList.add('is-flipped'));
  setTimeout(()=>{ cards.forEach(c => c.classList.remove('is-flipped')); }, ms);
}

function startGame() {
  sStart(); buildDeck(); renderBoard(); startTimer(); previewAll();
  document.getElementById('btnRestart').disabled = false;
}

function restartGame() { stopTimer(); startGame(); }

function finishGame() {
  stopTimer(); sComplete();
  document.getElementById('sumMoves').textContent = moves;
  document.getElementById('sumTime').textContent = formatTime(elapsed);
  document.getElementById('sumPairs').textContent = matchedPairs;
  document.getElementById('completeModal').classList.add('show');
}

// ====== 诗词问答闸门 ======
const STORAGE_KEY = "poemMemoryStatus_v1";
let statusMap = {};
function loadStatus() {
  try { const raw = localStorage.getItem(STORAGE_KEY); statusMap = raw ? (JSON.parse(raw)||{}) : {}; } catch(_) { statusMap = {}; }
}
function saveStatus() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap)); } catch(_) {} }
function statusKey(theme, index) { return `${theme}-${index}`; }
function getStatus(theme, index) { return statusMap[statusKey(theme,index)] || "default"; }
function setStatus(theme, index, st) { statusMap[statusKey(theme,index)] = st; }

function pickFlowerPoem() {
  const list = (window.POEMS && Array.isArray(POEMS.flower)) ? POEMS.flower : [];
  const idx = Math.floor(Math.random() * (list.length || 1));
  return { poem: list[idx] || null, index: idx, total: list.length };
}

function buildQuiz() {
  const { poem, index, total } = pickFlowerPoem();
  if (!poem || !total) {
    return { question: "未找到花主题诗词，返回诗词库重试。", options: [], correct: "", index: -1, type: "none" };
  }
  const useAuthor = Math.random() < 0.5;
  const question = useAuthor ? `这句诗的作者是谁：${poem.sentence}` : `这句诗的题目是：${poem.sentence}`;
  const correct = useAuthor ? (poem.author || "") : (poem.title || "");
  const pool = POEMS.flower.map(p => useAuthor ? (p.author||"") : (p.title||""))
    .filter(v => v && v !== correct);
  const distractors = shuffle(pool).slice(0,2);
  const options = shuffle([correct, ...distractors]);
  return { question, options, correct, index, type: useAuthor ? "author" : "title" };
}

function openQuizModal() {
  loadStatus();
  const modal = document.getElementById('quizModal');
  const qEl = document.getElementById('quizQuestion');
  const optsEl = document.getElementById('quizOptions');
  const fbEl = document.getElementById('quizFeedback');
  const complete = document.getElementById('completeModal');
  if (complete) complete.classList.remove('show');
  const quiz = buildQuiz();
  qEl.textContent = quiz.question;
  fbEl.textContent = "";
  optsEl.innerHTML = "";
  quiz.options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'fm-quiz-btn';
    b.textContent = opt;
    b.addEventListener('click', () => handleQuizAnswer(opt, quiz));
    optsEl.appendChild(b);
  });
  modal.classList.add('show');
}

function handleQuizAnswer(choice, quiz) {
  const fbEl = document.getElementById('quizFeedback');
  if (choice === quiz.correct) {
    fbEl.textContent = '✅ 回答正确！开始下一局';
    // 提升该诗的记忆状态：default/unfamiliar -> bullet，bullet -> bomb
    if (quiz.index >= 0) {
      const old = getStatus('flower', quiz.index);
      let next = old;
      if (old === 'default' || old === 'unfamiliar') next = 'bullet';
      else if (old === 'bullet') next = 'bomb';
      setStatus('flower', quiz.index, next); saveStatus();
    }
    setTimeout(() => {
      document.getElementById('quizModal').classList.remove('show');
      advanceStage();
      restartGame();
    }, 500);
  } else {
    fbEl.textContent = '❌ 再想想，可以根据题干中的诗句判断';
  }
}

function advanceStage() { if (stage < 2) stage++; }

function bindEvents() {
  const btnStart = document.getElementById('btnStart');
  const btnRestart = document.getElementById('btnRestart');
  const btnBack = document.getElementById('btnBack');
  const btnPlayAgain = document.getElementById('btnPlayAgain');
  const btnReturnHome = document.getElementById('btnReturnHome');
  const btnQuizBack = document.getElementById('btnQuizBack');

  btnStart.addEventListener('click', () => { startGame(); });
  btnRestart.addEventListener('click', () => { restartGame(); });
  btnBack.addEventListener('click', () => {
    try {
      if (window.history.length > 1) window.history.back(); else window.location.href = '../../index.html';
    } catch(_) { window.location.href='../../index.html'; }
  });
  btnPlayAgain.addEventListener('click', () => {
    openQuizModal();
  });
  btnReturnHome.addEventListener('click', () => { window.location.href='../../index.html'; });
  if (btnQuizBack) {
    btnQuizBack.addEventListener('click', () => { window.location.href='../../index.html'; });
  }
}

document.addEventListener('DOMContentLoaded', () => { bindEvents(); buildDeck(); renderBoard(); });
