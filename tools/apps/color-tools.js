const picker=document.getElementById("picker")
const hex=document.getElementById("hex")
const apply=document.getElementById("apply")
const conv=document.getElementById("conv")
const vars=document.getElementById("vars")
const contrast=document.getElementById("contrast")
const fg=document.getElementById("fg")
const bg=document.getElementById("bg")
const savePalette=document.getElementById("savePalette")
const sharePalette=document.getElementById("sharePalette")
const palette=document.getElementById("palette")
const exportPalette=document.getElementById("exportPalette")
const importFile=document.getElementById("importFile")
const paletteSet=document.getElementById("paletteSet")
const paletteSelect=document.getElementById("paletteSelect")
const targetRatio=document.getElementById("targetRatio")
const adjustAA=document.getElementById("adjustAA")
function clamp(n){return Math.min(255,Math.max(0,n))}
function hexToRgb(h){const s=h.replace(/^#/,'');if(s.length===3){const r=parseInt(s[0]+s[0],16),g=parseInt(s[1]+s[1],16),b=parseInt(s[2]+s[2],16);return {r,g,b}}const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);return {r,g,b}}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(x=>clamp(x).toString(16).padStart(2,'0')).join('')}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h/=6}return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}}
function hslToHex(h,s,l){h=Number(h);s=Number(s)/100;l=Number(l)/100;const c=(1-Math.abs(2*l-1))*s;const x=c*(1-Math.abs((h/60)%2-1));const m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return rgbToHex(Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255))}
function luminance(r,g,b){const a=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]}
function contrastRatio(c1,c2){const r1=luminance(c1.r,c1.g,c1.b)+0.05;const r2=luminance(c2.r,c2.g,c2.b)+0.05;const ratio=r1>r2?r1/r2:r2/r1;return Math.round(ratio*100)/100}
function wcag(ratio){let level="不达标";if(ratio>=7)level="AAA";else if(ratio>=4.5)level="AA";else if(ratio>=3)level="AA(大字)";return level}
function getAll(){try{const raw=localStorage.getItem("tools_color_palettes");if(raw){const obj=JSON.parse(raw);if(Array.isArray(obj)){return {default:obj}}if(obj&&typeof obj==="object")return obj}const legacy=JSON.parse(localStorage.getItem("tools_color_palette")||"[]");return {default:legacy}}catch(_){return {default:[]}}}
function setAll(obj){localStorage.setItem("tools_color_palettes",JSON.stringify(obj))}
function curSet(){return (paletteSet.value||"default")}
function renderPalette(){const all=getAll();const set=curSet();const data=all[set]||[];palette.innerHTML="";data.forEach((col,idx)=>{const wrap=document.createElement('div');wrap.style.display='inline-flex';wrap.style.alignItems='center';wrap.style.gap='6px';const box=document.createElement('div');box.style.width='40px';box.style.height='30px';box.style.border='1px solid #ddd';box.style.borderRadius='6px';box.style.background=col;box.title=col;const del=document.createElement('button');del.className='btn secondary';del.textContent='删';del.addEventListener('click',()=>{const arr=getAll()[set]||[];arr.splice(idx,1);const all2=getAll();all2[set]=arr;setAll(all2);renderPalette()});const left=document.createElement('button');left.className='btn secondary';left.textContent='←';left.addEventListener('click',()=>{const arr=getAll()[set]||[];if(idx>0){[arr[idx-1],arr[idx]]=[arr[idx],arr[idx-1]];const all2=getAll();all2[set]=arr;setAll(all2);renderPalette()}});const right=document.createElement('button');right.className='btn secondary';right.textContent='→';right.addEventListener('click',()=>{const arr=getAll()[set]||[];if(idx<arr.length-1){[arr[idx+1],arr[idx]]=[arr[idx],arr[idx+1]];const all2=getAll();all2[set]=arr;setAll(all2);renderPalette()}});wrap.appendChild(box);wrap.appendChild(left);wrap.appendChild(right);wrap.appendChild(del);palette.appendChild(wrap)})}
function renderSetSelect(){const all=getAll();paletteSelect.innerHTML='';Object.keys(all).forEach(k=>{const opt=document.createElement('option');opt.value=k;opt.textContent=k;paletteSelect.appendChild(opt)});paletteSelect.value=curSet()}
function update(){const color=hex.value||picker.value||'#000000';picker.value=color;hex.value=color;const {r,g,b}=hexToRgb(color);const {h,s,l}=rgbToHsl(r,g,b);conv.innerText=`HEX ${color}\nRGB ${r}, ${g}, ${b}\nHSL ${h}°, ${s}%, ${l}%`;vars.innerHTML='';[ -20,-10,10,20 ].forEach(d=>{const nl=Math.max(0,Math.min(100,l+d));const c=`hsl(${h}, ${s}%, ${nl}%)`;const box=document.createElement('div');box.style.width='60px';box.style.height='40px';box.style.border='1px solid #ddd';box.style.borderRadius='8px';box.style.background=c;const label=document.createElement('div');label.className='small';label.innerText=c;const wrap=document.createElement('div');wrap.appendChild(box);wrap.appendChild(label);vars.appendChild(wrap)})}
function updateContrast(){const c1=hexToRgb(fg.value||'#000000');const c2=hexToRgb(bg.value||'#ffffff');const r=contrastRatio(c1,c2);let hint='';if(r<4.5){const hsl=rgbToHsl(c1.r,c1.g,c1.b);const target=4.5;let lo=0,hi=1,ans=0;for(let i=0;i<12;i++){const mid=(lo+hi)/2;const test=contrastRatio(hexToRgb(hslToHex(hsl.h,hsl.s,Math.min(100,Math.max(0,hsl.l+mid*100)))),c2);if(test>=target){ans=mid;hi=mid}else{lo=mid}}if(ans>0.01){hint=` · 建议将前景${ans>0?'调亮':''} ${(ans*100).toFixed(0)}%`}else{hint=''} }
contrast.innerText=`前景/背景对比度: ${r} (${wcag(r)})`+hint}
function recommendFg(bgHex){const rBlack=contrastRatio(hexToRgb('#000000'),hexToRgb(bgHex));const rWhite=contrastRatio(hexToRgb('#ffffff'),hexToRgb(bgHex));return rBlack>=rWhite?'#000000':'#ffffff'}
savePalette.addEventListener('click',()=>{const all=getAll();const set=curSet();const arr=all[set]||[];arr.push(hex.value||picker.value||'#000000');all[set]=arr;setAll(all);renderPalette()})
sharePalette.addEventListener('click',()=>{const all=getAll();const set=curSet();const data=all[set]||[];const url=location.origin+location.pathname+"?paletteSet="+encodeURIComponent(set)+"&palette="+encodeURIComponent(data.join(','));navigator.clipboard.writeText(url).then(()=>{}).catch(()=>{})})
exportPalette.addEventListener('click',()=>{const data=JSON.stringify(getAll());const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='palettes.json';a.click();URL.revokeObjectURL(url)})
importFile.addEventListener('change',()=>{const f=importFile.files&&importFile.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(Array.isArray(data)){const all=getAll();all['default']=data;setAll(all);renderPalette()}else if(data&&typeof data==='object'){setAll(data);renderPalette()}}catch(_){}};reader.readAsText(f)})
apply.addEventListener('click',update)
picker.addEventListener('input',()=>{hex.value=picker.value;update()})
update();renderPalette();
fg.value=hex.value||picker.value||'#000000';bg.value='#ffffff';updateContrast();
hex.addEventListener('input',()=>{update()})
fg.addEventListener('input',updateContrast)
bg.addEventListener('input',()=>{const bgHex=bg.value||'#ffffff';fg.value=recommendFg(bgHex);updateContrast()})
paletteSet.addEventListener('input',renderPalette)
paletteSelect.addEventListener('change',()=>{paletteSet.value=paletteSelect.value;renderPalette()})
renderSetSelect()
adjustAA.addEventListener('click',()=>{const bgHex=bg.value||'#ffffff';const target=parseFloat(targetRatio?.value||'4.5');const c2=hexToRgb(bgHex);const c1=hexToRgb(fg.value||'#000000');const base=rgbToHsl(c1.r,c1.g,c1.b);function tryAdjust(sign){let lo=0,hi=1,ans=null;for(let i=0;i<14;i++){const mid=(lo+hi)/2;const l2=Math.min(100,Math.max(0,base.l+sign*mid*100));const hex=hslToHex(base.h,base.s,l2);const r=contrastRatio(hexToRgb(hex),c2);if(r>=target){ans=hex;hi=mid}else{lo=mid}}return ans}
  const up=tryAdjust(1),down=tryAdjust(-1);const pick=up||down; if(pick){fg.value=pick;updateContrast()}})
