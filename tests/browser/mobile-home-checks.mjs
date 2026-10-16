import assert from 'node:assert/strict';

export async function appMobileHomeChecks(page, browser, base) {
    const context = await browser.newContext({ storageState: await page.context().storageState(), viewport: { width: 380, height: 850 }, reducedMotion: 'reduce' });
    const mobile = await context.newPage(), errors = [];
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
        try { localStorage.setItem('app-pet-invite:' + document.body.dataset.appUserId, 'later'); } catch {}
    }));
    const dates = await page.evaluate(() => {
        const now = new Date();
        return [-2, 0, 2].map(offset => { const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset); return [day.getFullYear(), String(day.getMonth() + 1).padStart(2, '0'), String(day.getDate()).padStart(2, '0')].join('-'); });
    });
    let tasks = [
        { id: 8801, title: 'Past task', due_date: dates[0], priority: 'high', stage: 'todo', status: 'pending' },
        { id: 8802, title: 'Today first', due_date: dates[1], priority: 'high', stage: 'in_progress', status: 'pending' },
        { id: 8803, title: 'Today second', due_date: dates[1], priority: 'low', stage: 'todo', status: 'pending' },
    ];
    let gets = 0;
    await mobile.route('**/api/tasks?sort=*', route => { gets++; return route.fulfill({ json: tasks }); });
    await mobile.goto(base + '/dashboard');
    await mobile.waitForFunction(() => document.querySelector('#app-mobile-home')?.getAttribute('aria-busy') === 'false');
    assert.equal(gets, 1);
    assert.match(await mobile.locator('#app-mobile-greeting').textContent(), /^Good (morning|afternoon|evening),$/);
    assert.deepEqual(await mobile.locator('#app-mobile-today-list [data-task-id]').evaluateAll(nodes => nodes.map(node => +node.dataset.taskId)), [8802, 8803]);
    assert.equal(await mobile.locator('[data-app-home-stat="total"] strong').textContent(), '3');
    assert.equal(await mobile.locator('[data-app-home-stat="progress"] strong').textContent(), '1');
    assert.equal(await mobile.locator('#app-mobile-home-overdue').evaluate(node => node.open), false);
    await mobile.locator('#app-mobile-home-overdue summary').click();
    assert.ok(await mobile.locator('#app-mobile-overdue-list [data-task-id]').isVisible());
    await mobile.route('**/api/tasks/8802/complete', async route => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({ status: 400, json: { message: 'Mobile completion rollback' } });
    });
    await mobile.locator('#app-mobile-today-list [data-task-id="8802"] [data-action="toggle-check"]').click();
    assert.equal(await mobile.locator('[data-app-home-stat="completed"] strong').textContent(), '1');
    await mobile.getByText('Mobile completion rollback', { exact: true }).waitFor();
    assert.equal(await mobile.locator('[data-app-home-stat="completed"] strong').textContent(), '0');
    assert.equal(await mobile.locator('#app-mobile-today-list [data-task-id]').count(), 2);
    await mobile.unroute('**/api/tasks/8802/complete');
    await mobile.route('**/api/tasks/8802/complete', route => {
        tasks = tasks.map(task => task.id === 8802 ? { ...task, status: 'completed', completed_at: Date.now() } : task);
        return route.fulfill({ json: tasks.find(task => task.id === 8802) });
    });
    await mobile.locator('#app-mobile-today-list [data-task-id="8802"] [data-action="toggle-check"]').click();
    await mobile.waitForFunction(() => document.querySelector('[data-app-home-stat="completed"] strong')?.textContent === '1');
    assert.equal(await mobile.locator('#app-mobile-today-list [data-task-id]').count(), 1);
    await mobile.locator('[data-app-home-action="add"]').first().click();
    assert.ok(await mobile.locator('#create-modal').isVisible());
    await mobile.keyboard.press('Escape');
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await mobile.locator('[data-app-home-action="more"]').click();
    assert.ok(await mobile.locator('#app-more').isVisible()); await mobile.keyboard.press('Escape');
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await mobile.locator('.app-mobile-home-actions a').filter({ hasText: 'Filter' }).click();
    await mobile.locator('#app-mobile-picker').waitFor({ state: 'visible' });
    await mobile.keyboard.press('Escape');
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await mobile.goto(base + '/dashboard');
    for (const width of [768, 1024, 1280, 1920]) {
        await mobile.setViewportSize({ width, height: 950 });
        assert.equal(await mobile.locator('#app-mobile-home').isVisible(), false);
        assert.equal(await mobile.locator('.app-dashboard-main').isVisible(), true);
        assert.equal(await mobile.locator('.app-dashboard-summary [data-app-pet-widget]').count(), 1);
    }
    await mobile.setViewportSize({ width: 380, height: 850 });
    await mobile.waitForFunction(() => document.querySelector('#app-mobile-home-pet [data-app-pet-widget]'));
    assert.equal(await mobile.locator('#app-mobile-home-pet [data-app-pet-widget]').count(), 1);
    tasks = []; await mobile.reload();
    await mobile.locator('#app-mobile-home-empty').waitFor({ state: 'visible' });
    assert.match(await mobile.locator('#app-mobile-empty-title').textContent(), /first small step/);
    assert.equal(await mobile.locator('[data-app-home-stat="overdue"]').getAttribute('data-app-tone'), 'accent');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.screenshot({ path: 'storage/app/ui-review/mobile-home-first-run.png', fullPage: true });
    await mobile.unroute('**/api/tasks?sort=*');
    await mobile.route('**/api/tasks?sort=*', route => route.fulfill({ status: 500, json: { message: 'Home retry check' } }));
    await mobile.reload();
    await mobile.locator('#app-mobile-home-error').getByRole('button', { name: 'Try again' }).waitFor();
    await mobile.unroute('**/api/tasks?sort=*');
    await mobile.route('**/api/tasks?sort=*', route => route.fulfill({ json: [] }));
    await mobile.locator('#app-mobile-home-error').getByRole('button', { name: 'Try again' }).click();
    await mobile.locator('#app-mobile-home-empty').waitFor({ state: 'visible' });
    assert.deepEqual(errors, []); await context.close();
    console.log('PASS: mobile Home single fetch, English greeting, server order, stats, optimistic rollback, Add/More/Filter sheets, desktop restoration, pet reuse and first-run state.');
}
