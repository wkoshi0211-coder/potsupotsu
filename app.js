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
if(!Number.isInteger(state.setsSinceBug)||state.setsSinceBug<0||state.setsSinceBug>3)state.setsSinceBug=0;
if(![2,3,4].includes(state.nextBugAfter))state.nextBugAfter=2+Math.floor(Math.random()*3);
const bugScene=createBugScene();
function completeSet(){state.setsSinceBug++;if(state.setsSinceBug>=state.nextBugAfter){state.setsSinceBug=0;state.nextBugAfter=2+Math.floor(Math.random()*3);persist();bugScene.start()}else{persist();nextLetter()}}

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
reduced.addEventListener?.('change',requestDraw);window.addEventListener('pagehide',persist);new ResizeObserver(resize).observe(canvas);document.fonts.ready.then(()=>{generate();sync();resize()});

// Realistic insects share a scene lifecycle; each species retains its own drawing.
function createBugScene(){
 const rnd=(a,b)=>a+Math.random()*(b-a);
 let insects=[],kind='ant',elapsed=0,clock=null,previousKind=null,running=false;
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

 function start(){
  const choices=['ant','ladybug','spider'].filter(k=>k!==previousKind);
  kind=choices[Math.floor(Math.random()*choices.length)];previousKind=kind;
  elapsed=0;clock=null;running=true;
  insects=Array.from({length:3},(_,i)=>({x:W*(.24+i*.25),y:H*rnd(.35,.7),angle:rnd(-Math.PI,Math.PI),turn:rnd(-1,1),speed:kind==='ant'?rnd(180,230):rnd(45,90),targetSpeed:kind==='ant'?rnd(190,260):rnd(60,100),fast:true,paceTimer:rnd(.8,1.5),phase:rnd(0,10),timer:rnd(.8,2.5),paused:false,dead:false,age:0,scale:rnd(.95,1.12)}));
  active=null;last=null;canvas.setAttribute('aria-label',({ant:'アリ',ladybug:'てんとう虫',spider:'蜘蛛'})[kind]+'３匹。タッチやなぞる操作でつぶす');requestDraw();
 }
 function render(ms){
  const dt=clock===null?0:Math.min(.2,Math.max(0,(ms-clock)/1000));clock=ms;elapsed+=dt;
  for(const a of insects){
   if(a.dead){a.age+=dt;}else{
    a.timer-=dt;
    if(a.timer<=0){a.paused=!a.paused;a.timer=a.paused?rnd(.2,kind==='spider'?1.3:.85):rnd(1.8,4.5);a.turn=rnd(-1.6,1.6);}
    if(elapsed>12){a.paused=false;a.angle=a.x<W/2?Math.PI:0;a.targetSpeed=140;}
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
   ({ant:drawAnt,ladybug:drawRealLadybug,spider:drawSpider})[kind](a,elapsed);
  }
  if(insects.every(a=>a.dead?a.age>1.6:a.x<-65||a.x>W+65)||elapsed>18){running=false;clock=null;nextLetter();}
 }
 function touch(a,b){
  const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;
  for(const p of insects){if(p.dead)continue;const u=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;if(Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy)<(kind==='spider'?42:34)*p.scale){p.dead=true;p.age=0;}}
 }
 return {get active(){return running},start,render,touch,resetClock(){clock=null}};
}
