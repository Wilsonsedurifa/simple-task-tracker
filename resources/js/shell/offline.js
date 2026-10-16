// offline: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appToast } from '../core/toast.js';

const appMutationControls = 'button[type="submit"], [data-action="toggle-check"], [data-action="delete"], #detail-complete-btn, #app-detail-start, #app-detail-review, #app-confirm-delete-completed, [data-app-mutation]';
export function appInitOffline() {
    const banner = document.getElementById('app-offline-banner'), previous = new Map();
    function appMark() {
        const offline = navigator.onLine === false; document.documentElement.dataset.appOffline = String(offline);
        if (banner) banner.hidden = !offline;
        if (offline) document.querySelectorAll(appMutationControls).forEach(node => {
            if (!previous.has(node)) previous.set(node, node.getAttribute('aria-disabled'));
            node.setAttribute('aria-disabled', 'true');
        });
        else { for (const [node, value] of previous) { if (value === null) node.removeAttribute('aria-disabled'); else node.setAttribute('aria-disabled', value); } previous.clear(); }
        for (const node of previous.keys()) if (!node.isConnected) previous.delete(node);
    }
    addEventListener('offline', () => { appMark(); appToast("You're offline. Reconnect to make changes.", 'error'); });
    addEventListener('online', () => { appMark(); appToast('Back online. You can make changes again.'); });
    document.addEventListener('click', event => {
        if (navigator.onLine !== false || !event.target.closest(appMutationControls)) return;
        event.preventDefault(); event.stopImmediatePropagation(); appToast("You're offline. Reconnect to make changes.", 'error');
    }, true);
    document.addEventListener('submit', event => {
        if (navigator.onLine !== false || event.target.method?.toLowerCase() === 'dialog') return;
        event.preventDefault(); event.stopImmediatePropagation(); appToast("You're offline. Reconnect to make changes.", 'error');
    }, true);
    new MutationObserver(appMark).observe(document.body, { childList: true, subtree: true }); appMark();
}
