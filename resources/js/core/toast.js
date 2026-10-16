import { APP_MOBILE_QUERY } from './constants.js';
// Accessible notifications, including existing mobile dialog placement.
export function appToast(message, type = 'success') {
    const container = document.getElementById('toasts');
    if (!container) return;
    const dialog = matchMedia(APP_MOBILE_QUERY).matches ? document.querySelector('dialog[open]') : null;
    if (dialog && !dialog.contains(container)) {
        dialog.append(container);
        dialog.addEventListener('close', () => { if (container.parentElement === dialog) document.body.append(container); }, { once: true });
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    container.append(toast);
    setTimeout(() => toast.remove(), 5000);
}
