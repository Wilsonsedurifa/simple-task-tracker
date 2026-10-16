import { appTaskState } from '../core/state.js';
import { appDueLabel, appLocalDate } from '../core/dates.js';

import { appElement, appIcon } from '../core/dom.js';
export { appIcon } from '../core/dom.js';

function appAction(task, action) {
    const complete = task.status === 'completed';
    const button = appElement('button', 'app-task-action app-action-' + action);
    button.type = 'button'; button.dataset.action = action;
    button.setAttribute('aria-label', (action === 'toggle-check' ? complete ? 'Reopen' : 'Complete' : action === 'move' ? 'Move to…' : action === 'edit' ? 'Edit' : 'Delete') + ' ' + task.title);
    button.title = button.getAttribute('aria-label');
    button.disabled = appTaskState.isMoving(task.id);
    button.append(appIcon(action === 'toggle-check' ? complete ? 'reopen' : 'check' : action));
    return button;
}
function appPriority(task) {
    const badge = appElement('span', 'app-task-priority badge badge-' + task.priority);
    const dot = appElement('span', 'app-priority-dot'); dot.setAttribute('aria-hidden', 'true');
    badge.append(dot, document.createTextNode(task.priority[0].toUpperCase() + task.priority.slice(1)));
    return badge;
}
function appDue(task) {
    const date = appLocalDate(task.due_date), today = new Date(); today.setHours(0, 0, 0, 0);
    return appElement('span', 'app-task-due' + (date && date < today && task.status === 'pending' ? ' app-is-overdue' : ''), appDueLabel(task.due_date));
}
export function appTaskNode(task, board) {
    const complete = task.status === 'completed';
    const node = appElement(board ? 'article' : 'div', board ? 'app-board-card kanban-card' : 'app-task-row task-row');
    node.classList.toggle('app-is-completed', complete);
    node.dataset.taskId = task.id; node.tabIndex = 0; node.setAttribute('aria-label', 'Open ' + task.title);
    if (board) node.draggable = !matchMedia('(pointer: coarse)').matches && !appTaskState.isMoving(task.id);
    const text = appElement('div', 'app-task-copy');
    text.append(appElement(board ? 'h4' : 'span', 'app-task-title task-title-text', task.title));
    if (task.description) text.append(appElement('p', 'app-task-preview', task.description));
    const metadata = appElement('div', 'app-task-metadata'); metadata.append(appDue(task), appPriority(task));
    const actions = appElement('div', 'app-task-actions');
    actions.append(appAction(task, 'edit'), appAction(task, 'delete'));
    if (!board) {
        const more = appElement('button', 'app-mobile-task-more'); more.type = 'button'; more.dataset.appMobileTaskMenu = String(task.id); more.textContent = '…'; more.setAttribute('aria-label', 'Actions for ' + task.title); more.setAttribute('aria-haspopup', 'dialog'); actions.append(more);
        const dateIcon = appIcon('calendar'); dateIcon.classList.add('app-mobile-date-icon'); metadata.querySelector('.app-task-due')?.prepend(dateIcon);
    }
    if (board) {
        const move = appAction(task, 'move'); move.setAttribute('aria-haspopup', 'menu'); move.setAttribute('aria-expanded', 'false');
        actions.append(move);
    }
    node.append(appAction(task, 'toggle-check'), text, metadata, actions);
    return node;
}
