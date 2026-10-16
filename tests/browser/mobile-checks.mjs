import assert from 'node:assert/strict';

export async function appMobileChecks(main, browser, base) {
    const guestContext = await browser.newContext({ viewport: { width: 380, height: 820 } }), guest = await guestContext.newPage();
    let publicReads = 0;
    guest.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) publicReads++; });
    await guest.goto(base + '/');
    assert.match(await guest.locator('h1').innerText(), /Finish your tasks\./);
    assert.match(await guest.locator('body').evaluate(node => getComputedStyle(node).fontFamily), /Figtree|system-ui/);
    assert.equal(await guest.getByRole('link', { name: /Get started/ }).first().getAttribute('href'), base + '/register');
    await guest.screenshot({ path: 'storage/app/ui-review/mobile-welcome.png', fullPage: true });
    for (const route of ['login', 'register']) for (const width of [380, 768, 1024, 1280, 1920]) {
        await guest.setViewportSize({ width, height: 900 }); await guest.goto(base + '/' + route);
        assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        for (const input of await guest.locator('.auth-card input:not([type="checkbox"]):not([type="hidden"])').all()) {
            assert.ok((await input.boundingBox()).height >= 48);
            assert.ok(await input.evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 16));
        }
        if (width === 380) await guest.screenshot({ path: 'storage/app/ui-review/mobile-' + route + '.png', fullPage: true });
    }
    for (const theme of ['light', 'dark', 'system', 'kawaii', 'racing']) {
        await guest.evaluate(value => localStorage.setItem('task-tracker-theme', value), theme);
        for (const route of ['/login', '/register']) { await guest.goto(base + route); assert.equal(await guest.locator('html').getAttribute('data-theme-mode'), theme); assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); }
    }
    assert.equal(publicReads, 0, 'welcome/auth never fetch private task or pet data');
    await guestContext.close();
    const context = await browser.newContext({ storageState: await main.context().storageState(), viewport: { width: 380, height: 820 } });
    const page = await context.newPage(), errors = [], warnings = [];
    page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (['warning', 'error'].includes(message.type())) warnings.push(message.text()); });
    let reads = 0, writes = 0;
    page.on('request', request => { if (new URL(request.url()).pathname === '/api/tasks' && request.method() === 'GET') reads++; if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD'].includes(request.method())) writes++; });
    for (const route of ['dashboard', 'tasks', 'calendar', 'notifications', 'settings', 'pet']) {
        const before = reads; await page.goto(base + '/' + route);
        await page.waitForFunction(() => ![...document.querySelectorAll('main [aria-busy="true"]')].some(node => node.offsetParent !== null));
        assert.equal(reads - before, 1, 'one shared task fetch on ' + route);
        assert.equal(await page.locator('.app-topbar').isVisible(), false); assert.equal(await page.locator('#sidebar').isVisible(), false);
        assert.equal(await page.locator('.app-mobile-header').isVisible(), true);
        assert.deepEqual(await page.locator('.app-bottom-nav>a>span,.app-bottom-nav>button>span:last-child').allTextContents(), ['Home', 'Calendar', 'Add', 'Tasks', 'Profile']);
        assert.equal(await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map(node => node.id); return ids.length === new Set(ids).size; }), true);
        for (const item of await page.locator('.app-bottom-nav>a,.app-bottom-nav>button').all()) assert.ok((await item.boundingBox()).height >= 44);
        await page.locator('#app-more-button').click(); await page.waitForFunction(() => document.querySelector('#app-more')?.open);
        await page.goBack(); await page.waitForFunction(() => !document.querySelector('#app-more').open);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'app-more-button');
        const previous = reads;
        await page.setViewportSize({ width: 768, height: 950 }); await page.waitForFunction(() => document.documentElement.dataset.appMobile === 'false');
        assert.equal(await page.locator('.app-topbar').isVisible(), true);
        assert.equal(await page.locator('.app-topbar #task-search').count(), 1);
        await page.setViewportSize({ width: 380, height: 820 }); await page.waitForFunction(() => document.documentElement.dataset.appMobile === 'true');
        assert.equal(await page.locator('.app-mobile-header #task-search').count(), 1); assert.equal(reads, previous, 'resize never fetches tasks');
    }
    await page.goto(base + '/tasks?view=list');
    await page.waitForFunction(() => document.querySelector('#task-list')?.getAttribute('aria-busy') === 'false');
    await page.locator('#priority-filter-mobile-trigger').click();
    await page.locator('#app-mobile-picker input[value="high"]').check();
    await page.locator('#app-mobile-picker').getByRole('button', { name: 'Done' }).click();
    await page.waitForFunction(() => !document.querySelector('#app-mobile-picker'));
    assert.equal(new URL(page.url()).searchParams.get('priority'), 'high');
    await page.locator('.app-mobile-task-more').first().click();
    await page.locator('#app-mobile-task-actions').getByRole('button', { name: 'View details' }).click();
    await page.waitForFunction(() => document.querySelector('#app-task-dialog')?.open);
    await page.locator('#detail-close-btn').click();
    await page.waitForFunction(() => !document.querySelector('#app-task-dialog').open);
    await page.locator('#app-mobile-add').click(); await page.waitForFunction(() => document.querySelector('#create-modal')?.open);
    assert.equal(await page.locator('.app-bottom-nav').isVisible(), false);
    assert.ok(Math.abs((await page.locator('#create-modal').boundingBox()).height - 820) <= 2);
    await page.evaluate(() => { if (window.visualViewport) { Object.defineProperty(visualViewport, 'height', { value: 420, configurable: true }); visualViewport.dispatchEvent(new Event('resize')); } });
    await page.waitForFunction(() => document.querySelector('#create-modal').getBoundingClientRect().height <= 422);
    const primary = await page.locator('#submit-button').boundingBox(); assert.ok(primary && primary.y + primary.height <= 422, 'primary action stays above the simulated keyboard');
    await page.evaluate(() => { if (window.visualViewport) { delete visualViewport.height; visualViewport.dispatchEvent(new Event('resize')); } });
    await page.goBack(); await page.waitForFunction(() => !document.querySelector('#create-modal').open);
    await context.setOffline(true); await page.locator('#app-offline-banner').waitFor();
    const beforeWrites = writes;
    await page.locator('#task-list [data-action="toggle-check"]').first().click({ force: true });
    assert.equal(writes, beforeWrites, 'offline completion makes no mutation request');
    assert.match(await page.locator('#toasts').textContent(), /offline/);
    assert.equal(await page.locator('#task-list [data-action="toggle-check"]').first().getAttribute('aria-disabled'), 'true');
    await page.locator('#app-mobile-add').click(); await page.locator('#title').fill('Offline task must not be queued');
    await page.locator('#submit-button').click({ force: true });
    assert.equal(await page.locator('#create-modal #toasts').count(), 1, 'offline toast is in the active native dialog top layer');
    assert.equal(writes, beforeWrites);
    await page.locator('#close-create-modal').click(); await page.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await context.setOffline(false); await page.waitForFunction(() => document.querySelector('#app-offline-banner').hidden);
    assert.equal(writes, beforeWrites, 'reconnection never queues a write');
    await page.locator('#app-more-button').click(); await page.locator('#app-more [data-app-appearance]').click();
    await page.locator('.app-theme-option[data-app-mode="light"]').click();
    await page.keyboard.press('Escape'); await page.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    for (const theme of ['light', 'dark', 'system', 'kawaii', 'racing']) {
        await page.locator('#app-more-button').click(); await page.locator('#app-more [data-app-appearance]').click();
        await page.locator('.app-theme-option[data-app-mode="' + theme + '"]').click(); await page.keyboard.press('Escape'); await page.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
        await page.waitForFunction(() => !document.querySelector('#app-appearance').open);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#app-more-button').click(); await page.locator('#app-more [data-app-appearance]').click(); await page.locator('.app-theme-option[data-app-mode="light"]').click(); await page.keyboard.press('Escape'); await page.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
    await page.evaluate(() => { document.querySelectorAll('.toast').forEach(node => node.remove()); document.activeElement?.blur(); });
    await page.screenshot({ path: 'storage/app/ui-review/mobile-foundation-tasks.png', fullPage: true });
    assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
    await context.close();
    console.log('PASS: mobile welcome/auth, five tabs/targets, shared IDs/state, hamburger Back/focus, responsive reparenting without fetch, filter picker, task action sheet, full-screen create/nav hiding, offline no-write/no-queue, themes and reduced motion.');
}
