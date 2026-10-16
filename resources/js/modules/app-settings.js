import { appReadSettings, appSaveSettings } from './app-preferences.js';
import { appTaskState } from '../core/state.js';
import { appRequest, appToast } from '../core/api.js';
import { appTasksCsv } from './app-export.js';
import { appDateInput } from '../core/dates.js';

function appSettingsTabs() {
    const tabs = [...document.querySelectorAll('[data-app-settings-tab]')];
    function appSelect(tab, focus = false, updateUrl = true) {
        if (!tab) return;
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1;
            const panel = document.getElementById(item.getAttribute('aria-controls'));
            if (panel) panel.hidden = !selected;
        }
        if (updateUrl) history.replaceState(history.state, '', location.pathname + location.search + '#' + tab.dataset.appSettingsTab);
        dispatchEvent(new Event('app:settings-section'));
        if (focus) tab.focus();
    }
    for (const tab of tabs) {
        tab.addEventListener('click', () => appSelect(tab));
        tab.addEventListener('keydown', event => {
            const index = tabs.indexOf(tab), key = event.key;
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
            event.preventDefault(); appSelect(tabs[key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : (index + (key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length], true);
        });
    }
    const appFromHash = () => appSelect(tabs.find(tab => tab.dataset.appSettingsTab === location.hash.slice(1)) || tabs[0], false, location.hash !== '#profile');
    appFromHash(); addEventListener('hashchange', appFromHash);
}
function appSettingsPreferences() {
    const controls = [...document.querySelectorAll('[data-app-setting]')];
    function appSync() {
        const settings = appReadSettings();
        for (const control of controls) {
            const value = settings[control.dataset.appSetting];
            if (control.type === 'checkbox') control.checked = value; else control.value = value;
        }
    }
    appSync(); addEventListener('app:settings', appSync);
    for (const control of controls) control.addEventListener('change', () => {
        const saved = appSaveSettings({ [control.dataset.appSetting]: control.type === 'checkbox' ? control.checked : control.value });
        const note = document.getElementById('app-settings-status');
        if (note) note.textContent = saved ? 'Preference saved for this account in this browser.' : 'Applied for this page, but browser storage is blocked; it could not be saved.';
    });
    document.getElementById('app-settings-preview-button')?.addEventListener('click', () => appToast('Looking good! This is your current accent.'));
}
function appClearErrors(form) {
    form.querySelectorAll('[data-app-field-error]').forEach(node => node.remove());
    form.querySelectorAll('[aria-invalid]').forEach(input => {
        const errorId = input.id + '-error';
        const ids = (input.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorId);
        if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
        input.removeAttribute('aria-invalid');
    });
    const summary = form.querySelector('[data-app-form-error]'); if (summary) { summary.hidden = true; summary.textContent = ''; }
}
function appShowErrors(form, error) {
    let first = null;
    for (const [name, messages] of Object.entries(error.errors || {})) {
        const input = form.elements.namedItem(name); if (!(input instanceof HTMLElement)) continue;
        const node = document.createElement('p'); node.className = 'app-field-error'; node.dataset.appFieldError = ''; node.id = input.id + '-error';
        node.textContent = Array.isArray(messages) ? messages.join(' ') : String(messages);
        input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), node.id].filter(Boolean).join(' '));
        input.insertAdjacentElement('afterend', node); first ||= input;
    }
    const summary = form.querySelector('[data-app-form-error]');
    if (summary) { summary.textContent = error.message; summary.hidden = false; }
    if (first) first.focus(); else if (summary) { summary.tabIndex = -1; summary.focus(); }
}
function appSettingsAccount() {
    for (const id of ['app-profile-form', 'app-password-form']) {
        const form = document.getElementById(id); if (!form) continue;
        let busy = false;
        form.addEventListener('submit', async event => {
            event.preventDefault(); if (busy) return; busy = true; appClearErrors(form);
            const fields = [...form.querySelectorAll('input[name]:not([type="hidden"])')];
            const data = Object.fromEntries(fields.map(input => [input.name, input.value]));
            const button = form.querySelector('button[type="submit"]'), label = button?.textContent;
            if (button) { button.disabled = true; button.textContent = 'Saving…'; }
            form.setAttribute('aria-busy', 'true'); fields.forEach(input => { input.readOnly = true; });
            let failure;
            try {
                const result = await appRequest(form.action, { method: id === 'app-profile-form' ? 'PATCH' : 'PUT', body: JSON.stringify(data) });
                if (result.user) {
                    document.querySelectorAll('.user-name,[data-app-profile-name]').forEach(node => { node.textContent = result.user.name; });
                    const parts = result.user.name.trim().split(/\s+/);
                    const initials = (Array.from(parts[0] || '')[0] || '') + (parts.length > 1 ? Array.from(parts.at(-1))[0] : '');
                    document.querySelectorAll('.app-user-avatar,.app-mobile-avatar,.app-profile-avatar').forEach(node => { node.textContent = initials.toUpperCase(); });
                } else form.reset();
                appToast(result.message); fields[0]?.focus();
            } catch (error) { failure = error; }
            finally {
                busy = false; form.setAttribute('aria-busy', 'false'); fields.forEach(input => { input.readOnly = false; });
                if (button) { button.disabled = false; button.textContent = label; }
            }
            if (failure) appShowErrors(form, failure);
        });
    }
}
function appSettingsData() {
    const exports = [...document.querySelectorAll('[data-app-export]')], note = document.getElementById('app-data-status');
    let exporting = false, deleting = false;
    for (const button of exports) button.addEventListener('click', async () => {
        if (exporting) return; exporting = true; exports.forEach(item => { item.disabled = true; });
        if (note) note.textContent = 'Fetching your latest tasks…';
        try {
            await appTaskState.load({ force: true });
            const format = button.dataset.appExport, tasks = appTaskState.tasks;
            const blob = new Blob([format === 'csv' ? appTasksCsv(tasks) : JSON.stringify(tasks, null, 2)], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob), link = document.createElement('a');
            link.href = url; link.download = 'simple-task-tracker-tasks-' + appDateInput(new Date()) + '.' + format; link.hidden = true;
            document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
            if (note) note.textContent = tasks.length + ' tasks exported as ' + format.toUpperCase() + '.';
            appToast('Export ready.');
        } catch (error) { if (note) note.textContent = error.message; appToast(error.message, 'error'); }
        finally { exporting = false; exports.forEach(item => { item.disabled = false; }); }
    });
    const opener = document.getElementById('app-delete-completed-open'), confirm = document.getElementById('app-delete-completed-confirm');
    const cancel = document.getElementById('app-cancel-delete-completed'), submit = document.getElementById('app-confirm-delete-completed');
    if (!opener || !confirm || !cancel || !submit) return;
    function appCount(tasks) {
        const count = tasks.filter(task => task.status === 'completed').length;
        const summary = document.getElementById('app-completed-summary'), title = document.getElementById('app-delete-completed-title');
        if (summary) summary.textContent = count + ' completed task' + (count === 1 ? '' : 's') + ' in your account.';
        if (title) title.textContent = 'Permanently delete ' + count + ' completed task' + (count === 1 ? '' : 's') + '?';
        opener.disabled = deleting || count === 0; submit.disabled = deleting || count === 0;
    }
    appTaskState.subscribe(appCount);
    appTaskState.onError(error => { if (note) note.textContent = error.message + ' Reload to retry loading the task count.'; });
    function appCloseConfirm() { confirm.hidden = true; (opener.disabled ? document.getElementById('app-settings-tab-data') : opener)?.focus(); }
    opener.addEventListener('click', () => { confirm.hidden = false; cancel.focus(); });
    cancel.addEventListener('click', appCloseConfirm);
    confirm.addEventListener('keydown', event => { if (event.key === 'Escape' && !deleting) { event.preventDefault(); appCloseConfirm(); } });
    submit.addEventListener('click', async () => {
        if (deleting) return; deleting = true; submit.disabled = true; cancel.disabled = true; opener.disabled = true;
        confirm.setAttribute('aria-busy', 'true');
        try {
            const result = await appTaskState.mutate('/api/tasks/completed', 'DELETE');
            const message = 'Deleted ' + result.deleted_count + ' completed task' + (result.deleted_count === 1 ? '' : 's') + '.';
            if (note) note.textContent = message; appToast(message); confirm.hidden = true;
        } catch (error) { if (note) note.textContent = error.message; appToast(error.message, 'error'); }
        finally { deleting = false; cancel.disabled = false; confirm.setAttribute('aria-busy', 'false'); appCount(appTaskState.tasks); if (confirm.hidden) appCloseConfirm(); else cancel.focus(); }
    });
}
export function appInitSettings() {
    for (const [name, init] of Object.entries({ tabs: appSettingsTabs, preferences: appSettingsPreferences, account: appSettingsAccount, data: appSettingsData })) {
        try { init(); } catch (error) { console.error('Settings ' + name + ':', error); }
    }
}
