const file=document.getElementById("file")
const format=document.getElementById("format")
const quality=document.getElementById("quality")
const maxW=document.getElementById("maxW")
const maxH=document.getElementById("maxH")
const useExif=document.getElementById("useExif")
const convert=document.getElementById("convert")
const downloadZip=document.getElementById("downloadZip")
const origList=document.getElementById("origList")
const outList=document.getElementById("outList")
const dropZone=document.getElementById("dropZone")
const concurrency=document.getElementById("concurrency")
const progress=document.getElementById("progress")
const zipMax=document.getElementById("zipMax")
const zipLevel=document.getElementById("zipLevel")
const avifOpt=document.getElementById("avifOpt")
const avifQuality=document.getElementById("avifQuality")
const zipProgress=document.getElementById("zipProgress")
const pauseBtn=document.getElementById("pause")
const resumeBtn=document.getElementById("resume")
const cancelBtn=document.getElementById("cancel")
const errors=document.getElementById("errors")
let paused=false,canceled=false
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function renderOrig(files){origList.innerHTML="";Array.from(files).forEach(f=>{const url=URL.createObjectURL(f);const wrap=document.createElement("div");const img=document.createElement("img");img.src=url;img.style.maxWidth="100%";const info=document.createElement("div");info.className="small";info.textContent="大小: "+f.size+"B";wrap.appendChild(img);wrap.appendChild(info);origList.appendChild(wrap)})}
file.addEventListener("change",()=>{const files=file.files||[];renderOrig(files)})
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.style.borderColor='#3b82f6'})
dropZone.addEventListener('dragleave',e=>{e.preventDefault();dropZone.style.borderColor='#ddd'})
async function collectEntries(items){const files=[];async function walkEntry(entry){return new Promise(resolve=>{if(entry.isFile){entry.file(f=>{if(f && /^image\//.test(f.type)) files.push(f);resolve()})}else if(entry.isDirectory){const reader=entry.createReader();const readAll=()=>reader.readEntries(async ents=>{if(ents.length){for(const en of ents){await walkEntry(en)}readAll()}else{resolve()}});readAll()}else{resolve()}})}
  const ops=[];for(const it of items){const en=it.webkitGetAsEntry?it.webkitGetAsEntry():null;if(en){ops.push(walkEntry(en))}}
  await Promise.all(ops);return files}
dropZone.addEventListener('drop',async e=>{e.preventDefault();dropZone.style.borderColor='#3b82f6';const dt=e.dataTransfer;if(dt.items&&dt.items.length){const filesList=await collectEntries(dt.items);const dataTransfer=new DataTransfer();filesList.forEach(f=>dataTransfer.items.add(f));file.files=dataTransfer.files;renderOrig(dataTransfer.files)}else{const filesList=dt.files;file.files=filesList;renderOrig(filesList)}})
async function drawWithExif(file){if(!useExif.checked||!window.createImageBitmap) return null;try{const bmp=await createImageBitmap(file,{imageOrientation:"from-image"});const canvas=document.createElement("canvas");canvas.width=bmp.width;canvas.height=bmp.height;const ctx=canvas.getContext("2d");ctx.drawImage(bmp,0,0);return canvas}catch(_){return null}}
let results=[]
async function compressOne(f){return new Promise(resolve=>{const url=URL.createObjectURL(f);const img=new Image();img.onerror=()=>{errors.style.display='block';errors.textContent=(errors.textContent||'')+`\n加载失败: ${f.name}`;resolve(false)};img.onload=async()=>{try{let w=img.width,h=img.height;const mw=+maxW.value||w;const mh=+maxH.value||h;const ratio=Math.min(1,mw/w,mh/h);w=Math.floor(w*ratio);h=Math.floor(h*ratio);let canvas=await drawWithExif(f);if(!canvas){canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,w,h)}
const q=Math.min(1,Math.max(0.1,+quality.value||0.8));canvas.toBlob(async b=>{if(!b){errors.style.display='block';errors.textContent=(errors.textContent||'')+`\n生成失败: ${f.name}`;resolve(false);return}const wrap=document.createElement("div");const outImg=document.createElement("img");const blobUrl=URL.createObjectURL(b);outImg.src=blobUrl;outImg.style.maxWidth="100%";const info=document.createElement("div");info.className="small";info.textContent="大小: "+(b?b.size:0)+"B";const base=(f.name.split('.')[0]||'image');const ext=(format.value.includes('png')?'.png':format.value.includes('webp')?'.webp':'.jpg');const a=document.createElement("a");a.href=blobUrl;a.download=base+ext;a.textContent="下载";a.className="btn secondary";wrap.appendChild(outImg);wrap.appendChild(info);wrap.appendChild(a);outList.appendChild(wrap);results.push({name:a.download,blob:b});
if(avifOpt.checked&&window._avifSupport){await new Promise(r=>canvas.toBlob(av=>{if(av){results.push({name:base+'.avif',blob:av});const a2=document.createElement('a');const u2=URL.createObjectURL(av);a2.href=u2;a2.download=base+'.avif';a2.textContent='下载AVIF';a2.className='btn secondary';wrap.appendChild(a2)}r()},'image/avif',Math.min(1,Math.max(0.1,+avifQuality.value||0.8))))}
resolve(true)},format.value,q) }catch(_){errors.style.display='block';errors.textContent=(errors.textContent||'')+`\n处理失败: ${f.name}`;resolve(false)}}
img.src=url})}
async function compressAll(){outList.innerHTML="";errors.style.display='none';errors.textContent='';results=[];canceled=false;paused=false;const files=Array.from(file.files||[]);let done=0;const limit=Math.max(1,parseInt(concurrency.value||"3",10));progress.textContent=`进度: ${done}/${files.length}`;const queue=files.slice();const workers=Array.from({length:Math.min(limit,files.length)},async()=>{while(queue.length && !canceled){if(paused){await sleep(120);continue}const f=queue.shift();let ok=await compressOne(f);if(!ok){ok=await compressOne(f)}done++;progress.textContent=`进度: ${done}/${files.length}`}});await Promise.all(workers);if(canceled){progress.textContent=`已取消 · 进度: ${done}/${files.length}`}}
convert.addEventListener("click",compressAll)
pauseBtn.addEventListener('click',()=>{paused=true})
resumeBtn.addEventListener('click',()=>{paused=false})
cancelBtn.addEventListener('click',()=>{canceled=true})
// AVIF可用性检测提示
;(function(){try{const c=document.createElement('canvas');const ok=c.toDataURL('image/avif').startsWith('data:image/avif');const info=document.createElement('div');info.className='small';info.textContent='AVIF支持: '+(ok?'是':'否');outList.parentElement.insertBefore(info,outList);window._avifSupport=ok;if(!ok){avifOpt.disabled=true;avifQuality.disabled=true}}catch(_){}})()
// 打包下载 ZIP 需引入第三方库，这里提供顺序“下载全部”作为替代方案
downloadZip.addEventListener('click',async()=>{
  if(!results.length)return;
  if(!window.JSZip){alert('JSZip 未加载');return}
  const maxBytes=Math.max(0,(+zipMax.value||0))*1024*1024;const level=Math.min(9,Math.max(0,parseInt(zipLevel.value||'6',10)));
  let idx=1;let curSize=0;let zip=new JSZip();for(const r of results){const sz=r.blob&&r.blob.size||0;if(maxBytes>0 && curSize+sz>maxBytes){const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level}});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='images-part-'+idx+'.zip';a.click();URL.revokeObjectURL(url);idx++;zip=new JSZip();curSize=0}
    zip.file(r.name,r.blob);curSize+=sz
  }
  zipProgress.textContent='打包中...';
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level}},meta=>{zipProgress.textContent=`打包进度: ${meta.percent.toFixed(1)}%`});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=idx>1?'images-part-'+idx+'.zip':'images.zip';a.click();URL.revokeObjectURL(url)
  zipProgress.textContent='打包完成'
})
