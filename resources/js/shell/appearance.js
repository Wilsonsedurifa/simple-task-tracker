import { appReadStorage, appWriteStorage } from '../core/storage.js';
const appModes = ['light', 'dark', 'system', 'kawaii', 'racing'];
const appNormalAccents = ['blue', 'emerald', 'violet', 'amber', 'sky'];
const appAccentSets = {
    light: appNormalAccents, dark: appNormalAccents, system: appNormalAccents,
    kawaii: ['pink', 'lavender', 'mint', 'peach', 'babyblue'],
    racing: ['red', 'amber', 'sky'],
};
const appAccentNames = { blue:'Blue', emerald:'Emerald', violet:'Violet', amber:'Amber', sky:'Sky', pink:'Candy pink', lavender:'Lavender', mint:'Mint', peach:'Peach', babyblue:'Baby blue', red:'Racing red' };
const appAccentCache = new Map();
let appReturnFocus = null;
let appCurrentMode = null;

function appWritePreference(key, value) {
    appWriteStorage(key, value);
}
function appReadAccent(mode) {
    if (appAccentCache.has(mode)) return appAccentCache.get(mode);
    let value;
    value = appReadStorage('task-accent-' + mode).value;
    return appAccentSets[mode].includes(value) ? value : appAccentSets[mode][0];
}
function appUpdateMeta() {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
}
function appChooseAccent(value) {
    if (!appAccentSets[appCurrentMode]?.includes(value)) return;
    document.documentElement.dataset.accent = value;
    appAccentCache.set(appCurrentMode, value);
    appWritePreference('task-accent-' + appCurrentMode, value);
    const note = document.getElementById('app-appearance-note');
    if (note) note.textContent = appAccentNames[value] + ' accent selected.';
    appUpdateMeta();
    document.querySelectorAll('[data-app-accent-group] input, #app-accent-swatches input').forEach(input => { input.checked = input.value === value; });
}
function appRenderAccents(mode, selected) {
    for (const group of document.querySelectorAll('#app-accent-swatches, [data-app-accent-group]')) {
    group.replaceChildren();
    for (const value of appAccentSets[mode]) {
        const label = document.createElement('label');
        label.className = group.dataset.appAccentClass || 'app-accent-option'; label.dataset.accent = value;
        label.title = appAccentNames[value];
        const input = document.createElement('input');
        input.type = 'radio'; input.name = group.id === 'app-accent-swatches' ? 'app-accent' : group.id + '-choice'; input.value = value;
        input.className = 'app-visually-hidden'; input.checked = selected === value;
        input.setAttribute('aria-label', appAccentNames[value]);
        const swatch = document.createElement('span'); swatch.className = 'app-accent-color'; swatch.setAttribute('aria-hidden', 'true');
        const check = document.createElement('span'); check.className = 'app-option-check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true');
        swatch.append(check); label.append(input, swatch); group.append(label);
        input.addEventListener('change', () => { if (input.checked) appChooseAccent(value); });
    }
    }
}
export function appApplyTheme(mode) {
    if (!appModes.includes(mode)) mode = 'system';
    const root = document.documentElement, dark = matchMedia('(prefers-color-scheme: dark)').matches;
    appCurrentMode = mode;
    const accent = appReadAccent(mode);
    root.dataset.themeMode = mode; root.dataset.theme = mode === 'system' ? (dark ? 'dark' : 'light') : mode; root.dataset.accent = accent;
    appWritePreference('task-tracker-theme', mode); appAccentCache.set(mode, accent);
    document.querySelectorAll('input[name="app-theme-mode"], [data-app-theme-mode]').forEach(input => { input.checked = input.value === mode; });
    appRenderAccents(mode, accent);
    const note = document.getElementById('app-appearance-note');
    if (note) note.textContent = mode === 'system' ? 'Follows your device appearance.' : mode.charAt(0).toUpperCase() + mode.slice(1) + ' theme selected.';
    appUpdateMeta();
}
export function appOpenAppearance(trigger = document.activeElement) {
    const dialog = document.getElementById('app-appearance');
    if (!dialog || dialog.open) return;
    appReturnFocus = trigger;
    dialog.showModal();
    dialog.querySelector('input[name="app-theme-mode"]:checked')?.focus();
}
export function appCloseOnBackdrop(dialog) {
    if (!dialog) return;
    let startedOutside = false;
    const outside = event => {
        const bounds = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
    };
    dialog.addEventListener('pointerdown', event => { startedOutside = outside(event); });
    dialog.addEventListener('click', event => { if (startedOutside && outside(event)) dialog.close(); startedOutside = false; });
}
export function appInitAppearance() {
    const dialog = document.getElementById('app-appearance');
    if (!dialog) return;
    document.querySelectorAll('input[name="app-theme-mode"], [data-app-theme-mode]').forEach(input => {
        input.addEventListener('change', () => { if (input.checked) appApplyTheme(input.value); });
    });
    dialog.querySelector('[data-app-close-appearance]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        const target = appReturnFocus?.isConnected && appReturnFocus.getClientRects().length ? appReturnFocus : innerWidth < 768 ? document.getElementById('app-more-button') : document.getElementById('theme-toggle');
        target?.focus();
    });
    appCloseOnBackdrop(dialog);
    const media = matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', () => {
        if (document.documentElement.dataset.themeMode === 'system') {
            document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
            appUpdateMeta();
        }
    });
    appApplyTheme(document.documentElement.dataset.themeMode || 'system');
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('app-theme-ready')));
}
