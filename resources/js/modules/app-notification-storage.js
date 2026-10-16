import { appReadStorage, appWriteStorage } from '../core/storage.js';
export function appNotificationReadKey(userId) {
    return userId ? 'app-notifications-read:' + String(userId) : null;
}

export function appReadNotificationState(userId) {
    const key = appNotificationReadKey(userId);
    if (!key) return { ids: new Set(), available: false };
    const result = appReadStorage(key); if (!result.available) return { ids:new Set(), available:false };
    const raw = result.value;
    try {
        const data = JSON.parse(raw || '{}');
        return { ids: new Set(Array.isArray(data?.ids) ? data.ids.filter(id => typeof id === 'string') : []), available: true };
    } catch { return { ids: new Set(), available: true }; }
}

export function appSaveNotificationState(userId, current, additions) {
    const stored = appReadNotificationState(userId), ids = new Set([...stored.ids, ...current, ...additions]);
    const key = appNotificationReadKey(userId);
    if (!key) return { ids, available: false };
    return { ids, available: appWriteStorage(key, JSON.stringify({ version:1, ids:[...ids] })) && stored.available };
}
