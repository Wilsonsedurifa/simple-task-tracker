// notifications/welcome: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_STORAGE } from '../../core/constants.js';
import { appReadStorage, appWriteStorage } from '../../core/storage.js';
const appWelcomeMemory = new Map();

// A local, one-time greeting, not a pushed message or an assigned task.
export function appReadWelcome(userId, create = false) {
    if (!userId) return null;
    const key = APP_STORAGE.welcome + userId;
    let timestamp = appWelcomeMemory.get(key);
    { const saved = Number(appReadStorage(key).value); if (saved > 0 && Number.isFinite(saved)) timestamp = saved; }
    if (!timestamp && create) {
        timestamp = Date.now();
        appWriteStorage(key, String(timestamp));
    }
    if (!timestamp) return null;
    appWelcomeMemory.set(key, timestamp);
    return { id:'welcome:' + userId + ':' + timestamp, taskId:null, type:'welcome', timestamp, message:'Thanks for using Simple Task Tracker. Isa-isa lang, kaya natin!' };
}
export function appMobileNotificationTime(timestamp, now = Date.now()) {
    const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
    return minutes < 1 ? 'Just now' : minutes < 60 ? minutes + 'm ago' : minutes < 1440 ? Math.floor(minutes / 60) + 'h ago' : Math.floor(minutes / 1440) + 'd ago';
}
