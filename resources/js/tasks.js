import { appTaskState, appInitTaskBadge } from './core/state.js';
import { appOpenCreate, appInitDialogs } from './features/task-dialog/dialog.js';

import { appInitAppearance } from './shell/appearance.js';
import { appInitShell } from './shell/nav.js';

import { appInitNotifications } from './features/notifications/page.js';
import { appInitPreferences } from './shell/preferences.js';
import { appInitPet } from './features/pet/widget.js';
import { appInitMobile } from './shell/mobile.js';

import { appInitMobileTaskScreens } from './features/mobile/task-screens.js';
import { appInitMobileAccount } from './features/mobile/account.js';
import { appInitOffline } from './shell/offline.js';
import { appInitPublicAuth } from './shell/public-auth.js';

import { appInitGlobalSearch } from './shell/search.js';

async function appSafeInit(name, init) {
    try { await init(); } catch (error) { console.error('Task Tracker '+name+':', error); }
}
async function appBoot() {
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
const appPages = {
    tasks: () => import('./pages/tasks.js').then(module => module.appInitTasks()),
    dashboard: async () => {
        const page = await import('./pages/dashboard.js');
        await appSafeInit('dashboard', page.appInitDashboard);
        const mobile = await import('./features/mobile/home.js');
        await appSafeInit('mobile home', mobile.appInitMobileHome);
    },
    calendar: () => import('./pages/calendar.js').then(module => module.appInitCalendar()),
    settings: () => import('./pages/settings.js').then(module => module.appInitSettings()),
};
const appPage = document.body.dataset.page;
if (appPages[appPage]) await appSafeInit(appPage + ' page', appPages[appPage]);
appSafeInit('mobile account', appInitMobileAccount);
appTaskState.load().catch(() => {});
} else appSafeInit('public auth', appInitPublicAuth);
}
appBoot();
