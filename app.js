'use strict';
const $=s=>document.querySelector(s), canvas=$('#board'),ctx=canvas.getContext('2d');
const KANA=[...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const NAMES={balloon:'ふうせん',bee:'はち',butterfly:'ちょうちょ',ladybug:'てんとうむし',beetle:'かぶとむし'};
let saved;try{saved=JSON.parse(localStorage.getItem('potsupotsu-v2'))}catch{}
let state={letter:KANA[Math.floor(Math.random()*KANA.length)],theme:Object.keys(NAMES)[Math.floor(Math.random()*Object.keys(NAMES).length)],bag:[],done:[],...saved,density:'normal',motion:'on'};
if(!KANA.includes(state.letter))state.letter='あ';
if(!NAMES[state.theme])state.theme='balloon';
if(!Array.isArray(state.bag))state.bag=[];
if(!Array.isArray(state.done))state.done=[];
let points=[],W=900,H=500,scale=1,offsetX=0,offsetY=0,paused=false,active=null,last=null,frame=0,advanceTimer=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const bugScene=createBugScene();
function completeSet(){nextLetter();bugScene.beginBatch()}
function persist(){try{localStorage.setItem('potsupotsu-v2',JSON.stringify(state))}catch{}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function generate(){const mask=document.createElement('canvas');mask.width=600;mask.height=600;const m=mask.getContext('2d');m.font='500 475px "Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';m.textAlign='center';m.textBaseline='middle';m.fillText(state.letter,300,310);const data=m.getImageData(0,0,600,600).data;const step=state.density==='fine'?24:31;points=[];let row=0;for(let y=70;y<545;y+=step*.87,row++){for(let x=65+(row%2)*step/2;x<545;x+=step){if(data[(Math.round(y)*600+Math.round(x))*4+3]>140)points.push({x:x-300,y:y-300,done:state.done.includes(points.length),at:0,phaseX:Math.random()*Math.PI*2,phaseY:Math.random()*Math.PI*2,speedX:.0008+Math.random()*.0007,speedY:.0007+Math.random()*.0007,ampX:1.5+Math.random()*1.5,ampY:1.5+Math.random()*1.5})}}}
function sync(){if(bugScene.active)return;canvas.setAttribute('aria-label',state.letter+'。イラストを指でなぞる');if(points.length&&points.every(p=>p.done)&&advanceTimer===null&&!document.hidden)advanceTimer=setTimeout(()=>{advanceTimer=null;completeSet()},1800)}
function nextLetter(){if(advanceTimer!==null)clearTimeout(advanceTimer);advanceTimer=null;active=null;last=null;if(!state.bag.length)state.bag=shuffle(KANA.filter(c=>c!==state.letter));state.letter=state.bag.pop();state.done=[];state.theme=Object.keys(NAMES)[Math.floor(Math.random()*3)];generate();persist();sync();resize()}
function cloud(x,y,r){ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.ellipse(x,y+3,r,r*.58,0,0,Math.PI*2);ctx.fill();for(const [dx,dy,rr]of [[-.4,0,.57],[.1,-.25,.68],[.55,.05,.48]]){ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*rr,0,Math.PI*2);ctx.fill()}}
function floatingPosition(p,t){if(p.done||reduced.matches)return{x:p.x,y:p.y};return{x:p.x+Math.sin(t*p.speedX+p.phaseX)*p.ampX,y:p.y+Math.sin(t*p.speedY+p.phaseY)*p.ampY}}
function icon(p,r,t){const pos=floatingPosition(p,t);p.displayX=pos.x;p.displayY=pos.y;const x=pos.x,y=pos.y;if(p.done){cloud(x,y,r*.94);if(p.at&&t-p.at<280&&state.motion==='on'&&!reduced.matches){const f=(t-p.at)/280;ctx.strokeStyle='rgba(255,242,192,'+(1-f)+')';ctx.lineWidth=1.6;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*(1+f),y+Math.sin(a)*r*(1+f));ctx.lineTo(x+Math.cos(a)*r*(1.25+f),y+Math.sin(a)*r*(1.25+f));ctx.stroke()}}return}
ctx.save();ctx.translate(x,y);
if(state.theme==='balloon'){ctx.strokeStyle='#765068';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,r*.8);ctx.quadraticCurveTo(-4,r*1.05,1,r*1.2);ctx.stroke();const colors=['#e76671','#e9b43e','#a36ac4'];ctx.fillStyle=colors[Math.abs(Math.round(p.x+p.y))%3];ctx.beginPath();ctx.ellipse(0,-2,r*.7,r*.84,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#874c68';ctx.lineWidth=.9;ctx.stroke();ctx.beginPath();ctx.moveTo(0,r*.6);ctx.lineTo(-3,r*.85);ctx.lineTo(3,r*.85);ctx.fill();ctx.strokeStyle='#ffffff80';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-r*.26,-r*.3,2,r*.23,.3,0,Math.PI*2);ctx.stroke()}
else if(state.theme==='bee'){drawBee(r)}
else if(state.theme==='ladybug'){drawLadybug(r)}
else if(state.theme==='beetle'){drawBeetle(r)}
else{
for(const d of [-1,1]){
ctx.fillStyle='#f3de63';ctx.strokeStyle='#826b3c';ctx.lineWidth=1.05;
ctx.beginPath();ctx.ellipse(d*r*.43,-r*.3,r*.49,r*.68,d*.45,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle='#f7e994';ctx.beginPath();ctx.ellipse(d*r*.34,r*.4,r*.38,r*.43,-d*.4,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle='#fff4c4';ctx.beginPath();ctx.ellipse(d*r*.48,-r*.28,r*.15,r*.32,d*.45,0,Math.PI*2);ctx.fill();
}
ctx.strokeStyle='#74613a';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-r*.6);ctx.lineTo(0,r*.65);ctx.stroke();
ctx.lineWidth=1;for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(0,-r*.5);ctx.quadraticCurveTo(d*r*.12,-r*.83,d*r*.25,-r*.84);ctx.stroke()}
}ctx.restore()}
function drawLadybug(r){
ctx.save();ctx.scale(r,r);ctx.lineCap='round';ctx.lineJoin='round';
ctx.strokeStyle='#414039';ctx.lineWidth=.07;
for(const side of [-1,1])for(let i=0;i<3;i++){const y=-.3+i*.3;ctx.beginPath();ctx.moveTo(side*.45,y);ctx.lineTo(side*.74,y+.08);ctx.lineTo(side*.85,y-.02);ctx.stroke()}
ctx.fillStyle='#393b35';ctx.beginPath();ctx.ellipse(0,-.58,.32,.29,0,0,Math.PI*2);ctx.fill();
ctx.lineWidth=.045;for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(d*.15,-.72);ctx.quadraticCurveTo(d*.23,-.95,d*.39,-.94);ctx.stroke()}
ctx.fillStyle='#db5547';ctx.strokeStyle='#843f36';ctx.lineWidth=.055;ctx.beginPath();ctx.ellipse(0,.08,.65,.73,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.strokeStyle='#633b32';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(0,-.64);ctx.lineTo(0,.8);ctx.stroke();
ctx.fillStyle='#383b34';for(const [x,y,rr]of [[-.27,-.28,.12],[.27,-.28,.12],[-.36,.15,.14],[.36,.15,.14],[-.23,.50,.11],[.23,.50,.11]]){ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='rgba(255,237,198,.55)';ctx.beginPath();ctx.ellipse(-.38,-.25,.065,.16,.5,0,Math.PI*2);ctx.fill();ctx.restore()
}
function drawBeetle(r){
ctx.save();ctx.scale(r,r);ctx.lineCap='round';ctx.lineJoin='round';
ctx.strokeStyle='#604630';ctx.lineWidth=.075;
for(const side of [-1,1])for(let i=0;i<3;i++){const y=-.27+i*.34;ctx.beginPath();ctx.moveTo(side*.35,y);ctx.lineTo(side*.64,y+.08);ctx.lineTo(side*.79,y-.07);ctx.stroke()}
ctx.fillStyle='#815332';ctx.strokeStyle='#523b2a';ctx.lineWidth=.05;ctx.beginPath();ctx.ellipse(0,.26,.48,.62,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle='#a06c42';ctx.beginPath();ctx.ellipse(-.14,.20,.20,.46,-.1,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#593c29';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(0,-.28);ctx.lineTo(0,.85);ctx.stroke();
ctx.fillStyle='#69472e';ctx.beginPath();ctx.ellipse(0,-.30,.42,.29,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#95653d';ctx.beginPath();ctx.ellipse(-.09,-.37,.23,.11,-.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#533c2b';ctx.beginPath();ctx.ellipse(0,-.52,.25,.21,0,0,Math.PI*2);ctx.fill();
// Broad forked horn makes the silhouette readable even at a small size.
ctx.strokeStyle='#62452c';ctx.lineWidth=.14;ctx.beginPath();ctx.moveTo(0,-.55);ctx.quadraticCurveTo(.08,-.78,.02,-.96);ctx.stroke();
ctx.lineWidth=.10;ctx.beginPath();ctx.moveTo(.02,-.92);ctx.lineTo(-.13,-1.07);ctx.moveTo(.02,-.92);ctx.lineTo(.18,-1.06);ctx.stroke();
ctx.fillStyle='#e9cf98';for(const d of [-1,1]){ctx.beginPath();ctx.arc(d*.19,-.54,.027,0,Math.PI*2);ctx.fill()}ctx.restore()
}
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
function draw(t=performance.now()){frame=0;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.clearRect(0,0,W,H);if(bugScene.active){bugScene.render(t);if(!paused)requestDraw();return}ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);ctx.fillStyle='#ffffff03';ctx.font='500 475px "Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(state.letter,0,10);const r=(state.density==='fine'?24:31)*.46;let anim=false;for(const p of points){icon(p,r,t);if((!p.done&&!reduced.matches)||(p.at&&t-p.at<300))anim=true}if(points.length&&points.every(p=>p.done)){ctx.fillStyle='#fffdf6';ctx.fillText(state.letter,0,10)}ctx.restore();if(anim&&!paused)requestDraw()}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw)}
function resize(){const box=canvas.getBoundingClientRect();W=box.width;H=box.height;canvas.width=Math.round(W*devicePixelRatio);canvas.height=Math.round(H*devicePixelRatio);const xs=points.map(p=>p.x),ys=points.map(p=>p.y);const left=Math.min(...xs)-22,right=Math.max(...xs)+22,top=Math.min(...ys)-22,bottom=Math.max(...ys)+22;scale=Math.min((W-36)/(right-left),(H-36)/(bottom-top));offsetX=W/2-(left+right)/2*scale;offsetY=H/2-(top+bottom)/2*scale;requestDraw()}
function hit(a,b){if(paused)return;if(bugScene.active){bugScene.touch({x:a.x*scale+offsetX,y:a.y*scale+offsetY},{x:b.x*scale+offsetX,y:b.y*scale+offsetY});requestDraw();return;}let changed=false;const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,r=(state.density==='fine'?24:31)*.62;for(let i=0;i<points.length;i++){const p=points[i];if(p.done)continue;const px=p.displayX??p.x,py=p.displayY??p.y;const u=l?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/l)):0;if(Math.hypot(px-a.x-u*dx,py-a.y-u*dy)<=r){p.done=true;p.at=performance.now();state.done.push(i);changed=true}}if(changed){persist();sync();requestDraw()}}
function position(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left-offsetX)/scale,y:(e.clientY-b.top-offsetY)/scale}}
canvas.addEventListener('pointerdown',e=>{if(paused||active!==null)return;e.preventDefault();active=e.pointerId;canvas.setPointerCapture(active);last=position(e);hit(last,last)});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==active)return;e.preventDefault();for(const sample of (e.getCoalescedEvents?.().length?e.getCoalescedEvents():[e])){const now=position(sample);hit(last,now);last=now}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===active){active=null;last=null}});
document.addEventListener('visibilitychange',()=>{paused=document.hidden;bugScene.resetClock();active=null;last=null;if(paused&&advanceTimer!==null){clearTimeout(advanceTimer);advanceTimer=null}if(!paused){sync();requestDraw()}persist()});
reduced.addEventListener?.('change',requestDraw);window.addEventListener('pagehide',persist);new ResizeObserver(resize).observe(canvas);document.fonts.ready.then(()=>{generate();resize();bugScene.beginBatch()});

// Realistic insects share a scene lifecycle; each species retains its own drawing.
function createBugScene(){
 const rnd=(a,b)=>a+Math.random()*(b-a);
 let insects=[],kind='ant',elapsed=0,clock=null,previousKind=null,running=false;
 let remaining=0, bag=[];
 const names={ant:'アリ',ladybug:'てんとう虫',spider:'蜘蛛',grasshopper:'バッタ',dragonfly:'トンボ',mantis:'カマキリ',pillbug:'ダンゴムシ',caterpillar:'青虫'};
 const lengths={grasshopper:.08,dragonfly:.09,mantis:.10,pillbug:.06,caterpillar:.09};
 function size(a){return lengths[kind]?Math.min(W,H)*lengths[kind]/56:a.scale;}
 function beginBatch(){remaining=2+Math.floor(Math.random()*2);start();}
 function finish(){if(--remaining>0){start();return;}running=false;clock=null;sync();requestDraw();}

 function ellipse(x,y,rx,ry,color,rotation=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function line(points,width,color){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function body(x,y,rx,ry){const g=ctx.createRadialGradient(x-rx*.32,y-ry*.35,1,x,y,Math.max(rx,ry));g.addColorStop(0,'#625143');g.addColorStop(.35,'#30271f');g.addColorStop(1,'#151411');ellipse(x,y,rx,ry,g);ellipse(x-rx*.2,y-ry*.35,rx*.38,ry*.16,'rgba(255,226,184,.14)',-.2);}

 function drawAnt(a,t){if(a.dead&&a.age>1.6)return;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle);ctx.scale(a.scale,a.scale);if(a.dead){ctx.globalAlpha=Math.min(1,(1.6-a.age)/.6);const press=1-Math.pow(1-Math.min(1,a.age/.14),3);ctx.scale(1+.4*press,1-.63*press);}const p=a.phase,flat=a.dead;
// 接地した細い脚を先に描き、三つの体節を重ねる。
if(flat){ellipse(-3,0,29,13,'rgba(48,35,23,.16)');}ctx.shadowColor='rgba(44,31,11,.22)';ctx.shadowBlur=flat?0:3;ctx.shadowOffsetY=flat?0:2;
for(let side of [-1,1])for(let i=0;i<3;i++){const phase=p+(i%2?Math.PI:0)+(side===1?Math.PI:0);const swing=flat?0:Math.sin(phase)*4;const lift=flat?0:Math.max(0,Math.cos(phase))*2;const rootX=3-i*4;const reach=[14,0,-15][i]*(flat?1.24:1);line([[rootX,side*3],[rootX+reach*.65+swing*.4,side*((flat?18:12)-lift)],[rootX+reach+swing,side*(23-lift)+(flat?side*11:0)]],1.25,'#342c22');line([[rootX+reach+swing,side*(23-lift)+(flat?side*11:0)],[rootX+reach+swing-2,side*(25-lift+(flat?11:0))]],.7,'#514333');}
body(-17,0,11,7.5);body(-4,0,3.1,2.7);body(3,0,7,4.5);body(14,0,6.5,5.7);if(flat){ellipse(-17,0,11,7.5,'rgba(25,20,16,.3)');ellipse(3,0,7,4.5,'rgba(25,20,16,.3)');ellipse(14,0,6.5,5.7,'rgba(25,20,16,.3)');}
// 腹部の薄い節線と頭部の眼・大顎。
ctx.shadowBlur=0;ctx.shadowOffsetY=0;for(const x of [-21,-17,-13]){ctx.beginPath();ctx.ellipse(x,0,2,6.2,0,-1.1,1.1);ctx.strokeStyle='rgba(196,159,106,.13)';ctx.lineWidth=.6;ctx.stroke();}
ellipse(15,-4,1.2,.9,'#080a08');ellipse(15,4,1.2,.9,'#080a08');line([[19,-2],[22,-2.4],[21,0]],.85,'#29231b');line([[19,2],[22,2.4],[21,0]],.85,'#29231b');
for(const side of [-1,1]){const f=flat?0:Math.sin(t*(a.paused?6:3.7)+side*2+a.phase*.07);const ax=23+f*2,ay=side*(9+f*2);line([[16,side*3],[ax,ay],[29+f*3,side*(14-f*3)]],.9,'#3b3023');ellipse(29+f*3,side*(14-f*3),.75,.75,'#3b3023');}ctx.restore();}

 function drawRealLadybug(a,t){
if(a.dead&&a.age>1.6)return;
ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle);ctx.scale(a.scale,a.scale);
const flat=a.dead;
if(flat){ctx.globalAlpha=Math.min(1,(1.6-a.age)/.6);const press=1-Math.pow(1-Math.min(1,a.age/.14),3);ctx.scale(1+.4*press,1-.63*press);}
if(flat){ellipse(-3,0,27,18,'rgba(48,35,23,.16)');}ctx.shadowColor='rgba(49,33,15,.24)';ctx.shadowBlur=flat?0:4;ctx.shadowOffsetY=flat?0:3;
for(const side of [-1,1])for(let i=0;i<3;i++){
 const phase=a.phase+(i%2?Math.PI:0)+(side===1?Math.PI:0),swing=flat?0:Math.sin(phase)*3;
 const x=9-i*8,reach=[9,0,-9][i]*(flat?1.24:1);
 line([[x,side*7],[x+reach*.5+swing*.4,side*(flat?22:16)],[x+reach+swing,side*(22+(flat?11:0))]],1.65,'#25231e');
 line([[x+reach+swing,side*(22+(flat?11:0))],[x+reach+swing+2,side*(flat?35:23)]],.85,'#39352b');
}
// 頭部、前胸背板、短い棍棒状の触角。
body(18,0,6.7,6.3);
for(const side of [-1,1]){const f=flat?0:Math.sin(t*(a.paused?5.5:3.5)+side*2);line([[21,side*3],[26,side*(6+f)],[28+f,side*(9+f)]],.95,'#28271f');ellipse(28+f,side*(9+f),1.3,.8,'#24231e');}
body(11,0,8,12);ellipse(13,-8,3.4,2.6,'#eee9d6',-.4);ellipse(13,8,3.4,2.6,'#eee9d6',.4);
// 盛り上がった赤い上翅。中央の合わせ目と七つの斑点。
const red=ctx.createRadialGradient(-7,-7,1,-3,0,25);red.addColorStop(0,'#ff7651');red.addColorStop(.4,'#e83b25');red.addColorStop(.8,'#b91c17');red.addColorStop(1,'#6e1413');
ellipse(-4,0,20,16,red);if(flat)ellipse(-4,0,20,16,'rgba(58,15,10,.3)');
ctx.shadowBlur=0;ctx.shadowOffsetY=0;
line([[15,0],[-22,0]],1.15,'#501913');
ellipse(11,0,3.5,3,'#20201b');
for(const side of [-1,1]){ellipse(4,side*9,3.5,3.2,'#1b1c18',side*.25);ellipse(-8,side*10,3.9,3.3,'#20201b',side*-.2);ellipse(-16,side*5,2.8,2.7,'#1b1c18');}
ellipse(-7,-6,8,3.5,'rgba(255,245,220,.24)',.25);ellipse(-10,-8,3,1.3,'rgba(255,255,243,.35)',.25);
ctx.restore();
}

 function drawSpider(a,t){
if(a.dead&&a.age>1.6)return;
ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle);ctx.scale(a.scale,a.scale);
const flat=a.dead;
if(flat){ctx.globalAlpha=Math.min(1,(1.6-a.age)/.6);const press=1-Math.pow(1-Math.min(1,a.age/.14),3);ctx.scale(1+.4*press,1-.63*press);}
if(flat){ellipse(-4,0,29,15,'rgba(48,35,23,.16)');}ctx.shadowColor='rgba(35,25,15,.22)';ctx.shadowBlur=flat?0:3;ctx.shadowOffsetY=flat?0:2;
// 頭胸部から左右４本ずつ伸びる、節のある８本の脚。
for(const side of [-1,1])for(let i=0;i<4;i++){
 const phase=a.phase+(i%2?Math.PI:0)+(side===1?Math.PI:0);
 const swing=flat?0:Math.sin(phase)*4;
 const lift=flat?0:Math.max(0,Math.cos(phase))*2.5;
 const rootX=8-i*3,reach=[30,17,-13,-29][i]*(flat?1.24:1);
 const kneeX=rootX+reach*.58+swing*.45,kneeY=side*((flat?25:19)-lift);
 const footX=rootX+reach+swing,footY=side*(31-lift+(flat?12:0));
 line([[rootX,side*4],[kneeX,kneeY]],2.5,'#473a2d');
 line([[kneeX,kneeY],[footX,footY]],1.65,'#342c24');
 line([[footX,footY],[footX-3,footY+side*3]],.75,'#29251e');
 ellipse(kneeX,kneeY,1.65,1.65,'#554535');
 // 脚の短い毛。
 for(let j=1;j<=3;j++){const q=j/4,x=kneeX+(footX-kneeX)*q,y=kneeY+(footY-kneeY)*q;line([[x,y],[x-2,y+side*2.3]],.45,'rgba(58,46,33,.65)');}
}
// 腹柄でつながった腹部と頭胸部。
body(-14,0,flat?15:13,flat?10:9);body(-1,0,3.5,3);body(7,0,flat?11:9.5,flat?8:7);if(flat){ellipse(-14,0,13,7,'rgba(36,27,19,.32)');ellipse(7,0,9,5,'rgba(36,27,19,.32)');}
ctx.shadowBlur=0;ctx.shadowOffsetY=0;
// 腹部の中央模様と左右の斜紋。
ellipse(-14,0,9,2.2,'rgba(172,143,100,.38)');
for(const side of [-1,1])for(let i=0;i<3;i++)line([[-20+i*5,side*2],[-17+i*5,side*6]],1.15,'rgba(188,157,110,.37)');
line([[2,0],[12,0]],1.1,'rgba(194,159,104,.3)');
// 前方の眼と短い触肢（蜘蛛には触角がない）。
for(const side of [-1,1]){ellipse(14,side*2,1.25,1.25,'#10120f');ellipse(12,side*4.5,.8,.8,'#11130f');ellipse(14.2,side*2-.3,.35,.35,'#bdc0a5');const f=flat?0:Math.sin(t*4+side*1.8)*1.2;line([[14,side*4],[20,side*(7+f)],[22,side*(4+f)]],1.15,'#574635');}
ctx.restore();
}

 function moveNew(a,dt){
  const cycle=(elapsed+a.offset)%4;
  let speed=0;
  a.height=0;
  a.roll=0;
  a.pose=cycle;
  switch(kind){
   case 'grasshopper': {
    const jump=Math.max(0,Math.min(1,(cycle-1.05)/.66));
    a.height=4*jump*(1-jump)*Math.min(W,H)*.085;
    a.crouch=cycle<1.05?Math.max(0,(cycle-.55)*2):Math.max(0,1-Math.abs(cycle-1.63)*10);
    speed=jump>0&&jump<1?Math.min(W,H)*.92:cycle<.48?62:0;
    break;
   }
   case 'dragonfly':
    a.height=Math.min(W,H)*(.06+.012*Math.sin(elapsed*5+a.offset));
    speed=cycle<1.15?0:cycle<2.75?Math.min(W,H)*.68*Math.sin(Math.PI*(cycle-1.15)/1.60):0;
    break;
   case 'mantis':
    speed=cycle>1.15&&cycle<3.25?Math.min(W,H)*.19:0;
    break;
   case 'pillbug':
    a.roll=Math.max(0,Math.min(1,(cycle-2.25)*4,(3.9-cycle)*4));
    speed=cycle<2.1?Math.min(W,H)*.17:0;
    break;
   case 'caterpillar':
    speed=cycle<2.55?Math.min(W,H)*.18*(.7+.3*Math.sin(a.gait)):0;
    break;
  }
  const margin=Math.min(W,H)*.14;
  if(speed>0&&(a.x<margin||a.x>W-margin||a.y<margin||a.y>H-margin)){
   const target=Math.atan2(H/2-a.y,W/2-a.x);
   const turn=Math.atan2(Math.sin(target-a.angle),Math.cos(target-a.angle));
   a.angle+=turn*Math.min(1,dt*12);
  }else if(speed>0){
   a.angle+=dt*a.turn*(kind==='dragonfly'?1.35:.48);
  }
  a.x+=Math.cos(a.angle)*speed*dt;
  a.y+=Math.sin(a.angle)*speed*dt;
  a.gait+=dt*(kind==='caterpillar'?(speed>0?9:0):speed*.35);
 }

 function shell(x,y,rx,ry,light,dark,angle=0){
  const gradient=ctx.createRadialGradient(x-rx*.28,y-ry*.45,0,x,y,Math.max(rx,ry));
  gradient.addColorStop(0,light);
  gradient.addColorStop(.48,light);
  gradient.addColorStop(1,dark);
  ellipse(x,y,rx,ry,gradient,angle);
 }
 function legs(a,count,width,length,color){
  for(const side of [-1,1])for(let i=0;i<count;i++){
   const x=8-i*7;
   const stride=a.dead?4:Math.sin(a.gait+(i+(side===1?1:0))*Math.PI)*4;
   line([[x,side*3],[x+stride+4,side*length*.63],[x+stride-5,side*length]],width,color);
  }
 }
 function feelers(length,color,phase){
  for(const side of [-1,1]){
   const sway=Math.sin(phase+side)*2;
   line([[21,side*2],[27,side*5],[21+length,side*(8+sway)]],.85,color);
  }
 }
 function grasshopper(a){
  const crouch=a.dead?1:a.crouch||0;
  legs(a,3,1.4,13,'#566532');
  for(const side of [-1,1]){
   const knee=-7+(a.height>3?-17:crouch*12);
   line([[-15,side*3],[knee,side*12],[-24,side*17]],2.1,'#66753b');
   line([[-15,side*3],[knee,side*12]],4.4,'#879349');
  }
  shell(-7,0,23,6,'#a4b35b','#475a2d');
  shell(10,0,10,7,'#99aa57','#566c32');
  line([[-28,1],[-6,-4],[13,-2]],.85,'#d5c685');
  for(let i=0;i<8;i++){
   const x=-25+i*4;
   line([[x,-.5],[x+4,-4]],.55,'rgba(53,68,30,.65)');
   line([[x,1],[x+4,3]],.55,'rgba(204,189,111,.58)');
  }
  for(const side of [-1,1])for(let j=0;j<4;j++){
   const x=-21+j*3;
   line([[x,side*15],[x-2,side*18]],.7,'#3b4929');
  }
  ellipse(24,-3,.65,.55,'#ece5bd');
  shell(21,0,7,6,'#c1c884','#68733c');
  ellipse(23,-3,2.3,1.7,'#303925');
  feelers(18,'#646b3a',a.dead?0:elapsed*4+a.offset);
 }
 function dragonfly(a){
  const flutter=a.dead?.95:.72+.28*Math.sin(elapsed*74+a.offset);
  for(const side of [-1,1])for(const x of [-8,4]){
   ctx.save();ctx.translate(x,0);ctx.rotate(side*(x<0?.38:.15));
   ellipse(0,side*21*flutter,5,22*flutter,'rgba(219,241,235,.73)');
   line([[0,0],[0,side*41*flutter]],.9,'rgba(53,98,91,.62)');
   for(let j=1;j<=8;j++){
   const y=j*4.5*flutter;
   line([[-3.6,side*(y+2)],[0,side*y],[3.5,side*(y+2.7)]],.46,'rgba(56,91,81,.66)');
   if(j>1)line([[2,side*y],[2,side*(y-4)]],.35,'rgba(56,91,81,.56)');
  }
  ellipse(2,side*35*flutter,1.35,2.8,'rgba(81,53,36,.7)');
   ctx.restore();
  }
  legs(a,3,1,9,'#333e3c');
  shell(-10,0,19,3.5,'#55b8bf','#174a54');
  for(let x=-25;x<5;x+=5)line([[x,-2],[x,2]],1,'#253c45');
  shell(11,0,10,6,'#568786','#284646');
  shell(22,0,5,6,'#6ca7a5','#263c3d');
  for(const side of [-1,1])shell(24,side*4,4,3.6,'#b2c4a3','#314749');
 }
 function mantis(a){
  legs(a,2,1.5,20,'#5c7838');
  shell(-11,0,18,5,'#afba65','#4f7437');
  line([[-25,0],[4,0]],.7,'#d7da98');
  for(const side of [-1,1])for(let j=0;j<7;j++){
   const x=-23+j*3.5;
   line([[x,0],[x+5,side*3.8]],.46,'rgba(59,89,33,.7)');
  }
  shell(11,0,13,2.7,'#98af60','#4d713a');
  for(const side of [-1,1]){
   const lift=a.dead?0:Math.max(0,Math.sin((a.pose||0)*2.3+side));
   line([[15,side*2],[18+lift*6,side*10],[27,side*(5+lift*3)],[20,side*6]],2.2,'#688a40');
   for(let j=0;j<4;j++){
   const x=22+j*1.35;
   line([[x,side*(6+lift)],[x-1,side*(8+lift)]],.65,'#344d27');
  }
  }
  ctx.save();ctx.translate(24,0);ctx.rotate(a.dead?0:Math.sin(elapsed*3+a.offset)*.34);
  ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(3,-7);ctx.lineTo(5,7);ctx.closePath();ctx.fillStyle='#9bac5c';ctx.fill();
  for(const side of [-1,1]){
   ellipse(3,side*5,2.2,2,'#556539');
   line([[3,side*4],[11,side*8],[16,side*11]],.7,'#59633d');
  }
  ctx.restore();
 }
 function pillbug(a){
  const roll=a.dead?0:a.roll;
  ctx.scale(1-roll*.28,1+roll*.28);
  if(roll<.85)legs(a,7,1.2,13*(1-roll*.55),'#655d55');
  for(let i=0;i<9;i++){
   const x=-23+i*5.8;
   const radius=8+5*Math.sin(Math.PI*i/8);
   shell(x,0,5.5,radius,'#817d75','#27282b');
   for(const side of [-1,1]){
    line([[x-1,side*radius*.38],[x,side*radius*.76],[x+1,side*radius*.91]],.65,'rgba(211,202,180,.43)');
    ellipse(x+1,side*radius*.61,.55,.42,'#413e38');
   }
   line([[x-2,-radius*.74],[x-3,0],[x-2,radius*.74]],.95,'#444348');
  }
  if(roll<.65)feelers(10,'#595650',a.dead?0:elapsed*4+a.offset);
 }
 function caterpillar(a){
  const cycle=a.dead?0:a.gait;
  const spacing=4.65+1.05*Math.sin(cycle);
  for(let i=0;i<10;i++){
   const x=(i-4.5)*spacing;
   const bend=a.dead?0:Math.sin(i*.72-cycle)*2.4;
   const width=5.2+1.5*Math.sin(Math.PI*i/9);
   if(i<5||i>6)for(const side of [-1,1])ellipse(x+1,bend+side*(width-1),1.75,2.5,'#697e39');
   shell(x,bend,5.1,width,'#bdd479','#527039');
   for(const side of [-1,1]){
    ellipse(x-1.2,bend+side*width*.68,.85,.62,'#e6dba1');
    ellipse(x-1,bend+side*width*.70,.42,.35,'#4e4e2a');
   }
   if(i>1&&i<7)line([[x-2,bend-width*.73],[x+.4,bend],[x-2,bend+width*.73]],.85,'rgba(47,77,41,.65)');
   if(i===7){ellipse(x,bend-3,2.6,1.8,'#444d32');ellipse(x,bend+3,2.6,1.8,'#444d32');}
  }
  const raise=!a.dead&&a.pose>2.6?Math.sin((a.pose-2.6)*7)*3:0;
  shell(4.5*spacing+5,-raise,5.8,5.1,'#a8c463','#5b7736');
 }
 function drawNew(a){
  if(a.dead&&a.age>=1.6)return;
  const ratio=size(a);
  ctx.save();
  if(a.height>0){
   ctx.globalAlpha=.16;
   ellipse(a.x,a.y,17*ratio,7*ratio,'#283d3c',a.angle);
   ctx.globalAlpha=1;
  }
  ctx.translate(a.x,a.y-a.height);
  ctx.rotate(a.angle);
  ctx.scale(ratio,ratio);
  if(a.dead){
   const press=1-Math.pow(1-Math.min(1,a.age/.14),3);
   ctx.globalAlpha=Math.min(1,(1.6-a.age)/.6);
   ctx.scale(1+.4*press,1-.63*press);
  }
  ({grasshopper,dragonfly,mantis,pillbug,caterpillar})[kind](a);
  ctx.restore();
 }

 function start(){
  if(!bag.length){
   bag=shuffle(Object.keys(names));
   if(bag.at(-1)===previousKind)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
  }
  kind=bag.pop();previousKind=kind;
  elapsed=0;clock=null;running=true;
  insects=Array.from({length:3},(_,i)=>({x:W*(.24+i*.25),y:H*rnd(.35,.7),angle:rnd(-Math.PI,Math.PI),turn:rnd(-1,1),speed:kind==='ant'?rnd(180,230):rnd(45,90),targetSpeed:kind==='ant'?rnd(190,260):rnd(60,100),fast:true,paceTimer:rnd(.8,1.5),phase:rnd(0,10),timer:rnd(.8,2.5),paused:false,dead:false,age:0,scale:rnd(.95,1.12),offset:rnd(0,3),height:0,roll:0,gait:0}));
  active=null;last=null;canvas.setAttribute('aria-label',names[kind]+'３匹。タッチやなぞる操作でつぶす');requestDraw();
 }
 function render(ms){
  const dt=clock===null?0:Math.min(.2,Math.max(0,(ms-clock)/1000));clock=ms;elapsed+=dt;
  for(const a of insects){
   if(a.dead){a.age+=dt;}else if(lengths[kind]&&elapsed<=12){moveNew(a,dt);}else{
    a.timer-=dt;
    if(a.timer<=0){a.paused=!a.paused;a.timer=a.paused?rnd(.2,kind==='spider'?1.3:.85):rnd(1.8,4.5);a.turn=rnd(-1.6,1.6);}
    if(elapsed>12){a.height=0;a.roll=0;a.paused=false;a.angle=a.x<W/2?Math.PI:0;a.targetSpeed=140;}
    if(!a.paused){
     a.paceTimer-=dt;
     if(a.paceTimer<=0&&elapsed<=12){a.fast=!a.fast;const top=kind==='ant'?[190,260]:kind==='spider'?[110,210]:[55,105];a.targetSpeed=a.fast?rnd(...top):rnd(30,58);a.paceTimer=a.fast?rnd(.9,1.7):rnd(.4,.8);a.turn=rnd(-1.6,1.6);}
     a.speed+=(a.targetSpeed-a.speed)*(1-Math.exp(-dt*7));a.phase+=dt*a.speed*.27;
     if(elapsed<=12)a.angle+=a.turn*dt*.9;
     a.x+=Math.cos(a.angle)*a.speed*dt;a.y+=Math.sin(a.angle)*a.speed*dt;
     if(elapsed<=12&&(a.x<45||a.x>W-45||a.y<45||a.y>H-45)){
      const angle=Math.atan2(H/2-a.y,W/2-a.x);a.angle+=Math.atan2(Math.sin(angle-a.angle),Math.cos(angle-a.angle))*Math.min(1,dt*6);
      a.x=Math.max(25,Math.min(W-25,a.x));a.y=Math.max(25,Math.min(H-25,a.y));
     }
    }
   }
   if(lengths[kind])drawNew(a);else ({ant:drawAnt,ladybug:drawRealLadybug,spider:drawSpider})[kind](a,elapsed);
  }
  if(insects.every(a=>a.dead?a.age>1.6:a.x<-65||a.x>W+65)||elapsed>18)finish();
 }
 function touch(a,b){
  const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;
  for(const p of insects){if(p.dead)continue;const u=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-p.height-a.y)*dy)/l)):0;if(Math.hypot(p.x-a.x-u*dx,p.y-p.height-a.y-u*dy)<Math.max(25,(kind==='spider'?42:34)*size(p))){p.y-=p.height;p.height=0;p.dead=true;p.age=0;}}
 }
 return {get active(){return running},beginBatch,render,touch,resetClock(){clock=null}};
}
