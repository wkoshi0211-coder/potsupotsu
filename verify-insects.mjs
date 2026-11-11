import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
let now=100,serial=0,label="";
const timers=new Map(),listeners={};
const context=new Proxy({createRadialGradient:()=>({addColorStop(){}}),getImageData:()=>({data:new Uint8ClampedArray(600*600*4).fill(255)})},{get:(t,k)=>t[k]??(()=>{})});
const canvas={setAttribute(key,value){if(key==="aria-label")label=value},getContext:()=>context,getBoundingClientRect:()=>({width:1024,height:768,left:0,top:0}),addEventListener(n,f){listeners[n]=f},setPointerCapture(){}};
const document={hidden:false,querySelector:()=>canvas,createElement:()=>({getContext:()=>context}),addEventListener(n,f){listeners[n]=f},fonts:{ready:{then:f=>f()}}};
const sandbox={console,document,performance:{now:()=>now},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),devicePixelRatio:1,requestAnimationFrame:()=>1,ResizeObserver:class{observe(){}},window:{addEventListener(){}},setTimeout(f,ms){assert.equal(ms,1800);timers.set(++serial,f);return serial},clearTimeout(id){timers.delete(id)}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);
function finish(){run('for(const p of points)hit(p,p)');assert.equal(timers.size,1);const [id,f]=[...timers][0];timers.delete(id);f();}

assert.ok(run('bugScene.active'));
const seen=[];let clock=1000000;
for(let batch=0;batch<5;batch++){
 let count=0;
 while(run('bugScene.active')){
  assert.match(label,/３匹/);
  seen.push(label);
  if(batch===0){
   run('draw(1000)');
   document.hidden=true;listeners.visibilitychange();document.hidden=false;listeners.visibilitychange();
   run('draw(1000000)');assert.ok(run('bugScene.active'));assert.equal(timers.size,0);
  }
  const t=clock;clock+=2600;
  run('for(let y=0;y<=H;y+=8)hit({x:(-offsetX)/scale,y:(y-offsetY)/scale},{x:(W-offsetX)/scale,y:(y-offsetY)/scale})');
  for(let i=1;i<=12;i++)run('draw('+ (t+i*200) +')');
  assert.ok(++count<=3);
 }
 assert.ok(count>=2);
 finish();
}
assert.equal(new Set(seen.slice(0,8)).size,8);
assert.ok(seen.every((label,i)=>i===0||seen[i-1]!==label));
for(let t=0;t<=60000&&run('bugScene.active');t+=200)run('draw('+t+')');
assert.equal(run('bugScene.active'),false);
console.log('PASS: all eight insects, no repeat, 2–3 scenes, sweep, timeout, visibility');
