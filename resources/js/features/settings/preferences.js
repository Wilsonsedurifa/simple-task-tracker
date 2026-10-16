import { appReadSettings, appSaveSettings } from '../../shell/preferences.js';
import { appTaskState } from '../../core/state.js';
import { appRequest, appToast } from '../../core/api.js';
import { appTasksCsv } from './data-export.js';
import { appDateInput } from '../../core/dates.js';


export function appSettingsPreferences() {
    const controls = [...document.querySelectorAll('[data-app-setting]')];
    function appSync() {
        const settings = appReadSettings();
        for (const control of controls) {
            const value = settings[control.dataset.appSetting];
            if (control.type === 'checkbox') control.checked = value; else control.value = value;
        }
    }
    appSync(); addEventListener('app:settings', appSync);
    for (const control of controls) control.addEventListener('change', () => {
        const saved = appSaveSettings({ [control.dataset.appSetting]: control.type === 'checkbox' ? control.checked : control.value });
        const note = document.getElementById('app-settings-status');
        if (note) note.textContent = saved ? 'Preference saved for this account in this browser.' : 'Applied for this page, but browser storage is blocked; it could not be saved.';
    });
    document.getElementById('app-settings-preview-button')?.addEventListener('click', () => appToast('Looking good! This is your current accent.'));
}
