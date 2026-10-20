import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/PITO/AppData/Local/Programs/Python/Python311/Lib/site-packages/playwright/driver/package');
const root = process.cwd(), output = path.join(root, 'storage/app/pet-movement-review');
mkdirSync(output, { recursive: true });
const env = { ...process.env, APP_ENV: 'testing', DB_CONNECTION: 'sqlite', DB_DATABASE: path.join(output, 'review.sqlite'), SESSION_DRIVER: 'file', CACHE_STORE: 'array', MAIL_MAILER: 'array', APP_URL: 'http://127.0.0.1:8143' };
const migration = spawnSync('php', ['artisan', 'migrate', '--force'], { env, encoding: 'utf8' });
assert.equal(migration.status, 0, migration.stdout + migration.stderr);
const server = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', '--port=8143'], { env, windowsHide: true, stdio: 'ignore' });
let browser;
try {
    for (let attempt = 0; attempt < 100; attempt++) {
        try { if ((await fetch(env.APP_URL)).ok) break; } catch {}
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 950 }, recordVideo: { dir: output } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(env.APP_URL + '/register');
    await page.locator('#name').fill('Movement Review');
    await page.locator('#username').fill('review_' + Date.now());
    await page.locator('#email').fill('review' + Date.now() + '@example.test');
    await page.locator('#password').fill('Password-123!');
    await page.locator('[data-register-form] [type="submit"]').click();
    await page.waitForURL('**/continue');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL('**/dashboard');
    await page.evaluate(async () => {
        await fetch('/api/pet', { method:'POST', headers:{ 'Content-Type':'application/json', Accept:'application/json', 'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').content }, body:JSON.stringify({name:'Mochi',species:'cat'}) });
    });
    await page.goto(env.APP_URL + '/pet');
    const room = page.locator('[data-app-pet-room]');
    await page.locator('[data-app-pet-content]:not([hidden])').waitFor();
    await room.scrollIntoViewIfNeeded();
    const directions = new Set();
    for (let index = 0; index < 170; index++) {
        const snapshot = await room.evaluate(node => {
            const pet = node.querySelector('[data-app-pet-touch]'), bounds = pet.getBoundingClientRect(), area = node.getBoundingClientRect();
            return { state:node.dataset.petState, direction:pet.dataset.direction, inside:bounds.left >= area.left && bounds.right <= area.right && bounds.bottom <= area.bottom && bounds.top >= area.top };
        });
        assert.ok(snapshot.inside, JSON.stringify(snapshot));
        if (snapshot.state === 'walk') {
            if (!directions.has(snapshot.direction)) {
                await room.screenshot({ path:path.join(output, 'walk-' + snapshot.direction + '-a.png') });
                await page.waitForTimeout(160);
                await room.screenshot({ path:path.join(output, 'walk-' + snapshot.direction + '-b.png') });
                directions.add(snapshot.direction);
            }
        }
        if (directions.size === 2) break;
        await page.waitForTimeout(400);
    }
    assert.equal(directions.size, 2, 'Expected both walking directions');
    await page.locator('[data-pet-interaction="pet"]').click();
    await page.locator('.pet-room-bubble').waitFor();
    await room.screenshot({ path:path.join(output, 'reaction.png') });
    await page.setViewportSize({width:375,height:812});
    await room.scrollIntoViewIfNeeded();
    await page.waitForTimeout(4500);
    await room.screenshot({ path:path.join(output, 'mobile.png') });
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(250);
    assert.equal(await room.getAttribute('data-pet-state'), 'idle-sit');
    const before = await page.locator('[data-app-pet-touch]').evaluate(node => getComputedStyle(node).translate);
    await page.waitForTimeout(700);
    assert.equal(await page.locator('[data-app-pet-touch]').evaluate(node => getComputedStyle(node).translate), before);
    await room.screenshot({ path:path.join(output, 'reduced-motion.png') });
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS: both walk directions, bounds, reactions, 375px and reduced motion. Artifacts: ' + output);
} finally { if (browser) await browser.close(); server.kill(); }
