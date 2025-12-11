const grid=document.getElementById("grid")
const search=document.getElementById("search")
function render(list){grid.innerHTML="";list.forEach(t=>{const a=document.createElement("a");const enabled=!!t.path;a.className="card"+(enabled?"":" disabled");if(enabled)a.href=t.path;const name=document.createElement("div");name.className="name";name.textContent=t.name;const desc=document.createElement("div");desc.className="desc";desc.textContent=t.desc+(enabled?"":" · 即将开放");a.appendChild(name);a.appendChild(desc);const tags=document.createElement("div");tags.className="row";if(Array.isArray(t.tags))t.tags.forEach(tag=>{const b=document.createElement("span");b.className="badge";b.textContent=tag;tags.appendChild(b)});a.appendChild(tags);grid.appendChild(a)})}
function filter(q){const s=(q||"").toLowerCase();const src=Array.isArray(window.TOOLS_MANIFEST)?window.TOOLS_MANIFEST:[];return src.filter(t=>{const txt=[t.name,t.desc].concat(t.tags||[]).join(" ").toLowerCase();return !s||txt.includes(s)})}
function init(){render(filter(""));search.addEventListener("input",()=>{render(filter(search.value||""))})}
init()
