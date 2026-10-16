// dashboard/quick add: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_API } from '../../core/constants.js';
import { appGet, appText, appElement as appNode } from '../../core/dom.js';
import { appTaskState } from '../../core/state.js';
import { appToast } from '../../core/toast.js';
export function appInitQuickAdd() {
    let appSubmitting = false;
    const form = appGet('app-quick-form'), details = appGet('app-quick-details'), toggle = appGet('app-quick-toggle'), description = appGet('app-quick-description');
    toggle?.addEventListener('click', () => {
        if (!details) return;
        details.hidden = !details.hidden; toggle.setAttribute('aria-expanded', String(!details.hidden)); toggle.textContent = details.hidden ? 'Add details' : 'Hide details';
        if (!details.hidden) description?.focus();
    });
    description?.addEventListener('input', () => {
        appText('app-quick-count', description.value.length + '/1000'); appGet('app-quick-count')?.classList.toggle('app-limit', description.value.length === 1000);
    });
    description?.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); form?.requestSubmit(); } });
    function appQuickErrors(error = null) {
        form?.querySelectorAll('.app-field-error').forEach(node => node.remove());
        form?.querySelectorAll('[aria-invalid]').forEach(node => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
        if (description) description.setAttribute('aria-describedby', 'app-quick-count');
        const box = appGet('app-quick-error'); if (box) { box.hidden = !error; box.textContent = error?.message || ''; }
        let first = null;
        for (const [key, messages] of Object.entries(error?.errors || {})) {
            const field = form?.elements.namedItem(key); if (!(field instanceof HTMLElement)) continue;
            if (key === 'description' && details && toggle) { details.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = 'Hide details'; }
            const message = appNode('p', 'app-field-error', messages[0]); message.id = 'app-quick-error-' + key; message.setAttribute('role', 'alert');
            field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', message.id); field.after(message); first ||= field;
        }
        first?.focus();
    }
    form?.addEventListener('submit', async event => {
        event.preventDefault(); if (appSubmitting) return;
        appSubmitting = true; appQuickErrors();
        const values = { title: appGet('app-quick-title')?.value.trim() || '', priority: appGet('app-quick-priority')?.value || 'medium', due_date: appGet('app-quick-due')?.value || null, description: description?.value || null };
        const controls = [...form.querySelectorAll('input,select,textarea,button')]; controls.forEach(control => { control.disabled = true; });
        appText('app-quick-submit', 'Adding…');
        try {
            await appTaskState.mutate(APP_API.tasks, 'POST', values);
            form.reset(); if (details) details.hidden = true;
            toggle?.setAttribute('aria-expanded', 'false'); if (toggle) toggle.textContent = 'Add details';
            appText('app-quick-count', '0/1000'); appGet('app-quick-count')?.classList.remove('app-limit'); appToast('Task added.');
        } catch (error) { appQuickErrors(error); }
        finally {
            controls.forEach(control => { control.disabled = false; }); appSubmitting = false; appText('app-quick-submit', 'Add task');
            (form.querySelector('[aria-invalid]') || appGet('app-quick-title'))?.focus({ preventScroll: true });
        }
    });
}
