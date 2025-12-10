const STORAGE_KEY="poemMemoryStatus_v1";
let statusMap={};
function loadStatus(){try{const r=localStorage.getItem(STORAGE_KEY);statusMap=r?(JSON.parse(r)||{}):{}}catch(_){statusMap={}}}
function saveStatus(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(statusMap))}catch(_){}}
function sKey(t,i){return `${t}-${i}`}
function gStatus(t,i){return statusMap[sKey(t,i)]||"default"}
function sStatus(t,i,v){statusMap[sKey(t,i)]=v}

let board=[];
let turn='';
let aiMode='';
let moves=0;
let timer=null;
let elapsed=0;
let history=[];
let gameOver=false;

let audioCtx=null;
function initAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audioCtx)audioCtx=new AC();if(audioCtx.state==='suspended')audioCtx.resume()}
function tone(f,d,t='sine'){try{initAudio();if(!audioCtx)return;const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.type=t;o.frequency.value=f;o.connect(g);g.connect(audioCtx.destination);const n=audioCtx.currentTime;g.gain.setValueAtTime(0.14,n);g.gain.exponentialRampToValueAtTime(0.001,n+d);o.start(n);o.stop(n+d)}catch(_){}}
const sClick=()=>tone(900,0.05,'square');
const sGood=()=>{tone(659,0.12);setTimeout(()=>tone(784,0.12),100)};
const sBad=()=>tone(220,0.18);
const sStart=()=>{tone(523,0.12);setTimeout(()=>tone(659,0.12),100);setTimeout(()=>tone(784,0.14),200)};
const sWin=()=>{tone(784,0.15);setTimeout(()=>tone(988,0.15),120);setTimeout(()=>tone(1175,0.2),240)};

function fmt(sec){const m=Math.floor(sec/60);const s=sec%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function startTimer(){stopTimer();elapsed=0;updateTime();timer=setInterval(()=>{elapsed++;updateTime()},1000)}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function updateTime(){document.getElementById('winTime').textContent=fmt(elapsed)}

function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function highlightKeywords(txt){try{const chars=(window.HIGHLIGHT_CHARS||[]);if(!chars.length)return String(txt);const set=new Set(chars);const s=String(txt);let out='';for(let i=0;i<s.length;i++){const ch=s[i];out+= set.has(ch) ? '<mark class="hl">'+ch+'</mark>' : ch;}return out;}catch(_){return String(txt)}}

function pickAiMode(){const r=Math.random();if(r<0.5)return 'pro';if(r<0.8)return 'block';return 'random'}

function render(){const boardEl=document.getElementById('board');boardEl.innerHTML='';for(let i=0;i<9;i++){const cell=document.createElement('div');cell.className='sf-cell'+(gameOver?' disabled':'');cell.dataset.idx=String(i);cell.textContent=board[i]==='P'?'🌱':board[i]==='C'?'🚜':'';cell.addEventListener('click',()=>onCell(cell));boardEl.appendChild(cell)}updateTurn();const undoBtn=document.getElementById('btnUndo');if(undoBtn)undoBtn.disabled = gameOver || history.length < 2}
function updateTurn(){document.getElementById('turnText').textContent=turn==='P'?'玩家(🌱)':'电脑(🚜)';document.getElementById('moveText').textContent=String(moves)}

function startGame(){sStart();board=Array(9).fill('');turn=Math.random()<0.5?'P':'C';aiMode=pickAiMode();moves=0;history=[];gameOver=false;document.getElementById('btnRestart').disabled=false;document.getElementById('btnUndo').disabled=false;render();startTimer();if(turn==='C')setTimeout(aiMove,300)}
function restartGame(){startGame()}

function lines(){return[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]}
function winner(){for(const l of lines()){const[a,b,c]=l;const v=board[a]&&board[a]===board[b]&&board[b]===board[c]?board[a]:'';if(v){return{player:v,line:l}}}return null}
function movesLeft(){return board.reduce((acc,v,i)=>{if(!v)acc.push(i);return acc},[])}

function place(i,p){board[i]=p;history.push({i,p});moves++}
function undoOnce(){const h=history.pop();if(!h)return false;board[h.i]='';if(gameOver){gameOver=false;document.querySelectorAll('.sf-cell').forEach(el=>el.classList.remove('win'))}turn=h.p;render();return true}

function undoTwo(){
  if(history.length<2)return false;
  const h1=history.pop(); if(h1) board[h1.i]='';
  const h2=history.pop(); if(h2) board[h2.i]='';
  if(gameOver){gameOver=false;document.querySelectorAll('.sf-cell').forEach(el=>el.classList.remove('win'))}
  turn='P'; render(); return true;
}

function onCell(cell){if(gameOver)return;const i=parseInt(cell.dataset.idx,10);if(board[i])return;if(turn!=='P')return;sClick();place(i,'P');render();const w=winner();if(w){endWin('P',w.line);return}if(movesLeft().length===0){endDraw();return}turn='C';setTimeout(aiMove,300)}

function aiMove(){if(gameOver)return;const avail=movesLeft();if(avail.length===0)return;let chosen=null;if(aiMode==='pro'){chosen=aiProMove()}else if(aiMode==='block'){chosen=aiBlockMove()}else{chosen=aiRandomMove()}place(chosen,'C');render();const w=winner();if(w){endWin('C',w.line);return}if(movesLeft().length===0){endDraw();return}turn='P'}

function aiRandomMove(){const a=movesLeft();return a[Math.floor(Math.random()*a.length)]}
function aiProMove(){const a=movesLeft();for(const i of a){board[i]='C';if(winner()&&winner().player==='C'){board[i]='';return i}board[i]=''}for(const i of a){board[i]='P';if(winner()&&winner().player==='P'){board[i]='';return i}board[i]=''}if(a.includes(4))return 4;const corners=[0,2,6,8].filter(i=>a.includes(i));if(corners.length)return corners[Math.floor(Math.random()*corners.length)];return aiRandomMove()}
function aiBlockMove(){const a=movesLeft();for(const i of a){board[i]='P';const w=winner();board[i]='';if(w&&w.player==='P'){return i}}if(a.includes(4))return 4;const corners=[0,2,6,8].filter(i=>a.includes(i));if(corners.length)return corners[Math.floor(Math.random()*corners.length)];return aiRandomMove()}

function endWin(player,line){gameOver=true;stopTimer();document.getElementById('winMoves').textContent=String(moves);sWin();highlightLine(line);if(player==='P'){celebrate();rewardSpring();}
 const header=document.querySelector('#winModal .sf-modal-header h2');
 const msg=document.querySelector('#winModal .sf-win-msg');
 if(player==='P'){header.textContent='🎉 你赢了！';msg.textContent='春日耕耘，收获满满！'}
 else {header.textContent='🧠 电脑赢了，你输了！';msg.textContent='不气馁，再读题再战！'}
 document.getElementById('winModal').classList.add('show')}
function endDraw(){gameOver=true;stopTimer();document.getElementById('winMoves').textContent=String(moves);document.getElementById('winTime').textContent=fmt(elapsed);const header=document.querySelector('#winModal .sf-modal-header h2');const msg=document.querySelector('#winModal .sf-win-msg');header.textContent='🤝 平局';msg.textContent='旗鼓相当，再接再厉！';document.getElementById('winModal').classList.add('show')}
function highlightLine(line){const cells=document.querySelectorAll('.sf-cell');line.forEach(idx=>{cells[idx].classList.add('win')})}

function sproutRain(count){for(let i=0;i<count;i++){const el=document.createElement('div');el.textContent=['🌱','🌸','🥕'][i%3];el.className='sprout-fall';el.style.left=(Math.random()*80+10)+'%';document.body.appendChild(el);setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},2500)}}
function celebrate(){sproutRain(40)}

function rewardSpring(){loadStatus();const list=(window.POEMS&&Array.isArray(POEMS.spring))?POEMS.spring:[];if(!list.length)return;const idx=Math.floor(Math.random()*list.length);const old=gStatus('spring',idx);let next=old;if(old==='default'||old==='unfamiliar')next='bullet';else if(old==='bullet')next='bomb';sStatus('spring',idx,next);saveStatus()}

function buildQuiz(){const list=(window.POEMS&&Array.isArray(POEMS.spring))?POEMS.spring:[];if(!list.length)return{q:'暂无春主题诗词',opts:[],ans:''};const useAuthor=Math.random()<0.5;const ix=Math.floor(Math.random()*list.length);const p=list[ix];const qRaw=useAuthor?`这句诗的作者是谁：${p.sentence}`:`这句诗的题目是：${p.sentence}`;const q=highlightKeywords(qRaw);const ans=useAuthor?(p.author||''):(p.title||'');const pool=list.map(x=>useAuthor?(x.author||''):(x.title||'')).filter(v=>v&&v!==ans);const opts=shuffle([ans,...shuffle(pool).slice(0,2)]);return{q,opts,ans}}
function openQuiz(){const modal=document.getElementById('quizModal');const qEl=document.getElementById('quizQuestion');const oEl=document.getElementById('quizOptions');const fEl=document.getElementById('quizFeedback');const cEl=document.getElementById('quizCountdown');const quiz=buildQuiz();qEl.innerHTML=quiz.q;fEl.textContent='';oEl.innerHTML='';cEl.textContent='请先读题（3）';let enabled=false;quiz.opts.forEach(opt=>{const b=document.createElement('button');b.className='sf-quiz-btn';b.textContent=opt;b.disabled=true;b.addEventListener('click',()=>{if(!enabled)return;answerQuiz(opt,quiz)});oEl.appendChild(b)});modal.classList.add('show');let t=3;const timer=setInterval(()=>{t--;cEl.textContent=`请先读题（${t}）`;if(t<=0){clearInterval(timer);Array.from(oEl.children).forEach(btn=>btn.disabled=false);enabled=true;cEl.textContent='可以作答';}},1000)}
function answerQuiz(choice,quiz){const fEl=document.getElementById('quizFeedback');const oEl=document.getElementById('quizOptions');if(choice===quiz.ans){fEl.textContent='✅ 回答正确，执行一次悔棋';sGood();setTimeout(()=>{document.getElementById('quizModal').classList.remove('show');undoTwo()},300)}else{fEl.textContent='❌ 再想想（2秒后再试）';Array.from(oEl.children).forEach(btn=>btn.disabled=true);setTimeout(()=>{Array.from(oEl.children).forEach(btn=>btn.disabled=false);fEl.textContent='可以作答'},2000)}}

function bind(){const btnStart=document.getElementById('btnStart');const btnRestart=document.getElementById('btnRestart');const btnUndo=document.getElementById('btnUndo');const btnBack=document.getElementById('btnBack');const btnPlayAgain=document.getElementById('btnPlayAgain');const btnReturnHome=document.getElementById('btnReturnHome');const btnQuizCancel=document.getElementById('btnQuizCancel');
btnStart.addEventListener('click',()=>{startGame()});
btnRestart.addEventListener('click',()=>{restartGame()});
btnUndo.addEventListener('click',()=>{if(history.length>=2){openQuiz()}});
btnBack.addEventListener('click',()=>{try{if(window.history.length>1)window.history.back();else window.location.href='../../index.html'}catch(_){window.location.href='../../index.html'}});
btnPlayAgain.addEventListener('click',()=>{document.getElementById('winModal').classList.remove('show');openQuizForReplay()});
btnReturnHome.addEventListener('click',()=>{window.location.href='../../index.html'});
btnQuizCancel.addEventListener('click',()=>{document.getElementById('quizModal').classList.remove('show')})}

document.addEventListener('DOMContentLoaded',()=>{bind();})

function openQuizForReplay(){const modal=document.getElementById('quizModal');const qEl=document.getElementById('quizQuestion');const oEl=document.getElementById('quizOptions');const fEl=document.getElementById('quizFeedback');const cEl=document.getElementById('quizCountdown');const quiz=buildQuiz();qEl.innerHTML=quiz.q;fEl.textContent='';oEl.innerHTML='';cEl.textContent='请先读题（3）';let enabled=false;quiz.opts.forEach(opt=>{const b=document.createElement('button');b.className='sf-quiz-btn';b.textContent=opt;b.disabled=true;b.addEventListener('click',()=>{if(!enabled)return;if(opt===quiz.ans){fEl.textContent='✅ 回答正确，开始新一局';setTimeout(()=>{document.getElementById('quizModal').classList.remove('show');restartGame()},300)}else{fEl.textContent='❌ 再想想（2秒后再试）';Array.from(oEl.children).forEach(btn=>btn.disabled=true);setTimeout(()=>{Array.from(oEl.children).forEach(btn=>btn.disabled=false);fEl.textContent='可以作答'},2000)}});oEl.appendChild(b)});modal.classList.add('show');let t=3;const timer=setInterval(()=>{t--;cEl.textContent=`请先读题（${t}）`;if(t<=0){clearInterval(timer);Array.from(oEl.children).forEach(btn=>btn.disabled=false);enabled=true;cEl.textContent='可以作答';}},1000)}
