import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const elements=new Map(),listeners={};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(600*600*4).fill(255)})},{get:(t,k)=>t[k]??(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',dataset:{},setAttribute(){},getContext:()=>context,getBoundingClientRect:()=>({width:900,height:500,left:0,top:0}),addEventListener(n,f){listeners[n]=f},setPointerCapture(){},showModal(){}});return elements.get(id)}
const themes=['balloon','bee','butterfly'].map(t=>({...el(t),dataset:{theme:t}}));const sandbox={console,performance:{now:()=>100},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),devicePixelRatio:1,requestAnimationFrame:()=>1,ResizeObserver:class{observe(){}},window:{addEventListener(){}},document:{querySelector:el,querySelectorAll:()=>themes,createElement:()=>({getContext:()=>context}),fonts:{ready:{then:f=>f()}}}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
vm.runInContext(`
if(points.length===0)throw Error('no targets');
const p=points[0];hit(p,p);if(!p.done)throw Error('tap');
const n=state.done.length;hit(p,p);if(state.done.length!==n)throw Error('duplicate tap');
pause(true);const q=points[1];hit(q,q);if(q.done)throw Error('pause');pause(false);
const before=state.letter;$('#next').onclick();if(state.letter===before||state.done.length)throw Error('next');
const seen=new Set([state.letter]);for(let i=0;i<43;i++){$('#next').onclick();if(seen.has(state.letter))throw Error('repeat in bag');seen.add(state.letter)}
state.autoTheme='random';const theme=state.theme;$('#next').onclick();if(state.theme===theme)throw Error('theme');
state.density='fine';state.done=[];generate();if(points.length===0)throw Error('fine');
for(const p of points)hit(p,p);if(!points.every(p=>p.done))throw Error('completion');
`,sandbox);
assert.equal(elements.get('#status').textContent,'できあがり。つぎも、じぶんのペースで。');console.log('PASS: tap, drag geometry, pause, no duplicate hits, random letters, random themes, density, completion');

