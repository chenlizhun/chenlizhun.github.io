const cat=document.getElementById("cat")
const val=document.getElementById("val")
const from=document.getElementById("from")
const to=document.getElementById("to")
const btn=document.getElementById("convert")
const out=document.getElementById("out")
const custName=document.getElementById("custName")
const custFactor=document.getElementById("custFactor")
const addUnit=document.getElementById("addUnit")
const unitList=document.getElementById("unitList")
const customUnits=JSON.parse(localStorage.getItem("tools_units_custom")||"{}")
const maps={
  length:{base:"m",units:["m","km","cm","mm","ft","in"],toBase:(v,u)=>({m:v,km:v*1000,cm:v/100,mm:v/1000,ft:v*0.3048,in:v*0.0254}[u]),fromBase:(v,u)=>({m:v,km:v/1000,cm:v*100,mm:v*1000,ft:v/0.3048,in:v/0.0254}[u])},
  temp:{base:"C",units:["C","F","K"],toBase:(v,u)=>({C:v,F:(v-32)*5/9,K:v-273.15}[u]),fromBase:(v,u)=>({C:v,F:v*9/5+32,K:v+273.15}[u])},
  weight:{base:"kg",units:["kg","g","lb"],toBase:(v,u)=>({kg:v,g:v/1000,lb:v*0.45359237}[u]),fromBase:(v,u)=>({kg:v,g:v*1000,lb:v/0.45359237}[u])},
  speed:{base:"m/s",units:["m/s","km/h","mph","kn","m/min"],toBase:(v,u)=>({"m/s":v,"km/h":v/3.6,"mph":v*0.44704,"kn":v*0.514444,"m/min":v/60}[u]),fromBase:(v,u)=>({"m/s":v,"km/h":v*3.6,"mph":v/0.44704,"kn":v/0.514444,"m/min":v*60}[u])},
  area:{base:"m2",units:["m2","km2","cm2","mm2","acre"],toBase:(v,u)=>({"m2":v,"km2":v*1e6,"cm2":v/1e4,"mm2":v/1e6,"acre":v*4046.8564224}[u]),fromBase:(v,u)=>({"m2":v,"km2":v/1e6,"cm2":v*1e4,"mm2":v*1e6,"acre":v/4046.8564224}[u])},
  volume:{base:"m3",units:["m3","L","mL","gal"],toBase:(v,u)=>({"m3":v,"L":v/1000,"mL":v/1e6,"gal":v*0.00378541178}[u]),fromBase:(v,u)=>({"m3":v,"L":v*1000,"mL":v*1e6,"gal":v/0.00378541178}[u])}
  ,pressure:{base:"Pa",units:["Pa","kPa","bar","psi"],toBase:(v,u)=>({"Pa":v,"kPa":v*1000,"bar":v*1e5,"psi":v*6894.757293168}[u]),fromBase:(v,u)=>({"Pa":v,"kPa":v/1000,"bar":v/1e5,"psi":v/6894.757293168}[u])}
  ,energy:{base:"J",units:["J","kJ","Wh","kWh","cal"],toBase:(v,u)=>({"J":v,"kJ":v*1000,"Wh":v*3600,"kWh":v*3.6e6,"cal":v*4.184}[u]),fromBase:(v,u)=>({"J":v,"kJ":v/1000,"Wh":v/3600,"kWh":v/3.6e6,"cal":v/4.184}[u])}
}
function getUnits(catKey){const m=maps[catKey];const extra=(customUnits[catKey]||[]).map(u=>u.name);return m.units.concat(extra)}
function toBase(catKey,v,u){const m=maps[catKey];const extras=customUnits[catKey]||[];const ext=extras.find(x=>x.name===u);if(ext){return v*ext.factor}else{return m.toBase(v,u)}}
function fromBase(catKey,v,u){const m=maps[catKey];const extras=customUnits[catKey]||[];const ext=extras.find(x=>x.name===u);if(ext){return v/ext.factor}else{return m.fromBase(v,u)}}
function fill(){const m=maps[cat.value];from.innerHTML="";to.innerHTML="";getUnits(cat.value).forEach(u=>{const o=document.createElement("option");o.value=u;o.textContent=u;from.appendChild(o.cloneNode(true));to.appendChild(o)})}
function renderCustom(){unitList.innerHTML="";const arr=customUnits[cat.value]||[];arr.forEach((u,idx)=>{const tag=document.createElement('span');tag.className='badge';tag.textContent=u.name+'='+u.factor;const ren=document.createElement('button');ren.className='btn secondary';ren.textContent='重命名';ren.addEventListener('click',()=>{const nn=prompt('重命名',u.name||'');if(nn){arr[idx]={...u,name:nn};customUnits[cat.value]=arr;localStorage.setItem("tools_units_custom",JSON.stringify(customUnits));fill();renderCustom()}});const del=document.createElement('button');del.className='btn secondary';del.textContent='删除';del.addEventListener('click',()=>{arr.splice(idx,1);customUnits[cat.value]=arr;localStorage.setItem("tools_units_custom",JSON.stringify(customUnits));fill();renderCustom()});unitList.appendChild(tag);unitList.appendChild(ren);unitList.appendChild(del)})}
const showAll=document.getElementById("showAll")
function convert(){const v=parseFloat(val.value||"0");const b=toBase(cat.value,v,from.value);const fmt=(x)=>Number.isFinite(x)?Number(x).toLocaleString('zh-CN',{maximumFractionDigits:6}):String(x);if(showAll&&showAll.checked){const units=getUnits(cat.value).filter(u=>u!==from.value);const lines=units.map(u=>`${fmt(fromBase(cat.value,b,u))} ${u}`);out.textContent=`${fmt(v)} ${from.value} =\n`+lines.join("\n")}else{const r=fromBase(cat.value,b,to.value);out.textContent=`${fmt(v)} ${from.value} = ${fmt(r)} ${to.value}`}}
cat.addEventListener("change",()=>{fill();convert()})
cat.addEventListener("change",renderCustom)
btn.addEventListener("click",convert)
addUnit.addEventListener("click",()=>{const name=(custName.value||"").trim();const factor=parseFloat(custFactor.value||"0");if(!name||!factor)return;const arr=customUnits[cat.value]||[];arr.push({name,factor});customUnits[cat.value]=arr;localStorage.setItem("tools_units_custom",JSON.stringify(customUnits));fill();renderCustom()})
fill();convert();renderCustom()
const exportCustom=document.getElementById("exportCustom")
const importCustomFile=document.getElementById("importCustomFile")
exportCustom?.addEventListener('click',()=>{const data=JSON.stringify(customUnits);const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='custom-units.json';a.click();URL.revokeObjectURL(url)})
importCustomFile?.addEventListener('change',()=>{const f=importCustomFile.files&&importCustomFile.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(data&&typeof data==='object'){Object.assign(customUnits,data);localStorage.setItem("tools_units_custom",JSON.stringify(customUnits));fill();renderCustom()}}catch(_){}};reader.readAsText(f)})
