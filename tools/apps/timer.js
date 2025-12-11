function fmtMs(ms){const m=Math.floor(ms/60000);const s=Math.floor(ms/1000)%60;const ms3=ms%1000;return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")+"."+String(ms3).padStart(3,"0")}
function fmtSec(sec){const m=Math.floor(sec/60);const s=sec%60;return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
let sw={running:false,startTs:0,elapsed:0,timer:null,laps:[]}
const swDisplay=document.getElementById("swDisplay")
const swStart=document.getElementById("swStart")
const swLap=document.getElementById("swLap")
const swStop=document.getElementById("swStop")
const swReset=document.getElementById("swReset")
const swLaps=document.getElementById("swLaps")
function swRender(){swDisplay.textContent=fmtMs(sw.elapsed)}
function swTick(){sw.elapsed=Date.now()-sw.startTs;swRender()}
swStart.addEventListener("click",()=>{if(sw.running)return;sw.running=true;sw.startTs=Date.now()-sw.elapsed;sw.timer=setInterval(swTick,16)})
swLap.addEventListener("click",()=>{if(!sw.running)return;sw.laps.push(sw.elapsed);const list=document.createElement("div");list.className="mono small";list.textContent="#"+sw.laps.length+" · "+fmtMs(sw.elapsed);swLaps.prepend(list)})
swStop.addEventListener("click",()=>{if(!sw.running)return;sw.running=false;clearInterval(sw.timer);sw.timer=null})
swReset.addEventListener("click",()=>{sw.running=false;clearInterval(sw.timer);sw.timer=null;sw.elapsed=0;swRender();swLaps.innerHTML=""})
swRender()
let cd={total:600,startTs:0,remaining:600,running:false,timer:null}
const cdMinutes=document.getElementById("cdMinutes")
const cdSeconds=document.getElementById("cdSeconds")
const cdDisplay=document.getElementById("cdDisplay")
const cdStart=document.getElementById("cdStart")
const cdPause=document.getElementById("cdPause")
const cdReset=document.getElementById("cdReset")
const cdInfo=document.getElementById("cdInfo")
function cdRender(){cdDisplay.textContent=fmtSec(cd.remaining);document.title="倒计时 · "+fmtSec(cd.remaining)}
function cdBeep(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=new AC();const o=ctx.createOscillator();const g=ctx.createGain();o.type="square";o.frequency.value=660;o.connect(g);g.connect(ctx.destination);const n=ctx.currentTime;g.gain.setValueAtTime(0.15,n);g.gain.exponentialRampToValueAtTime(0.001,n+0.4);o.start(n);o.stop(n+0.4)}catch(_){} }
function cdTick(){const elapsed=Math.floor((Date.now()-cd.startTs)/1000);cd.remaining=Math.max(0,cd.total-elapsed);cdRender();if(cd.remaining===0){clearInterval(cd.timer);cd.running=false;cdBeep();cdInfo.textContent="时间到"}}
function cdApply(){const m=Math.max(0,Math.floor(+cdMinutes.value||0));const s=Math.max(0,Math.floor(+cdSeconds.value||0));cd.total=m*60+s;cd.remaining=cd.total;cdRender()}
cdMinutes.addEventListener("input",cdApply)
cdSeconds.addEventListener("input",cdApply)
cdStart.addEventListener("click",()=>{if(cd.running)return;cdApply();cd.running=true;cd.startTs=Date.now();cd.timer=setInterval(cdTick,250)})
cdPause.addEventListener("click",()=>{if(!cd.running)return;cd.running=false;clearInterval(cd.timer);cd.timer=null})
cdReset.addEventListener("click",()=>{cd.running=false;clearInterval(cd.timer);cd.timer=null;cdApply();cdInfo.textContent=""})
cdApply()
