// settings/account: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appRequest } from '../../core/api.js';
import { appToast } from '../../core/toast.js';

import { appClearErrors, appShowErrors } from './errors.js';

export function appSettingsAccount() {
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
