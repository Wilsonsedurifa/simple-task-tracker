import assert from 'node:assert/strict';

export async function appMobileAccountChecks(page,browser,base) {
    const context = await browser.newContext({storageState:await page.context().storageState(),viewport:{width:380,height:850},reducedMotion:'reduce'}), mobile = await context.newPage(), errors=[];
    mobile.on('pageerror',error=>errors.push(error.message));
    await mobile.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{ try {if(!sessionStorage.getItem('app-mobile-account-check')){const id=document.body.dataset.appUserId; localStorage.removeItem('app-notifications-welcome:'+id); sessionStorage.setItem('app-mobile-account-check','true');}} catch {} },{once:true}));
    const dates=await page.evaluate(()=>[-2,0,1].map(offset=>{const now=new Date(),date=new Date(now.getFullYear(),now.getMonth(),now.getDate()+offset);return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}));
    const tasks=[{id:66001,title:'Overdue mobile reminder',due_date:dates[0],stage:'todo',status:'pending'},{id:66002,title:'Today reminder',due_date:dates[1],stage:'in_progress',status:'pending'},{id:66003,title:'Tomorrow reminder',due_date:dates[2],stage:'review',status:'pending'},{id:66004,title:'Completed mobile task',due_date:null,stage:'todo',status:'completed',completed_at:Date.now()}].map(task=>({...task,priority:'medium',description:'',created_at:Date.now()}));
    let reads=0;await mobile.route('**/api/tasks?sort=*',route=>{reads++;return route.fulfill({json:tasks});});
    await mobile.goto(base+'/settings#profile');await mobile.locator('[data-app-profile-stat="total"] strong').getByText('4',{exact:true}).waitFor();
    assert.equal(reads,1);assert.ok(await mobile.locator('#app-mobile-profile').isVisible());assert.equal(await mobile.locator('#app-settings').isVisible(),false);
    assert.equal(await mobile.locator('#app-mobile-profile [data-app-unread]').textContent(),'4');assert.equal(await mobile.locator('#app-more-button [data-app-unread]').textContent(),'4');
    assert.equal(await mobile.locator('[data-app-profile-stat="progress"] strong').textContent(),'2');
    const appearance=mobile.locator('#app-mobile-profile [data-app-appearance]');await appearance.click();await mobile.locator('#app-appearance').waitFor({state:'visible'});await mobile.keyboard.press('Escape');await mobile.waitForFunction(()=>document.documentElement.dataset.appMobileHistoryBusy!=='true');
    assert.equal(await mobile.evaluate(()=>document.activeElement?.hasAttribute('data-app-appearance')),true);
    await mobile.locator('[data-app-open-logout]').click();await mobile.locator('#logout-modal').waitFor({state:'visible'});await mobile.locator('#cancel-logout').click();await mobile.waitForFunction(()=>document.documentElement.dataset.appMobileHistoryBusy!=='true');
    assert.equal(await mobile.evaluate(()=>document.activeElement?.hasAttribute('data-app-open-logout')),true);
    await mobile.locator('#app-mobile-profile [aria-label="Open Settings"]').click();await mobile.locator('#app-settings').waitFor({state:'visible'});
    assert.equal(await mobile.locator('#app-mobile-title').textContent(),'Settings');
    await mobile.locator('#app-settings-tab-preferences').click();assert.ok(await mobile.locator('#app-settings-preferences').isVisible());assert.equal(reads,1);
    await mobile.locator('.app-mobile-page-back').click();await mobile.locator('#app-mobile-profile').waitFor({state:'visible'});
    await mobile.locator('#app-mobile-profile [data-app-notifications]').click();await mobile.locator('#app-notification-feed .app-notification-type-welcome').waitFor();
    assert.equal(await mobile.locator('body').getAttribute('data-app-unread-count'),'5');
    await mobile.locator('#app-notification-feed .app-notification-row:has(.app-notification-type-welcome)').click();
    assert.equal(await mobile.locator('#app-notification-feed .app-notification-type-welcome').count(),0);assert.equal(await mobile.locator('body').getAttribute('data-app-unread-count'),'4');
    await mobile.reload();await mobile.waitForFunction(()=>document.querySelector('#app-notification-feed')?.getAttribute('aria-busy')==='false');
    assert.equal(await mobile.locator('#app-notification-feed .app-notification-type-welcome').count(),0,'Welcome is not replayed after reload');
    await mobile.locator('#app-notification-feed [data-task-id="66001"]').click();await mobile.locator('#app-task-dialog').waitFor({state:'visible'});assert.equal(await mobile.locator('#detail-title').textContent(),'Overdue mobile reminder');await mobile.goBack();await mobile.waitForFunction(()=>!document.querySelector('#app-task-dialog')?.open);
    await mobile.evaluate(()=>{window.scrollTo(0,0);document.activeElement?.blur();});await mobile.screenshot({path:'storage/app/ui-review/mobile-notifications.png',fullPage:true});
    await mobile.locator('.app-notifications-toolbar [data-app-mark-all]').click();assert.equal(await mobile.locator('body').getAttribute('data-app-unread-count'),'0');
    await mobile.locator('#app-notification-tab-unread').click();await mobile.getByRole('heading',{name:'Wala kang bagong notifications.',exact:true}).waitFor();
    await mobile.screenshot({path:'storage/app/ui-review/mobile-notifications-empty.png',fullPage:true});
    await mobile.goto(base+'/settings#profile');await mobile.locator('#app-mobile-profile').waitFor({state:'visible'});
    for(const theme of ['light','dark','system','kawaii','racing']){await mobile.locator('#app-mobile-profile [data-app-appearance]').click();await mobile.locator('.app-theme-option[data-app-mode="'+theme+'"]').click();await mobile.keyboard.press('Escape');await mobile.waitForFunction(()=>document.documentElement.dataset.appMobileHistoryBusy!=='true');assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
    await mobile.evaluate(()=>{window.scrollTo(0,0);document.activeElement?.blur();});await mobile.screenshot({path:'storage/app/ui-review/mobile-profile.png',fullPage:true});
    await mobile.setViewportSize({width:768,height:950});await mobile.waitForFunction(()=>document.body.dataset.appProfile==='false');assert.ok(await mobile.locator('#app-settings').isVisible());
    assert.deepEqual(errors,[]);await context.close();console.log('PASS: mobile Profile stats/navigation, shared Appearance/logout focus, grouped Settings, Welcome/read state, task Details, badges, themes and desktop restoration.');
}
