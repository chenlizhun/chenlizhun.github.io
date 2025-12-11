let boardEl,movesEl,timeEl,poemTextEl,poemMetaEl,hintGridEl
let tiles=[]
let positions=[]
let correct=[]
let moves=0
let timer=null
let seconds=0
let imgDataUrl=""

function pickAutumnPoem(){
  const list=(window.POEMS&&window.POEMS.autumn)||[]
  const p=list[Math.floor(Math.random()*list.length)]||{sentence:"秋风送爽",author:"佚名",title:"秋景",dynasty:""}
  return p
}

function buildImage(poem){
  const c=document.createElement("canvas")
  c.width=330;c.height=330
  const g=c.getContext("2d")
  const grd=g.createLinearGradient(0,0,330,330)
  grd.addColorStop(0,"#fff3e0")
  grd.addColorStop(.5,"#ffe0b2")
  grd.addColorStop(1,"#ffcc80")
  g.fillStyle=grd
  g.fillRect(0,0,330,330)
  // 背景落叶
  for(let i=0;i<24;i++){
    g.font=`${16+Math.random()*12}px serif`
    g.globalAlpha=.18
    g.fillStyle=["#d84315","#6d4c41","#8d6e63"][Math.floor(Math.random()*3)]
    g.fillText(Math.random()<.5?"🍁":"🍂",Math.random()*330,Math.random()*330)
  }
  g.globalAlpha=1
  // 将诗句居中绘制到中排（y≈165），按字符高亮关键字
  const text=(poem.sentence||"秋色连波")
  g.textAlign="left"
  g.textBaseline="middle"
  g.font="bold 24px serif"
  // 计算总宽以居中
  let total=0
  for(const ch of text){ total+=g.measureText(ch).width }
  let x=165-total/2
  const y=165
  const highlights=(window.HIGHLIGHT_CHARS||[])
  for(const ch of text){
    const w=g.measureText(ch).width
    const isHL=highlights.includes(ch)
    g.fillStyle=isHL?"#d84315":"#5d4037"
    g.fillText(ch,x,y)
    x+=w
  }
  // 不再绘制下方元信息，避免跨排
  imgDataUrl=c.toDataURL()
}

function createTiles(){
  tiles=[];positions=[];correct=[]
  for(let r=0;r<3;r++){
    for(let c=0;c<3;c++){
      const idx=r*3+c
      const x=c*110,y=r*110
      const t=document.createElement("div")
      t.className="tile"
      t.dataset.idx=String(idx)
      t.style.backgroundImage=`url(${imgDataUrl})`
      t.style.backgroundPosition=`-${x}px -${y}px`
      t.addEventListener("click",onTileClick)
      tiles.push(t)
      correct.push(idx)
    }
  }
}

function renderBoard(){
  boardEl.innerHTML=""
  positions=shuffle([...correct])
  positions.forEach(i=>boardEl.appendChild(tiles[i]))
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
  return arr
}

let first=null
function onTileClick(e){
  const t=e.currentTarget
  if(!first){first=t; t.style.outline="2px solid #ff8f00";return}
  const aIdx=Array.prototype.indexOf.call(boardEl.children,first)
  const bIdx=Array.prototype.indexOf.call(boardEl.children,t)
  if(aIdx===bIdx){first.style.outline="";first=null;return}
  const a=first;const b=t
  boardEl.insertBefore(b,a)
  boardEl.insertBefore(a,boardEl.children[bIdx])
  a.style.outline=""; first=null
  moves++; movesEl.textContent=String(moves)
  checkWin()
}

function checkWin(){
  const kids=[...boardEl.children]
  // 仅检查中间一排（索引 3、4、5）是否还原
  const ok=(
    Number(kids[3]?.dataset.idx)===3 &&
    Number(kids[4]?.dataset.idx)===4 &&
    Number(kids[5]?.dataset.idx)===5
  )
  if(ok){
    clearInterval(timer)
    showSuccess()
  }
}

function showSuccess(){
  const overlay=document.createElement("div")
  overlay.className="success"
  const card=document.createElement("div")
  card.className="success-card"
  const t=document.createElement("div")
  t.className="success-title"
  t.textContent="拼图完成！"
  const p=document.createElement("div")
  p.textContent="再看一遍这句秋诗吧"
  const btn=document.createElement("button")
  btn.className="btn"
  btn.textContent="再来一局"
  btn.addEventListener("click",()=>{overlay.remove();startGame()})
  card.appendChild(t);card.appendChild(p);card.appendChild(btn)
  overlay.appendChild(card)
  document.body.appendChild(overlay)
  requestAnimationFrame(()=>overlay.classList.add("active"))
  for(let i=0;i<24;i++){setTimeout(()=>leafRain(),i*90)}
}

function leafRain(){
  const el=document.createElement("div")
  el.className="leaf"
  el.textContent=Math.random()<.5?"🍁":"🍂"
  el.style.left=`${Math.random()*90+5}vw`
  el.style.top=`-40px`
  el.style.transition="transform 2.4s linear, opacity 2.4s linear"
  document.body.appendChild(el)
  requestAnimationFrame(()=>{
    el.style.transform=`translateY(${window.innerHeight+60}px) rotate(${Math.random()*360}deg)`
    el.style.opacity="0"
  })
  setTimeout(()=>{el.remove()},2400)
}

function buildHint(){
  hintGridEl.innerHTML=""
  for(let r=0;r<3;r++){
    for(let c=0;c<3;c++){
      const n=r*3+c+1
      const cell=document.createElement("div")
      cell.className="hint-cell"
      cell.style.left=`${c*110}px`;cell.style.top=`${r*110}px`
      cell.textContent=String(n)
      hintGridEl.appendChild(cell)
    }
  }
}

function startTimer(){
  clearInterval(timer);seconds=0;timeEl.textContent="0"
  timer=setInterval(()=>{seconds++;timeEl.textContent=String(seconds)},1000)
}

function startGame(){
  const poem=pickAutumnPoem()
  poemTextEl.textContent=poem.sentence||"秋风萧瑟，洪波涌起"
  const meta=`${poem.dynasty||""} ${poem.author||""}《${poem.title||"秋景"}》`
  poemMetaEl.textContent=meta
  buildImage(poem)
  createTiles()
  renderBoard()
  moves=0;movesEl.textContent="0"
  startTimer()
  buildHint()
}

function init(){
  boardEl=document.getElementById("board")
  movesEl=document.getElementById("moves")
  timeEl=document.getElementById("time")
  poemTextEl=document.getElementById("poemText")
  poemMetaEl=document.getElementById("poemMeta")
  hintGridEl=document.getElementById("hintGrid")
  document.getElementById("shuffleBtn").addEventListener("click",()=>startGame())
  document.getElementById("hintBtn").addEventListener("click",()=>{
    hintGridEl.classList.add("active")
    setTimeout(()=>hintGridEl.classList.remove("active"),800)
  })
  startGame()
}

window.addEventListener("DOMContentLoaded",init)
