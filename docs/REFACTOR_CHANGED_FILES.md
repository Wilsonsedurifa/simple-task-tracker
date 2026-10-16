# Changed files

Compared with the preserved implementation checkpoint `7913d29` on `refactor/structure`. `R` denotes a move/rename, not removal of behavior. This list includes the refactor phases only, not the earlier user implementation checkpoint.

Why: JS core/features/pages/shell = shared helpers and focused modules; numbered CSS = unchanged cascade extraction; Blade = shared composition; PHP = exact validation/serialization/service extraction; routes = original middleware groups split by feature; tests = organization, contract characterization and async/history-aware waits; README/docs = structure, evidence and remaining exceptions. Auth/landing JS changes are header comments only; their bundles are unchanged.

```text
M	README.md
M	app/Http/Controllers/GoogleAuthController.php
M	app/Http/Controllers/PetController.php
M	app/Http/Controllers/SettingsController.php
M	app/Http/Controllers/TaskController.php
A	app/Http/Requests/IndexTaskRequest.php
A	app/Http/Requests/JsonFormRequest.php
A	app/Http/Requests/ReopenTaskRequest.php
A	app/Http/Requests/SavePetRequest.php
A	app/Http/Requests/StoreTaskRequest.php
A	app/Http/Requests/UpdatePasswordRequest.php
A	app/Http/Requests/UpdateProfileRequest.php
A	app/Http/Requests/UpdateTaskRequest.php
A	app/Http/Resources/TaskResource.php
M	app/Models/Task.php
A	app/Services/GoogleAccountService.php
A	app/Services/GoogleLoginService.php
A	app/Services/TaskService.php
A	docs/REFACTOR_AFTER.json
A	docs/REFACTOR_BASELINE.json
A	docs/REFACTOR_CHANGED_FILES.md
A	docs/REFACTOR_PLAN.md
A	docs/REFACTOR_REPORT.md
A	resources/css/base/007-reset.css
A	resources/css/base/028-tokens.css
A	resources/css/base/032-tokens.css
A	resources/css/base/037-tokens.css
A	resources/css/base/040-tokens.css
A	resources/css/base/045-tokens.css
A	resources/css/base/047-tokens.css
A	resources/css/base/048-public-auth.css
A	resources/css/base/050-tokens.css
A	resources/css/components/012-stat-cards.css
A	resources/css/components/015-badges.css
A	resources/css/components/016-empty-and-skeleton.css
A	resources/css/components/017-view-switcher.css
A	resources/css/components/022-buttons.css
A	resources/css/components/023-forms.css
A	resources/css/components/024-alerts.css
A	resources/css/components/025-dialog.css
A	resources/css/components/026-toast.css
A	resources/css/features/005-legacy-dashboard.css
A	resources/css/features/006-legacy-dashboard.css
A	resources/css/features/013-legacy-task-list.css
A	resources/css/features/014-legacy-task-list.css
A	resources/css/features/018-legacy-board.css
A	resources/css/features/019-legacy-board.css
A	resources/css/features/020-legacy-inspector.css
A	resources/css/features/021-legacy-inspector.css
A	resources/css/features/034-task-list.css
A	resources/css/features/035-drawer.css
A	resources/css/features/036-dashboard.css
A	resources/css/features/038-calendar.css
A	resources/css/features/039-notifications.css
A	resources/css/features/041-pet.css
A	resources/css/features/044-pet.css
A	resources/css/features/046-settings.css
A	resources/css/layout/008-shell.css
A	resources/css/layout/009-sidebar.css
A	resources/css/layout/010-sidebar.css
A	resources/css/layout/011-topbar.css
A	resources/css/layout/027-legacy-responsive.css
A	resources/css/layout/030-shell-modern.css
A	resources/css/layout/031-shell-modern.css
A	resources/css/layout/033-shell-modern.css
A	resources/css/mobile/049-foundation.css
A	resources/css/mobile/051-account.css
A	resources/css/mobile/052-calendar.css
A	resources/css/mobile/053-tasks.css
A	resources/css/mobile/054-home.css
M	resources/css/tasks.css
A	resources/css/themes/001-light.css
A	resources/css/themes/002-dark.css
A	resources/css/themes/003-kawaii.css
A	resources/css/themes/004-racing.css
A	resources/css/themes/029-accent-and-species-tokens.css
A	resources/css/themes/042-kawaii.css
A	resources/css/themes/043-accent-and-species-tokens.css
M	resources/js/auth.js
R071	resources/js/modules/app-api.js	resources/js/core/api.js
A	resources/js/core/constants.js
R096	resources/js/modules/app-dates.js	resources/js/core/dates.js
A	resources/js/core/dom.js
R090	resources/js/modules/app-state.js	resources/js/core/state.js
A	resources/js/core/storage.js
A	resources/js/core/toast.js
A	resources/js/features/board/board.js
A	resources/js/features/board/dnd.js
A	resources/js/features/board/move-menu.js
R090	resources/js/modules/app-calendar-data.js	resources/js/features/calendar/data.js
A	resources/js/features/calendar/day-list.js
A	resources/js/features/calendar/labels.js
A	resources/js/features/calendar/month.js
A	resources/js/features/calendar/week-strip.js
A	resources/js/features/dashboard/chart.js
R093	resources/js/modules/app-dashboard-data.js	resources/js/features/dashboard/data.js
A	resources/js/features/dashboard/quick-add.js
A	resources/js/features/dashboard/side-row.js
R086	resources/js/modules/app-mobile-account.js	resources/js/features/mobile/account.js
R087	resources/js/modules/app-mobile-components.js	resources/js/features/mobile/components.js
R092	resources/js/modules/app-mobile-home.js	resources/js/features/mobile/home.js
R089	resources/js/modules/app-mobile-task-actions.js	resources/js/features/mobile/task-actions.js
R095	resources/js/modules/app-mobile-task-screens.js	resources/js/features/mobile/task-screens.js
R092	resources/js/modules/app-notification-data.js	resources/js/features/notifications/derive.js
R094	resources/js/modules/app-notifications.js	resources/js/features/notifications/page.js
R057	resources/js/modules/app-notification-storage.js	resources/js/features/notifications/read-state.js
R066	resources/js/modules/app-notification-welcome.js	resources/js/features/notifications/welcome.js
R092	resources/js/modules/app-pet-art.js	resources/js/features/pet/art.js
R093	resources/js/modules/app-pet-data.js	resources/js/features/pet/data.js
R093	resources/js/modules/app-pet.js	resources/js/features/pet/widget.js
A	resources/js/features/settings/account.js
R100	resources/js/modules/app-export.js	resources/js/features/settings/data-export.js
A	resources/js/features/settings/data.js
A	resources/js/features/settings/errors.js
A	resources/js/features/settings/preferences.js
A	resources/js/features/settings/sections.js
R077	resources/js/modules/app-dialog.js	resources/js/features/task-dialog/dialog.js
A	resources/js/features/task-dialog/view-panel.js
A	resources/js/features/tasks/filters.js
A	resources/js/features/tasks/list.js
R071	resources/js/modules/app-task-components.js	resources/js/features/tasks/row.js
M	resources/js/landing.js
D	resources/js/modules/app-settings.js
R055	resources/js/modules/app-calendar.js	resources/js/pages/calendar.js
R064	resources/js/modules/app-dashboard.js	resources/js/pages/dashboard.js
A	resources/js/pages/settings.js
R064	resources/js/modules/app-tasks.js	resources/js/pages/tasks.js
R096	resources/js/modules/app-appearance.js	resources/js/shell/appearance.js
R093	resources/js/modules/app-mobile.js	resources/js/shell/mobile.js
R095	resources/js/modules/app-shell.js	resources/js/shell/nav.js
R093	resources/js/modules/app-offline.js	resources/js/shell/offline.js
R082	resources/js/modules/app-preferences.js	resources/js/shell/preferences.js
R095	resources/js/modules/app-public-auth.js	resources/js/shell/public-auth.js
A	resources/js/shell/search.js
M	resources/js/tasks.js
M	resources/views/layouts/app.blade.php
A	resources/views/partials/logout-modal.blade.php
A	resources/views/partials/page-title.blade.php
A	resources/views/partials/task-create.blade.php
A	resources/views/partials/task-delete.blade.php
A	resources/views/partials/task-dialog.blade.php
A	resources/views/partials/toast-container.blade.php
M	resources/views/tasks/dashboard.blade.php
A	resources/views/tasks/dashboard/quick-add.blade.php
A	resources/views/tasks/dashboard/side-panel.blade.php
A	resources/views/tasks/dashboard/stats.blade.php
A	resources/views/tasks/dashboard/summary.blade.php
D	resources/views/tasks/partials/task-dialog.blade.php
M	resources/views/tasks/partials/workspace-dialogs.blade.php
M	resources/views/tasks/settings.blade.php
A	resources/views/tasks/settings/account.blade.php
A	resources/views/tasks/settings/appearance.blade.php
A	resources/views/tasks/settings/data.blade.php
A	resources/views/tasks/settings/preferences.blade.php
D	resources/views/welcome.blade.php
A	routes/auth.php
A	routes/pets.php
A	routes/tasks.php
M	routes/web.php
R099	tests/Feature/PetTest.php	tests/Feature/Api/PetTest.php
R099	tests/Feature/SettingsTest.php	tests/Feature/Api/SettingsTest.php
R099	tests/Feature/TaskApiTest.php	tests/Feature/Api/TaskApiTest.php
A	tests/Feature/Api/TaskContractTest.php
R099	tests/Feature/TaskStagesTest.php	tests/Feature/Api/TaskStagesTest.php
R098	tests/Feature/AccessControlTest.php	tests/Feature/Pages/AccessControlTest.php
R093	tests/Feature/ExampleTest.php	tests/Feature/Pages/ExampleTest.php
R099	tests/Feature/GoogleAuthIntentTest.php	tests/Feature/Pages/GoogleAuthIntentTest.php
R097	tests/Feature/LandingPageTest.php	tests/Feature/Pages/LandingPageTest.php
R096	tests/Feature/MobileAccountTest.php	tests/Feature/Pages/MobileAccountTest.php
R096	tests/Feature/MobileCalendarTest.php	tests/Feature/Pages/MobileCalendarTest.php
R097	tests/Feature/MobileFoundationTest.php	tests/Feature/Pages/MobileFoundationTest.php
R096	tests/Feature/MobileHomeTest.php	tests/Feature/Pages/MobileHomeTest.php
R096	tests/Feature/MobileTasksTest.php	tests/Feature/Pages/MobileTasksTest.php
R099	tests/Feature/PageFlowTest.php	tests/Feature/Pages/PageFlowTest.php
R096	tests/Feature/PetPageTest.php	tests/Feature/Pages/PetPageTest.php
R099	tests/Feature/WorkspaceTest.php	tests/Feature/Pages/WorkspaceTest.php
M	tests/browser/calendar-data.mjs
M	tests/browser/dashboard-data.mjs
M	tests/browser/mobile-checks.mjs
M	tests/browser/mobile-home-checks.mjs
M	tests/browser/notification-data.mjs
M	tests/browser/pet-checks.mjs
M	tests/browser/pet-data.mjs
A	tests/browser/refactor-inventory.mjs
A	tests/browser/refactor-visual.mjs
M	tests/browser/settings-checks.mjs
M	tests/browser/task-dates.mjs
M	tests/browser/workspace.mjs
```
