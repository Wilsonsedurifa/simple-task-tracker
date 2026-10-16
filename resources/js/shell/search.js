// search: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appOpenCreate } from '../features/task-dialog/dialog.js';

export function appInitGlobalSearch() {
    const search = document.getElementById('task-search');
    search?.addEventListener('keydown', event => {
        if (event.key === 'Enter' && document.body.dataset.page !== 'tasks') {
            event.preventDefault();
            location.assign('/tasks?q=' + encodeURIComponent(search.value.trim()));
        }
    });
    document.addEventListener('keydown', event => {
        const target = event.target;
        const typing = target instanceof HTMLElement && Boolean(target.closest('input,textarea,select,[contenteditable="true"]'));
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            if (document.querySelector('dialog[open]')) return;
            event.preventDefault(); search?.focus(); search?.select();
        }
        if (event.key.toLowerCase() === 'n' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('dialog[open]')) {
            event.preventDefault(); appOpenCreate();
        }
    });
}
