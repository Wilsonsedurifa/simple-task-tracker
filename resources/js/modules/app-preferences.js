const appDefaults = { defaultView: 'board', defaultSort: 'priority', weekStart: 'monday', showCompleted: true, density: 'comfortable', motion: 'system', showPet: true, reducePetMotion: false };
const appChoices = { defaultView: ['board', 'list'], defaultSort: ['priority', 'deadline'], weekStart: ['monday', 'sunday'], density: ['comfortable', 'compact'], motion: ['system', 'reduce'] };
let appMemory = null;
export function appSettingsKey() {
    return 'app-settings:' + (document.body?.dataset.appUserId || 'guest');
}
export function appReadSettings() {
    let values = appMemory;
    if (!values) { try { values = JSON.parse(localStorage.getItem(appSettingsKey()) || '{}'); } catch {} }
    const settings = { ...appDefaults };
    if (!values || typeof values !== 'object') return settings;
    for (const [key, choices] of Object.entries(appChoices)) if (choices.includes(values[key])) settings[key] = values[key];
    for (const key of ['showCompleted', 'showPet', 'reducePetMotion']) if (typeof values[key] === 'boolean') settings[key] = values[key];
    return settings;
}
export function appReadWeekStart() { return appReadSettings().weekStart === 'sunday' ? 0 : 1; }
export function appReducedMotion() { return appReadSettings().motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches; }
export function appApplyPreferences() {
    const settings = appReadSettings(), root = document.documentElement;
    root.dataset.appMotion = settings.motion;
    root.dataset.appDensity = settings.density;
    root.style.setProperty('--app-density-space', settings.density === 'compact' ? '12px' : '18px');
    root.style.setProperty('--app-density-gap', settings.density === 'compact' ? '8px' : '14px');
}
export function appSaveSettings(values) {
    appMemory = { ...appReadSettings(), ...values };
    let saved = true;
    try { localStorage.setItem(appSettingsKey(), JSON.stringify(appMemory)); } catch { saved = false; }
    appApplyPreferences();
    dispatchEvent(new CustomEvent('app:settings', { detail: { ...appReadSettings(), saved } }));
    return saved;
}
export function appInitPreferences() {
    appApplyPreferences();
    addEventListener('storage', event => {
        if (event.key !== null && event.key !== appSettingsKey()) return;
        appMemory = null; appApplyPreferences();
        dispatchEvent(new CustomEvent('app:settings', { detail: appReadSettings() }));
    });
}
