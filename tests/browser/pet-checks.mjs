import assert from 'node:assert/strict';

export async function appPetChecks(main, browser, base) {
    const context = await browser.newContext({ storageState: { ...(await main.context().storageState()), cookies: [] }, viewport: { width: 1280, height: 950 } });
    const page = await context.newPage(), errors = [], warnings = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (['warning', 'error'].includes(message.type()) && !/Failed to load resource/.test(message.text())) warnings.push(message.text()); });
    await page.goto(base + '/register');
    await page.locator('#name').fill('Pet UI Review');
    await page.locator('#email').fill('pet-' + process.pid + '-' + Date.now() + '@example.test');
    await page.locator('#password').fill('Pet-test-123!');
    await page.locator('[data-register-form] button[type="submit"]').click();
    await page.waitForURL('**/continue');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL('**/dashboard');
    await page.waitForFunction(() => document.querySelector('#app-pet-adoption')?.open);
    assert.equal(await page.locator('.app-pet-species-option').count(), 6);
    await page.getByRole('button', { name: 'Later', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-app-pet-adopt')), true);
    await page.locator('[data-app-pet-adopt]').click();
    await page.locator('#app-pet-adopt-name').fill('');
    await page.locator('#app-pet-adopt-form [type="submit"]').click();
    await page.locator('#app-pet-adopt-name[aria-invalid="true"]').waitFor();
    await page.locator('#app-pet-adopt-form input[value="bunny"]').check();
    await page.locator('#app-pet-adopt-name').fill('Mochi <3');
    await page.locator('#app-pet-adopt-form [type="submit"]').click();
    await page.waitForFunction(() => !document.querySelector('#app-pet-adoption').open);
    assert.equal(await page.locator('[data-app-pet-name]').textContent(), 'Mochi <3');
    const api = (url, method = 'GET', data) => page.evaluate(async ({ url, method, data }) => {
        const response = await fetch(url, { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, ...(data ? { body: JSON.stringify(data) } : {}) });
        return { status: response.status, data: await response.json() };
    }, { url, method, data });
    const date = await page.evaluate(() => {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: document.querySelector('meta[name="app-timezone"]').content, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
        const part = type => parts.find(item => item.type === type).value;
        return part('year') + '-' + part('month') + '-' + part('day');
    });
    const created = await api('/api/tasks', 'POST', { title: 'Pet reward task', priority: 'medium', due_date: date });
    assert.equal(created.status, 201);
    await page.goto(base + '/tasks?view=board');
    const card = page.locator('.app-board-card[data-task-id="' + created.data.id + '"]');
    await card.waitFor();
    await card.locator('[data-action="toggle-check"]').click();
    await page.getByText('+25 XP', { exact: true }).waitFor();
    await page.goto(base + '/pet');
    await page.locator('[data-app-pet-name]').waitFor();
    assert.match(await page.locator('[data-app-pet-xp]').textContent(), /^25 \/ 60 XP/);
    assert.equal(await page.locator('.app-pet-roadmap-item').count(), 7);
    assert.equal(await page.locator('.app-pet-badge').count(), 6);
    assert.equal(await page.locator('[data-app-pet-celebration]').isVisible(), false, 'reload/navigation never replay level-up');
    const before = (await api('/api/pet')).data.pet.xp;
    await page.locator('[data-app-pet-touch]').click();
    assert.equal((await api('/api/pet')).data.pet.xp, before, 'petting never awards XP');
    for (const species of ['cat', 'dog', 'bunny', 'fox', 'dragon', 'panda']) {
        await page.locator('#app-pet-edit-species').selectOption(species);
        const saved = page.waitForResponse(response => response.url().endsWith('/api/pet') && response.request().method() === 'PATCH');
        await page.locator('#app-pet-edit-form [type="submit"]').click();
        assert.equal((await saved).status(), 200);
        await page.waitForFunction(value => document.querySelector('[data-app-pet-touch] svg')?.dataset.species === value, species);
        assert.match(await page.locator('[data-app-pet-xp]').textContent(), /^25 /);
    }
    for (const theme of ['light', 'dark', 'system', 'kawaii', 'racing']) {
        await page.locator('#theme-toggle').click();
        await page.locator('.app-theme-option[data-app-mode="' + theme + '"]').click();
        await page.keyboard.press('Escape'); await page.waitForFunction(() => document.documentElement.dataset.appMobileHistoryBusy !== 'true');
        for (const width of [380, 768, 1024, 1280, 1920]) {
            await page.setViewportSize({ width, height: 950 });
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'pet overflow ' + theme + '/' + width);
        }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-app-pet-touch]').focus();
    assert.match(await page.locator('[data-app-pet-touch]').getAttribute('aria-label'), /Mochi <3, level 2/);
    assert.equal(await page.locator('[data-app-pet-touch]').evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    await page.evaluate(() => { document.querySelectorAll('.toast,.app-pet-xp-chip').forEach(node => node.remove()); document.activeElement?.blur(); });
    await page.screenshot({ path: 'storage/app/ui-review/pet-page.png', fullPage: true });
    await page.goto(base + '/settings#preferences');
    await page.waitForFunction(() => /^\d+ completed/.test(document.getElementById('app-completed-summary')?.textContent || ''));
    await page.locator('#app-show-pet').uncheck();
    assert.equal(await page.locator('#sidebar [data-app-pet-nav]').isVisible(), false);
    await page.goto(base + '/dashboard');
    assert.equal(await page.locator('[data-app-pet-widget]').isVisible(), false);
    await page.goto(base + '/settings#preferences');
    await page.waitForFunction(() => /^\d+ completed/.test(document.getElementById('app-completed-summary')?.textContent || ''));
    await page.locator('#app-show-pet').check();
    await page.locator('#app-reduce-pet-motion').check();
    await page.goto(base + '/pet');
    await page.locator('[data-app-pet-name]').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-app-pet-motion'), 'reduce');
    await page.route('**/api/pet', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Pet unavailable"}' }));
    await page.goto(base + '/tasks?view=list');
    await page.waitForFunction(() => document.querySelector('#task-list')?.getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.app-task-row').count(), 1, 'pet failure never blocks tasks');
    await page.goto(base + '/pet');
    await page.locator('[data-app-pet-retry]').waitFor();
    await page.unroute('**/api/pet');
    await page.locator('[data-app-pet-retry]').click();
    await page.locator('[data-app-pet-name]').waitFor();
    const high = await api('/api/tasks', 'POST', { title: 'Drawer pet level-up', priority: 'high', due_date: date });
    assert.equal(high.status, 201);
    await page.goto(base + '/pet?task=' + high.data.id);
    await page.waitForFunction(() => document.querySelector('#app-task-dialog')?.open);
    await page.locator('#detail-complete-btn').click();
    await page.waitForFunction(() => document.querySelector('[data-app-pet-celebration]')?.textContent.includes('Young'));
    assert.match(await page.locator('[data-app-pet-celebration]').textContent(), /Mochi <3 grew into a Young pet!/);
    await page.locator('#detail-close-btn').click();
    assert.match(await page.locator('[data-app-pet-xp]').textContent(), /^60 /);
    for (const [level, accessory, visible] of [[2, 'bell', false], [3, 'bell', true], [5, 'scarf', true], [7, 'crown', true]]) {
        assert.equal(await page.locator('.app-pet-roadmap .app-pet-art[data-level="' + level + '"] .app-pet-' + accessory).evaluate(node => getComputedStyle(node).display !== 'none'), visible);
    }
    await page.goto(base + '/pet?task=' + high.data.id);
    await page.waitForFunction(() => document.querySelector('#app-task-dialog')?.open);
    await page.locator('#detail-complete-btn').click();
    await page.waitForFunction(() => document.querySelector('#detail-complete-text')?.textContent === 'Mark as completed');
    await page.locator('#detail-complete-btn').click();
    await page.waitForFunction(() => document.querySelector('#detail-complete-text')?.textContent === 'Reopen task');
    assert.equal(await page.locator('.app-pet-xp-chip').count(), 0, 'already awarded task emits no chip');
    assert.equal((await api('/api/pet')).data.pet.xp, 60);
    await page.locator('#detail-close-btn').click();
    const expiredContext = await browser.newContext({ storageState: await context.storageState() });
    const expired = await expiredContext.newPage();
    await expired.route('**/api/pet', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"message":"Unauthenticated."}' }));
    const unauthorized = expired.waitForResponse(response => response.status() === 401);
    await expired.goto(base + '/pet'); await unauthorized; await expiredContext.clearCookies();
    await expired.waitForURL('**/login?return_to=%2Fpet');
    await expiredContext.close();
    assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
    await context.close();
    console.log('PASS: Pet adoption/Later/focus/errors, six original species, real completion reward, no replay/petting XP, roadmap/badges, five themes and widths, reduced motion, settings visibility, isolated failure and retry.');
}
