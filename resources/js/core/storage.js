// Safe storage primitives preserve the caller's existing availability/fallback semantics.
export function appReadStorage(key) {
    try { return { value:globalThis.localStorage.getItem(key), available:true }; }
    catch { return { value:null, available:false }; }
}
export function appWriteStorage(key, value) {
    try { globalThis.localStorage.setItem(key, value); return true; }
    catch { return false; }
}
export function appReadJsonStorage(key, fallback = null) {
    const result = appReadStorage(key);
    try { return { value:JSON.parse(result.value || '{}'), available:result.available }; }
    catch { return { value:fallback, available:result.available }; }
}
