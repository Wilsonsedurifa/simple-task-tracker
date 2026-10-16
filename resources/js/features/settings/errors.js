import { appReadSettings, appSaveSettings } from '../../shell/preferences.js';
import { appTaskState } from '../../core/state.js';
import { appRequest, appToast } from '../../core/api.js';
import { appTasksCsv } from './data-export.js';
import { appDateInput } from '../../core/dates.js';


export function appClearErrors(form) {
    form.querySelectorAll('[data-app-field-error]').forEach(node => node.remove());
    form.querySelectorAll('[aria-invalid]').forEach(input => {
        const errorId = input.id + '-error';
        const ids = (input.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorId);
        if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
        input.removeAttribute('aria-invalid');
    });
    const summary = form.querySelector('[data-app-form-error]'); if (summary) { summary.hidden = true; summary.textContent = ''; }
}

export function appShowErrors(form, error) {
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
