// Records stable shell/page geometry before M1, then compares after M1.
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const require = createRequire(import.meta.url), { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const env = { ...process.env, APP_ENV: 'testing', DB_CONNECTION: 'sqlite', DB_DATABASE: path.join(process.cwd(), 'storage/app/ui-review.sqlite'), SESSION_DRIVER: 'file', CACHE_STORE: 'array', APP_URL: 'http://127.0.0.1:8138' };
const setup = spawnSync('php', ['-r', `require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); App\\Models\\User::firstOrCreate(['email'=>'mobile-baseline@example.test'],['name'=>'Mobile Baseline','password'=>Illuminate\\Support\\Facades\\Hash::make('Baseline-test-123!')]);`], { env, encoding: 'utf8' });
assert.equal(setup.status, 0, setup.stderr);
const server = spawn('php', ['artisan', 'serve', '--port=8138', '--no-reload'], { env, windowsHide: true, stdio: 'ignore' });
let browser;
try {
    for (let i = 0; i < 60; i++) { try { await fetch(env.APP_URL + '/login'); break; } catch { await new Promise(resolve => setTimeout(resolve, 150)); } }
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    const page = await browser.newPage({ viewport: { width: 1280, height: 950 }, reducedMotion: 'reduce' });
    if (process.argv.includes('--record-stable')) {
        const source = await readFile('resources/css/tasks.css', 'utf8'), start = source.indexOf('/* M1 foundation:'), end = source.indexOf('@media (min-width:768px) and (max-width:1023px) { .app-nav-item>.app-notification-count', start);
        assert.ok(start >= 0 && end > start);
        const original = source.slice(0, start) + source.slice(end) + '\n.app-mobile-header,.app-mobile-picker-trigger,.app-mobile-task-more,.app-mobile-date-icon{display:none!important}';
        // Reconstruct pre-foundation styles for a settled reference, hiding only
        // additive mobile-only elements which were absent in the original HTML.
        await page.route('**/build/assets/tasks-*.css', route => route.fulfill({ status: 200, contentType: 'text/css', body: original }));
    }
    await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { localStorage.setItem('task-tracker-theme', 'light'); if (document.body.dataset.appUserId) localStorage.setItem('app-pet-invite:' + document.body.dataset.appUserId, 'later'); }));
    await page.goto(env.APP_URL + '/login'); await page.locator('#email').fill('mobile-baseline@example.test'); await page.locator('#password').fill('Baseline-test-123!'); await page.locator('button[type="submit"]').first().click();
    await page.waitForURL('**/continue'); await page.getByRole('button', { name: 'Continue', exact: true }).click(); await page.waitForURL('**/dashboard');
    const result = {};
    for (const route of ['dashboard', 'tasks', 'calendar', 'notifications', 'settings', 'pet']) for (const width of [768, 1024, 1280, 1920]) {
        await page.setViewportSize({ width, height: 950 }); await page.goto(env.APP_URL + '/' + route);
        await page.waitForFunction(() => ![...document.querySelectorAll('main [aria-busy="true"]')].some(node => node.offsetParent !== null) && (!document.querySelector('[data-app-pet-loading]') || document.querySelector('[data-app-pet-loading]').hidden)); await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        result[route + ':' + width] = await page.evaluate(() => {
            const output = {};
            for (const selector of ['.app-sidebar', '.app-topbar', '.dashboard-content', '.app-page-title', '.app-task-stats', '.app-task-toolbar', '.app-calendar-layout', '.app-settings-layout', '.app-pet-page-layout']) {
                const node = document.querySelector(selector); if (!node) continue;
                const style = getComputedStyle(node), rect = node.getBoundingClientRect();
                output[selector] = { x: rect.x, y: rect.y, width: rect.width, height: rect.height, display: style.display, padding: style.padding, gap: style.gap, background: style.backgroundColor, color: style.color, font: style.font, borderRadius: style.borderRadius };
            }
            return output;
        });
    }
    const file = process.argv.includes('--record') ? 'storage/app/mobile-desktop-baseline.json' : 'storage/app/mobile-desktop-stable.json';
    if (process.argv.includes('--record') || process.argv.includes('--record-stable')) { await writeFile(file, JSON.stringify(result, null, 2)); console.log('Recorded 24 pre-foundation tablet/desktop geometry and style snapshots.'); }
    else {
        const expected = JSON.parse(await readFile(file, 'utf8'));
        const differences = [];
        for (const [key, selectors] of Object.entries(result)) for (const [selector, styles] of Object.entries(selectors)) for (const [property, value] of Object.entries(styles)) if (value !== expected[key]?.[selector]?.[property]) differences.push({ key, selector, property, expected: expected[key]?.[selector]?.[property], actual: value });
        assert.deepEqual(differences, []); console.log('PASS: all 24 settled tablet/desktop geometry and style snapshots unchanged.');
    }
} finally { await browser?.close(); server.kill(); }
