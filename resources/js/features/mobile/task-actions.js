// mobile/task actions: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_API } from '../../core/constants.js';
import { appTaskState } from '../../core/state.js';
import { appToast } from '../../core/toast.js';
import { appOpenTask } from '../task-dialog/dialog.js';
import { appMobileElement, appMobileSheet } from './components.js';

export function appOpenMobileTaskActions(id, trigger) {
    const task = appTaskState.tasks.find(item => String(item.id) === String(id));
    if (!task || document.getElementById('app-mobile-task-actions')) return;
    const sheet = appMobileSheet('app-mobile-task-actions', 'Task actions');
    const appButton = (label, action, mutation = false) => {
        const button = appMobileElement('button', 'app-mobile-menu-action', label); button.type = 'button';
        if (mutation) button.dataset.appMutation = '';
        button.addEventListener('click', action); return button;
    };
    const appAfterClose = action => {
        if (history.state?.appMobileSheet === sheet.dialog.id) {
            let timer; const run = () => { clearTimeout(timer); removeEventListener('popstate', run); queueMicrotask(action); };
            addEventListener('popstate', run, { once: true }); sheet.dialog.close(); timer = setTimeout(run, 500);
        } else { sheet.dialog.close(); requestAnimationFrame(action); }
    };
    let appBusy = false;
    async function appMutate(action, message) {
        if (appBusy) return; appBusy = true;
        sheet.body.querySelectorAll('button').forEach(button => { button.disabled = true; });
        try { await action(); appToast(message); sheet.dialog.close(); }
        catch (error) { appToast(error.message, 'error'); }
        finally { appBusy = false; sheet.body.querySelectorAll('button').forEach(button => { button.disabled = false; }); }
    }
    const appActions = appMobileElement('div', 'app-mobile-action-list');
    const appMoves = appMobileElement('section', 'app-mobile-action-list'); appMoves.hidden = true;
    appMoves.setAttribute('aria-label', 'Move to');
    appMoves.append(appMobileElement('h3', '', 'Move to'));
    for (const [stage, label] of [['todo', 'To do'], ['in_progress', 'In progress'], ['review', 'Review']]) {
        const button = appButton(label, () => appMutate(() => appTaskState.move(id, stage), 'Moved to ' + label + '.'), true);
        button.disabled = task.status === 'pending' && (task.stage || 'todo') === stage; appMoves.append(button);
    }
    appMoves.append(appButton('Back', () => { appMoves.hidden = true; appActions.hidden = false; appActions.querySelector('button')?.focus(); }));
    const appConfirm = appMobileElement('section', 'app-drawer-confirm'); appConfirm.hidden = true;
    appConfirm.append(appMobileElement('h3', '', 'Delete this task?'), appMobileElement('p', '', 'This cannot be undone.'));
    appConfirm.append(appButton('Keep task', () => { appConfirm.hidden = true; appActions.hidden = false; appActions.querySelector('button')?.focus(); }), appButton('Yes, delete', () => appMutate(() => appTaskState.mutate(APP_API.tasks + '/' + id, 'DELETE'), 'Task deleted.'), true));
    appActions.append(
        appButton('View details', () => appAfterClose(() => appOpenTask(id, { trigger }))),
        appButton('Edit task', () => appAfterClose(() => appOpenTask(id, { trigger, edit: true }))),
        appButton('Move to…', () => { appActions.hidden = true; appMoves.hidden = false; appMoves.querySelector('button:not(:disabled)')?.focus(); }),
        appButton(task.status === 'completed' ? 'Reopen' : 'Mark complete', () => appMutate(() => appTaskState.move(id, task.status === 'completed' ? 'todo' : 'completed'), task.status === 'completed' ? 'Task reopened.' : 'Task completed.'), true),
        appButton('Delete task', () => { appActions.hidden = true; appConfirm.hidden = false; appConfirm.querySelector('button')?.focus(); }),
    );
    sheet.body.append(appActions, appMoves, appConfirm);
    sheet.dialog.addEventListener('cancel', event => { if (appBusy) event.preventDefault(); });
    sheet.dialog.addEventListener('close', () => { setTimeout(() => sheet.dialog.remove(), 0); if (!trigger?.isConnected) document.getElementById('task-search')?.focus({ preventScroll: true }); }, { once: true });
    document.body.append(sheet.dialog); sheet.open(trigger);
}
