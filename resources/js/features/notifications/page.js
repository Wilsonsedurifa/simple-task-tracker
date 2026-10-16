// notifications/page: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_STORAGE } from '../../core/constants.js';
import { APP_MOBILE_QUERY } from '../../core/constants.js';
import { appGet, appElement as appNode } from '../../core/dom.js';
import { appTaskState } from '../../core/state.js';
import { appSetUnreadCount } from '../../shell/nav.js';
import { appOpenTask } from '../task-dialog/dialog.js';
import { appIcon } from '../tasks/row.js';
import { appDateInput } from '../../core/dates.js';
import { appToast } from '../../core/toast.js';
import { appDeriveNotifications, appLatestNotifications, appNotificationTypes, appNotificationGroup, appNotificationRelative } from './derive.js';
import { appNotificationReadKey, appReadNotificationState, appSaveNotificationState } from './read-state.js';
import { appReadWelcome, appMobileNotificationTime } from './welcome.js';


export function appInitNotifications() {
    const bell = appGet('app-notification-bell'), dropdown = appGet('app-notification-dropdown'), preview = appGet('app-notification-preview'), feed = appGet('app-notification-feed');
    if (!bell || !dropdown || !preview) return;
    const userId = document.body.dataset.appUserId || '', storageKey = appNotificationReadKey(userId);
    let saved = appReadNotificationState(userId), items = [], filter = 'all', error = null;
    const appPhone = matchMedia(APP_MOBILE_QUERY), appWelcomeKey = APP_STORAGE.welcome + userId;
    function appBuildItems(tasks) {
        items = appDeriveNotifications(tasks);
        const welcome = appPhone.matches ? appReadWelcome(userId, document.body.dataset.page === 'notifications') : null;
        if (welcome && !saved.ids.has(welcome.id)) items.push(welcome);
    }
    function appCloseDropdown(restore = false) {
        if (dropdown.matches(':popover-open')) dropdown.hidePopover();
        bell.setAttribute('aria-expanded', 'false');
        if (restore && !document.querySelector('dialog[open]')) bell.focus({ preventScroll: true });
    }
    function appPositionDropdown() {
        const rect = bell.getBoundingClientRect(), width = Math.min(440, innerWidth - 32), top = Math.max(8, rect.bottom + 8);
        dropdown.style.setProperty('--app-notification-left', Math.max(16, Math.min(innerWidth - width - 16, rect.right - width)) + 'px');
        dropdown.style.setProperty('--app-notification-top', top + 'px');
        dropdown.style.setProperty('--app-notification-height', Math.max(100, innerHeight - top - 16) + 'px');
    }
    function appSelectFilter(value, focus = false) {
        filter = value === 'unread' ? 'unread' : 'all';
        document.querySelectorAll('[data-app-notification-filter]').forEach(button => {
            const active = button.dataset.appNotificationFilter === filter;
            button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
        });
        feed?.setAttribute('aria-labelledby', 'app-notification-tab-' + filter);
        appRender();
        if (focus) appGet('app-notification-tab-' + filter)?.focus();
    }
    function appEmpty(unread = false) {
        const box = appNode('div', 'app-designed-empty app-notification-empty');
        box.append(appIcon('check'), appNode('h3', '', 'Wala kang bagong notifications.'), appNode('p', '', unread && items.length ? 'You’re all caught up. Read reminders are still available under All.' : 'Due dates and recent completions will appear here when they apply.'));
        if (unread && items.length) {
            const all = appNode('button', 'button button-secondary', 'Show all'); all.type = 'button'; all.addEventListener('click', () => appSelectFilter('all', true)); box.append(all);
        }
        return box;
    }
    function appItem(item, compact = false) {
        const unread = !saved.ids.has(item.id), definition = appNotificationTypes[item.type];
        const button = appNode('button', 'app-notification-row' + (unread ? ' app-notification-is-unread' : '') + (compact ? ' app-notification-compact' : ''));
        button.type = 'button'; button.dataset.appNotificationId = item.id; if (item.taskId !== null) button.dataset.taskId = item.taskId;
        button.setAttribute('aria-label', (unread ? 'Unread: ' : 'Read: ') + item.message + '. ' + appNotificationRelative(item) + (item.type === 'welcome' ? '. Dismiss welcome' : '. Open task details'));
        const icon = appNode('span', 'app-notification-icon app-notification-type-' + item.type); icon.setAttribute('aria-hidden', 'true'); icon.append(appIcon(definition.icon));
        if (item.type === 'welcome') icon.querySelector('path')?.setAttribute('d','m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z');
        const copy = appNode('span', 'app-notification-copy'), metadata = appNode('span', 'app-notification-meta');
        const time = appNode('time', '', appNotificationRelative(item)); time.setAttribute('datetime', appDateInput(item.timestamp)); time.setAttribute('title', new Date(item.timestamp).toLocaleString());
        metadata.append(time, appNode('span', 'app-notification-read-label', unread ? 'Unread' : 'Read'));
        metadata.append(appNode('span', 'app-mobile-notification-time', appMobileNotificationTime(item.timestamp)));
        copy.append(appNode('span', 'app-notification-type-label', definition.label), appNode('span', 'app-notification-message', item.message), metadata);
        const dot = appNode('span', 'app-notification-unread-dot'); dot.hidden = !unread; dot.setAttribute('aria-hidden', 'true');
        button.append(icon, copy, dot); return button;
    }
    function appErrorBox(container) {
        if (!container) return;
        container.hidden = !error;
        if (error && container.dataset.appError === error.message && container.childElementCount) return;
        container.replaceChildren(); container.dataset.appError = error?.message || '';
        if (!error) return;
        container.append(appNode('p', '', error.message));
        const retry = appNode('button', 'button button-secondary', 'Try again'); retry.type = 'button';
        retry.addEventListener('click', async () => {
            // Disabling the focused retry must not dismiss its open popover.
            if (dropdown.contains(container)) appGet('app-notification-view-all')?.focus({ preventScroll: true });
            retry.disabled = true;
            try { await appTaskState.load({ force: true }); } catch {}
            finally {
                if (retry.isConnected) retry.disabled = false;
                if (dropdown.contains(container) && dropdown.matches(':popover-open')) {
                    (error ? container.querySelector('button') : preview.querySelector('[data-app-notification-id]') || appGet('app-notification-view-all'))?.focus({ preventScroll: true });
                } else if (container === appGet('app-notification-error') && !retry.isConnected) (feed?.querySelector('[data-app-notification-id]') || feed)?.focus({ preventScroll: true });
            }
        }); container.append(retry);
    }
    function appRender() {
        const active = document.activeElement, id = active?.closest('[data-app-notification-id]')?.dataset.appNotificationId;
        const source = preview.contains(active) ? preview : feed?.contains(active) ? feed : null;
        const previewScroll = preview.scrollTop, pageScroll = window.scrollY;
        const unread = items.filter(item => !saved.ids.has(item.id)).length;
        appSetUnreadCount(unread);
        document.querySelectorAll('[data-app-notification-total]').forEach(node => { node.textContent = String(items.length); });
        document.querySelectorAll('[data-app-notification-unread]').forEach(node => { node.textContent = String(unread); });
        document.querySelectorAll('[data-app-mark-all]').forEach(button => { button.disabled = !appTaskState.loaded || !unread; });
        document.querySelectorAll('[data-app-notification-storage]').forEach(node => { node.hidden = saved.available; });
        const summary = appGet('app-notification-summary');
        const summaryText = error ? 'Task reminders could not be refreshed.' : unread + (unread === 1 ? ' unread notification' : ' unread notifications') + ' · ' + items.length + ' total';
        if (summary && summary.textContent !== summaryText) summary.textContent = summaryText;
        const previewSummary = appGet('app-notification-preview-summary');
        if (previewSummary) previewSummary.textContent = unread + ' unread · latest ' + Math.min(items.length, 5) + ' shown';
        if (appTaskState.loaded) {
            const latest = appLatestNotifications(items);
            preview.replaceChildren(...latest.map(item => appItem(item, true)));
            if (!latest.length) preview.append(appEmpty());
            if (feed) {
                const visible = items.filter(item => filter === 'all' || !saved.ids.has(item.id));
                feed.replaceChildren();
                for (const label of ['Today', 'Yesterday', 'Earlier']) {
                    const group = visible.filter(item => appNotificationGroup(item) === label); if (!group.length) continue;
                    const section = appNode('section', 'app-notification-group'), heading = appNode('h2', 'app-notification-group-title', label);
                    const headingId = 'app-notification-group-' + label.toLowerCase(); heading.id = headingId; section.setAttribute('aria-labelledby', headingId);
                    heading.append(appNode('span', 'app-column-count', group.length)); section.append(heading, ...group.map(item => appItem(item))); feed.append(section);
                }
                if (!visible.length) feed.append(appEmpty(filter === 'unread'));
            }
        } else if (error) {
            preview.replaceChildren(); feed?.replaceChildren();
        }
        preview.setAttribute('aria-busy', String(!appTaskState.loaded && !error)); feed?.setAttribute('aria-busy', String(!appTaskState.loaded && !error));
        appErrorBox(appGet('app-notification-error')); appErrorBox(appGet('app-notification-preview-error'));
        preview.scrollTop = previewScroll;
        if (id && source && !document.querySelector('dialog[open]')) {
            const replacement = source.querySelector('[data-app-notification-id="' + CSS.escape(id) + '"]');
            (replacement || (source === preview ? appGet('app-notification-view-all') : appGet('app-notification-tab-' + filter)))?.focus({ preventScroll: true });
        }
        if (feed) window.scrollTo({ top: pageScroll, behavior: 'instant' });
    }
    function appMarkRead(ids) {
        saved = appSaveNotificationState(userId, saved.ids, ids); items = items.filter(item => item.type !== 'welcome' || !saved.ids.has(item.id)); appRender();
    }
    function appOpenItem(button) {
        const id = button.dataset.appNotificationId, item = items.find(item => item.id === id); if (!item) return;
        const fromDropdown = dropdown.contains(button);
        appMarkRead([id]); appCloseDropdown();
        if (item.type === 'welcome') { appToast('Welcome! Your next small step starts here.'); appGet('app-notification-tab-' + filter)?.focus(); return; }
        const replacement = feed?.querySelector('[data-app-notification-id="' + CSS.escape(id) + '"]');
        const trigger = fromDropdown ? bell : replacement || appGet('app-notification-tab-' + filter) || bell;
        appOpenTask(item.taskId, { trigger });
    }
    for (const container of [feed, preview]) container?.addEventListener('click', event => { const button = event.target.closest('[data-app-notification-id]'); if (button) appOpenItem(button); });
    document.querySelectorAll('[data-app-mark-all]').forEach(button => button.addEventListener('click', () => {
        const fromDropdown = dropdown.contains(button);
        appMarkRead(items.map(item => item.id)); appToast(saved.available ? 'All notifications marked as read.' : 'Marked as read for this tab.');
        (fromDropdown ? preview.querySelector('[data-app-notification-id]') || appGet('app-notification-view-all') : appGet('app-notification-tab-' + filter))?.focus({ preventScroll: true });
    }));
    document.querySelectorAll('[data-app-notification-filter]').forEach(button => {
        button.addEventListener('click', () => appSelectFilter(button.dataset.appNotificationFilter));
        button.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault(); appSelectFilter(event.key === 'Home' ? 'all' : event.key === 'End' ? 'unread' : filter === 'all' ? 'unread' : 'all', true);
        });
    });
    bell.addEventListener('click', () => {
        if (dropdown.matches(':popover-open')) { appCloseDropdown(true); return; }
        appPositionDropdown(); dropdown.showPopover(); bell.setAttribute('aria-expanded', 'true');
        (preview.querySelector('[data-app-notification-id]') || appGet('app-notification-view-all'))?.focus();
    });
    appGet('app-notification-close')?.addEventListener('click', () => appCloseDropdown(true));
    dropdown.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); appCloseDropdown(true); }
        else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            const choices = [...preview.querySelectorAll('[data-app-notification-id]')]; if (!choices.length) return;
            event.preventDefault(); const index = choices.indexOf(document.activeElement);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length;
            choices[next]?.focus();
        }
    });
    dropdown.addEventListener('toggle', event => {
        const open = event.newState === 'open'; bell.setAttribute('aria-expanded', String(open));
        if (!open && !document.querySelector('dialog[open]') && (document.activeElement === document.body || dropdown.contains(document.activeElement))) bell.focus({ preventScroll: true });
    });
    dropdown.addEventListener('focusout', () => setTimeout(() => {
        if (dropdown.matches(':popover-open') && !dropdown.contains(document.activeElement) && document.activeElement !== bell) appCloseDropdown();
    }, 0));
    window.addEventListener('resize', () => { if (dropdown.matches(':popover-open')) appPositionDropdown(); });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== appWelcomeKey && event.key !== null) return;
        saved = appReadNotificationState(userId); appBuildItems(appTaskState.tasks); appRender();
    });
    appTaskState.subscribe(tasks => { appBuildItems(tasks); error = null; appRender(); });
    appTaskState.onError(failure => { error = failure; appRender(); });
    const appRefresh = () => { if (document.hidden || !appTaskState.loaded) return; appBuildItems(appTaskState.tasks); appRender(); };
    appPhone.addEventListener('change', appRefresh);
    setInterval(appRefresh, 60000);
    document.addEventListener('visibilitychange', appRefresh);
    window.addEventListener('focus', appRefresh);
    document.querySelectorAll('[data-app-notification-storage]').forEach(node => { node.hidden = saved.available; });
}
