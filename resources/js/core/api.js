import { appToast } from './toast.js';
export { appToast } from './toast.js';

export class AppApiError extends Error {
    constructor(message, errors = {}, status = 0) {
        super(message);
        this.errors = errors;
        this.status = status;
    }
}

let appRedirecting = false;
export function appAssertOnline() {
    if (navigator.onLine === false) throw new AppApiError("You're offline. Reconnect to make changes.");
}
export async function appRequest(url, options = {}) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes((options.method || 'GET').toUpperCase())) appAssertOnline();
    let response;
    try {
        response = await fetch(url, {
            ...options,
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                ...options.headers,
            },
        });
    } catch {
        throw new AppApiError('Cannot reach the server. Check your connection and try again.');
    }
    const body = await response.json().catch(() => null);
    if (response.status === 401 && !appRedirecting) {
        appRedirecting = true;
        appToast('Session expired', 'error');
        const returnTo = location.pathname + location.search;
        setTimeout(() => location.assign('/login?return_to=' + encodeURIComponent(returnTo)), 800);
    }
    if (response.status === 419 && !appRedirecting) {
        appRedirecting = true;
        location.assign('/session-expired?return_to=' + encodeURIComponent(location.pathname + location.search));
    }
    if (!response.ok) {
        const first = Object.values(body?.errors || {}).flat()[0];
        throw new AppApiError(first || body?.message || 'Something went wrong. Please try again.', body?.errors || {}, response.status);
    }
    return body;
}
