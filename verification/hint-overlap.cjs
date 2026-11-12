// Hint-overlap gate: node verification/hint-overlap.cjs <url>. Fails if the chrome hint tab intersects visible text/link rects at 320 and 390.
const pptr=require("puppeteer-core");
const urls=process.argv.slice(2);
(async()=>{const b=await pptr.launch({executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--enable-unsafe-swiftshader"]});
for(const u of urls)for(const w of [320,390]){const c=await b.createBrowserContext();const p=await c.newPage();await p.setViewport({width:w,height:844});
try{await p.goto(u,{waitUntil:"domcontentloaded",timeout:40000});}catch(e){console.log(u,w,"load err");}
try{await p.click("#start-btn")}catch(e){}await new Promise(r=>setTimeout(r,5500));
const res=[];for(const pos of ["top","bottom"]){
await p.evaluate(pos=>window.scrollTo(0,pos==="top"?0:document.documentElement.scrollHeight),pos);await new Promise(r=>setTimeout(r,400));
res.push(await p.evaluate(()=>{const hEl=document.querySelector(".chrome-hint,#chrome-hint,[class*=chrome-hint]");if(!hEl)return{nohint:true};
const cs=getComputedStyle(hEl);if(cs.display==="none"||cs.visibility==="hidden")return{hintHidden:true};
const h=hEl.getBoundingClientRect();const bad=[];
for(const el of document.querySelectorAll("a,p,h1,h2,h3,h4,span,button,label,li,input,select,small,b,strong,em")){
if(el===hEl||hEl.contains(el)||el.contains(hEl))continue;
const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||/^(A|BUTTON|INPUT|SELECT)$/.test(el.tagName);if(!hasText)continue;
const dt=el.closest("details");if(dt&&!dt.open&&!el.closest("summary"))continue;const s=getComputedStyle(el);if(s.visibility==="hidden"||s.display==="none")continue;
let o=1,n=el,clipped=false;while(n&&n!==document.body){const t=getComputedStyle(n);o*=parseFloat(t.opacity);if(t.pointerEvents==="none"&&el===n&&!/^(A|BUTTON)$/.test(el.tagName)){}
n=n.parentElement}
if(o<0.05)continue;
const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
if(r.right<h.left||r.left>h.right||r.bottom<h.top||r.top>h.bottom)continue;
bad.push((el.id?"#"+el.id:el.tagName+"."+String(el.className).slice(0,30))+":"+(el.textContent||"").trim().slice(0,20));}
return{hint:[Math.round(h.left),Math.round(h.top),Math.round(h.width),Math.round(h.height)],bad};}));}
console.log(u,w,JSON.stringify(res));if(res.some(r=>r.nohint||r.hintHidden||(r.bad&&r.bad.length)))process.exitCode=1;await c.close();}
await b.close();})();
