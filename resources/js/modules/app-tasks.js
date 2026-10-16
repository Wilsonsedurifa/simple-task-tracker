import { appTaskState } from './app-state';
import { appToast } from './app-api';
import { appOpenTask, appOpenDelete, appOpenCreate } from './app-dialog';
import { appLocalDate, appTaskGroup as appGroup } from './app-dates';
import { appTaskNode, appIcon } from './app-task-components';
import { appReadSettings, appSaveSettings, appReducedMotion } from './app-preferences';

const appGet = id => document.getElementById(id);
const appStageLabels = { todo: 'To do', in_progress: 'In progress', review: 'Review', completed: 'Completed' };
const appMoving = new Set();
function appElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}
export function appInitTasks() {
    const list = appGet('task-list'), board = appGet('task-board-container');
    if (!list || !board) return;
    const params = new URLSearchParams(location.search);
    const appPhone = matchMedia('(max-width: 767px)');
    const filters = {
        status: ['pending', 'in_progress', 'completed'].includes(params.get('status')) ? params.get('status') : '',
        priority: ['high', 'medium', 'low'].includes(params.get('priority')) ? params.get('priority') : '',
        q: params.get('q') || '',
        due: ['today', 'overdue', 'week', 'none'].includes(params.get('due')) ? params.get('due') : '',
        stage: Object.hasOwn(appStageLabels, params.get('stage')) && params.get('stage') !== 'completed' ? params.get('stage') : '',
    };
    let view = params.get('view'), sort = 'priority', appMenu = null, appDragId = null;
    view ||= appReadSettings().defaultView; sort = appReadSettings().defaultSort;
    if (['priority', 'deadline'].includes(params.get('sort'))) sort = params.get('sort');
    appTaskState.setSort(sort);
    const search = appGet('task-search'), priority = appGet('priority-filter'), sorter = appGet('sort-filter');
    const appDueFilter = appGet('due-filter'); if (appDueFilter) appDueFilter.value = filters.due;
    if (search) search.value = filters.q;
    if (priority) priority.value = filters.priority;
    if (sorter) sorter.value = sort;
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
    function appFiltered(tasks) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return tasks.filter(task => {
            const date = appLocalDate(task.due_date);
            const appStage = task.stage || 'todo';
            const appStatusMatch = !filters.status || (filters.status === 'in_progress' ? task.status === 'pending' && ['in_progress', 'review'].includes(appStage) : task.status === filters.status && !(appPhone.matches && filters.status === 'pending' && !filters.stage && appStage !== 'todo'));
            const appWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8);
            const appTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            return appStatusMatch
                && (!filters.stage || task.status === 'pending' && task.stage === filters.stage)
                && (!filters.priority || task.priority === filters.priority)
                && (!filters.q || (task.title + ' ' + (task.description || '')).toLowerCase().includes(filters.q.toLowerCase()))
                && (!filters.due || task.status === 'pending' && (filters.due === 'none' ? !date : filters.due === 'today' ? date?.getTime() === today.getTime() : filters.due === 'week' ? date && date > appTomorrow && date <= appWeekEnd : date && date < today));
        });
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
    function appCloseMenu(focus = false) {
        if (!appMenu) return;
        const { menu, trigger } = appMenu; menu.remove(); trigger.setAttribute('aria-expanded', 'false'); appMenu = null;
        if (focus && trigger.isConnected) trigger.focus();
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
    function appOpenMenu(trigger, id) {
        appCloseMenu();
        const menu = appElement('div', 'app-move-menu'); menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Move task to');
        for (const [stage, label] of Object.entries(appStageLabels)) {
            const item = appElement('button', '', label); item.type = 'button'; item.setAttribute('role', 'menuitem'); item.tabIndex = -1;
            item.addEventListener('click', event => { event.stopPropagation(); appMove(id, stage); }); menu.append(item);
        }
        menu.addEventListener('keydown', event => {
            const items = [...menu.querySelectorAll('button')], index = items.indexOf(document.activeElement);
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); appCloseMenu(true); }
            else if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) {
                if (event.key === 'Tab') { appCloseMenu(true); return; }
                event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[next]?.focus();
            }
        });
        const rect = trigger.getBoundingClientRect();
        menu.setAttribute('popover', 'manual');
        menu.style.setProperty('--app-menu-left', Math.max(8, Math.min(innerWidth - 190, rect.right - 180)) + 'px');
        menu.style.setProperty('--app-menu-top', Math.max(8, Math.min(innerHeight - 200, rect.bottom + 6)) + 'px');
        document.body.append(menu); menu.showPopover();
        trigger.setAttribute('aria-expanded', 'true'); appMenu = { menu, trigger }; menu.firstElementChild?.focus();
    }
    function appRender(tasks) {
        const active = document.activeElement, id = active?.closest('[data-task-id]')?.dataset.taskId, action = active?.dataset.action;
        const source = board.contains(active) ? board : list;
        const scrollY = window.scrollY, scrollX = board.scrollLeft, listScroll = list.scrollTop;
        appCloseMenu();
        const filtered = appFiltered(tasks), done = tasks.filter(task => task.status === 'completed').length;
        const progress = tasks.filter(task => task.status === 'pending' && task.stage === 'in_progress').length;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const overdue = tasks.filter(task => task.status === 'pending' && task.due_date && appLocalDate(task.due_date) < today).length;
        for (const [key, value] of Object.entries({ total: tasks.length, completed: done, pending: progress, overdue })) appNumber('stat-' + key, value);
        for (const [key, value] of Object.entries({ all: tasks.length, pending: appPhone.matches ? tasks.filter(task => task.status === 'pending' && (!task.stage || task.stage === 'todo')).length : tasks.length - done, 'in-progress': tasks.filter(task => task.status === 'pending' && ['in_progress', 'review'].includes(task.stage)).length, completed: done })) if (appGet('count-' + key)) appGet('count-' + key).textContent = value;
        const subtitle = document.querySelector('.app-page-title p'); if (subtitle) subtitle.textContent = (tasks.length - done) + ' open · ' + progress + ' in progress · ' + done + ' completed';
        document.querySelector('[data-app-stat="overdue"]')?.classList.toggle('app-has-overdue', overdue > 0);
        document.querySelectorAll('[data-app-stat]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appStat === 'completed' ? filters.status === 'completed' : button.dataset.appStat === 'pending' ? filters.stage === 'in_progress' : button.dataset.appStat === 'overdue' ? filters.due === 'overdue' : !Object.values(filters).some(Boolean))));
        document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filters.status)));
        list.replaceChildren();
        const counts = new Map();
        for (const task of filtered) counts.set(appGroup(task), (counts.get(appGroup(task)) || 0) + 1);
        let previous = null;
        for (const task of filtered) {
            const group = appGroup(task);
            if (sort === 'deadline' && group !== previous) {
                const heading = appElement('h3', 'app-list-group', group); heading.append(appElement('span', '', counts.get(group))); list.append(heading); previous = group;
            }
            list.append(appTaskNode(task, false));
        }
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
    document.addEventListener('click', event => { if (appMenu && !appMenu.menu.contains(event.target) && event.target !== appMenu.trigger && !appMenu.trigger.contains(event.target)) appCloseMenu(); });
    board.addEventListener('dragstart', event => {
        const card = event.target.closest('[data-task-id]');
        if (!card || matchMedia('(pointer: coarse)').matches || event.target.closest('button')) { event.preventDefault(); return; }
        appDragId = card.dataset.taskId; event.dataTransfer?.setData('text/plain', appDragId); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        card.classList.add('app-dragging');
    });
    board.addEventListener('dragover', event => {
        const column = event.target.closest('[data-column]'); if (!column || !appDragId) return;
        event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        board.querySelectorAll('.app-drop-target').forEach(node => node.classList.remove('app-drop-target')); column.classList.add('app-drop-target');
    });
    board.addEventListener('drop', event => {
        const column = event.target.closest('[data-column]'); if (!column || !appDragId) return;
        event.preventDefault(); const id = appDragId; appDragId = null;
        board.querySelectorAll('.app-drop-target,.app-dragging').forEach(node => node.classList.remove('app-drop-target', 'app-dragging'));
        appMove(id, column.dataset.column === 'inprogress' ? 'in_progress' : column.dataset.column);
    });
    board.addEventListener('dragend', () => { appDragId = null; board.querySelectorAll('.app-drop-target,.app-dragging').forEach(node => node.classList.remove('app-drop-target', 'app-dragging')); });
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
