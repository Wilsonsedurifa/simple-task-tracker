import { appSettingsTabs } from '../features/settings/sections.js';
import { appSettingsPreferences } from '../features/settings/preferences.js';
import { appSettingsAccount } from '../features/settings/account.js';
import { appSettingsData } from '../features/settings/data.js';
export function appInitSettings() {
    for (const [name, init] of Object.entries({ tabs: appSettingsTabs, preferences: appSettingsPreferences, account: appSettingsAccount, data: appSettingsData })) {
        try { init(); } catch (error) { console.error('Settings ' + name + ':', error); }
    }
}
