const input=document.getElementById("input")
const output=document.getElementById("output")
const error=document.getElementById("error")
const format2=document.getElementById("format2")
const format4=document.getElementById("format4")
const minify=document.getElementById("minify")
const sortKeys=document.getElementById("sortKeys")
const copyOut=document.getElementById("copyOut")
const clear=document.getElementById("clear")
function parse(){error.style.display="none";error.textContent="";try{const val=input.value||"";if(!val.trim()){output.value="";return null}const obj=JSON.parse(val);return obj}catch(e){error.style.display="block";error.textContent="解析失败: "+(e&&e.message||"未知错误");return null}}
function stringify(obj,space){try{output.value=JSON.stringify(obj,null,space)}catch(e){error.style.display="block";error.textContent="序列化失败"}}
function sortObject(obj){if(Array.isArray(obj))return obj.map(sortObject);if(obj&&typeof obj==="object"){const keys=Object.keys(obj).sort();const res={};keys.forEach(k=>{res[k]=sortObject(obj[k])});return res}return obj}
format2.addEventListener("click",()=>{const obj=parse();if(obj==null)return;stringify(obj,2)})
format4.addEventListener("click",()=>{const obj=parse();if(obj==null)return;stringify(obj,4)})
minify.addEventListener("click",()=>{const obj=parse();if(obj==null)return;stringify(obj,0)})
sortKeys.addEventListener("click",()=>{const obj=parse();if(obj==null)return;const sorted=sortObject(obj);stringify(sorted,2)})
copyOut.addEventListener("click",()=>{navigator.clipboard.writeText(output.value||"").then(()=>{}).catch(()=>{})})
clear.addEventListener("click",()=>{input.value="";output.value="";error.style.display="none";error.textContent=""})
