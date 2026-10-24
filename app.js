'use strict';
const $=s=>document.querySelector(s), canvas=$('#board'),ctx=canvas.getContext('2d');
const KANA=[...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const NAMES={balloon:'ふうせん',bee:'はち',butterfly:'ちょうちょ'};
let saved;try{saved=JSON.parse(localStorage.getItem('potsupotsu-v1'))}catch{}
let state={letter:'あ',theme:'balloon',autoTheme:'manual',density:'normal',motion:'on',bag:[],done:[],...saved};
if(!KANA.includes(state.letter))state.letter='あ';
if(!NAMES[state.theme])state.theme='balloon';
if(!Array.isArray(state.bag))state.bag=[];
if(!Array.isArray(state.done))state.done=[];
let points=[],W=900,H=500,scale=1,offsetX=0,offsetY=0,paused=false,active=null,last=null,frame=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function persist(){try{localStorage.setItem('potsupotsu-v1',JSON.stringify(state))}catch{}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function generate(){const mask=document.createElement('canvas');mask.width=600;mask.height=600;const m=mask.getContext('2d');m.font='500 475px "Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';m.textAlign='center';m.textBaseline='middle';m.fillText(state.letter,300,310);const data=m.getImageData(0,0,600,600).data;const step=state.density==='fine'?24:31;points=[];let row=0;for(let y=70;y<545;y+=step*.87,row++){for(let x=65+(row%2)*step/2;x<545;x+=step){if(data[(Math.round(y)*600+Math.round(x))*4+3]>140)points.push({x:x-300,y:y-300,done:state.done.includes(points.length),at:0})}}}
function sync(){ $('#current').textContent=state.letter;$('#modeLabel').textContent=NAMES[state.theme];document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===state.theme)));for(const id of ['autoTheme','density','motion'])$('#'+id).value=state[id];const complete=points.length&&points.every(p=>p.done);$('#status').textContent=complete?'できあがり。つぎも、じぶんのペースで。':'さわると、くもにかわるよ'}
function cloud(x,y,r){ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.ellipse(x,y+3,r,r*.58,0,0,Math.PI*2);ctx.fill();for(const [dx,dy,rr]of [[-.4,0,.57],[.1,-.25,.68],[.55,.05,.48]]){ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*rr,0,Math.PI*2);ctx.fill()}}
function icon(p,r,t){const x=p.x,y=p.y;if(p.done){cloud(x,y,r*.94);if(p.at&&t-p.at<280&&state.motion==='on'&&!reduced.matches){const f=(t-p.at)/280;ctx.strokeStyle='rgba(255,242,192,'+(1-f)+')';ctx.lineWidth=1.6;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*(1+f),y+Math.sin(a)*r*(1+f));ctx.lineTo(x+Math.cos(a)*r*(1.25+f),y+Math.sin(a)*r*(1.25+f));ctx.stroke()}}return}
ctx.save();ctx.translate(x,y);
if(state.theme==='balloon'){ctx.strokeStyle='#ddcda4';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,r*.8);ctx.quadraticCurveTo(-4,r*1.05,1,r*1.2);ctx.stroke();const colors=['#e6aa80','#e6c16e','#a6c8ba'];ctx.fillStyle=colors[Math.abs(Math.round(x+y))%3];ctx.beginPath();ctx.ellipse(0,-2,r*.7,r*.84,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(0,r*.6);ctx.lineTo(-3,r*.85);ctx.lineTo(3,r*.85);ctx.fill();ctx.strokeStyle='#ffffff80';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-r*.26,-r*.3,2,r*.23,.3,0,Math.PI*2);ctx.stroke()}
else if(state.theme==='bee'){ctx.fillStyle='#d9ebea';for(const d of [-1,1]){ctx.beginPath();ctx.ellipse(d*r*.4,-r*.5,r*.38,r*.52,d*.5,0,Math.PI*2);ctx.fill()}ctx.save();ctx.beginPath();ctx.ellipse(0,2,r*.78,r*.52,0,0,Math.PI*2);ctx.clip();ctx.fillStyle='#e9c66d';ctx.fillRect(-r,-r,2*r,2*r);ctx.fillStyle='#485752';ctx.fillRect(-r*.32,-r,3,2*r);ctx.fillRect(r*.12,-r,3,2*r);ctx.restore();ctx.fillStyle='#344b4c';ctx.beginPath();ctx.arc(r*.62,0,r*.3,0,Math.PI*2);ctx.fill()}
else{for(const d of [-1,1]){ctx.fillStyle=d<0?'#c3b4db':'#d6c3e4';ctx.beginPath();ctx.ellipse(d*r*.43,-r*.3,r*.49,r*.68,d*.45,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a6c7cd';ctx.beginPath();ctx.ellipse(d*r*.34,r*.4,r*.38,r*.43,-d*.4,0,Math.PI*2);ctx.fill()}ctx.strokeStyle='#435b64';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-r*.6);ctx.lineTo(0,r*.65);ctx.stroke()}ctx.restore()}
function draw(t=performance.now()){frame=0;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);ctx.fillStyle='#ffffff03';ctx.font='500 475px "Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(state.letter,0,10);const r=(state.density==='fine'?24:31)*.46;let anim=false;for(const p of points){icon(p,r,t);if(p.at&&t-p.at<300)anim=true}if(points.length&&points.every(p=>p.done)){ctx.fillStyle='#fffdf6';ctx.fillText(state.letter,0,10)}ctx.restore();if(anim&&!paused)requestDraw()}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw)}
function resize(){const box=canvas.getBoundingClientRect();W=box.width;H=box.height;canvas.width=Math.round(W*devicePixelRatio);canvas.height=Math.round(H*devicePixelRatio);scale=Math.min((W-50)/600,(H-55)/530);offsetX=W/2;offsetY=(H-25)/2;requestDraw()}
function hit(a,b){if(paused)return;let changed=false;const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,r=(state.density==='fine'?24:31)*.62;for(let i=0;i<points.length;i++){const p=points[i];if(p.done)continue;const u=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;if(Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy)<=r){p.done=true;p.at=performance.now();state.done.push(i);changed=true}}if(changed){persist();sync();requestDraw()}}
function position(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left-offsetX)/scale,y:(e.clientY-b.top-offsetY)/scale}}
canvas.addEventListener('pointerdown',e=>{if(paused||active!==null)return;e.preventDefault();active=e.pointerId;canvas.setPointerCapture(active);last=position(e);hit(last,last)});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==active)return;e.preventDefault();for(const sample of (e.getCoalescedEvents?.()||[e])){const now=position(sample);hit(last,now);last=now}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===active){active=null;last=null}});
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{state.theme=b.dataset.theme;persist();sync();requestDraw()});
$('#next').onclick=()=>{if(!state.bag.length)state.bag=shuffle(KANA.filter(c=>c!==state.letter));let next=state.bag.pop();if(!KANA.includes(next))next='あ';state.letter=next;state.done=[];if(state.autoTheme==='random'){const choices=Object.keys(NAMES).filter(k=>k!==state.theme);state.theme=choices[Math.floor(Math.random()*choices.length)]}generate();persist();sync();requestDraw()};
function pause(value){paused=value;active=null;last=null;$('#paused').hidden=!value;requestDraw()}
$('#pause').onclick=()=>pause(true);$('#resume').onclick=()=>pause(false);
$('#settings').onclick=()=>$('#dialog').showModal();
for(const id of ['autoTheme','density','motion'])$('#'+id).onchange=e=>{state[id]=e.target.value;if(id==='density'){state.done=[];generate()}persist();sync();requestDraw()};
window.addEventListener('pagehide',persist);new ResizeObserver(resize).observe(canvas);
document.fonts.ready.then(()=>{generate();sync();resize()});

