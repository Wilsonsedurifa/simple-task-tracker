import { appTaskState, appInitTaskBadge } from './core/state.js';
import { appOpenCreate, appInitDialogs } from './modules/app-dialog.js';
import { appInitTasks } from './modules/app-tasks.js';
import { appInitDashboard } from './modules/app-dashboard.js';
import { appInitAppearance } from './modules/app-appearance.js';
import { appInitShell } from './modules/app-shell.js';
import { appInitCalendar } from './modules/app-calendar.js';
import { appInitSettings } from './modules/app-settings.js';
import { appInitNotifications } from './modules/app-notifications.js';
import { appInitPreferences } from './modules/app-preferences.js';
import { appInitPet } from './modules/app-pet.js';
import { appInitMobile } from './modules/app-mobile.js';
import { appInitMobileHome } from './modules/app-mobile-home.js';
import { appInitMobileTaskScreens } from './modules/app-mobile-task-screens.js';
import { appInitMobileAccount } from './modules/app-mobile-account.js';
import { appInitOffline } from './modules/app-offline.js';
import { appInitPublicAuth } from './modules/app-public-auth.js';

function appInitGlobalSearch() {
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
function appSafeInit(name, init) {
    try { init(); } catch (error) { console.error('Task Tracker '+name+':', error); }
}
appSafeInit('offline', appInitOffline);
if (document.body.classList.contains('app-workspace')) {
appSafeInit('preferences', appInitPreferences);
appSafeInit('appearance', appInitAppearance);
appSafeInit('shell', appInitShell);
appSafeInit('task badge', appInitTaskBadge);
appSafeInit('dialogs', appInitDialogs);
appSafeInit('notifications', appInitNotifications);
appSafeInit('global search', appInitGlobalSearch);
appSafeInit('pet', appInitPet);
appSafeInit('mobile foundation', appInitMobile);
appSafeInit('mobile task screens', appInitMobileTaskScreens);
if (document.body.dataset.page === 'tasks') appSafeInit('task page', appInitTasks);
if (document.body.dataset.page === 'dashboard') appSafeInit('dashboard', appInitDashboard);
if (document.body.dataset.page === 'dashboard') appSafeInit('mobile home', appInitMobileHome);
if (document.body.dataset.page === 'calendar') appSafeInit('calendar', appInitCalendar);
if (document.body.dataset.page === 'settings') appSafeInit('settings', appInitSettings);
appSafeInit('mobile account', appInitMobileAccount);
appTaskState.load().catch(() => {});
} else appSafeInit('public auth', appInitPublicAuth);
