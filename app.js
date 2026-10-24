'use strict';
const $=s=>document.querySelector(s), canvas=$('#board'),ctx=canvas.getContext('2d');
const KANA=[...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const NAMES={balloon:'ふうせん',bee:'はち',butterfly:'ちょうちょ'};
let saved;try{saved=JSON.parse(localStorage.getItem('potsupotsu-v2'))}catch{}
let state={letter:KANA[Math.floor(Math.random()*KANA.length)],theme:Object.keys(NAMES)[Math.floor(Math.random()*3)],bag:[],done:[],...saved,density:'normal',motion:'on'};
if(!KANA.includes(state.letter))state.letter='あ';
if(!NAMES[state.theme])state.theme='balloon';
if(!Array.isArray(state.bag))state.bag=[];
if(!Array.isArray(state.done))state.done=[];
let points=[],W=900,H=500,scale=1,offsetX=0,offsetY=0,paused=false,active=null,last=null,frame=0,advanceTimer=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function persist(){try{localStorage.setItem('potsupotsu-v2',JSON.stringify(state))}catch{}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function generate(){const mask=document.createElement('canvas');mask.width=600;mask.height=600;const m=mask.getContext('2d');m.font='500 475px "Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';m.textAlign='center';m.textBaseline='middle';m.fillText(state.letter,300,310);const data=m.getImageData(0,0,600,600).data;const step=state.density==='fine'?24:31;points=[];let row=0;for(let y=70;y<545;y+=step*.87,row++){for(let x=65+(row%2)*step/2;x<545;x+=step){if(data[(Math.round(y)*600+Math.round(x))*4+3]>140)points.push({x:x-300,y:y-300,done:state.done.includes(points.length),at:0,phaseX:Math.random()*Math.PI*2,phaseY:Math.random()*Math.PI*2,speedX:.0008+Math.random()*.0007,speedY:.0007+Math.random()*.0007,ampX:1.5+Math.random()*1.5,ampY:1.5+Math.random()*1.5})}}}
function sync(){canvas.setAttribute('aria-label',state.letter+'。イラストを指でなぞる');if(points.length&&points.every(p=>p.done)&&advanceTimer===null&&!document.hidden)advanceTimer=setTimeout(()=>{advanceTimer=null;nextLetter()},1800)}
function nextLetter(){if(advanceTimer!==null)clearTimeout(advanceTimer);advanceTimer=null;active=null;last=null;if(!state.bag.length)state.bag=shuffle(KANA.filter(c=>c!==state.letter));state.letter=state.bag.pop();state.done=[];state.theme=Object.keys(NAMES)[Math.floor(Math.random()*3)];generate();persist();sync();resize()}
function cloud(x,y,r){ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.ellipse(x,y+3,r,r*.58,0,0,Math.PI*2);ctx.fill();for(const [dx,dy,rr]of [[-.4,0,.57],[.1,-.25,.68],[.55,.05,.48]]){ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*rr,0,Math.PI*2);ctx.fill()}}
function floatingPosition(p,t){if(p.done||reduced.matches)return{x:p.x,y:p.y};return{x:p.x+Math.sin(t*p.speedX+p.phaseX)*p.ampX,y:p.y+Math.sin(t*p.speedY+p.phaseY)*p.ampY}}
function icon(p,r,t){const pos=floatingPosition(p,t);p.displayX=pos.x;p.displayY=pos.y;const x=pos.x,y=pos.y;if(p.done){cloud(x,y,r*.94);if(p.at&&t-p.at<280&&state.motion==='on'&&!reduced.matches){const f=(t-p.at)/280;ctx.strokeStyle='rgba(255,242,192,'+(1-f)+')';ctx.lineWidth=1.6;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*(1+f),y+Math.sin(a)*r*(1+f));ctx.lineTo(x+Math.cos(a)*r*(1.25+f),y+Math.sin(a)*r*(1.25+f));ctx.stroke()}}return}
ctx.save();ctx.translate(x,y);
if(state.theme==='balloon'){ctx.strokeStyle='#ddcda4';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,r*.8);ctx.quadraticCurveTo(-4,r*1.05,1,r*1.2);ctx.stroke();const colors=['#e6aa80','#e6c16e','#a6c8ba'];ctx.fillStyle=colors[Math.abs(Math.round(p.x+p.y))%3];ctx.beginPath();ctx.ellipse(0,-2,r*.7,r*.84,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(0,r*.6);ctx.lineTo(-3,r*.85);ctx.lineTo(3,r*.85);ctx.fill();ctx.strokeStyle='#ffffff80';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-r*.26,-r*.3,2,r*.23,.3,0,Math.PI*2);ctx.stroke()}
else if(state.theme==='bee'){drawBee(r)}
else{
for(const d of [-1,1]){
ctx.fillStyle=d<0?'#a253a2':'#bd5b91';ctx.strokeStyle='#66356f';ctx.lineWidth=1.05;
ctx.beginPath();ctx.ellipse(d*r*.43,-r*.3,r*.49,r*.68,d*.45,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle=d<0?'#be6b9e':'#a967ac';ctx.beginPath();ctx.ellipse(d*r*.34,r*.4,r*.38,r*.43,-d*.4,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle='#f5dfb1';ctx.beginPath();ctx.ellipse(d*r*.53,-r*.38,r*.13,r*.24,d*.45,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(d*r*.40,r*.42,r*.10,0,Math.PI*2);ctx.fill();
}
ctx.strokeStyle='#513651';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-r*.6);ctx.lineTo(0,r*.65);ctx.stroke();
ctx.lineWidth=1;for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(0,-r*.5);ctx.quadraticCurveTo(d*r*.12,-r*.83,d*r*.25,-r*.84);ctx.stroke()}
}ctx.restore()}
// A softly illustrated honeybee, drawn in normalized coordinates.
function drawBee(r){
ctx.save();ctx.scale(r,r);ctx.lineCap='round';ctx.lineJoin='round';
const ellipse=(x,y,rx,ry,angle,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.fill()};
const line=(coords,color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(coords[0],coords[1]);for(let i=2;i<coords.length;i+=2)ctx.lineTo(coords[i],coords[i+1]);ctx.stroke()};
// Six short bent legs, behind the body.
for(const side of [-1,1])for(let i=0;i<3;i++){
const x=-.31+i*.24;line([x,.1*side,x-.1,.43*side,x-.24,.64*side],'#66503a',.052);
}
// Two pairs of translucent wings, with a restrained edge and vein.
for(const [x,y,rx,ry,angle]of [[-.16,-.45,.27,.49,-.58],[-.44,-.28,.23,.36,-.9]]){
ellipse(x,y,rx,ry,angle,'rgba(220,241,239,.88)');
ctx.strokeStyle='rgba(250,255,255,.65)';ctx.lineWidth=.035;ctx.stroke();
line([.02,-.08,x-.08,y-.2],'rgba(143,186,186,.65)',.025);
}
// Tapered gold abdomen and rounded dark bands.
ctx.save();ctx.beginPath();ctx.ellipse(-.36,.1,.59,.37,.12,0,Math.PI*2);ctx.clip();
ellipse(-.36,.1,.59,.37,.12,'#e5ad42');
ellipse(-.39,-.02,.54,.24,.12,'#f3cb65');
for(const x of [-.64,-.34,-.04]){
ctx.strokeStyle='#514536';ctx.lineWidth=.13;ctx.beginPath();
ctx.moveTo(x,-.35);ctx.quadraticCurveTo(x+.16,.08,x-.05,.55);ctx.stroke();
}
ctx.restore();
// Soft overlapping shapes suggest the thorax's down without photorealistic hairs.
ellipse(.14,.03,.31,.32,-.15,'#b98536');
for(const [x,y]of [[-.03,-.17],[.13,-.23],[.27,-.15],[.02,.2],[.2,.23]])ellipse(x,y,.105,.10,0,'#c79b4a');
ellipse(.13,-.02,.24,.24,0,'#d9b365');
ellipse(.11,-.10,.18,.12,-.3,'#e4c981');
// Distinct head, two antennae and a small glossy eye; no stinger or cartoon face.
line([.52,-.16,.51,-.44,.39,-.52],'#544737',.045);
line([.65,-.12,.77,-.36,.88,-.39],'#544737',.045);
ellipse(.39,-.52,.04,.04,0,'#544737');ellipse(.88,-.39,.04,.04,0,'#544737');
ellipse(.60,.015,.26,.255,-.22,'#584b39');
ellipse(.59,-.085,.19,.12,-.3,'#726248');
ellipse(.73,-.02,.065,.09,-.2,'#242f2d');
ellipse(.745,-.045,.019,.026,0,'#f7f5dd');
line([.79,.12,.90,.17],'#6f5a3b',.035);
ctx.restore();
}
function draw(t=performance.now()){frame=0;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);ctx.fillStyle='#ffffff03';ctx.font='500 475px "Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(state.letter,0,10);const r=(state.density==='fine'?24:31)*.46;let anim=false;for(const p of points){icon(p,r,t);if((!p.done&&!reduced.matches)||(p.at&&t-p.at<300))anim=true}if(points.length&&points.every(p=>p.done)){ctx.fillStyle='#fffdf6';ctx.fillText(state.letter,0,10)}ctx.restore();if(anim&&!paused)requestDraw()}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw)}
function resize(){const box=canvas.getBoundingClientRect();W=box.width;H=box.height;canvas.width=Math.round(W*devicePixelRatio);canvas.height=Math.round(H*devicePixelRatio);const xs=points.map(p=>p.x),ys=points.map(p=>p.y);const left=Math.min(...xs)-22,right=Math.max(...xs)+22,top=Math.min(...ys)-22,bottom=Math.max(...ys)+22;scale=Math.min((W-36)/(right-left),(H-36)/(bottom-top));offsetX=W/2-(left+right)/2*scale;offsetY=H/2-(top+bottom)/2*scale;requestDraw()}
function hit(a,b){if(paused)return;let changed=false;const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,r=(state.density==='fine'?24:31)*.62;for(let i=0;i<points.length;i++){const p=points[i];if(p.done)continue;const px=p.displayX??p.x,py=p.displayY??p.y;const u=l?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/l)):0;if(Math.hypot(px-a.x-u*dx,py-a.y-u*dy)<=r){p.done=true;p.at=performance.now();state.done.push(i);changed=true}}if(changed){persist();sync();requestDraw()}}
function position(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left-offsetX)/scale,y:(e.clientY-b.top-offsetY)/scale}}
canvas.addEventListener('pointerdown',e=>{if(paused||active!==null)return;e.preventDefault();active=e.pointerId;canvas.setPointerCapture(active);last=position(e);hit(last,last)});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==active)return;e.preventDefault();for(const sample of (e.getCoalescedEvents?.().length?e.getCoalescedEvents():[e])){const now=position(sample);hit(last,now);last=now}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===active){active=null;last=null}});
document.addEventListener('visibilitychange',()=>{paused=document.hidden;active=null;last=null;if(paused&&advanceTimer!==null){clearTimeout(advanceTimer);advanceTimer=null}if(!paused){sync();requestDraw()}persist()});
reduced.addEventListener?.('change',requestDraw);window.addEventListener('pagehide',persist);new ResizeObserver(resize).observe(canvas);document.fonts.ready.then(()=>{generate();sync();resize()});
