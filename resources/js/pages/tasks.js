import { appInitMoveMenu } from '../features/board/move-menu.js';
import { appRenderList } from '../features/tasks/list.js';
import { appRenderBoard } from '../features/board/board.js';
import { appInitDnd } from '../features/board/dnd.js';
import { appFiltered } from '../features/tasks/filters.js';
import { APP_MOBILE_QUERY } from '../core/constants.js';
import { appGet, appElement as appElement } from '../core/dom.js';
import { appTaskState } from '../core/state.js';
import { appToast } from '../core/api.js';
import { appOpenTask, appOpenDelete, appOpenCreate } from '../features/task-dialog/dialog.js';
import { appLocalDate, appTaskGroup as appGroup } from '../core/dates.js';
import { appTaskNode, appIcon } from '../features/tasks/row.js';
import { appReadSettings, appSaveSettings, appReducedMotion } from '../shell/preferences.js';

const appStageLabels = { todo: 'To do', in_progress: 'In progress', review: 'Review', completed: 'Completed' };
const appMoving = new Set();
export function appInitTasks() {
    const list = appGet('task-list'), board = appGet('task-board-container');
    if (!list || !board) return;
    const params = new URLSearchParams(location.search);
    const appPhone = matchMedia(APP_MOBILE_QUERY);
    const filters = {
        status: ['pending', 'in_progress', 'completed'].includes(params.get('status')) ? params.get('status') : '',
        priority: ['high', 'medium', 'low'].includes(params.get('priority')) ? params.get('priority') : '',
        q: params.get('q') || '',
        due: ['today', 'overdue', 'week', 'none'].includes(params.get('due')) ? params.get('due') : '',
        stage: Object.hasOwn(appStageLabels, params.get('stage')) && params.get('stage') !== 'completed' ? params.get('stage') : '',
    };
    let view = params.get('view'), sort = 'priority';
    view ||= appReadSettings().defaultView; sort = appReadSettings().defaultSort;
    if (['priority', 'deadline'].includes(params.get('sort'))) sort = params.get('sort');
    appTaskState.setSort(sort);
    const search = appGet('task-search'), priority = appGet('priority-filter'), sorter = appGet('sort-filter');
    const appDueFilter = appGet('due-filter'); if (appDueFilter) appDueFilter.value = filters.due;
    if (search) search.value = filters.q;
    if (priority) priority.value = filters.priority;
    if (sorter) sorter.value = sort;
    const { appCloseMenu, appOpenMenu } = appInitMoveMenu(appMove, appStageLabels);
    function appUrl() {
        const url = new URL(location.href);
        for (const [key, value] of Object.entries({ ...filters, view, sort })) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
        history.replaceState(history.state, '', url);
    }
    function appClear() {
        for (const key of Object.keys(filters)) filters[key] = '';
        if (search) search.value = '';
        if (priority) priority.value = '';
        if (appDueFilter) appDueFilter.value = '';
        appUrl(); appRender(appTaskState.tasks);
    }
    function appEmpty(title, copy, label, action) {
        const empty = appElement('div', 'app-designed-empty');
        empty.append(appIcon('check'), appElement('h3', '', title), appElement('p', '', copy));
        const button = appElement('button', 'button button-secondary', label); button.type = 'button'; button.addEventListener('click', action);
        empty.append(button); return empty;
    }
    function appChips() {
        const container = appGet('app-filter-chips'); if (!container) return;
        container.replaceChildren();
        for (const [key, value] of Object.entries(filters)) {
            if (!value) continue;
            const label = key === 'stage' ? appStageLabels[value] : key === 'q' ? 'Search: ' + value : key + ': ' + value;
            const chip = appElement('button', 'app-filter-chip', label + ' ×'); chip.type = 'button';
            chip.setAttribute('aria-label', 'Remove ' + label + ' filter');
            chip.addEventListener('click', () => { filters[key] = ''; if (search) search.value = filters.q; if (priority) priority.value = filters.priority; if (appDueFilter) appDueFilter.value = filters.due; appUrl(); appRender(appTaskState.tasks); });
            container.append(chip);
        }
        container.hidden = !container.childElementCount;
        if (!container.hidden) {
            const clear = appElement('button', 'app-clear-filters', 'Clear all'); clear.type = 'button'; clear.addEventListener('click', appClear); container.append(clear);
        }
    }
    const appAnimations = new Map();
    function appNumber(id, number) {
        const node = appGet(id); if (!node || node.dataset.value === String(number)) return;
        cancelAnimationFrame(appAnimations.get(id));
        const start = Number(node.textContent) || 0, time = performance.now(); node.dataset.value = number;
        if (appReducedMotion()) { node.textContent = number; return; }
        const tick = now => { const progress = Math.min(1, (now - time) / 300); node.textContent = Math.round(start + (number - start) * progress); if (progress < 1) appAnimations.set(id, requestAnimationFrame(tick)); };
        appAnimations.set(id, requestAnimationFrame(tick));
    }
    function appSetView(mode, persist = true) {
        view = mode === 'list' ? 'list' : 'board';
        if (appGet('task-list-view')) appGet('task-list-view').hidden = !appPhone.matches && view !== 'list';
        board.hidden = appPhone.matches || view !== 'board';
        for (const type of ['board', 'list']) {
            const button = appGet('view-mode-' + type); button?.classList.toggle('is-active', view === type); button?.setAttribute('aria-pressed', String(view === type));
        }
        if (appGet('tasks-heading')) appGet('tasks-heading').textContent = view === 'board' ? 'Task board' : 'Task list';
        if (persist) appSaveSettings({ defaultView: view });
        appUrl();
        if (appTaskState.loaded) appRender(appTaskState.tasks);
    }
    async function appMove(id, destination) {
        appCloseMenu();
        if (appMoving.has(String(id))) return;
        const task = appTaskState.tasks.find(item => String(item.id) === String(id));
        if (!task || (task.status === 'completed' ? 'completed' : task.stage || 'todo') === destination) return;
        appMoving.add(String(id)); appCloseMenu();
        try {
            await appTaskState.move(id, destination);
            const announcement = appGet('app-task-announcement');
            if (announcement) announcement.textContent = "Moved ‘" + task.title + "’ to " + appStageLabels[destination];
            appToast('Moved to ' + appStageLabels[destination] + '.');
        } catch (error) { appToast(error.message, 'error'); }
        finally {
            appMoving.delete(String(id)); appRender(appTaskState.tasks);
            if (document.activeElement === document.body && view === 'board') board.querySelector('[data-task-id="' + CSS.escape(String(id)) + '"]')?.focus({ preventScroll: true });
        }
    }
    function appRender(tasks) {
        const active = document.activeElement, id = active?.closest('[data-task-id]')?.dataset.taskId, action = active?.dataset.action;
        const source = board.contains(active) ? board : list;
        const scrollY = window.scrollY, scrollX = board.scrollLeft, listScroll = list.scrollTop;
        appCloseMenu();
        const filtered = appFiltered(tasks, filters, appPhone), done = tasks.filter(task => task.status === 'completed').length;
        const progress = tasks.filter(task => task.status === 'pending' && task.stage === 'in_progress').length;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const overdue = tasks.filter(task => task.status === 'pending' && task.due_date && appLocalDate(task.due_date) < today).length;
        for (const [key, value] of Object.entries({ total: tasks.length, completed: done, pending: progress, overdue })) appNumber('stat-' + key, value);
        for (const [key, value] of Object.entries({ all: tasks.length, pending: appPhone.matches ? tasks.filter(task => task.status === 'pending' && (!task.stage || task.stage === 'todo')).length : tasks.length - done, 'in-progress': tasks.filter(task => task.status === 'pending' && ['in_progress', 'review'].includes(task.stage)).length, completed: done })) if (appGet('count-' + key)) appGet('count-' + key).textContent = value;
        const subtitle = document.querySelector('.app-page-title p'); if (subtitle) subtitle.textContent = (tasks.length - done) + ' open · ' + progress + ' in progress · ' + done + ' completed';
        document.querySelector('[data-app-stat="overdue"]')?.classList.toggle('app-has-overdue', overdue > 0);
        document.querySelectorAll('[data-app-stat]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appStat === 'completed' ? filters.status === 'completed' : button.dataset.appStat === 'pending' ? filters.stage === 'in_progress' : button.dataset.appStat === 'overdue' ? filters.due === 'overdue' : !Object.values(filters).some(Boolean))));
        document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filters.status)));
        appRenderList(list, filtered, sort);
        appRenderBoard(board, filtered, filters, appEmpty, appOpenCreate);
        const empty = appGet('app-task-empty');
        if (empty) {
            empty.hidden = filtered.length > 0;
            empty.replaceChildren(appEmpty(tasks.length ? 'No matching tasks' : appPhone.matches ? 'Wala pang tasks' : 'Your next step starts here', tasks.length ? 'Try another search or clear your filters.' : 'Create a task, then move it forward at your own pace.', tasks.length ? 'Clear filters' : 'New task', tasks.length ? appClear : () => appOpenCreate()));
        }
        if (appGet('task-list-view')) appGet('task-list-view').hidden = (!appPhone.matches && view !== 'list') || !filtered.length;
        board.hidden = appPhone.matches || view !== 'board' || !filtered.length;
        appChips(); if (appGet('list-error')) appGet('list-error').hidden = true;
        dispatchEvent(new Event('app:filters'));
        list.setAttribute('aria-busy', 'false'); board.setAttribute('aria-busy', 'false');
        board.scrollLeft = scrollX; list.scrollTop = listScroll;
        if (id && !document.querySelector('dialog[open]')) {
            const row = source.querySelector('[data-task-id="' + CSS.escape(id) + '"]');
            (action ? row?.querySelector('[data-action="' + action + '"]') : row)?.focus({ preventScroll: true });
        }
        window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
    for (const container of [list, board]) {
        container.addEventListener('click', event => {
            if (event.target.closest('.app-move-menu')) return;
            const row = event.target.closest('[data-task-id]'), button = event.target.closest('[data-action]'); if (!row) return;
            const id = row.dataset.taskId, action = button?.dataset.action;
            if (action === 'move') appOpenMenu(button, id);
            else if (action === 'toggle-check') {
                const task = appTaskState.tasks.find(item => String(item.id) === id); if (task) appMove(id, task.status === 'completed' ? 'todo' : 'completed');
            } else if (action === 'edit') appOpenTask(id, { edit: true, trigger: button });
            else if (action === 'delete') appOpenDelete(id);
            else appOpenTask(id, { trigger: row });
        });
        container.addEventListener('keydown', event => {
            if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-task-id]')) { event.preventDefault(); appOpenTask(event.target.dataset.taskId, { trigger: event.target }); }
        });
    }
    appInitDnd(board, appMove);
    document.querySelectorAll('[data-add-column]').forEach(button => button.addEventListener('click', () => appOpenCreate(button.dataset.addColumn === 'inprogress' ? 'in_progress' : button.dataset.addColumn)));
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filters.status = button.dataset.filter; filters.stage = ''; appUrl(); appRender(appTaskState.tasks); }));
    document.querySelectorAll('[data-app-stat]').forEach(button => button.addEventListener('click', () => {
        appClear();
        if (button.dataset.appStat === 'completed') filters.status = 'completed';
        if (button.dataset.appStat === 'pending') { filters.status = 'pending'; filters.stage = 'in_progress'; }
        if (button.dataset.appStat === 'overdue') filters.due = 'overdue';
        appUrl(); appRender(appTaskState.tasks);
    }));
    priority?.addEventListener('change', () => { filters.priority = priority.value; appUrl(); appRender(appTaskState.tasks); });
    appDueFilter?.addEventListener('change', () => { filters.due = appDueFilter.value; appUrl(); appRender(appTaskState.tasks); });
    appPhone.addEventListener('change', () => { if (appTaskState.loaded) appRender(appTaskState.tasks); });
    let timer;
    search?.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { filters.q = search.value.trim(); appUrl(); appRender(appTaskState.tasks); }, 180); });
    sorter?.addEventListener('change', async () => {
        const previous = sort;
        sort = sorter.value; sorter.disabled = true;
        try { await appTaskState.load({ force: true, sort }); appSaveSettings({ defaultSort: sort }); }
        catch (error) { sort = previous; sorter.value = previous; appTaskState.setSort(previous); appToast(error.message, 'error'); }
        finally { sorter.disabled = false; appUrl(); }
    });
    for (const type of ['board', 'list']) appGet('view-mode-' + type)?.addEventListener('click', () => appSetView(type));
    // Both views have skeletons before the single shared fetch resolves.
    for (const container of [list, ...board.querySelectorAll('.app-column-cards')]) {
        for (let index = 0; index < 3; index++) { const skeleton = appElement('div', 'app-task-skeleton'); skeleton.setAttribute('aria-hidden', 'true'); container.append(skeleton); }
    }
    appSetView(view, false); appTaskState.subscribe(appRender);
    addEventListener('app:settings', () => { if (appTaskState.loaded) appRender(appTaskState.tasks); });
    appTaskState.onError(error => {
        const box = appGet('list-error'); if (!box) return;
        box.hidden = false; box.replaceChildren(appElement('p', '', error.message));
        const retry = appElement('button', 'button button-secondary', 'Try again'); retry.type = 'button';
        retry.addEventListener('click', async () => {
            retry.disabled = true; retry.textContent = 'Trying again…';
            try { await appTaskState.load({ force: true }); } catch {}
            finally { if (retry.isConnected) { retry.disabled = false; retry.textContent = 'Try again'; } }
        }); box.append(retry);
        list.querySelectorAll('.app-task-skeleton').forEach(node => node.remove()); board.querySelectorAll('.app-task-skeleton').forEach(node => node.remove());
        list.setAttribute('aria-busy', 'false'); board.setAttribute('aria-busy', 'false');
    });
}
