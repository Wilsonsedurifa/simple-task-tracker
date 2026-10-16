export function appNotificationReadKey(userId) {
    return userId ? 'app-notifications-read:' + String(userId) : null;
}

export function appReadNotificationState(userId) {
    const key = appNotificationReadKey(userId);
    if (!key) return { ids: new Set(), available: false };
    let raw;
    try { raw = globalThis.localStorage.getItem(key); }
    catch { return { ids: new Set(), available: false }; }
    try {
        const data = JSON.parse(raw || '{}');
        return { ids: new Set(Array.isArray(data?.ids) ? data.ids.filter(id => typeof id === 'string') : []), available: true };
    } catch { return { ids: new Set(), available: true }; }
}

export function appSaveNotificationState(userId, current, additions) {
    const stored = appReadNotificationState(userId), ids = new Set([...stored.ids, ...current, ...additions]);
    const key = appNotificationReadKey(userId);
    if (!key) return { ids, available: false };
    try { globalThis.localStorage.setItem(key, JSON.stringify({ version: 1, ids: [...ids] })); return { ids, available: stored.available }; }
    catch { return { ids, available: false }; }
}
