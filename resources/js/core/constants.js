// Shared platform boundaries and API/storage names; values match the baseline.
export const APP_MOBILE_QUERY = '(max-width: 767px)';
export const APP_API = Object.freeze({ tasks:'/api/tasks', pet:'/api/pet' });
export const APP_STORAGE = Object.freeze({ dashboardTab:'app-dashboard-tab', settings:'app-settings:', welcome:'app-notifications-welcome:', read:'app-notifications-read:' });
export const APP_STAGES = Object.freeze({ todo:'todo', progress:'in_progress', review:'review', completed:'completed' });
export const APP_STATUS = Object.freeze({ pending:'pending', completed:'completed' });
