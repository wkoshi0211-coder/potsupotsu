import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
let now=100,serial=0;
const timers=new Map(),listeners={};
const context=new Proxy({createRadialGradient:()=>({addColorStop(){}}),getImageData:()=>({data:new Uint8ClampedArray(600*600*4).fill(255)})},{get:(t,k)=>t[k]??(()=>{})});
const canvas={setAttribute(){},getContext:()=>context,getBoundingClientRect:()=>({width:1024,height:768,left:0,top:0}),addEventListener(n,f){listeners[n]=f},setPointerCapture(){}};
const document={hidden:false,querySelector:()=>canvas,createElement:()=>({getContext:()=>context}),addEventListener(n,f){listeners[n]=f},fonts:{ready:{then:f=>f()}}};
const sandbox={console,document,performance:{now:()=>now},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),devicePixelRatio:1,requestAnimationFrame:()=>1,ResizeObserver:class{observe(){}},window:{addEventListener(){}},setTimeout(f,ms){assert.equal(ms,1800);timers.set(++serial,f);return serial},clearTimeout(id){timers.delete(id)}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);
function finish(){run('for(const p of points)hit(p,p)');assert.equal(timers.size,1);const [id,f]=[...timers][0];timers.delete(id);f();}
for(const interval of [2,3,4]){
 run(`state.setsSinceBug=0;state.nextBugAfter=${interval}`);
 for(let i=1;i<=interval;i++){finish();assert.equal(run('bugScene.active'),i===interval);}
 assert.equal(run('state.setsSinceBug'),0);
 assert.ok([2,3,4].includes(run('state.nextBugAfter')));
 // Hit the whole scene using horizontal sweeps in screen coordinates.
 run('for(let y=0;y<=H;y+=10)bugScene.touch({x:0,y},{x:W,y})');
 run('draw(1000);draw(1200);draw(1400);draw(1600);draw(1800);draw(2000);draw(2200);draw(2400);draw(2600);draw(2800)');
 assert.equal(run('bugScene.active'),false);
 assert.equal(run('points.some(p=>p.done)'),false);
}
// Untouched scenes finish on their own; every renderer is exercised repeatedly.
for(let n=0;n<12;n++){
 run('bugScene.start()');
 for(let t=0;t<=19000;t+=100)run(`draw(${t})`);
 assert.equal(run('bugScene.active'),false);
}
run('bugScene.start();draw(1000)');
document.hidden=true;listeners.visibilitychange();document.hidden=false;listeners.visibilitychange();
run('draw(1000000)');assert.equal(run('bugScene.active'),true);
assert.equal(timers.size,0);
console.log('PASS: 2/3/4 sets, three-insect scenes, sweep hits, flatten/fade, automatic return, visibility pause, all renderers');
