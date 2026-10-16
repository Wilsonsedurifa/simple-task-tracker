// nav: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appOpenAppearance, appCloseOnBackdrop } from './appearance.js';

let appLogoutTrigger = null;
function appOpenLogout(trigger) {
    const modal = document.getElementById('logout-modal');
    if (!modal || modal.open) return;
    appLogoutTrigger = trigger; modal.showModal();
    document.getElementById('cancel-logout')?.focus();
}
export function appSetUnreadCount(value) {
    const count = Math.max(0, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0);
    document.body.dataset.appUnreadCount = String(count);
    document.getElementById('app-more-button')?.setAttribute('aria-label', count ? 'More navigation, ' + count + ' unread notifications' : 'More navigation');
    document.querySelectorAll('[data-app-unread]').forEach(dot => { dot.hidden = count === 0; dot.textContent = count > 9 ? '9+' : count ? String(count) : ''; });
    document.querySelectorAll('[data-app-notifications]').forEach(link => {
        link.setAttribute('aria-label', count ? 'Notifications, ' + count + ' unread' : 'Notifications, no unread messages');
    });
}
export function appInitShell() {
    document.querySelectorAll('[data-app-open-logout]').forEach(button => button.addEventListener('click', () => appOpenLogout(button)));
    const more = document.getElementById('app-more'), moreButton = document.getElementById('app-more-button');
    moreButton?.addEventListener('click', () => { if (more && !more.open) more.showModal(); });
    more?.querySelector('[data-app-close-more]')?.addEventListener('click', () => more.close());
    more?.addEventListener('close', () => {
        const target = innerWidth < 768 ? moreButton : document.getElementById('theme-toggle');
        target?.focus();
    });
    appCloseOnBackdrop(more);
    document.querySelectorAll('[data-app-appearance]').forEach(button => {
        button.addEventListener('click', () => {
            if (more?.open) {
                more.close();
                requestAnimationFrame(() => appOpenAppearance(moreButton));
            } else appOpenAppearance(button);
        });
    });
    const logout = document.getElementById('logout-modal'), form = document.getElementById('logout-form');
    form?.addEventListener('submit', event => { event.preventDefault(); appOpenLogout(form.querySelector('button')); });
    document.getElementById('app-mobile-logout')?.addEventListener('click', () => {
        more?.close(); requestAnimationFrame(() => appOpenLogout(moreButton));
    });
    document.getElementById('cancel-logout')?.addEventListener('click', () => logout?.close());
    logout?.addEventListener('close', () => {
        const target = appLogoutTrigger?.isConnected && appLogoutTrigger.getClientRects().length ? appLogoutTrigger : innerWidth < 768 ? moreButton : form?.querySelector('button');
        target?.focus();
    });
    appCloseOnBackdrop(logout);
    appSetUnreadCount(document.body.dataset.appUnreadCount || 0);
    document.addEventListener('app:notifications', event => appSetUnreadCount(event.detail?.unread || 0));
    matchMedia('(min-width: 768px)').addEventListener('change', event => {
        if (event.matches && more?.open) more.close();
    });
}
