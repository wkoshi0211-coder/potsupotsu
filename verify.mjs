import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const listeners={},timers=new Map();let serial=0;const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(600*600*4).fill(255)})},{get:(t,k)=>t[k]??(()=>{})});
const canvas={setAttribute(){},getContext:()=>context,getBoundingClientRect:()=>({width:1024,height:768,left:0,top:0}),addEventListener(n,f){listeners[n]=f},setPointerCapture(){}};
const document={hidden:false,querySelector:()=>canvas,createElement:()=>({getContext:()=>context}),addEventListener(n,f){listeners[n]=f},fonts:{ready:{then:f=>f()}}};
const sandbox={console,document,performance:{now:()=>100},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),devicePixelRatio:1,requestAnimationFrame:()=>1,ResizeObserver:class{observe(){}},window:{addEventListener(){}},setTimeout(f,ms){assert.equal(ms,1800);timers.set(++serial,f);return serial},clearTimeout(id){timers.delete(id)}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
vm.runInContext(`
if(!points.length||!Number.isFinite(scale))throw Error('layout');
const moving=points[0];for(let t=0;t<20000;t+=100){const at=floatingPosition(moving,t);if(Math.abs(at.x-moving.x)>3.001||Math.abs(at.y-moving.y)>3.001)throw Error('motion bounds')}const at0=floatingPosition(moving,0),at1=floatingPosition(moving,2000);if(at0.x===at1.x&&at0.y===at1.y)throw Error('no motion');draw(2000);const target={x:moving.displayX,y:moving.displayY};hit(target,target);if(!moving.done)throw Error('moving hit');const settled=floatingPosition(moving,4000);if(settled.x!==moving.x||settled.y!==moving.y)throw Error('cloud not settled');nextLetter();
const p=points[0];hit(p,p);const n=state.done.length;hit(p,p);if(!p.done||state.done.length!==n)throw Error('tap');
paused=true;const q=points[1];hit(q,q);if(q.done)throw Error('pause');paused=false;
const before=state.letter;nextLetter();if(state.letter===before||state.done.length)throw Error('next');
const seen=new Set([state.letter]);for(let i=0;i<43;i++){nextLetter();if(seen.has(state.letter))throw Error('repeat');seen.add(state.letter)}
if(!NAMES[state.theme])throw Error('theme');state.theme='bee';draw(2500);state.theme='butterfly';draw(2600);
for(const p of points)hit(p,p);if(advanceTimer===null)throw Error('completion timer');sync();
`,sandbox);
assert.equal(timers.size,1);document.hidden=true;listeners.visibilitychange();assert.equal(timers.size,0);document.hidden=false;listeners.visibilitychange();assert.equal(timers.size,1);const f=[...timers.values()][0];timers.clear();f();assert.equal(timers.size,0);
assert.equal((fs.readFileSync('index.html','utf8').match(/<canvas/g)||[]).length,1);assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/<button|<select|<p[ >]|<header/);
console.log('PASS: canvas-only UI, fit layout, touch, pause, random letters/themes, completion timer, visibility pause/resume');

