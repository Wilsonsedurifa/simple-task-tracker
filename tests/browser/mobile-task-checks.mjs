import assert from 'node:assert/strict';

export async function appMobileTaskChecks(page, browser, base) {
    const context = await browser.newContext({ storageState: await page.context().storageState(), viewport: { width: 380, height: 850 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
    const mobile = await context.newPage(), errors = []; mobile.on('pageerror', error => errors.push(error.message));
    const dates = await page.evaluate(() => [-3, 0, 3].map(offset => { const now = new Date(), day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset); return [day.getFullYear(), String(day.getMonth() + 1).padStart(2, '0'), String(day.getDate()).padStart(2, '0')].join('-'); }));
    let tasks = [
        { id: 7701, title: 'Overdue todo', description: 'Original\nDescription', priority: 'high', status: 'pending', stage: 'todo', due_date: dates[0], created_at: Date.now(), completed_at: null },
        { id: 7702, title: 'In progress today', description: '', priority: 'medium', status: 'pending', stage: 'in_progress', due_date: dates[1], created_at: Date.now(), completed_at: null },
        { id: 7703, title: 'Review this week', description: '', priority: 'low', status: 'pending', stage: 'review', due_date: dates[2], created_at: Date.now(), completed_at: null },
        { id: 7704, title: 'Completed task', description: '', priority: 'low', status: 'completed', stage: 'todo', due_date: null, created_at: Date.now(), completed_at: Date.now() },
    ];
    const patches = [], gets = []; let appRejectEdit = false;
    await mobile.route('**/api/tasks**', async route => {
        const request = route.request(), url = new URL(request.url()), method = request.method();
        if (method === 'GET') { gets.push(url.searchParams.get('sort')); return route.fulfill({ json: tasks }); }
        assert.ok(await request.headerValue('x-csrf-token'));
        const payload = request.postDataJSON() || {};
        if (method === 'POST') {
            if (!payload.title) return route.fulfill({ status: 400, json: { message: 'Please check your input.', errors: { title: ['The title field is required.'] } } });
            const task = { ...payload, id: 7799, status: 'pending', created_at: Date.now(), completed_at: null }; tasks.push(task); return route.fulfill({ status: 201, json: task });
        }
        const id = Number(url.pathname.split('/')[3]), task = tasks.find(task => task.id === id);
        if (method === 'DELETE') { tasks = tasks.filter(task => task.id !== id); return route.fulfill({ json: { message: 'Deleted.' } }); }
        patches.push({ url: url.pathname, payload });
        if (appRejectEdit) return route.fulfill({ status: 400, json: { message: 'Check the title.', errors: { title: ['Title rejected for this test.'] } } });
        if (url.pathname.endsWith('/complete')) Object.assign(task, { status: 'completed', completed_at: Date.now() });
        else if (url.pathname.endsWith('/reopen')) Object.assign(task, { status: 'pending', completed_at: null, stage: payload.stage || 'todo' });
        else Object.assign(task, payload);
        return route.fulfill({ json: task });
    });
    await mobile.goto(base + '/tasks?sort=deadline');
    await mobile.waitForFunction(() => document.querySelector('#task-list')?.getAttribute('aria-busy') === 'false');
    assert.deepEqual(gets, ['deadline']);
    assert.equal(await mobile.locator('#task-board-container').isVisible(), false);
    assert.equal(await mobile.locator('.app-task-stats').isVisible(), false);
    assert.equal(await mobile.locator('#count-pending').textContent(), '1');
    assert.equal(await mobile.locator('#count-in-progress').textContent(), '2');
    await mobile.locator('[data-filter="pending"]').click();
    assert.deepEqual(await mobile.locator('#task-list [data-task-id]').evaluateAll(rows => rows.map(row => +row.dataset.taskId)), [7701]);
    await mobile.locator('[data-filter="in_progress"]').click();
    assert.deepEqual(await mobile.locator('#task-list [data-task-id]').evaluateAll(rows => rows.map(row => +row.dataset.taskId)), [7702, 7703]);
    await mobile.locator('#app-filter-chips').getByRole('button', { name: 'Clear all', exact: true }).click();
    await mobile.locator('#due-filter-mobile-trigger').click(); await mobile.locator('#app-mobile-picker input[value="week"]').check();
    await mobile.locator('#app-mobile-picker').getByRole('button', { name: 'Done' }).click();
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    assert.equal(new URL(mobile.url()).searchParams.get('due'), 'week');
    assert.deepEqual(await mobile.locator('#task-list [data-task-id]').evaluateAll(rows => rows.map(row => +row.dataset.taskId)), [7703]);
    assert.equal(gets.length, 1, 'visibility filters do not fetch');
    await mobile.locator('#app-filter-chips').getByRole('button', { name: 'Clear all', exact: true }).click();
    await mobile.locator('#sort-filter-mobile-trigger').click(); await mobile.locator('#app-mobile-picker input[value="priority"]').check();
    await mobile.locator('#app-mobile-picker').getByRole('button', { name: 'Done' }).click();
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    assert.equal(new URL(mobile.url()).searchParams.get('sort'), 'priority'); assert.equal(gets.at(-1), 'priority');
    await mobile.locator('#task-list [data-task-id="7701"]').click();
    await mobile.locator('#app-task-dialog').waitFor({ state: 'visible' });
    assert.equal(Math.round((await mobile.locator('#app-task-dialog').boundingBox()).width), 380);
    assert.equal(await mobile.locator('#detail-status-text').textContent(), 'Pending');
    assert.match(await mobile.locator('#app-detail-due').textContent(), /3 days overdue/);
    assert.equal(await mobile.locator('#app-detail-completed').isVisible(), false);
    await mobile.screenshot({ path: 'storage/app/ui-review/mobile-task-details.png', fullPage: true });
    await mobile.locator('#app-mobile-detail-menu').click(); await mobile.locator('#app-mobile-detail-actions').getByRole('button', { name: 'Edit', exact: true }).click();
    assert.equal(await mobile.locator('#app-mobile-task-heading').textContent(), 'Edit Task');
    assert.equal(await mobile.locator('#save-edit-button').isDisabled(), true);
    await mobile.locator('#edit-title').fill('Updated overdue todo');
    await mobile.screenshot({ path: 'storage/app/ui-review/mobile-task-edit.png', fullPage: true });
    await mobile.evaluate(() => { if (window.visualViewport) { Object.defineProperty(visualViewport, 'height', { value: 420, configurable: true }); visualViewport.dispatchEvent(new Event('resize')); } });
    await mobile.waitForFunction(() => document.querySelector('#app-task-dialog').getBoundingClientRect().height <= 422);
    const saveBox = await mobile.locator('#save-edit-button').boundingBox(); assert.ok(saveBox && saveBox.y + saveBox.height <= 422, 'edit save stays above simulated keyboard');
    await mobile.evaluate(() => { if (window.visualViewport) { delete visualViewport.height; visualViewport.dispatchEvent(new Event('resize')); } });
    await mobile.locator('#detail-close-btn').click(); await mobile.locator('#app-discard').waitFor({ state: 'visible' }); await mobile.locator('#app-keep-editing').click();
    appRejectEdit = true; await mobile.locator('#save-edit-button').click(); await mobile.locator('#edit-title[aria-invalid="true"]').waitFor(); appRejectEdit = false;
    await mobile.locator('#save-edit-button').click(); await mobile.waitForFunction(() => document.querySelector('#edit-task-form')?.hidden);
    assert.deepEqual(patches.at(-1).payload, { title: 'Updated overdue todo' }, 'unchanged overdue due_date is not sent');
    await mobile.goBack(); await mobile.waitForFunction(() => !document.querySelector('#app-task-dialog')?.open);
    assert.equal(await mobile.evaluate(() => document.activeElement?.dataset.taskId), '7701');
    await mobile.locator('#app-mobile-add').click(); await mobile.locator('#submit-button').click(); await mobile.locator('#title[aria-invalid="true"]').waitFor();
    await mobile.locator('#title').fill('A new mobile task'); await mobile.locator('#description').fill('More details');
    assert.equal(await mobile.locator('#app-create-description-count').textContent(), '12/1000');
    await mobile.locator('#app-mobile-create-priority').selectOption('high'); await mobile.locator('#app-create-stage').selectOption('review');
    await mobile.locator('#app-create-due').fill(dates[2]); await mobile.locator('#app-clear-create-due').click();
    await mobile.locator('#description').press('Control+Enter'); await mobile.waitForFunction(() => !document.querySelector('#create-modal')?.open);
    assert.equal(tasks.at(-1).stage, 'review'); assert.equal(tasks.at(-1).priority, 'high'); assert.equal(tasks.at(-1).due_date, null);
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await mobile.locator('#task-list [data-task-id="7701"] [data-app-mobile-task-menu]').click();
    await mobile.locator('#app-mobile-task-actions').getByRole('button', { name: 'Move to…', exact: true }).click();
    await mobile.locator('#app-mobile-task-actions').getByRole('button', { name: 'In progress', exact: true }).click();
    await mobile.waitForFunction(() => !document.querySelector('#app-mobile-task-actions')?.open);
    assert.equal(tasks.find(task => task.id === 7701).stage, 'in_progress');
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await mobile.locator('#task-list [data-task-id="7799"] [data-app-mobile-task-menu]').click();
    await mobile.locator('#app-mobile-task-actions').getByRole('button', { name: 'Delete task', exact: true }).click();
    assert.ok(tasks.find(task => task.id === 7799));
    await mobile.locator('#app-mobile-task-actions').getByRole('button', { name: 'Yes, delete', exact: true }).click();
    await mobile.waitForFunction(() => !document.querySelector('#task-list [data-task-id="7799"]'));
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    for (const theme of ['light', 'dark', 'system', 'kawaii', 'racing']) {
        await mobile.locator('#app-more-button').click(); await mobile.locator('#app-more [data-app-appearance]').click();
        await mobile.locator('.app-theme-option[data-app-mode="' + theme + '"]').click(); await mobile.keyboard.press('Escape');
        await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
        assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await mobile.screenshot({ path: 'storage/app/ui-review/mobile-task-list.png', fullPage: true });
    // Regression: screenshot-sized Kawaii form must not stagger Priority/Status.
    await mobile.setViewportSize({ width:500, height:800 });
    await mobile.locator('#app-more-button').click(); await mobile.locator('#app-more [data-app-appearance]').click();
    await mobile.locator('.app-theme-option[data-app-mode="kawaii"]').click(); await mobile.locator('.app-accent-option[data-accent="pink"]').click(); await mobile.keyboard.press('Escape');
    await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await mobile.locator('#app-mobile-add').click();
    for (const width of [380,500]) {
        await mobile.setViewportSize({width,height:800});
        const priority = await mobile.locator('#app-mobile-create-priority').boundingBox(), stage = await mobile.locator('#app-create-stage').boundingBox();
        assert.ok(Math.abs(priority.y-stage.y)<=4,'Priority and Status align at '+width);
        await mobile.locator('#task-form').evaluate(form => { form.scrollTop=form.scrollHeight; });
        const due = await mobile.locator('#app-create-due').boundingBox(), footer = await mobile.locator('#submit-button').boundingBox();
        assert.ok(due.y+due.height<=footer.y,'Due date is fully reachable above footer at '+width);
        const clear = await mobile.locator('#app-clear-create-due').boundingBox(); assert.ok(clear.y+clear.height<=due.y+1,'Clear does not overlap the date input');
    }
    await mobile.mouse.move(0,0);
    await mobile.waitForFunction(() => getComputedStyle(document.getElementById('submit-button')).backgroundColor === 'rgb(190, 24, 93)');
    await mobile.locator('#title').focus();
    await mobile.waitForFunction(() => getComputedStyle(document.getElementById('title')).borderTopColor === 'rgb(190, 24, 93)');
    await mobile.screenshot({path:'storage/app/ui-review/kawaii-create-fixed.png',fullPage:true});
    await mobile.keyboard.press('Escape'); await mobile.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    assert.deepEqual(errors, []); await context.close();
    console.log('PASS: mobile task filters/counts/order, picker URLs/server sort, full-screen details, changed-only overdue edit/guard/400, create validation/stage/counter, move/delete sheets and five themes.');
}
