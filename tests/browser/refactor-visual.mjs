// Captures deterministic whole-page baselines; uses the existing Playwright runtime.
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url), { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const record = process.argv.includes('--record'), phase = process.env.REFACTOR_PHASE || 'after';
const folder = 'storage/app/refactor-visual', baselineFile = folder + '/before.json';
await mkdir(folder, { recursive:true });
const existing = record ? null : JSON.parse(await readFile(baselineFile,'utf8'));
const clock = existing?.clock || Date.now();
const env = { ...process.env, APP_ENV:'testing', DB_CONNECTION:'sqlite', DB_DATABASE:path.resolve('storage/app/refactor-review.sqlite'), SESSION_DRIVER:'file', CACHE_STORE:'array', MAIL_MAILER:'array', APP_URL:'http://127.0.0.1:8139' };
function php(args) { const result = spawnSync('php',args,{env,encoding:'utf8'}); assert.equal(result.status,0,result.stderr + result.stdout); }
php(['-r','new PDO("sqlite:".getenv("DB_DATABASE"));']); php(['artisan','migrate','--force','--no-interaction']);
php(['-r',`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); $u=App\\Models\\User::firstOrCreate(['email'=>'refactor-review@example.test'],['name'=>'Refactor Review','password'=>Illuminate\\Support\\Facades\\Hash::make('Refactor-test-123!')]); if(!$u->tasks()->exists()){foreach([-2,0,1,5,null] as $i=>$d)$u->tasks()->create(['title'=>'Baseline task '.$i,'description'=>'A stable task description.','priority'=>['high','medium','low'][$i%3],'status'=>$i===4?'completed':'pending','stage'=>['todo','in_progress','review'][$i%3],'due_date'=>$d===null?null:now()->addDays($d)->format('Y-m-d'),'completed_at'=>$i===4?now():null]);} $u->pet()->firstOrCreate([],['species'=>'fox','name'=>'Mochi','xp'=>75]);`]);
const server=spawn('php',['artisan','serve','--port=8139','--no-reload'],{env,windowsHide:true,stdio:'ignore'});
let browser;
try {
    for(let i=0;i<60;i++){try{await fetch(env.APP_URL+'/login');break;}catch{await new Promise(resolve=>setTimeout(resolve,150));}}
    browser=await chromium.launch({headless:true,channel:'msedge'});
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    await context.addInitScript(time=>{const OriginalDate=Date;globalThis.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}};},clock);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(['error','warning'].includes(message.type()))errors.push(message.text());});
    await page.goto(env.APP_URL+'/login');await page.locator('#email').fill('refactor-review@example.test');await page.locator('#password').fill('Refactor-test-123!');await page.locator('button[type=submit]').first().click();await page.waitForURL('**/continue');
    const snapshots={};
    async function capture(target,route,theme,width) {
        await target.setViewportSize({width,height:950});
        await target.addInitScript(value=>{localStorage.setItem('task-tracker-theme',value);localStorage.setItem('lp-theme',value);},theme);
        await target.goto(env.APP_URL+route);await target.evaluate(()=>document.fonts.ready);
        if(await target.locator('.app-workspace').count())await target.waitForFunction(()=>![...document.querySelectorAll('main [aria-busy="true"]')].some(node=>node.getClientRects().length)&&(!document.querySelector('[data-app-pet-loading]')||document.querySelector('[data-app-pet-loading]').hidden));
        await target.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);document.querySelector('#main')?.scrollTo(0,0);});
        await target.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const key=route.replaceAll('/','_').replaceAll('#','-')+'-'+theme+'-'+width;
        const png=await target.screenshot({fullPage:true,animations:'disabled'});await writeFile(folder+'/'+(record?'before':phase)+'-'+key+'.png',png);
        snapshots[key]={hash:createHash('sha256').update(png).digest('hex'),geometry:await target.evaluate(()=>[...document.querySelectorAll('main,header,nav,section,aside,footer,button,input,select,textarea,h1,h2')].filter(node=>node.getClientRects().length).map(node=>{const b=node.getBoundingClientRect(),s=getComputedStyle(node);return {tag:node.tagName,id:node.id,class:node.className,x:b.x,y:b.y,w:b.width,h:b.height,color:s.color,bg:s.backgroundColor,font:s.font,border:s.border,radius:s.borderRadius};}))};
    }
    for(const theme of ['light','kawaii'])for(const width of [390,768,1280])for(const route of ['/dashboard','/tasks','/calendar','/notifications','/settings','/settings#profile','/pet','/continue'])await capture(page,route,theme,width);
    const guest=await browser.newContext({reducedMotion:'reduce'});await guest.addInitScript(time=>{const OriginalDate=Date;globalThis.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}};},clock);const publicPage=await guest.newPage();publicPage.on('pageerror',error=>errors.push(error.message));
    for(const theme of ['light','kawaii'])for(const width of [390,768,1280])for(const route of ['/','/login','/register','/unknown'])await capture(publicPage,route,theme,width);
    assert.deepEqual(errors,[]);
    const result={clock,snapshots};await writeFile(record?baselineFile:folder+'/'+phase+'.json',JSON.stringify(result,null,2));
    if(record)console.log('PASS: recorded '+Object.keys(snapshots).length+' before screenshots and computed visual snapshots.');
    else {const different=Object.entries(snapshots).filter(([key,value])=>value.hash!==existing.snapshots[key]?.hash);const geometry=different.filter(([key,value])=>JSON.stringify(value.geometry)!==JSON.stringify(existing.snapshots[key]?.geometry));console.log(JSON.stringify({screens:Object.keys(snapshots).length,identical:Object.keys(snapshots).length-different.length,pixelDifferences:different.map(([key])=>key),geometryDifferences:geometry.map(([key])=>key)}));assert.deepEqual(different,[],'Visual output changed; inspect storage/app/refactor-visual.');}
} finally {await browser?.close();server.kill();}
