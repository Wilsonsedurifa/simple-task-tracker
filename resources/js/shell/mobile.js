// mobile: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_MOBILE_QUERY } from '../core/constants.js';
import { appOpenCreate } from '../features/task-dialog/dialog.js';
import { appMobileElement, appMobilePickerSheet } from '../features/mobile/components.js';
import { appOpenMobileTaskActions } from '../features/mobile/task-actions.js';

export function appInitMobile() {
    if (!document.body.classList.contains('app-workspace')) return;
    const media = matchMedia(APP_MOBILE_QUERY), header = document.querySelector('[data-app-mobile-header]');
    const slot = header?.querySelector('[data-app-mobile-controls]'), search = document.querySelector('.app-global-search'), view = document.querySelector('.app-view-switcher');
    const controls = [search, view].filter(Boolean).map(node => { const marker = document.createComment('mobile control home'); node.before(marker); return { node, marker }; });
    const main = document.getElementById('main'), originalLabel = main?.getAttribute('aria-labelledby');
    function appMobileViewport() {
        const viewport = window.visualViewport, root = document.documentElement;
        root.style.setProperty('--app-mobile-viewport-height', (viewport?.height || innerHeight) + 'px');
        root.style.setProperty('--app-mobile-viewport-top', (viewport?.offsetTop || 0) + 'px');
    }
    function appMobileResize() {
        document.documentElement.dataset.appMobile = String(media.matches);
        for (const { node, marker } of controls) if (media.matches && slot) slot.append(node); else marker.after(node);
        if (main) { if (media.matches) main.setAttribute('aria-labelledby', 'app-mobile-title'); else if (originalLabel) main.setAttribute('aria-labelledby', originalLabel); else main.removeAttribute('aria-labelledby'); }
        if (!media.matches) document.querySelectorAll('[data-app-mobile-sheet][open]').forEach(dialog => dialog.close());
        appMobileViewport();
    }
    function appMobileGreeting() {
        const greeting = document.getElementById('app-mobile-greeting'), hour = new Date().getHours();
        if (greeting) greeting.textContent = (hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 18 ? 'Good afternoon' : 'Good evening') + ',';
    }
    appMobileGreeting(); setInterval(() => { if (!document.hidden) appMobileGreeting(); }, 60000);
    media.addEventListener('change', appMobileResize); window.visualViewport?.addEventListener('resize', appMobileViewport); window.visualViewport?.addEventListener('scroll', appMobileViewport); appMobileResize();
    document.getElementById('app-mobile-add')?.addEventListener('click', () => appOpenCreate());

    // Adapt existing selects; their original IDs, change handlers and state stay
    // authoritative. Picker radios never fetch a second task array.
    for (const select of document.querySelectorAll('#priority-filter,#due-filter,#sort-filter')) {
        const button = appMobileElement('button', 'app-mobile-picker-trigger'); button.type = 'button'; button.id = select.id + '-mobile-trigger'; button.setAttribute('aria-haspopup', 'dialog');
        const label = select.id === 'priority-filter' ? 'Priority' : select.id === 'due-filter' ? 'Due date' : 'Sort';
        const appSyncPicker = () => {
            const choice = select.id === 'sort-filter' && select.value === 'priority' ? 'Default' : select.selectedOptions[0]?.textContent || 'Any';
            button.textContent = choice; button.setAttribute('aria-label', label + ': ' + choice);
            button.disabled = select.disabled; button.dataset.appActive = String(Boolean(select.value && select.value !== 'priority'));
        };
        select.after(button); select.classList.add('app-mobile-native-filter'); appSyncPicker(); select.addEventListener('change', appSyncPicker);
        addEventListener('app:filters', appSyncPicker);
        new MutationObserver(appSyncPicker).observe(select, { attributes: true, attributeFilter: ['disabled'], subtree: false });
        button.addEventListener('click', () => { if (media.matches && !document.getElementById('app-mobile-picker')) appMobilePickerSheet(select, button); });
    }
    function appMobileOfferFilters() {
        const url = new URL(location.href);
        if (!media.matches || url.searchParams.get('filters') !== 'priority') return;
        const trigger = document.getElementById('priority-filter-mobile-trigger'); if (!trigger || document.querySelector('dialog[open]')) return;
        url.searchParams.delete('filters'); history.replaceState(history.state, '', url); trigger.click();
    }
    queueMicrotask(appMobileOfferFilters); media.addEventListener('change', appMobileOfferFilters);
    document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-app-mobile-task-menu]'); if (!media.matches || !trigger) return;
        event.preventDefault(); event.stopImmediatePropagation();
        appOpenMobileTaskActions(trigger.dataset.appMobileTaskMenu, trigger);
    }, true);

    let tracked = null, closing = false, pending = null, leaving = false, navigation = null, sheetUrl = null;
    addEventListener('beforeunload', () => { leaving = true; });
    addEventListener('pageshow', event => { leaving = false; if (event.persisted) { appMobileResize(); appSyncSheets(); } });
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (closing && link && !event.ctrlKey && !event.metaKey && !link.target && link.origin === location.origin) { event.preventDefault(); event.stopImmediatePropagation(); navigation = link.href; }
    }, true);
    const bound = new WeakSet();
    function appTrackSheet(dialog) {
        if (!media.matches || !dialog.open || dialog.id === 'app-task-dialog') return;
        sheetUrl = location.href;
        if (closing) { pending = dialog; return; }
        if (tracked === dialog) return;
        if (history.state?.appMobileSheet !== dialog.id) history.pushState({ ...history.state, appMobileSheet: dialog.id }, '', location.href);
        tracked = dialog;
    }
    function appSyncSheets() {
        const open = document.querySelector('dialog[open]'); document.documentElement.dataset.appMobileSheetOpen = String(Boolean(open));
        for (const dialog of document.querySelectorAll('dialog')) {
            if (!bound.has(dialog)) {
                bound.add(dialog);
                dialog.addEventListener('close', () => {
                    if (tracked === dialog) { sheetUrl = location.href; tracked = null; if (!leaving && history.state?.appMobileSheet === dialog.id) { closing = true; document.documentElement.dataset.appMobileHistoryBusy = 'true'; history.back(); } }
                    appSyncSheets();
                });
            }
            if (dialog.open) appTrackSheet(dialog);
        }
        const menu = document.getElementById('app-more'), trigger = document.getElementById('app-more-button'); trigger?.setAttribute('aria-expanded', String(Boolean(menu?.open)));
    }
    new MutationObserver(appSyncSheets).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    addEventListener('popstate', event => {
        const restoreUrl = closing || tracked?.open ? sheetUrl : null;
        if (tracked?.open && tracked.id !== event.state?.appMobileSheet) {
            const dialog = tracked; tracked = null;
            if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) dialog.close();
        }
        closing = false;
        document.documentElement.dataset.appMobileHistoryBusy = 'false';
        if (restoreUrl && new URL(restoreUrl).pathname === location.pathname) history.replaceState(event.state, '', restoreUrl);
        if (pending?.open) { const dialog = pending; pending = null; appTrackSheet(dialog); }
        appSyncSheets();
        if (navigation) { const href = navigation; navigation = null; location.assign(href); }
    });
    appSyncSheets();
}
