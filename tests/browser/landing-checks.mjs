import assert from 'node:assert/strict';

export async function lpLandingChecks(browser, base) {
    const context=await browser.newContext({viewport:{width:1280,height:950}}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(['error','warning'].includes(message.type()))errors.push(message.text());});
    let privateReads=0;page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))privateReads++;});
    await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.lp-features article').count(),6);assert.equal(await page.locator('.lp-faq details').count(),5);
    assert.equal(await page.locator('style,[style]:not(.lp-pet-card):not(#lp-progress)').count(),0);assert.equal(await page.locator('script:not([src])').count(),1);
    for(const width of [360,390,768,1024,1280,1920]){
        await page.setViewportSize({width,height:950});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'landing overflow at '+width);
    }
    for(const theme of ['light','dark','kawaii','racing']){
        await page.locator('[data-lp-theme-choice="'+theme+'"]').click();
        assert.equal(await page.locator('html').getAttribute('data-lp-theme'),theme);
        const pairs=await page.evaluate(()=>{
            const node=document.createElement('span');document.body.append(node);
            function color(token){node.style.setProperty('color','var(--'+token+')');return getComputedStyle(node).color.match(/[\d.]+/g).slice(0,3).map(Number);}
            const result=[['ink','bg'],['ink','surface'],['muted','surface-2'],['on-brand','brand'],['ink','sun'],['ink','mint'],['ink','bad'],['ink','pop']].map(([fg,bg])=>({fg,bg,a:color(fg),b:color(bg)}));node.remove();return result;
        });
        const luminance=rgb=>rgb.map(value=>value/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((total,value,index)=>total+value*[.2126,.7152,.0722][index],0);
        for(const pair of pairs){const a=luminance(pair.a),b=luminance(pair.b);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,theme+' contrast '+pair.fg+'/'+pair.bg);}
        await page.reload();assert.equal(await page.locator('html').getAttribute('data-lp-theme'),theme);
    }
    await page.locator('[data-lp-theme-choice="light"]').click();
    await page.locator('[data-lp-theme-choice="light"]').press('ArrowRight');assert.equal(await page.locator('[data-lp-theme-choice="dark"]').getAttribute('aria-checked'),'true');
    const boxes=page.locator('[data-lp-task]');
    for(let mask=0;mask<8;mask++){
        for(let i=0;i<3;i++)await boxes.nth(i).setChecked(Boolean(mask&(1<<i)));
        const done=[0,1,2].filter(i=>mask&(1<<i)).length,xp=(mask&1?30:0)+(mask&2?10:0)+(mask&4?20:0);
        assert.equal(await page.locator('#lp-xp-label').textContent(),xp+' XP · '+['Baby','Little','Young','Grown'][done]);
        assert.equal(await page.locator('.lp-pet-card').getAttribute('data-mood'),done===3?'happy':!(mask&4)?'sad':done?'happy':'neutral');
        assert.equal(Number(await page.locator('.lp-pet-card').evaluate(node=>node.style.getPropertyValue('--s'))),.72+.14*done);
        assert.equal(await page.locator('#lp-progress').getAttribute('aria-valuenow'),String(xp));
    }
    await page.locator('#lp-reset').click();assert.equal(await page.locator('[data-lp-task]:checked').count(),0);assert.equal(await page.locator('#lp-xp-label').textContent(),'0 XP · Baby');
    await page.setViewportSize({width:360,height:850});await page.evaluate(()=>window.scrollTo(0,0));
    const burger=page.locator('.lp-burger');await burger.focus();await page.keyboard.press('Enter');assert.equal(await burger.getAttribute('aria-expanded'),'true');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Features');await page.keyboard.press('Escape');assert.equal(await burger.getAttribute('aria-expanded'),'false');
    await burger.click();await page.locator('#lp-links a[href="#how"]').click();assert.equal(await burger.getAttribute('aria-expanded'),'false');await page.waitForFunction(()=>document.activeElement?.id==='how');
    await page.locator('.lp-faq summary').first().click();assert.ok(await page.locator('.lp-faq details').first().evaluate(node=>node.open));
    await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.lp-sticker').first().evaluate(node=>getComputedStyle(node).animationName),'none');
    assert.equal(await page.locator('.lp-rv').first().evaluate(node=>getComputedStyle(node).opacity),'1');
    await page.locator('[data-lp-theme-choice="light"]').click();await page.setViewportSize({width:1280,height:950});await page.evaluate(()=>{window.scrollTo(0,0);document.activeElement?.blur();});await page.screenshot({path:'storage/app/ui-review/landing-desktop.png',fullPage:true});
    await page.setViewportSize({width:360,height:850});await page.screenshot({path:'storage/app/ui-review/landing-mobile.png',fullPage:true});assert.equal(privateReads,0);assert.deepEqual(errors,[]);await context.close();
    const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:850}}),plain=await noJs.newPage();await plain.goto(base+'/');assert.equal(await plain.locator('.lp-rv').first().evaluate(node=>getComputedStyle(node).opacity),'1');assert.ok(await plain.locator('#lp-links a').first().isVisible());assert.equal(await plain.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await plain.getByRole('link',{name:/Get started/}).first().click();await plain.waitForURL('**/register');await noJs.close();
    const blocked=await browser.newContext({viewport:{width:390,height:850}}),temporary=await blocked.newPage();await temporary.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));await temporary.goto(base+'/');await temporary.locator('[data-lp-theme-choice="kawaii"]').click();assert.equal(await temporary.locator('html').getAttribute('data-lp-theme'),'kawaii');await blocked.close();
    console.log('PASS: landing six widths, four themes/AA contrast/persistence, all demo states/reset, keyboard menu/radios, FAQ, reduced motion, zero API calls/errors, blocked storage and JS-disabled auth links.');
}
