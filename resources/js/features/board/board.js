import { appGet } from '../../core/dom.js';
import { appReadSettings } from '../../shell/preferences.js';
import { appTaskNode } from '../tasks/row.js';
export function appRenderBoard(board, filtered, filters, appEmpty, appOpenCreate) {
    const columns = { todo: [], inprogress: [], review: [], completed: [] };
    const showCompleted = appReadSettings().showCompleted || filters.status === 'completed';
    board.dataset.appShowCompleted = String(showCompleted);
    for (const task of filtered) columns[task.status === 'completed' ? 'completed' : task.stage === 'in_progress' ? 'inprogress' : task.stage === 'review' ? 'review' : 'todo'].push(task);
    for (const [key, items] of Object.entries(columns)) {
        const container = appGet('cards-kanban-' + key); if (!container) continue;
        const column = container.closest('.app-board-column');
        if (column) column.hidden = key === 'completed' && !showCompleted;
        container.replaceChildren(...items.map(task => appTaskNode(task, true)));
        if (!items.length) container.append(appEmpty('A little breathing room', 'Tasks in this stage will appear here.', 'Add task', () => appOpenCreate(key === 'inprogress' ? 'in_progress' : key)));
        if (appGet('count-kanban-' + key)) appGet('count-kanban-' + key).textContent = items.length;
    }
}
