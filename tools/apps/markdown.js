const md=document.getElementById("md")
const out=document.getElementById("out")
const preview=document.getElementById("preview")
const clear=document.getElementById("clear")
const toggleTheme=document.getElementById("toggleTheme")
const exportHtml=document.getElementById("exportHtml")
const exportPdf=document.getElementById("exportPdf")
const THEME_KEY="tools_markdown_theme"
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function inlineFmt(s){return s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code class=mono>$1</code>")}
function parseTables(src){const lines=src.split(/\n/);let out=[];for(let i=0;i<lines.length;i++){if(/\|/.test(lines[i])&&i+1<lines.length&&/\|\s*-/.test(lines[i+1])){const header=lines[i].split("|").map(x=>x.trim()).filter(x=>x.length>0);i++;const sep=lines[i];const aligns=sep.split("|").map(x=>{x=x.trim();return x.startsWith(":")&&x.endsWith(":")?"center":x.endsWith(":")?"right":x.startsWith(":")?"left":"left"}).filter((_,idx)=>idx<header.length);let rows=[];while(i+1<lines.length&&/\|/.test(lines[i+1])&&!/\|\s*-/.test(lines[i+1])){rows.push(lines[i+1].split("|").map(x=>x.trim()).filter(x=>x.length>0));i++}let tbl='<table class="mono" style="width:100%">';tbl+='<thead><tr>'+header.map((h,idx)=>'<th style="text-align:'+aligns[idx]+'">'+inlineFmt(esc(h))+'</th>').join('')+'</tr></thead>';tbl+='<tbody>'+rows.map(r=>'<tr>'+r.map((c,idx)=>'<td style="text-align:'+(aligns[idx]||'left')+'">'+inlineFmt(esc(c))+'</td>').join('')+'</tr>').join('')+'</tbody></table>';out.push(tbl)}else{out.push(lines[i])}}return out.join("\n")}
function render(){let src=md.value||"";src=parseTables(src);const lines=src.split(/\n/);
  const parts=[];for(let i=0;i<lines.length;i++){const m=lines[i].match(/^\s*- \[(x|\s)\] (.*)$/);if(m){const checked=m[1].toLowerCase()==='x';const text=m[2];parts.push('<li><label><input type="checkbox" data-line="'+i+'" '+(checked?'checked':'')+'/> '+esc(text)+'</label></li>')}else{parts.push(esc(lines[i]))}}
  let html=parts.join("\n")
  html=html.replace(/~~(.*?)~~/g,"<del>$1</del>")
  html=html.replace(/```(\w+)?\n([\s\S]*?)```/g,(m,lang,code)=>{const cls=lang?('language-'+lang):'mono';return '<pre><code class="'+cls+'">'+code.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</code></pre>'})
  html=html.replace(/^>\s?(.*)$/gm,'<blockquote>$1</blockquote>')
html=html.replace(/^###### (.*)$/gm,"<h6>$1</h6>")
html=html.replace(/^##### (.*)$/gm,"<h5>$1</h5>")
html=html.replace(/^#### (.*)$/gm,"<h4>$1</h4>")
html=html.replace(/^### (.*)$/gm,"<h3>$1</h3>")
html=html.replace(/^## (.*)$/gm,"<h2>$1</h2>")
html=html.replace(/^# (.*)$/gm,"<h1>$1</h1>")
html=html.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
html=html.replace(/\*(.*?)\*/g,"<em>$1</em>")
html=html.replace(/`([^`]+)`/g,"<code class=mono>$1</code>")
html=html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,"<img alt='$1' src='$2' style='max-width:100%' />")
html=html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"<a href='$2' target='_blank'>$1</a>")
  // 有序列表
  html=html.replace(/^\s*\d+\. (.*)$/gm,"<li class=ol>$1</li>")
  html=html.replace(/(<li class=ol>.*?<\/li>\n?)+/gs,m=>"<ol>"+m.replace(/\n/g,"").replace(/ class=ol/g,"")+"</ol>")
  // 无序列表
  html=html.replace(/^\s*[-*] (.*)$/gm,"<li>$1</li>")
  html=html.replace(/(<li>.*?<\/li>\n?)+/gs,m=>"<ul>"+m.replace(/\n/g,"")+"</ul>")
  // 自动链接裸 URL
  html=html.replace(/(^|\s)(https?:\/\/[^\s<]+)(?=$|\s)/g,(m,prefix,url)=>`${prefix}<a href='${url}' target='_blank'>${url}</a>`)
  // 任务分组 UL 包裹
  html=html.replace(/(<li><label><input type=\"checkbox\"[\s\S]*?<\/label><\/li>\n?)+/gs,m=>"<ul class=tasks>"+m.replace(/\n/g,"")+"</ul>")
html=html.replace(/\n\n+/g,"<br/><br/>")
out.innerHTML=html
  if(window.Prism&&Prism.highlightAll)Prism.highlightAll()
}
preview.addEventListener("click",render)
out.addEventListener('change',e=>{const t=e.target;if(t&&t.matches('input[type="checkbox"][data-line]')){const idx=parseInt(t.getAttribute('data-line'),10);const arr=(md.value||"").split(/\n/);const line=arr[idx]||"";if(/^\s*- \[(x|\s)\] /.test(line)){arr[idx]=line.replace(/^\s*- \[(x|\s)\] /,`- [${t.checked?'x':' '}] `);md.value=arr.join("\n");render()}}})
clear.addEventListener("click",()=>{md.value="";out.innerHTML=""})
toggleTheme.addEventListener("click",()=>{document.body.classList.toggle("dark");const isDark=document.body.classList.contains("dark");localStorage.setItem(THEME_KEY,isDark?"dark":"light")})
;(function(){const t=localStorage.getItem(THEME_KEY);if(t==="dark"){document.body.classList.add("dark")}})()
exportHtml.addEventListener("click",()=>{const blob=new Blob([out.innerHTML],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="markdown.html";a.click();URL.revokeObjectURL(url)})
exportPdf.addEventListener("click",()=>{const w=window.open("","_blank");if(!w)return;const css='@page{margin:20mm}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif;padding:20px;-webkit-print-color-adjust:exact} pre{background:#0f172a;color:#e5e7eb;padding:10px;border-radius:8px} img{max-width:100%} header,footer{position:fixed;left:0;right:0} header{top:0;padding:8px 20px;border-bottom:1px solid #ddd} footer{bottom:0;padding:8px 20px;border-top:1px solid #ddd;font-size:12px} h1,h2,h3{page-break-after:avoid} table,pre{page-break-inside:avoid} .page-break{page-break-before:always} footer .page:after{content:counter(page)}';
  const title=(document.getElementById('pdfTitle')?.value||'Markdown 导出');
  const sub=(document.getElementById('pdfSub')?.value||'');
  const dt=(document.getElementById('pdfDate')?.value||new Date().toLocaleString());
  const logo=(document.getElementById('pdfLogo')?.value||'');
  const author=(document.getElementById('pdfAuthor')?.value||'');
  const hdr=(logo?`<img src="${logo}" alt="logo" style="height:24px;vertical-align:middle;margin-right:8px"/>`:"")+title+(sub?(' · '+sub):'')+(author?` · 作者 ${author}`:'');
  const ftr='第 <span class="page"></span> 页 · '+dt;
  w.document.write('<html><head><title>Markdown</title><style>'+css+'</style></head><body><header>'+hdr+'</header><footer>'+ftr+'</footer><main style="margin-top:48px;margin-bottom:48px">'+out.innerHTML+'</main></body></html>');w.document.close();w.focus();w.print();})
