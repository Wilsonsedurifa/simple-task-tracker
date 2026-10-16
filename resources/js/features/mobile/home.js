import { APP_MOBILE_QUERY } from '../../core/constants.js';
import { appTaskState } from '../../core/state.js';
import { appLocalDate } from '../../core/dates.js';
import { appOpenCreate } from '../task-dialog/dialog.js';
import { appMobileStatCard, appMobileTaskRow } from './components.js';

// Filter only: membership and ordering always come from the shared server array.
export function appMobileHomeData(tasks, now = new Date()) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const open = tasks.filter(task => task.status === 'pending');
    return {
        total: tasks.length, completed: tasks.length - open.length,
        progress: open.filter(task => task.stage === 'in_progress').length,
        today: open.filter(task => appLocalDate(task.due_date)?.getTime() === today.getTime()),
        overdue: open.filter(task => { const date = appLocalDate(task.due_date); return date && date < today; }),
    };
}

export function appInitMobileHome() {
    const root = document.getElementById('app-mobile-home'); if (!root) return;
    const appFind = id => document.getElementById(id);
    const media = matchMedia(APP_MOBILE_QUERY);
    const pet = document.querySelector('[data-app-pet-widget]'), error = appFind('db-summary-error');
    const homes = [[pet, appFind('app-mobile-home-pet')], [error, appFind('app-mobile-home-error')]].filter(([node, slot]) => node && slot).map(([node, slot]) => {
        const marker = document.createComment('mobile home restore'); node.before(marker); return { node, slot, marker };
    });
    const stats = appFind('app-mobile-home-stats');
    const cards = [
        ['total', 'Total', 'accent', 'calendar', '/tasks'],
        ['completed', 'Completed', 'success', 'check', '/tasks?status=completed'],
        ['progress', 'In progress', 'warning', 'clock', '/tasks?status=pending&stage=in_progress'],
        ['overdue', 'Overdue', 'danger', 'alert', '/tasks?status=pending&due=overdue'],
    ].map(([key, label, tone, icon, href]) => {
        const card = appMobileStatCard({ label, value: '—', tone, icon, href }); card.dataset.appHomeStat = key; stats?.append(card); return { key, tone, card };
    });
    let appFailed = false;
    function appRenderHome() {
        if (!media.matches) return;
        const loaded = appTaskState.loaded, data = appMobileHomeData(appTaskState.tasks);
        root.setAttribute('aria-busy', String(!loaded && !appFailed));
        const loading = appFind('app-mobile-home-loading'); if (loading) loading.hidden = loaded || appFailed;
        for (const { key, tone, card } of cards) {
            const count = key === 'overdue' ? data.overdue.length : data[key];
            const value = card.querySelector('strong'); if (value) value.textContent = loaded ? String(count) : '—';
            card.dataset.appTone = key === 'overdue' && !count ? 'accent' : tone;
        }
        const active = document.activeElement, focusRow = active?.closest('#app-mobile-home [data-task-id]');
        for (const [id, tasks] of [['app-mobile-today-list', data.today], ['app-mobile-overdue-list', data.overdue]]) {
            const list = appFind(id); if (list) list.replaceChildren(...(loaded ? tasks.map(appMobileTaskRow) : []));
        }
        const overdue = appFind('app-mobile-home-overdue'); if (overdue) overdue.hidden = !loaded || !data.overdue.length;
        const count = appFind('app-mobile-overdue-count'); if (count) count.textContent = String(data.overdue.length);
        const empty = appFind('app-mobile-home-empty'); if (empty) empty.hidden = !loaded || data.today.length > 0;
        const title = appFind('app-mobile-empty-title'), copy = appFind('app-mobile-empty-copy');
        if (title) title.textContent = loaded && !data.total ? 'Your first small step starts here' : 'Walang due ngayon';
        if (copy) copy.textContent = loaded && !data.total ? 'Add your first task. Isa-isa lang, kaya natin!' : 'A little breathing room for your day.';
        if (focusRow && !active.isConnected) {
            const replacement = [...root.querySelectorAll('[data-task-id]')].find(node => node.dataset.taskId === focusRow.dataset.taskId);
            (replacement?.querySelector('[data-action="toggle-check"]') || root.querySelector('.app-mobile-section-header a'))?.focus({ preventScroll: true });
        }
    }
    function appResizeHome() {
        for (const { node, slot, marker } of homes) if (media.matches) slot.append(node); else marker.after(node);
        if (!media.matches) for (const id of ['app-mobile-today-list', 'app-mobile-overdue-list']) appFind(id)?.replaceChildren();
        appRenderHome();
    }
    root.addEventListener('click', event => {
        const action = event.target.closest('[data-app-home-action]')?.dataset.appHomeAction;
        if (action === 'add') appOpenCreate();
        if (action === 'more') document.getElementById('app-more-button')?.click();
    });
    appTaskState.subscribe(() => { appFailed = false; appRenderHome(); });
    appTaskState.onError(() => { appFailed = true; appRenderHome(); });
    media.addEventListener('change', appResizeHome);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) appRenderHome(); });
    setInterval(() => { if (!document.hidden) appRenderHome(); }, 60000);
    appResizeHome();
}
