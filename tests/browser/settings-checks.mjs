import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { appCsvCell, appTasksCsv } from '../../resources/js/features/settings/data-export.js';

export async function appSettingsChecks(page, browser, base) {
    const appOriginalPage = page;
    const appSettingsContext = await browser.newContext({ storageState: await page.context().storageState() });
    page = await appSettingsContext.newPage();
    const appErrors = [], appConsole = [];
    page.on('pageerror', error => appErrors.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) appConsole.push(message.text()); });
    for (const value of ['=SUM(A1:A2)', '+123', '-123', '@SUM(A1)', '  =1+1', '\t+1']) assert.equal(appCsvCell(value), '"\'' + value + '"');
    assert.equal(appCsvCell('Say "hello", please\nnext line'), '"Say ""hello"", please\nnext line"');
    assert.ok(appTasksCsv([{ title: '=1+1', description: 'comma, quote"\nnewline' }]).includes('"\'=1+1"'));
    await page.setViewportSize({ width: 1280, height: 950 });
    await page.goto(base + '/settings');
    await page.waitForFunction(() => document.querySelector('#app-completed-summary')?.textContent.includes('1 completed'));
    const userId = await page.locator('body').getAttribute('data-app-user-id');
    assert.equal(await page.locator('#app-settings-tab-appearance').getAttribute('aria-selected'), 'true');
    await page.locator('#app-settings-tab-appearance').focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('#app-settings-preferences').isVisible(), true);
    await page.locator('#app-default-view').selectOption('list');
    await page.locator('#app-default-sort').selectOption('deadline');
    await page.locator('#app-show-completed').uncheck();
    await page.locator('#app-week-start').selectOption('sunday');
    const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('app-settings:' + id)), userId);
    assert.equal(saved.defaultView, 'list'); assert.equal(saved.showCompleted, false);
    await page.goto(base + '/tasks');
    await page.waitForFunction(() => document.querySelector('#task-list')?.getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('#view-mode-list').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#sort-filter').inputValue(), 'deadline');
    await page.locator('#view-mode-board').click();
    assert.equal(await page.locator('[data-column="completed"]').isVisible(), false);
    await page.goto(base + '/tasks?status=completed&view=board');
    await page.waitForFunction(() => document.querySelector('#task-board-container')?.getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('[data-column="completed"]').isVisible(), true);
    await page.goto(base + '/settings#appearance');
    await page.locator('#app-density').selectOption('compact');
    await page.locator('#app-motion').selectOption('reduce');
    assert.equal(await page.locator('html').getAttribute('data-app-density'), 'compact');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--app-density-space').trim()), '12px');
    assert.equal(await page.locator('html').getAttribute('data-app-motion'), 'reduce');
    for (const mode of ['light', 'dark', 'system', 'kawaii', 'racing']) {
        await page.locator('input[name="app-settings-theme"][value="' + mode + '"]').check({ force: true });
        assert.equal(await page.locator('input[name="app-theme-mode"]:checked').inputValue(), mode);
        const accents = page.locator('#app-settings-accents input');
        assert.equal(await accents.count(), mode === 'racing' ? 3 : 5);
        for (let i = 0; i < await accents.count(); i++) {
            await accents.nth(i).check({ force: true });
            const accent = await accents.nth(i).inputValue();
            assert.equal(await page.locator('html').getAttribute('data-accent'), accent);
            assert.equal(await page.locator('#app-accent-swatches input:checked').inputValue(), accent);
            assert.equal(await page.locator('#app-settings-accents input:checked').count(), 1);
        }
        for (const width of [380, 768, 1024, 1280, 1920]) {
            await page.setViewportSize({ width, height: 950 });
            for (const section of ['appearance', 'preferences', 'account', 'data']) {
                await page.locator('#app-settings-tab-' + section).click();
                assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Settings ' + section + ' overflows: ' + mode + '/' + width);
            }
        }
        await page.locator('#app-settings-tab-appearance').click();
        await page.reload();
        assert.equal(await page.locator('html').getAttribute('data-theme-mode'), mode);
        assert.equal(await page.locator('#app-settings-accents input:checked').inputValue(), await page.locator('html').getAttribute('data-accent'));
    }
    await page.setViewportSize({ width: 1280, height: 950 });
    assert.deepEqual(appErrors, []); assert.deepEqual(appConsole, []);
    await page.locator('#app-settings-tab-account').click();
    await page.locator('#app-profile-name').fill('');
    await page.locator('#app-profile-form button[type="submit"]').click();
    await page.locator('#app-profile-name[aria-invalid="true"]').waitFor();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'app-profile-name');
    const original = await page.locator('.user-name').textContent();
    await page.locator('#app-profile-name').fill('Professional Review');
    await page.locator('#app-profile-form button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('.user-name')?.textContent === 'Professional Review');
    assert.equal(await page.locator('.app-user-avatar').textContent(), 'PR');
    await page.locator('#app-profile-name').fill(original);
    await page.locator('#app-profile-form button[type="submit"]').click();
    await page.waitForFunction(name => document.querySelector('.user-name')?.textContent === name, original);
    await page.locator('#app-current-password').fill('wrong');
    await page.locator('#app-new-password').fill('Settings-new-123!');
    await page.locator('#app-password-confirmation').fill('Settings-new-123!');
    await page.locator('#app-password-form button[type="submit"]').click();
    await page.locator('#app-current-password[aria-invalid="true"]').waitFor();
    for (const [current, next] of [['Review-test-123!', 'Settings-new-123!'], ['Settings-new-123!', 'Review-test-123!']]) {
        await page.locator('#app-current-password').fill(current);
        await page.locator('#app-new-password').fill(next);
        await page.locator('#app-password-confirmation').fill(next);
        await page.locator('#app-password-form button[type="submit"]').click();
        await page.waitForFunction(() => document.querySelector('#app-current-password').value === '' && document.querySelector('#app-password-form').getAttribute('aria-busy') === 'false');
    }
    await page.locator('#app-settings-tab-data').click();
    for (const format of ['json', 'csv']) {
        const downloadPromise = page.waitForEvent('download');
        await page.locator('#app-export-' + format).click();
        const download = await downloadPromise;
        assert.match(download.suggestedFilename(), new RegExp('tasks-\\d{4}-\\d{2}-\\d{2}\\.' + format + '$'));
        const content = await readFile(await download.path(), 'utf8');
        if (format === 'json') { const tasks = JSON.parse(content); assert.equal(tasks.length, 5); assert.ok(tasks.every(task => String(task.user_id) === userId)); }
        else assert.match(content, /"id","user_id","title","description"/);
    }
    await page.locator('#app-delete-completed-open').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'app-cancel-delete-completed');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#app-delete-completed-confirm').isVisible(), false);
    await page.route('**/api/tasks/completed', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Simulated delete failure' }) }));
    await page.locator('#app-delete-completed-open').click();
    await page.locator('#app-confirm-delete-completed').click();
    await page.waitForFunction(() => document.querySelector('#app-data-status')?.textContent === 'Simulated delete failure');
    assert.equal(await page.locator('#app-delete-completed-confirm').isVisible(), true);
    await page.locator('#app-cancel-delete-completed').click();
    await page.unroute('**/api/tasks/completed');
    // Test a successful real bulk deletion using a disposable task, then restore
    // the seeded completed task so the earlier-page regression remains unchanged.
    const appApi = (url, method = 'GET', data) => page.evaluate(async ({ url, method, data }) => {
        const response = await fetch(url, { method, credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, ...(data ? { body: JSON.stringify(data) } : {}) });
        return { status: response.status, data: await response.json() };
    }, { url, method, data });
    const existing = (await appApi('/api/tasks')).data;
    const completed = existing.filter(task => task.status === 'completed');
    await page.locator('#app-delete-completed-open').click();
    await page.locator('#app-confirm-delete-completed').click();
    await page.waitForFunction(() => document.querySelector('#app-completed-summary')?.textContent.startsWith('0 completed'));
    assert.equal(await page.locator('#app-delete-completed-open').isDisabled(), true);
    for (const task of completed) {
        const response = await appApi('/api/tasks', 'POST', { title: task.title, description: task.description, priority: task.priority });
        const restored = response.data;
        assert.equal(response.status, 201);
        assert.equal((await appApi('/api/tasks/' + restored.id + '/complete', 'PATCH')).status, 200);
    }
    await page.goto(base + '/settings#preferences');
    await page.locator('#app-default-view').selectOption('board');
    await page.locator('#app-default-sort').selectOption('priority');
    await page.locator('#app-week-start').selectOption('monday');
    await page.locator('#app-show-completed').check();
    await page.locator('#app-settings-tab-appearance').click();
    await page.locator('#app-density').selectOption('comfortable');
    await page.locator('#app-motion').selectOption('system');
    // Copy the same browser storage to a genuinely different signed-in account.
    // Its defaults and saved values must not use this account's preference key.
    await page.locator('#app-settings-tab-preferences').click();
    await page.locator('#app-default-view').selectOption('list');
    const appOwnSettings = await page.evaluate(id => localStorage.getItem('app-settings:' + id), userId);
    const isolated = await browser.newContext({ storageState: { ...(await page.context().storageState()), cookies: [] } });
    const other = await isolated.newPage();
    await other.goto(base + '/register');
    await other.locator('#name').fill('Settings Other User');
    await other.locator('#email').fill('settings-' + process.pid + '-' + Date.now() + '@example.test');
    await other.locator('#password').fill('Settings-other-123!');
    await other.locator('[data-register-form] button[type="submit"]').click();
    await other.waitForURL('**/continue');
    await other.getByRole('button', { name: 'Continue', exact: true }).click();
    await other.waitForURL('**/dashboard');
    await other.goto(base + '/settings#preferences');
    assert.equal(await other.locator('#app-default-view').inputValue(), 'board');
    assert.equal(await other.locator('#app-default-sort').inputValue(), 'priority');
    await other.locator('#app-week-start').selectOption('sunday');
    assert.equal(await other.evaluate(id => localStorage.getItem('app-settings:' + id), userId), appOwnSettings);
    await isolated.close();
    await page.locator('#app-default-view').selectOption('board');
    const blockedContext = await browser.newContext({ storageState: await page.context().storageState() });
    await blockedContext.addInitScript(() => { Storage.prototype.getItem = () => { throw Error('Blocked'); }; Storage.prototype.setItem = () => { throw Error('Blocked'); }; });
    const blocked = await blockedContext.newPage();
    await blocked.goto(base + '/settings#appearance');
    await blocked.locator('#app-density').selectOption('compact');
    assert.equal(await blocked.locator('html').getAttribute('data-app-density'), 'compact');
    assert.match(await blocked.locator('#app-settings-status').textContent(), /could not be saved/);
    await blocked.locator('#app-settings-tab-preferences').click();
    await blocked.locator('#app-default-view').selectOption('list');
    await blocked.locator('#app-settings-tab-appearance').click();
    assert.equal(await blocked.locator('#app-density').inputValue(), 'compact');
    await blockedContext.close();
    await page.locator('#app-settings-tab-appearance').click();
    await page.evaluate(() => document.querySelectorAll('.toast').forEach(node => node.remove()));
    await page.screenshot({ path: 'storage/app/ui-review/settings-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 380, height: 950 });
    await page.screenshot({ path: 'storage/app/ui-review/settings-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + '/dashboard');
    await page.waitForFunction(() => document.querySelector('#db-summary-total')?.textContent === '5');
    assert.deepEqual(appErrors, []);
    assert.deepEqual(appConsole.filter(message => !/Failed to load resource:.*\b(400|500)\b/.test(message)), []);
    await appSettingsContext.close();
    await appOriginalPage.goto(base + '/dashboard');
    await appOriginalPage.waitForFunction(() => document.querySelector('#db-summary-total')?.textContent === '5');
    console.log('PASS: Settings tabs/keyboard, five themes and accents, reload, 25 responsive combinations across all sections, per-user preferences, board visibility/defaults, density/reduced motion, profile/password errors and saves, real JSON/CSV downloads, bulk delete/cancel/failure and shared-state updates.');
}
