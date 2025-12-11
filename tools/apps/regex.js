const pattern=document.getElementById("pattern")
const flags=document.getElementById("flags")
const run=document.getElementById("run")
const clear=document.getElementById("clear")
const text=document.getElementById("text")
const result=document.getElementById("result")
const highlight=document.getElementById("highlight")
const error=document.getElementById("error")
const repl=document.getElementById("repl")
const previewRepl=document.getElementById("previewRepl")
const replOut=document.getElementById("replOut")
const replCount=document.getElementById("replCount")
const flagInfo=document.getElementById("flagInfo")
const matchCount=document.getElementById("matchCount")
const snippets=document.getElementById("snippets")
const statusBar=document.getElementById("statusBar")
const escapeInject=document.getElementById("escapeInject")
const autoPreview=document.getElementById("autoPreview")
const autoDelay=document.getElementById("autoDelay")
const copyMatches=document.getElementById("copyMatches")
const copyRepl=document.getElementById("copyRepl")
const favSearch=document.getElementById("favSearch")
function esc(s){return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function reEsc(s){return String(s||"").replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function debounce(fn,delay){let t=null;return function(){const args=arguments;clearTimeout(t);t=setTimeout(()=>fn.apply(this,args),delay)}}
function explainFlags(f){const set=new Set((f||"").split(""));const map={g:"全局匹配",i:"不区分大小写",m:"多行模式(^/$ 匹配行边界)",s:"单行模式(点 . 匹配换行)",u:"Unicode 模式",d:"生成索引匹配数组"};const info=[...set].filter(x=>x).map(x=>x+": "+(map[x]||"未知"));flagInfo.textContent=info.length?info.join(" · "):"无标志"}
function doRun(){error.style.display="none";error.textContent="";result.innerHTML="";highlight.innerHTML="";replOut.textContent="";const pat=pattern.value||"";const flg=(flags.value||"g").replace(/\s+/g,"");const src=text.value||"";if(!pat){return}try{explainFlags(flg);const re=new RegExp(pat,flg);const matches=[...src.matchAll(re)];if(matches.length===0){result.textContent="无匹配";highlight.innerHTML="<div class=small>无高亮</div>";matchCount.textContent="匹配数: 0";statusBar.textContent="匹配: 0";return}matches.forEach((m,i)=>{const d=document.createElement("div");const groups=[];if(m.groups){for(const k of Object.keys(m.groups)){groups.push(k+"="+(m.groups[k]??""))}}for(let gi=1;gi<m.length;gi++){groups.push("$"+gi+"="+(m[gi]??""))}const gtxt=groups.length?" ("+groups.join(", ")+")":"";d.textContent="#"+(i+1)+" · index="+m.index+" · match="+m[0]+gtxt;result.appendChild(d)});matchCount.textContent="匹配数: "+matches.length;statusBar.textContent="匹配: "+matches.length;let out="";let cur=0;matches.forEach(m=>{const idx=m.index;const end=idx+m[0].length;out+=esc(src.slice(cur,idx));out+="<mark>"+esc(src.slice(idx,end))+"</mark>";cur=end});out+=esc(src.slice(cur));highlight.innerHTML=out}catch(e){error.style.display="block";error.textContent="正则错误"}}
function previewReplace(){error.style.display="none";error.textContent="";replOut.textContent="";replCount.textContent="";const pat=pattern.value||"";const flg=(flags.value||"g").replace(/\s+/g,"");const src=text.value||"";const tmpl=repl.value||"";if(!pat){return}try{const re=new RegExp(pat,flg);let count=0;let res="";if(tmpl.includes("$<")){res=src.replace(re,(...args)=>{const groups=args[args.length-1]||{};count++;return tmpl.replace(/\$<([^>]+)>/g,(mm,nn)=>{const v=groups[nn]??"";return escapeInject&&escapeInject.checked?reEsc(v):v})})}else{res=src.replace(re,(...args)=>{const groups=args[args.length-1]||{};count++;let out=tmpl;Object.keys(groups||{}).forEach(k=>{const v=groups[k]??"";out=out.replace(new RegExp("\\$<"+k+">","g"),escapeInject&&escapeInject.checked?reEsc(v):v)});return out})}
replOut.textContent=res;replCount.textContent="替换次数: "+count;statusBar.textContent=(statusBar.textContent?statusBar.textContent+" · ":"")+"替换: "+count}catch(e){error.style.display="block";error.textContent="替换失败"}}
run.addEventListener("click",doRun)
clear.addEventListener("click",()=>{pattern.value="";flags.value="";text.value="";result.innerHTML="";highlight.innerHTML="";error.style.display="none";error.textContent="";statusBar.textContent=""})
previewRepl.addEventListener("click",previewReplace)
const snippetCat=document.getElementById("snippetCat")
const favorites=document.getElementById("favorites")
const addFav=document.getElementById("addFav")
const exportFav=document.getElementById("exportFav")
const importFavFile=document.getElementById("importFavFile")
const exportLib=document.getElementById("exportLib")
const importLibFile=document.getElementById("importLibFile")
const LIB=[
  {cat:"common",name:"Email",pat:"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"},
  {cat:"network",name:"URL",pat:"^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w-./?%&=]*)?$"},
  {cat:"network",name:"IPv4",pat:"^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$"},
  {cat:"date",name:"日期(YYYY-MM-DD)",pat:"^(?<y>\\d{4})-(?<m>0[1-9]|1[0-2])-(?<d>0[1-9]|[12]\\d|3[01])$"},
  {cat:"common",name:"手机号(中国)",pat:"^1[3-9]\\d{9}$"},
  {cat:"common",name:"数字(整数或小数)",pat:"^-?\\d+(?:\\.\\d+)?$"},
  {cat:"date",name:"时间(HH:MM:SS)",pat:"^(2[0-3]|[01]\\d):([0-5]\\d):([0-5]\\d)$"},
  {cat:"common",name:"中文姓名(简体)",pat:"^[\\u4e00-\\u9fa5]{2,4}$"}
]
function getLib(){try{const raw=localStorage.getItem('tools_regex_lib');if(raw){const arr=JSON.parse(raw);if(Array.isArray(arr))return arr} }catch(_){} return LIB}
function renderSnippets(){snippets.innerHTML="";getLib().filter(s=>s.cat===snippetCat.value).forEach(s=>{const b=document.createElement("button");b.className="btn secondary";b.textContent=s.name;b.addEventListener("click",()=>{pattern.value=s.pat}) ;snippets.appendChild(b)})}
function renderFavorites(){favorites.innerHTML="";let fav=JSON.parse(localStorage.getItem("tools_regex_fav")||"[]");const q=(favSearch.value||"").trim().toLowerCase();if(q){fav=fav.filter(x=>String(x.name||"").toLowerCase().includes(q)||String(x.pat||"").toLowerCase().includes(q))}
  fav.sort((a,b)=>((b.ts||0)-(a.ts||0)));
  fav.forEach((s,idx)=>{const wrap=document.createElement('div');const b=document.createElement("button");b.className="btn secondary";b.textContent=s.name;b.addEventListener("click",()=>{pattern.value=s.pat;flags.value=s.flags||"g";const list=JSON.parse(localStorage.getItem("tools_regex_fav")||"[]");const i=list.findIndex(it=>it.pat===s.pat&&it.flags===s.flags&&it.name===s.name);if(i>=0){list[i]={...list[i],ts:Date.now()};localStorage.setItem("tools_regex_fav",JSON.stringify(list))}renderFavorites()});const ren=document.createElement('button');ren.className='btn secondary';ren.textContent='重命名';ren.addEventListener('click',()=>{const nn=prompt('重命名',s.name||'');if(nn){fav[idx]={...s,name:nn};localStorage.setItem("tools_regex_fav",JSON.stringify(fav));renderFavorites()}});const del=document.createElement('button');del.className='btn secondary';del.textContent='删除';del.addEventListener('click',()=>{fav.splice(idx,1);localStorage.setItem("tools_regex_fav",JSON.stringify(fav));renderFavorites()});wrap.appendChild(b);wrap.appendChild(ren);wrap.appendChild(del);favorites.appendChild(wrap)})}
snippetCat.addEventListener("change",renderSnippets)
addFav.addEventListener("click",()=>{const name=(pattern.value||"").slice(0,24)||"未命名";const item={name,pat:pattern.value||"",flags:flags.value||"g"};const fav=JSON.parse(localStorage.getItem("tools_regex_fav")||"[]");fav.push(item);localStorage.setItem("tools_regex_fav",JSON.stringify(fav));renderFavorites()})
copyMatches.addEventListener('click',()=>{navigator.clipboard.writeText(result.textContent||"").catch(()=>{})})
copyRepl.addEventListener('click',()=>{navigator.clipboard.writeText(replOut.textContent||"").catch(()=>{})})
favSearch.addEventListener('input',renderFavorites)
let runTimer=null,replTimer=null
function getDelay(){return Math.max(50,parseInt(autoDelay?.value||'300',10)||300)}
function scheduleRun(){clearTimeout(runTimer);runTimer=setTimeout(()=>{if(autoPreview.checked)doRun()},getDelay())}
function scheduleRepl(){clearTimeout(replTimer);replTimer=setTimeout(()=>{if(autoPreview.checked)previewReplace()},getDelay())}
pattern.addEventListener('input',scheduleRun)
flags.addEventListener('input',scheduleRun)
text.addEventListener('input',scheduleRun)
repl.addEventListener('input',scheduleRepl)
autoDelay?.addEventListener('change',()=>{})
exportFav.addEventListener('click',()=>{const data=localStorage.getItem('tools_regex_fav')||"[]";const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='regex-favorites.json';a.click();URL.revokeObjectURL(url)})
importFavFile.addEventListener('change',()=>{const f=importFavFile.files&&importFavFile.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(Array.isArray(data)){localStorage.setItem('tools_regex_fav',JSON.stringify(data));renderFavorites()}}catch(_){}};reader.readAsText(f)})
exportLib?.addEventListener('click',()=>{const data=JSON.stringify(getLib());const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='regex-snippets.json';a.click();URL.revokeObjectURL(url)})
importLibFile?.addEventListener('change',()=>{const f=importLibFile.files&&importLibFile.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(Array.isArray(data)){localStorage.setItem('tools_regex_lib',JSON.stringify(data));renderSnippets()}}catch(_){}};reader.readAsText(f)})
renderSnippets();
renderFavorites();
