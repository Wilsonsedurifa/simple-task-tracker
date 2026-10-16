import { appRequest, appToast, appAssertOnline } from './api.js';
import { appDateOnly } from './dates.js';

let appTasks = [];
let appLoaded = false;
let appPending = null;
let appSort = 'deadline';
let appVersion = 0;
const appListeners = new Set();
const appErrorListeners = new Set();
const appMoves = new Map();
const appBusy = new Set();
const appRewardListeners = new Set();
function appPublishReward(result) {
    if (!result?.pet) return;
    for (const listener of appRewardListeners) {
        try { listener(result.pet); } catch (error) { console.error('Pet reward subscriber:', error); }
    }
}
function appNormalizeTask(task) {
    if (!task || !Object.hasOwn(task, 'due_date')) return task;
    const timeZone = document.querySelector('meta[name="app-timezone"]')?.content || 'UTC';
    return { ...task, due_date: appDateOnly(task.due_date, timeZone) };
}
function appPublish() {
    for (const listener of appListeners) {
        try { listener(appTasks); } catch (error) { console.error('Task state subscriber:', error); }
    }
}
export const appTaskState = {
    get tasks() { return appTasks; },
    get loaded() { return appLoaded; },
    get sort() { return appSort; },
    isMoving(id) { return appBusy.has(String(id)); },
    setSort(sort) { appSort = sort === 'priority' ? 'priority' : 'deadline'; },
    async move(id, destination) {
        appAssertOnline();
        const key = String(id);
        if (appBusy.has(key)) throw Error('This task is still being updated. Please wait.');
        const original = appTasks.find(task => String(task.id) === String(id));
        if (!original) throw Error('That task is unavailable.');
        const completed = destination === 'completed';
        const endpoint = completed ? '/complete' : original.status === 'completed' ? '/reopen' : '';
        const optimistic = { ...original, status: completed ? 'completed' : 'pending', stage: completed ? original.stage : destination, completed_at: completed ? Date.now() : null };
        appBusy.add(key);
        appMoves.set(key, optimistic);
        appTasks = appTasks.map(task => task === original ? optimistic : task);
        appPublish();
        try {
            const result = await appRequest('/api/tasks/' + id + endpoint, { method: 'PATCH', ...(completed ? {} : { body: JSON.stringify({ stage: destination }) }) });
            if (completed) appPublishReward(result);
        } catch (error) {
            appMoves.delete(key);
            appBusy.delete(key);
            appTasks = appTasks.map(task => task === optimistic ? original : task);
            appPublish();
            throw error;
        }
        appMoves.delete(key);
        try { await this.load({ force: true }); } catch {
            appToast('Move saved, but the latest list could not be loaded. Try again.', 'error');
        } finally { appBusy.delete(key); appPublish(); }
    },
    subscribe(listener) {
        appListeners.add(listener);
        if (appLoaded) { try { listener(appTasks); } catch (error) { console.error('Task state subscriber:', error); } }
        return () => appListeners.delete(listener);
    },
    onError(listener) { appErrorListeners.add(listener); return () => appErrorListeners.delete(listener); },
    onReward(listener) { appRewardListeners.add(listener); return () => appRewardListeners.delete(listener); },
    async load({ force = false, sort = appSort } = {}) {
        if (appPending && !force && sort === appSort) return appPending;
        if (appLoaded && !force && sort === appSort) return appTasks;
        appSort = sort === 'priority' ? 'priority' : 'deadline';
        const version = ++appVersion;
        appPending = appRequest('/api/tasks?sort=' + appSort).then(tasks => {
            if (!Array.isArray(tasks)) throw Error('Unexpected task response. Please reload.');
            if (version === appVersion) {
                appTasks = tasks.map(task => appMoves.get(String(task.id)) || appNormalizeTask(task));
                appLoaded = true;
                appPublish();
            }
            return appTasks;
        }).catch(error => {
            if (version === appVersion) for (const listener of appErrorListeners) {
                try { listener(error); } catch (callbackError) { console.error('Task error subscriber:', callbackError); }
            }
            throw error;
        }).finally(() => { if (version === appVersion) appPending = null; });
        return appPending;
    },
    async mutate(url, method, data) {
        const result = await appRequest(url, { method, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
        if (method === 'PATCH' && /\/complete$/.test(url)) appPublishReward(result);
        try { await this.load({ force: true }); } catch {
            appToast('Saved, but the latest list could not be loaded. Please try refreshing.', 'error');
        }
        return appNormalizeTask(result);
    },
};

export function appInitTaskBadge() {
    appTaskState.subscribe(tasks => {
        const badge = document.getElementById('sidebar-task-count');
        if (!badge) return;
        const count = tasks.filter(task => task.status === 'pending').length;
        badge.textContent = String(count);
        badge.hidden = count === 0;
        badge.setAttribute('aria-label', count + ' open tasks');
    });
}
