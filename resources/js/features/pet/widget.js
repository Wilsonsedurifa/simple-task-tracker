// pet/widget: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appGet as appPetGet, appElement as appPetNode } from '../../core/dom.js';
import { APP_API } from '../../core/constants.js';
import { appReadStorage, appWriteStorage } from '../../core/storage.js';
import { appTaskState } from '../../core/state.js';
import { appRequest } from '../../core/api.js';
import { appToast } from '../../core/toast.js';
import { appReadSettings, appReducedMotion } from '../../shell/preferences.js';
import { appPetMood, appPetBadges } from './data.js';
import { appPetArt } from './art.js';
import { appCloseOnBackdrop } from '../../shell/appearance.js';

let appPet = null, appPetLoaded = false, appPetVersion = 0, appPetBurstUntil = 0, appPetLastTouch = 0, appPetReturnFocus = null;
let appPetLevels = [], appPetError = false, appPetBurstTimer, appPetLastSeen = 0;
function appPetKey(type) { return 'app-pet-' + type + ':' + (document.body?.dataset.appUserId || 'guest'); }
function appPetRead(type) { return appReadStorage(appPetKey(type)).value; }
function appPetWrite(type, value) { appWriteStorage(appPetKey(type), String(value)); }
function appPetStatic() { return appReducedMotion() || appReadSettings().reducePetMotion; }
function appPetFlame() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), path = document.createElementNS(svg.namespaceURI, 'path');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', class: 'app-pet-flame', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
    path.setAttribute('d', 'M12 2c2 6-5 7-3 12 2-1 3-3 3-5 6 4 8 7 6 10-3 5-12 3-12-3 0-5 4-7 6-14Z'); svg.append(path); return svg;
}
function appPetSeen(level) { appPetLastSeen = Math.max(appPetLastSeen, Number(appPetRead('level')) || 0, level); appPetWrite('level', appPetLastSeen); }
function appPetSyncEdit() {
    const form = appPetGet('app-pet-edit-form');
    if (appPet && form && !form.contains(document.activeElement)) for (const key of ['name', 'species']) { const input = form.elements.namedItem(key); if (input) input.value = appPet[key]; }
}

function appPetRender() {
    if (appPet && appTaskState.loaded) appPet.completed_count = appTaskState.tasks.filter(task => task.status === 'completed').length;
    const show = appReadSettings().showPet, reduced = appPetStatic();
    if (!show) document.querySelectorAll('.app-pet-global-reward').forEach(node => node.remove());
    document.documentElement.dataset.appPetMotion = reduced ? 'reduce' : 'full';
    document.querySelectorAll('[data-app-pet-nav]').forEach(node => { node.hidden = !show; });
    const hiddenNote = appPetGet('app-pet-hidden-note'); if (hiddenNote) hiddenNote.hidden = show;
    for (const id of ['app-pet-details', 'app-pet-roadmap-section', 'app-pet-badges-section']) { const node = appPetGet(id); if (node) node.hidden = !show || !appPet; }
    const mood = appPetMood(appTaskState.tasks, appPet);
    const displayMood = Date.now() < appPetBurstUntil ? 'happy' : mood.mood;
    for (const widget of document.querySelectorAll('[data-app-pet-widget]')) {
        widget.hidden = !show;
        for (const [selector, visible] of [['loading', !appPetLoaded && !appPetError], ['error', appPetError], ['empty', appPetLoaded && !appPet && !appPetError], ['content', Boolean(appPet) && !appPetError]]) {
            const node = widget.querySelector('[data-app-pet-' + selector + ']'); if (node) node.hidden = !visible;
        }
        if (!appPet) continue;
        const touch = widget.querySelector('[data-app-pet-touch]');
        if (touch) {
            const signature = appPet.species + ':' + appPet.level + ':' + displayMood;
            if (touch.dataset.appPetSignature !== signature) { touch.replaceChildren(appPetArt(appPet.species, appPet.level, displayMood)); touch.dataset.appPetSignature = signature; }
            touch.style.setProperty('--pet-scale', String(0.6 + (Math.max(1, Math.min(7, appPet.level)) - 1) * 0.7 / 6));
            touch.setAttribute('aria-label', 'Pet ' + appPet.name + ', level ' + appPet.level + ', ' + displayMood);
        }
        const values = { name: appPet.name, level: 'Level ' + appPet.level + ' · ' + appPet.stage, streak: '♨ ' + appPet.streak_days + '-day streak', xp: appPet.xp_for_next === null ? appPet.xp + ' XP · maximum level' : appPet.xp + ' / ' + (appPet.xp - appPet.xp_into_level + appPet.xp_for_next) + ' XP', mood: displayMood === 'happy' && mood.mood !== 'happy' ? appPet.name + ' is happy: one small step together!' : mood.text, speech: mood.speech };
        for (const [key, value] of Object.entries(values)) { const node = widget.querySelector('[data-app-pet-' + key + ']'); if (node) node.textContent = value; }
        const streak = widget.querySelector('[data-app-pet-streak]'); if (streak) streak.replaceChildren(appPetFlame(), document.createTextNode(appPet.streak_days + '-day streak'));
        const bar = widget.querySelector('[data-app-pet-progress]');
        if (bar) { bar.style.setProperty('--pet-progress', String(appPet.progress_pct / 100)); bar.setAttribute('aria-valuenow', String(appPet.progress_pct)); bar.setAttribute('aria-valuetext', values.xp); }
    }
    if (!appPet) return;
    const stats = appPetGet('app-pet-stats');
    if (stats) {
        stats.replaceChildren();
        for (const [label, value] of [['Level', appPet.level + ' · ' + appPet.stage], ['XP', appPet.xp], ['Streak', appPet.streak_days + (appPet.streak_days === 1 ? ' day' : ' days')], ['Longest streak', appPet.longest_streak + (appPet.longest_streak === 1 ? ' day' : ' days')], ['Tasks completed', appPet.completed_count]]) {
            const item = appPetNode('div'); item.append(appPetNode('dt', '', label), appPetNode('dd', '', String(value))); stats.append(item);
        }
    }
    const unlock = appPetGet('app-pet-unlock');
    if (unlock) {
        unlock.textContent = appPet.level < 3 ? 'Next unlock: a little bell at Level 3.' : appPet.level < 5 ? 'Next unlock: a cozy scarf at Level 5.' : appPet.level < 7 ? 'Next unlock: a crown at Level 7.' : 'All accessories unlocked. Keep growing at your own pace!';
        if (appPet.level < 7) unlock.append(appPetArt(appPet.species, appPet.level < 3 ? 3 : appPet.level < 5 ? 5 : 7, 'proud'));
    }
    const roadmap = appPetGet('app-pet-roadmap');
    if (roadmap && roadmap.dataset.appPetSignature !== appPet.species + ':' + appPet.level) {
        roadmap.dataset.appPetSignature = appPet.species + ':' + appPet.level;
        roadmap.replaceChildren(...appPetLevels.map((level, index) => {
            const unlocked = appPet.level >= index + 1, item = appPetNode('li', 'app-pet-roadmap-item'); item.dataset.unlocked = String(unlocked);
            item.append(appPetArt(appPet.species, index + 1, 'idle'), appPetNode('strong', '', level.stage), appPetNode('span', '', 'Level ' + (index + 1) + ' · ' + level.xp + ' XP'), appPetNode('span', '', unlocked ? '✓ Unlocked' : 'Locked'));
            return item;
        }));
    }
    const badges = appPetGet('app-pet-badges');
    if (badges) badges.replaceChildren(...appPetBadges(appTaskState.tasks, appPet).map(badge => {
        const node = appPetNode('div', 'app-pet-badge'); node.dataset.unlocked = String(badge.unlocked);
        node.append(appPetNode('strong', '', (badge.unlocked ? '✓ ' : '◇ ') + badge.name), appPetNode('span', '', badge.value + ' / ' + badge.goal + (badge.unlocked ? ' · Unlocked' : ' · Locked'))); return node;
    }));
}

async function appPetLoad(remember = true) {
    const version = ++appPetVersion;
    try {
        const data = await appRequest(APP_API.pet);
        if (version !== appPetVersion) return;
        if (!data || !Object.hasOwn(data, 'pet')) throw Error('Your companion could not be loaded.');
        appPet = data.pet; appPetLoaded = true; appPetError = false; appPetRender(); appPetSyncEdit();
        if (appPet && remember) appPetSeen(appPet.level);
        if (!appPet && document.body.dataset.page === 'dashboard' && !appPetRead('invite') && appReadSettings().showPet) appPetOffer();
    } catch { if (version === appPetVersion) { appPetError = true; appPetRender(); } }
}
function appPetOffer(trigger = document.activeElement) {
    const dialog = appPetGet('app-pet-adoption');
    if (!dialog || dialog.open || document.querySelector('dialog[open]')) return;
    appPetReturnFocus = trigger instanceof HTMLElement && trigger.matches('button,a,input') ? trigger : document.querySelector('[data-app-pet-adopt]'); dialog.showModal(); dialog.querySelector('input[name="species"]:checked')?.focus();
}
function appPetEffects(text, confetti = false) {
    if (!appReadSettings().showPet) return;
    const widget = [...document.querySelectorAll('[data-app-pet-widget]')].find(node => !node.hidden);
    const effects = widget?.querySelector('[data-app-pet-effects]');
    if (!effects) { appToast(text); document.getElementById('toasts')?.lastElementChild?.classList.add('app-pet-global-reward'); return; }
    const chip = appPetNode('span', 'app-pet-xp-chip', text); effects.append(chip);
    setTimeout(() => chip.remove(), 3000);
    if (appPetStatic() || document.hidden) return;
    if (confetti) for (let i = 0; i < 8; i++) {
        const piece = appPetNode('span', 'app-pet-confetti', i % 2 ? '♥' : '✧'); piece.style.setProperty('--pet-dx', (i - 3.5) * 18 + 'px'); piece.style.setProperty('--pet-dy', -(45 + i % 3 * 20) + 'px'); effects.append(piece);
        piece.addEventListener('animationend', () => piece.remove(), { once: true }); setTimeout(() => piece.remove(), 2000);
    }
    while (effects.childElementCount > 24) effects.firstElementChild?.remove();
}
async function appPetReward(reward) {
    const seen = Math.max(appPetLastSeen, Number(appPetRead('level')) || appPet?.level || 1);
    if (reward.xp_gained > 0) {
        appPetBurstUntil = Date.now() + 3000; clearTimeout(appPetBurstTimer); appPetBurstTimer = setTimeout(appPetRender, 3000);
        appPetRender();
    }
    await appPetLoad(false);
    const leveledUp = reward.leveled_up && reward.level > Math.max(seen, appPetLastSeen, Number(appPetRead('level')) || 0);
    appPetSeen(reward.level);
    if (!appPet || !appReadSettings().showPet || reward.xp_gained <= 0) return;
    appPetEffects('+' + reward.xp_gained + ' XP', leveledUp);
    const announcement = appPetGet('app-pet-announcement'); if (announcement) announcement.textContent = appPet.name + ' earned ' + reward.xp_gained + ' XP.';
    if (leveledUp) {
        const message = appPet.name + ' grew into a ' + reward.new_stage + ' pet!';
        for (const node of document.querySelectorAll('[data-app-pet-celebration]')) { node.textContent = message; node.hidden = false; setTimeout(() => { node.hidden = true; }, 6000); }
        if (!document.querySelector('[data-app-pet-widget]:not([hidden])')) appToast(message);
        appPetSeen(reward.level);
    }
}
function appPetFormErrors(form, error) {
    const summary = form.querySelector('[data-app-pet-form-error]');
    if (summary) { summary.textContent = error.message; summary.hidden = false; summary.tabIndex = -1; }
    let first;
    for (const [key, messages] of Object.entries(error.errors || {})) {
        const input = form.elements.namedItem(key); if (!(input instanceof HTMLElement)) continue;
        input.setAttribute('aria-invalid', 'true');
        const node = appPetNode('p', 'app-field-error', Array.isArray(messages) ? messages.join(' ') : String(messages));
        node.dataset.appPetFieldError = ''; node.id = input.id ? input.id + '-error' : form.id + '-' + key + '-error';
        input.setAttribute('aria-errormessage', node.id); input.closest('.field')?.append(node); first ||= input;
    }
    (first || summary)?.focus();
}
function appPetFormInit(form, editing) {
    if (!form) return;
    let busy = false;
    form.addEventListener('submit', async event => {
        event.preventDefault(); if (busy) return;
        form.querySelectorAll('[data-app-pet-field-error]').forEach(node => node.remove());
        form.querySelectorAll('[aria-invalid]').forEach(node => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-errormessage'); });
        const summary = form.querySelector('[data-app-pet-form-error]'); if (summary) summary.hidden = true;
        const name = form.elements.namedItem('name'), species = form.elements.namedItem('species');
        const data = { name: name?.value || '', species: species?.value || '' };
        if (editing && appPet) for (const key of Object.keys(data)) if (data[key] === appPet[key]) delete data[key];
        busy = true; const submit = form.querySelector('[type="submit"]'); if (submit) submit.disabled = true;
        try {
            const result = await appRequest(APP_API.pet, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(data) });
            appPet = result.pet; appPetLoaded = true; appPetError = false; appPetSeen(appPet.level); appPetWrite('invite', 'adopted'); appPetRender();
            if (editing) { if (name) name.value = appPet.name; if (species) species.value = appPet.species; }
            if (!editing) { appPetGet('app-pet-adoption')?.close(); appPetSyncEdit(); }
            appToast(editing ? 'Pet updated. Your XP is kept.' : 'Welcome, ' + appPet.name + '!');
            if (editing) name?.focus();
        } catch (error) { appPetFormErrors(form, error); }
        finally { busy = false; if (submit) submit.disabled = false; }
    });
}
export function appInitPet() {
    const dialog = appPetGet('app-pet-adoption'); if (!dialog) return;
    try { appPetLevels = JSON.parse(dialog.dataset.appPetLevels || '[]'); } catch { appPetLevels = []; }
    for (const node of document.querySelectorAll('[data-app-pet-preview]')) node.replaceChildren(appPetArt(node.dataset.appPetPreview, 1, 'happy'));
    appCloseOnBackdrop(dialog);
    dialog.addEventListener('close', () => { appPetWrite('invite', 'later'); if (appPetReturnFocus?.isConnected) appPetReturnFocus.focus(); });
    document.querySelectorAll('[data-app-pet-later]').forEach(node => node.addEventListener('click', () => dialog.close()));
    document.querySelectorAll('[data-app-pet-adopt]').forEach(node => node.addEventListener('click', () => appPetOffer(node)));
    document.querySelectorAll('[data-app-pet-retry]').forEach(node => node.addEventListener('click', () => { appPetError = false; appPetRender(); void appPetLoad(); }));
    for (const button of document.querySelectorAll('[data-app-pet-touch]')) button.addEventListener('click', () => {
        if (!appPet || Date.now() - appPetLastTouch < 2000) return;
        appPetLastTouch = Date.now();
        const speech = button.closest('[data-app-pet-widget]')?.querySelector('[data-app-pet-speech]');
        const messages = ['Salamat! Nandito lang ako.', 'Small steps, kaya natin!', 'Pahinga rin. You deserve it.', 'High five! Isa-isa lang.'];
        if (speech) { speech.setAttribute('aria-live', 'polite'); speech.textContent = messages[Math.floor(Math.random() * messages.length)]; }
        if (!appPetStatic()) { button.classList.remove('app-pet-petted'); requestAnimationFrame(() => button.classList.add('app-pet-petted')); setTimeout(() => button.classList.remove('app-pet-petted'), 700); }
        appPetEffects('♥', true);
    });
    appPetFormInit(appPetGet('app-pet-adopt-form'), false);
    appPetFormInit(appPetGet('app-pet-edit-form'), true);
    appTaskState.subscribe(() => { appPetRender(); });
    appTaskState.onReward(reward => { void appPetReward(reward).catch(() => {}); });
    addEventListener('app:settings', () => { appPetRender(); if (appReadSettings().showPet && !appPetLoaded) void appPetLoad().then(appPetSyncEdit); });
    document.addEventListener('visibilitychange', () => { document.documentElement.dataset.appPetPaused = String(document.hidden); if (!document.hidden) appPetRender(); });
    document.documentElement.dataset.appPetPaused = String(document.hidden);
    const appPetTimer = setInterval(() => { if (!document.hidden) appPetRender(); }, 60000);
    addEventListener('pagehide', () => clearInterval(appPetTimer), { once: true });
    appPetRender(); if (appReadSettings().showPet) void appPetLoad().then(appPetSyncEdit);
}
