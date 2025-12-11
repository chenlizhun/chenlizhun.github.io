const LS_KEY="tools_pomodoro_settings"
let settings={work:25,short:5,long:15,longGap:4,mute:false}
let state={phase:"idle",remaining:0,interval:null,workCount:0}
const mode=document.getElementById("mode")
const minutes=document.getElementById("minutes")
const start=document.getElementById("start")
const pause=document.getElementById("pause")
const reset=document.getElementById("reset")
const clock=document.getElementById("clock")
const stage=document.getElementById("stage")
const skip=document.getElementById("skip")
const workMin=document.getElementById("workMin")
const shortMin=document.getElementById("shortMin")
const longMin=document.getElementById("longMin")
const longGap=document.getElementById("longGap")
const save=document.getElementById("save")
const mute=document.getElementById("mute")
const info=document.getElementById("info")
const log=document.getElementById("log")
function load(){try{const raw=localStorage.getItem(LS_KEY);if(raw)settings=JSON.parse(raw)||settings}catch(_){}workMin.value=settings.work;shortMin.value=settings.short;longMin.value=settings.long;longGap.value=settings.longGap;minutes.value=settings.work}
function saveSettings(){settings.work=+workMin.value||25;settings.short=+shortMin.value||5;settings.long=+longMin.value||15;settings.longGap=+longGap.value||4;localStorage.setItem(LS_KEY,JSON.stringify(settings));info.textContent="已保存";setTimeout(()=>{info.textContent=""},1200)}
function fmt(s){const m=Math.floor(s/60);const sec=s%60;return String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")}
function beep(){if(settings.mute)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=new AC();const osc=ctx.createOscillator();const g=ctx.createGain();osc.type="sine";osc.frequency.value=880;osc.connect(g);g.connect(ctx.destination);const now=ctx.currentTime;g.gain.setValueAtTime(0.15,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.3);osc.start(now);osc.stop(now+0.3)}catch(_){} }
function setPhase(p,min){state.phase=p;state.remaining=Math.max(1,Math.floor(min*60));stage.textContent=p==="work"?"工作":p==="short"?"短休息":p==="long"?"长休息":"准备中";document.title=stage.textContent+" · "+fmt(state.remaining)}
function tick(){if(state.remaining<=0){nextPhase();return}state.remaining--;clock.textContent=fmt(state.remaining);document.title=stage.textContent+" · "+fmt(state.remaining)}
function startTimer(){if(state.interval)return;clock.textContent=fmt(state.remaining);state.interval=setInterval(tick,1000)}
function pauseTimer(){if(state.interval){clearInterval(state.interval);state.interval=null}}
function resetTimer(){pauseTimer();state.phase="idle";state.remaining=0;stage.textContent="准备中";clock.textContent=fmt(settings.work*60)}
function nextPhase(){pauseTimer();beep();if(state.phase==="work"){state.workCount++;const useLong=settings.longGap>0&&state.workCount%settings.longGap===0;setPhase(useLong?"long":"short",useLong?settings.long:settings.short)}else{setPhase("work",settings.work)}startTimer();appendLog()}
function appendLog(){const t=new Date();const line=t.toLocaleTimeString()+" · "+stage.textContent;const div=document.createElement("div");div.textContent=line;log.prepend(div)}
mode.addEventListener("change",()=>{const v=mode.value;if(v==="work")minutes.value=settings.work;else if(v==="short")minutes.value=settings.short;else minutes.value=settings.long;setPhase(v,+minutes.value);clock.textContent=fmt(state.remaining)})
minutes.addEventListener("input",()=>{const v=Math.max(1,Math.floor(+minutes.value||1));minutes.value=v;setPhase(mode.value,v);clock.textContent=fmt(state.remaining)})
start.addEventListener("click",()=>{if(state.phase==="idle"){setPhase(mode.value,+minutes.value)}startTimer()})
pause.addEventListener("click",pauseTimer)
reset.addEventListener("click",resetTimer)
skip.addEventListener("click",nextPhase)
save.addEventListener("click",saveSettings)
mute.addEventListener("click",()=>{settings.mute=!settings.mute;mute.textContent=settings.mute?"提示音已关闭":"提示音开关"})
load();setPhase("work",settings.work);clock.textContent=fmt(state.remaining)
