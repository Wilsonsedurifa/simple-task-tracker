// dashboard: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_STORAGE } from '../core/constants.js';
import { appInitQuickAdd } from '../features/dashboard/quick-add.js';
import { appReadStorage, appWriteStorage } from '../core/storage.js';
import { appGet, appText, appElement as appNode } from '../core/dom.js';
import { appTaskState } from '../core/state.js';
import { appToast } from '../core/toast.js';
import { appLocalDate, appDateInput, appTaskGroup } from '../core/dates.js';
import { appGreeting, appRecentCompleted } from '../features/dashboard/data.js';
import { appTaskNode, appIcon } from '../features/tasks/row.js';
import { appOpenTask, appOpenCreate, appOpenDelete } from '../features/task-dialog/dialog.js';

function appEmpty(title, copy, action = null, label = 'Add a task') {
    const empty = appNode('div', 'app-designed-empty app-dashboard-empty');
    empty.append(appIcon('check'), appNode('h3', '', title), appNode('p', '', copy));
    if (action) {
        const button = appNode('button', 'button button-secondary', label);
        button.type = 'button'; button.addEventListener('click', action); empty.append(button);
    }
    return empty;
}
import { appChart } from '../features/dashboard/chart.js';

import { appSideRow } from '../features/dashboard/side-row.js';

export function appInitDashboard() {
    const root = document.querySelector('.app-dashboard-grid');
    if (!root) return;
    let appTab = 'deadlines', appDay = '';
    { const saved = appReadStorage(APP_STORAGE.dashboardTab).value; if (['deadlines', 'active', 'done'].includes(saved)) appTab = saved; }
    function appHeader() {
        const now = new Date(), username = root.dataset.username || '';
        appText('db-greeting', appGreeting(now, username ? username.charAt(0).toUpperCase() + username.slice(1) : ''));
        appText('db-date', now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
        appGet('app-quick-due')?.setAttribute('min', appDateInput(now));
    }
    function appSelectTab(tab, focus = false) {
        appTab = tab;
        for (const name of ['deadlines', 'active', 'done']) {
            const button = appGet('app-tab-' + name), panel = appGet('app-panel-' + name);
            button?.setAttribute('aria-selected', String(name === tab));
            if (button) button.tabIndex = name === tab ? 0 : -1;
            if (panel) panel.hidden = name !== tab;
        }
        if (focus) appGet('app-tab-' + tab)?.focus();
        appWriteStorage(APP_STORAGE.dashboardTab, tab);
    }
    function appWeek(open, today, overdue) {
        const strip = appGet('app-week-strip'), actions = appGet('app-week-actions');
        if (!strip || !actions) return;
        strip.replaceChildren(); actions.replaceChildren();
        for (let index = 0; index < 7; index++) {
            const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index), key = appDateInput(date);
            const count = open.filter(task => appDateInput(task.due_date) === key).length;
            const button = appNode('button', 'app-week-day' + (index === 0 ? ' app-week-today' : ''));
            button.type = 'button'; button.dataset.appDay = key; button.setAttribute('aria-pressed', String(appDay === key));
            button.setAttribute('aria-label', date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) + ': ' + count + ' open tasks');
            const dot = appNode('span', 'app-week-count' + (count ? ' app-week-has-tasks' : ''), count || '·');
            dot.setAttribute('aria-hidden', 'true');
            button.append(appNode('small', '', date.toLocaleDateString(undefined, { weekday: 'short' })), appNode('strong', '', date.getDate()), dot);
            button.addEventListener('click', () => { appDay = appDay === key ? '' : key; appRender(appTaskState.tasks); });
            strip.append(button);
        }
        const all = appNode('button', 'app-clear-filters', 'All dates'); all.type = 'button'; all.dataset.appDay = '';
        all.setAttribute('aria-pressed', String(!appDay)); all.addEventListener('click', () => { appDay = ''; appRender(appTaskState.tasks); }); actions.append(all);
        const past = appNode('button', 'app-overdue-filter' + (overdue ? ' app-is-overdue' : ''), overdue + ' overdue'); past.type = 'button'; past.dataset.appDay = 'overdue';
        past.setAttribute('aria-pressed', String(appDay === 'overdue')); past.addEventListener('click', () => { appDay = appDay === 'overdue' ? '' : 'overdue'; appRender(appTaskState.tasks); }); actions.append(past);
    }
    function appRender(tasks) {
        const active = document.activeElement, taskId = active?.closest('[data-task-id]')?.dataset.taskId, action = active?.dataset.action, day = active?.dataset.appDay;
        const sourceId = active?.closest('#app-inprogress-cards,#app-deadline-list,#app-active-list,#app-done-list')?.id;
        const scrolls = ['app-deadline-list', 'app-active-list', 'app-done-list'].map(id => [id, appGet(id)?.scrollTop || 0]);
        const open = tasks.filter(task => task.status === 'pending'), done = tasks.filter(task => task.status === 'completed');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayCount = open.filter(task => appLocalDate(task.due_date)?.getTime() === today.getTime()).length;
        const overdue = open.filter(task => task.due_date && appLocalDate(task.due_date) < today).length;
        for (const [key, count] of Object.entries({ pending: open.length, today: todayCount, overdue, completed: done.length })) {
            appText('db-summary-' + key, count);
            const link = document.querySelector('[data-app-metric="' + key + '"]');
            link?.classList.toggle('app-metric-positive', count > 0);
            link?.setAttribute('aria-label', ({ pending: 'Open', today: 'Due today', overdue: 'Overdue', completed: 'Completed' }[key]) + ': ' + count + '. View tasks');
        }
        appText('db-summary-total', tasks.length); appText('app-dashboard-done', done.length);
        const percent = tasks.length ? Math.round(done.length / tasks.length * 100) : 0;
        appText('db-summary-percent', percent + '%');
        const progress = appGet('db-summary-progress');
        progress?.style.setProperty('--progress', percent + '%'); progress?.setAttribute('aria-valuenow', String(percent));
        progress?.setAttribute('aria-valuetext', done.length + ' of ' + tasks.length + ' completed');
        if (appGet('db-summary-label')) appGet('db-summary-label').hidden = !tasks.length;
        if (appGet('app-dashboard-first-run')) appGet('app-dashboard-first-run').hidden = Boolean(tasks.length);
        appChart(tasks);
        const inprogress = open.filter(task => task.stage === 'in_progress'), cards = appGet('app-inprogress-cards');
        appText('app-inprogress-count', inprogress.length);
        if (cards) {
            cards.replaceChildren(...inprogress.slice(0, 4).map(task => { const card = appTaskNode(task, true); card.draggable = false; card.querySelector('[data-action="move"]')?.remove(); return card; }));
            if (!inprogress.length) cards.append(appEmpty(tasks.length ? 'Ready when you are' : 'Welcome to your workspace', tasks.length ? 'Start a task from the board to give it your focus.' : 'Add your first task above. Your next small step belongs here.', tasks.length ? () => location.assign('/tasks?view=board') : () => appGet('app-quick-title')?.focus(), tasks.length ? 'View board' : 'Add your first task'));
            cards.setAttribute('aria-busy', 'false');
        }
        const deadlines = open.filter(task => task.due_date);
        appText('app-count-deadlines', deadlines.length); appText('app-count-active', open.length); appText('app-count-done', done.length);
        appWeek(open, today, overdue);
        const list = appGet('app-deadline-list');
        if (list) {
            list.replaceChildren();
            const filtered = deadlines.filter(task => !appDay || (appDay === 'overdue' ? appLocalDate(task.due_date) < today : appDateInput(task.due_date) === appDay));
            let previous = null;
            for (const task of filtered) {
                const group = appTaskGroup(task, today);
                if (group !== previous) { list.append(appNode('h3', 'app-side-group', group)); previous = group; }
                list.append(appSideRow(task));
            }
            if (!filtered.length) list.append(appEmpty(appDay ? 'A little space on this date' : 'No deadlines on the horizon', appDay ? 'Choose another day or show all dates.' : 'Add a due date when a task needs a little structure.', appDay ? () => { appDay = ''; appRender(appTaskState.tasks); } : () => appOpenCreate(), appDay ? 'Show all dates' : 'Add a task'));
        }
        const noDate = open.length - deadlines.length, noDateLink = appGet('app-no-deadline');
        if (noDateLink) { noDateLink.hidden = !noDate; noDateLink.textContent = '+' + noDate + ' without a deadline'; }
        for (const [id, items, title, copy] of [
            ['app-active-list', open.slice(0, 8), 'Everything is clear', 'No open tasks. Enjoy the breathing room.'],
            ['app-done-list', appRecentCompleted(tasks), 'Small wins start here', 'Your completed tasks will appear here.'],
        ]) {
            const container = appGet(id); if (!container) continue;
            container.replaceChildren(...items.map(task => appSideRow(task, id === 'app-done-list')));
            if (!items.length) container.append(appEmpty(title, copy, !tasks.length ? () => appGet('app-quick-title')?.focus() : null));
        }
        for (const [id, scroll] of scrolls) if (appGet(id)) appGet(id).scrollTop = scroll;
        if (day !== undefined) document.querySelector('[data-app-day="' + CSS.escape(day) + '"]')?.focus({ preventScroll: true });
        else if (taskId && sourceId && !document.querySelector('dialog[open]')) {
            const row = appGet(sourceId)?.querySelector('[data-task-id="' + CSS.escape(taskId) + '"]');
            const target = action ? row?.querySelector('[data-action="' + action + '"]') : row;
            (target || appGet('app-tab-' + appTab))?.focus({ preventScroll: true });
        }
        if (appGet('db-summary-error')) appGet('db-summary-error').hidden = true;
        root.setAttribute('aria-busy', 'false');
    }
    root.addEventListener('click', async event => {
        const row = event.target.closest('[data-task-id]'); if (!row) return;
        const button = event.target.closest('[data-action]'), id = row.dataset.taskId, action = button?.dataset.action;
        if (action === 'toggle-check') {
            const task = appTaskState.tasks.find(item => String(item.id) === id); if (!task || appTaskState.isMoving(id)) return;
            try { await appTaskState.move(id, task.status === 'completed' ? 'todo' : 'completed'); appToast(task.status === 'completed' ? 'Task reopened.' : 'Task completed.'); }
            catch (error) { appToast(error.message, 'error'); }
        } else if (action === 'edit') appOpenTask(id, { edit: true, trigger: button });
        else if (action === 'delete') appOpenDelete(id);
        else appOpenTask(id, { trigger: row });
    });
    root.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-task-id]')) { event.preventDefault(); appOpenTask(event.target.dataset.taskId, { trigger: event.target }); }
    });
    const tabs = [...root.querySelectorAll('[data-app-tab]')];
    for (const [index, button] of tabs.entries()) {
        button.addEventListener('click', () => appSelectTab(button.dataset.appTab));
        button.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            if (tabs[next]) appSelectTab(tabs[next].dataset.appTab, true);
        });
    }
    appInitQuickAdd();
    appHeader(); appChart([]); appSelectTab(appTab); root.setAttribute('aria-busy', 'true');
    for (const id of ['app-deadline-list', 'app-active-list', 'app-done-list']) {
        const container = appGet(id); if (!container) continue;
        for (let index = 0; index < 3; index++) { const skeleton = appNode('div', 'app-task-skeleton'); skeleton.setAttribute('aria-hidden', 'true'); container.append(skeleton); }
    }
    appTaskState.subscribe(appRender);
    appTaskState.onError(error => {
        const box = appGet('db-summary-error'); if (!box) return;
        box.hidden = false; box.replaceChildren(appNode('p', '', error.message));
        const retry = appNode('button', 'button button-secondary', 'Try again'); retry.type = 'button';
        retry.addEventListener('click', async () => { retry.disabled = true; try { await appTaskState.load({ force: true }); } catch {} finally { if (retry.isConnected) retry.disabled = false; } }); box.append(retry);
        root.querySelectorAll('.app-task-skeleton').forEach(node => node.remove()); root.setAttribute('aria-busy', 'false');
        appGet('app-inprogress-cards')?.setAttribute('aria-busy', 'false');
    });
    const appRefresh = () => { if (document.hidden) return; appHeader(); if (appTaskState.loaded) appRender(appTaskState.tasks); };
    setInterval(appRefresh, 60000);
    document.addEventListener('visibilitychange', appRefresh);
}
