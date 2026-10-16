import assert from 'node:assert/strict';

export async function appMobileCalendarChecks(page, browser, base) {
    const context = await browser.newContext({ storageState: await page.context().storageState(), viewport: { width:380, height:850 }, reducedMotion:'reduce', hasTouch:true, isMobile:true });
    const mobile = await context.newPage(), errors = []; mobile.on('pageerror', error => errors.push(error.message));
    const keys = await page.evaluate(() => [-3,0,1,3,7,8].map(offset => { const now = new Date(), date = new Date(now.getFullYear(),now.getMonth(),now.getDate()+offset); return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-'); }));
    let tasks = [
        { id:661, title:'Today high', due_date:keys[1], stage:'todo' },
        { id:662, title:'Day three first', due_date:keys[3], stage:'review' },
        { id:663, title:'Tomorrow follows server order', due_date:keys[2], stage:'in_progress' },
        { id:664, title:'Day three again', due_date:keys[3], stage:'todo' },
        { id:665, title:'Seventh day included', due_date:keys[4], stage:'todo' },
        { id:666, title:'Eighth day excluded', due_date:keys[5], stage:'todo' },
        { id:667, title:'Past task', due_date:keys[0], stage:'todo' },
        { id:668, title:'No due date', due_date:null, stage:'review' },
    ].map(task => ({ ...task, priority:'high', status:'pending', description:'', created_at:Date.now(), completed_at:null }));
    let reads = 0;
    await mobile.route('**/api/tasks?sort=*', route => { reads++; return route.fulfill({ json:tasks }); });
    await mobile.goto(base+'/calendar'); await mobile.waitForFunction(() => document.querySelector('#app-calendar')?.getAttribute('aria-busy') === 'false');
    assert.equal(reads,1); assert.equal(await mobile.locator('#app-calendar-week button').count(),7);
    assert.equal(await mobile.locator('#app-calendar-week button small').first().textContent(),'Mon');
    assert.equal(await mobile.locator('#app-calendar-week [aria-pressed="true"]').getAttribute('data-app-date'),keys[1]);
    assert.match(await mobile.locator('#app-agenda-date').textContent(),/^Today · /);
    assert.deepEqual(await mobile.locator('#app-agenda-tasks [data-task-id]').evaluateAll(rows => rows.map(row=>+row.dataset.taskId)),[661,662,663,664,665]);
    assert.deepEqual(await mobile.locator('#app-agenda-tasks .app-mobile-calendar-stage').allTextContents(),['Pending','Review','In Progress','Pending','Pending']);
    assert.equal(await mobile.locator('#app-calendar-unscheduled').evaluate(node=>node.open),false);
    await mobile.locator('#app-calendar-expand').click(); assert.equal(await mobile.locator('#app-calendar-mobile-month button').count(),42);
    assert.equal(await mobile.locator('#app-calendar-mobile-month [aria-pressed="true"]').getAttribute('data-app-mobile-date'),keys[1]);
    await mobile.locator('#app-calendar-mobile-month [data-app-mobile-date="'+keys[0]+'"]').click();
    assert.equal(await mobile.locator('#app-agenda-add').isDisabled(),true); assert.ok(await mobile.locator('#app-agenda-past').isVisible());
    assert.equal(await mobile.locator('#app-agenda-date').evaluate(node=>node.classList.contains('app-mobile-calendar-overdue')),true);
    await mobile.locator('#app-calendar-today').click();
    await mobile.locator('#app-calendar-next').click(); assert.equal(await mobile.locator('#app-calendar-week [aria-pressed="true"]').getAttribute('data-app-date'),keys[4]);
    await mobile.locator('#app-calendar-week').evaluate(node => {
        const start = new Touch({ identifier:1, target:node, clientX:50, clientY:100 });
        node.dispatchEvent(new TouchEvent('touchstart',{ touches:[start], changedTouches:[start], bubbles:true }));
        const end = new Touch({ identifier:1, target:node, clientX:200, clientY:105 });
        node.dispatchEvent(new TouchEvent('touchend',{ touches:[], changedTouches:[end], bubbles:true }));
    });
    assert.equal(await mobile.locator('#app-calendar-week [aria-pressed="true"]').getAttribute('data-app-date'),keys[1]);
    assert.equal(reads,1,'week/month navigation never refetches tasks');
    await mobile.locator('#app-agenda-add').click(); assert.equal(await mobile.locator('#app-create-due').inputValue(),keys[1]);
    await mobile.keyboard.press('Escape'); await mobile.waitForFunction(()=>document.documentElement.dataset.appMobileHistoryBusy!=='true');
    await mobile.locator('#app-agenda-tasks [data-task-id="661"]').click(); await mobile.locator('#app-task-dialog').waitFor({state:'visible'});
    await mobile.goBack(); await mobile.waitForFunction(()=>!document.querySelector('#app-task-dialog')?.open);
    await mobile.locator('#app-calendar-unscheduled summary').click(); assert.ok(await mobile.locator('#app-unscheduled-list [data-task-id="668"]').isVisible());
    for (const theme of ['light','dark','system','kawaii','racing']) {
        await mobile.locator('#app-more-button').click(); await mobile.locator('#app-more [data-app-appearance]').click(); await mobile.locator('.app-theme-option[data-app-mode="'+theme+'"]').click(); await mobile.keyboard.press('Escape');
        await mobile.waitForFunction(()=>document.documentElement.dataset.appMobileHistoryBusy!=='true'); assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    await mobile.evaluate(()=>{ const key='app-settings:'+document.body.dataset.appUserId; const settings=JSON.parse(localStorage.getItem(key)||'{}'); localStorage.setItem(key,JSON.stringify({...settings,weekStart:'sunday'})); dispatchEvent(new StorageEvent('storage',{key})); });
    assert.equal(await mobile.locator('#app-calendar-week button small').first().textContent(),'Sun');
    await mobile.evaluate(()=>{ window.scrollTo(0,0); document.activeElement?.blur(); });
    await mobile.screenshot({path:'storage/app/ui-review/mobile-calendar-expanded.png',fullPage:true});
    tasks=[]; await mobile.reload(); await mobile.getByRole('heading',{name:'Walang task sa araw na ito',exact:true}).waitFor();
    assert.deepEqual(errors,[]); await context.close();
    console.log('PASS: mobile Calendar week/month selection, dots, swipe/buttons, server-order 7-day agenda, past guard, shared Add/Details, Unscheduled, week-start, themes and empty state.');
}
