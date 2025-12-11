const d1=document.getElementById("d1")
const d2=document.getElementById("d2")
const calc=document.getElementById("calc")
const diff=document.getElementById("diff")
const fmtInput=document.getElementById("fmtInput")
const fmtRun=document.getElementById("fmtRun")
const fmtOut=document.getElementById("fmtOut")
const tzInput=document.getElementById("tzInput")
const tzFrom=document.getElementById("tzFrom")
const tzTo=document.getElementById("tzTo")
const tzRun=document.getElementById("tzRun")
const tzOut=document.getElementById("tzOut")
const nlp=document.getElementById("nlp")
const nlpRun=document.getElementById("nlpRun")
const nlpOut=document.getElementById("nlpOut")
const holidayFile=document.getElementById("holidayFile")
const holidayInfo=document.getElementById("holidayInfo")
let holidays=new Set(),workdays=new Set()
function fmtYmd(d){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const dd=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${dd}`}
function isWorkday(d){const s=fmtYmd(d);if(workdays.has(s))return true;if(holidays.has(s))return false;const wd=d.getDay();return wd!==0&&wd!==6}
function parse(s){if(!s)return null;const t=new Date(s);return isNaN(t.getTime())?null:t}
function human(ms){const sec=Math.floor(ms/1000);const d=Math.floor(sec/86400);const h=Math.floor((sec%86400)/3600);const m=Math.floor((sec%3600)/60);const s=sec%60;return `${d}天 ${h}小时 ${m}分 ${s}秒`}
function weekNumber(date){const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day+3);const first=new Date(Date.UTC(d.getUTCFullYear(),0,4));return 1+Math.round(((d-first)/86400000-3)/7)}
calc.addEventListener("click",()=>{const a=parse(d1.value),b=parse(d2.value);if(!a||!b){diff.textContent="请输入有效时间";return}const ms=Math.abs(b-a);diff.textContent=human(ms)})
fmtRun.addEventListener("click",()=>{const t=parse(fmtInput.value);if(!t){fmtOut.textContent="请输入有效时间";return}fmtOut.textContent=`ISO ${t.toISOString()}\n本地 ${t.toLocaleString()}\n周数 W${weekNumber(t)}`})
tzRun.addEventListener("click",()=>{const t=parse(tzInput.value);if(!t){tzOut.textContent="请输入有效时间";return}const fromOffset=parseInt(tzFrom.value||"0",10);const toOffset=parseInt(tzTo.value||"0",10);const utcMs=t.getTime()-fromOffset*3600000;const target=new Date(utcMs+toOffset*3600000);const label=(toOffset>=0?`UTC+${toOffset}`:`UTC${toOffset}`);tzOut.textContent=target.toISOString().replace('T',' ').slice(0,19)+` (${label})`})
nlpRun.addEventListener("click",()=>{let s=(nlp.value||"").trim();if(!s){nlpOut.textContent="请输入";return}
  let t=new Date(s);
  if(isNaN(t.getTime())){
    const en=s.toLowerCase().match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(\d{1,2}:\d{2}))?$/);
    if(en){const map={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};const target=map[en[1]];let now=new Date();let diff=(target-now.getDay()+7)%7;diff=diff===0?7:diff;now.setDate(now.getDate()+diff);if(en[2]){const parts=en[2].split(":");now.setHours(parseInt(parts[0],10)||0,parseInt(parts[1],10)||0,0,0)} t=now}
    else {
      const zh=s.match(/^下周([一二三四五六日天])\s*(\d{1,2}:\d{2})?$/);
      if(zh){const mapZh={"日":0,"天":0,"一":1,"二":2,"三":3,"四":4,"五":5,"六":6};const target=mapZh[zh[1]];let now=new Date();let diff=(target-now.getDay()+7)%7;diff=diff===0?7:diff;now.setDate(now.getDate()+diff);if(zh[2]){const parts=zh[2].split(":");now.setHours(parseInt(parts[0],10)||0,parseInt(parts[1],10)||0,0,0)} t=now}
      else {
        const cur=new Date();
        const zh2=s.match(/^下下周([一二三四五六日天])\s*(\d{1,2}:\d{2})?$/);
        if(zh2){const mapZh={"日":0,"天":0,"一":1,"二":2,"三":3,"四":4,"五":5,"六":6};const target=mapZh[zh2[1]];let now=new Date();let diff=(target-now.getDay()+7)%7;diff=diff===0?7:diff;now.setDate(now.getDate()+diff+7);if(zh2[2]){const parts=zh2[2].split(":");now.setHours(parseInt(parts[0],10)||0,parseInt(parts[1],10)||0,0,0)} t=now}
        else if(/^本周末$/.test(s)){const d=new Date(cur);const day=d.getDay();const diff=(6-day+7)%7;d.setDate(d.getDate()+diff);d.setHours(0,0,0,0);t=d}
        const m1=s.match(/^本周([一二三四五六日天])\s*(上午|下午)?\s*(\d{1,2})(?::(\d{2}))?$/);
        if(m1){const mapZh={"日":0,"天":0,"一":1,"二":2,"三":3,"四":4,"五":5,"六":6};const target=mapZh[m1[1]];const today=cur.getDay();const diff=target-today;const d=new Date(cur);d.setDate(cur.getDate()+diff);let h=parseInt(m1[3]||"0",10)||0;const min=parseInt(m1[4]||"0",10)||0;if((m1[2]||"")==='下午'&&h<12)h+=12;d.setHours(h,min,0,0);t=d}
        else {
          const m2=s.match(/^(今天|明天|后天|今晚|明早|星期[一二三四五六日天]|周[一二三四五六日天])\s*(上午|下午|晚上)?\s*(\d{1,2})?(?::(\d{2}))?$/);
          if(m2){const d=new Date(cur);const step={"今天":0,"明天":1,"后天":2,"今晚":(new Date().getHours()<18?0:0),"明早":1}[m2[1]]||0;d.setDate(cur.getDate()+step);let h=0;let min=0;const hasTime=!!m2[3];if(m2[1]==='今晚'&&!hasTime){h=20}else if(m2[1]==='明早'&&!hasTime){h=8}else{h=parseInt(m2[3]||"0",10)||0;min=parseInt(m2[4]||"0",10)||0}const dayPart=(m2[2]||"");if(dayPart==='下午'&&h<12)h+=12;else if(dayPart==='晚上'&&h<12)h=20;d.setHours(h,min,0,0);t=d}
        }
      }
    }
  }
  if(isNaN(t.getTime())){nlpOut.textContent="解析失败";return}
  const wd=isWorkday(t)?"工作日":"休息日";
  nlpOut.textContent=`${t.toLocaleString()} · 周数 W${weekNumber(t)} · ${wd}`
})
// 校验日期格式
function validDateStr(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)}
holidayFile.addEventListener('change',()=>{const f=holidayFile.files&&holidayFile.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);holidays=new Set();workdays=new Set();let invalid=[];if(data){if(Array.isArray(data.holidays))data.holidays.forEach(d=>{if(validDateStr(String(d)))holidays.add(String(d));else invalid.push(String(d))});if(Array.isArray(data.workdays))data.workdays.forEach(d=>{if(validDateStr(String(d)))workdays.add(String(d));else invalid.push(String(d))});if(!data.holidays&&!data.workdays&&typeof data==='object'){Object.keys(data).forEach(k=>{if(!validDateStr(k)){invalid.push(k);return}const v=data[k];if(v===true||v==='workday')workdays.add(k);else if(v===false||v==='holiday')holidays.add(k)})}}
  holidayInfo.textContent=`配置加载: 假期 ${holidays.size} · 工作日 ${workdays.size}`+(invalid.length?` · 无效日期 ${invalid.join(',')}`:'')
}catch(_){holidayInfo.textContent='配置解析失败'} };reader.readAsText(f)})
