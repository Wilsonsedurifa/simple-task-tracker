import { appTaskState } from './app-state';
import { appDueLabel, appLocalDate } from './app-dates';

function appElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}
export function appIcon(action) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
    path.setAttribute('d', { edit: 'm4 16 12-12 4 4-12 12H4v-4 M14 6l4 4', delete: 'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7', move: 'M4 7h16 M16 3l4 4-4 4 M20 17H4 M8 13l-4 4 4 4', check: 'm5 12 4 4L19 6', reopen: 'M4 4v6h6 M4 10a8 8 0 1 1 0 5', calendar: 'M8 2v5 M16 2v5 M3 10h18 M5 5h14v16H5z', clock: 'M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', alert: 'M12 8v5 M12 17h.01 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18' }[action] || 'M5 12h14');
    svg.append(path);
    return svg;
}
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
