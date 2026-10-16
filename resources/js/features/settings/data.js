// settings/data: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_API } from '../../core/constants.js';
import { appTaskState } from '../../core/state.js';
import { appToast } from '../../core/toast.js';
import { appTasksCsv } from './data-export.js';
import { appDateInput } from '../../core/dates.js';


export function appSettingsData() {
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
            const result = await appTaskState.mutate(APP_API.tasks + '/completed', 'DELETE');
            const message = 'Deleted ' + result.deleted_count + ' completed task' + (result.deleted_count === 1 ? '' : 's') + '.';
            if (note) note.textContent = message; appToast(message); confirm.hidden = true;
        } catch (error) { if (note) note.textContent = error.message; appToast(error.message, 'error'); }
        finally { deleting = false; cancel.disabled = false; confirm.setAttribute('aria-busy', 'false'); appCount(appTaskState.tasks); if (confirm.hidden) appCloseConfirm(); else cancel.focus(); }
    });
}
