// dashboard/side row: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appElement as appNode } from '../../core/dom.js';
import { appLocalDate } from '../../core/dates.js';
import { appRelativeTime } from './data.js';
import { appTaskNode, appIcon } from '../tasks/row.js';

export function appSideRow(task, done = false) {
    const row = appTaskNode(task, false); row.classList.add('app-side-row');
    row.querySelector('.app-task-actions')?.remove();
    const date = appLocalDate(done ? task.completed_at : task.due_date || task.created_at);
    const tile = appNode('span', 'app-dashboard-date-tile');
    tile.setAttribute('aria-hidden', 'true');
    if (date) tile.append(appNode('small', '', date.toLocaleDateString(undefined, { month: 'short' })), appNode('strong', '', date.getDate()));
    else tile.append(appIcon('check'));
    row.prepend(tile);
    if (done) {
        const relative = row.querySelector('.app-task-due');
        if (relative) { relative.textContent = appRelativeTime(task.completed_at); if (task.completed_at) relative.setAttribute('title', new Date(task.completed_at).toLocaleString()); }
    }
    return row;
}
