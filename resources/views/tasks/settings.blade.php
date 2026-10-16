@extends('layouts.app')
@section('title', 'Settings | Simple Task Tracker')
@section('page', 'settings')
@section('heading', 'Settings')
@section('subtitle', 'Your workspace, your way. Changes to preferences apply instantly.')
@section('content')
@include('tasks.partials.mobile-profile')
<div class="app-settings-layout" id="app-settings">
    <nav class="app-settings-nav" role="tablist" aria-label="Settings sections" aria-orientation="vertical">
        @foreach(['appearance'=>'Appearance','preferences'=>'Preferences','account'=>'Account','data'=>'Data'] as $appSection=>$appLabel)
        <button type="button" role="tab" id="app-settings-tab-{{ $appSection }}" aria-controls="app-settings-{{ $appSection }}" aria-selected="{{ $loop->first ? 'true' : 'false' }}" tabindex="{{ $loop->first ? '0' : '-1' }}" data-app-settings-tab="{{ $appSection }}">{{ $appLabel }}</button>
        @endforeach
    </nav>
    <div class="app-settings-panels">
        <section class="app-settings-panel" id="app-settings-appearance" role="tabpanel" aria-labelledby="app-settings-tab-appearance">
            <h2>Appearance</h2><p class="app-settings-help">Preview changes here and across your workspace. Your theme remembers its own accent.</p>
            <fieldset class="app-theme-options"><legend>Theme</legend>
                @foreach(['light'=>'Light','dark'=>'Dark','system'=>'System','kawaii'=>'Kawaii','racing'=>'Racing'] as $appMode=>$appModeTitle)
                <label class="app-settings-theme-option"><input class="app-visually-hidden" type="radio" name="app-settings-theme" data-app-theme-mode value="{{ $appMode }}"><span class="app-theme-preview" data-app-preview="{{ $appMode }}" aria-hidden="true"><span></span><i></i></span><span>{{ $appModeTitle }}</span><span class="app-option-check" aria-hidden="true">&#10003;</span></label>
                @endforeach
            </fieldset>
            <fieldset class="app-accent-options"><legend>Accent</legend><p class="app-settings-help">Used for buttons, selected controls, and focus rings.</p><div id="app-settings-accents" class="app-accent-swatches" data-app-accent-group data-app-accent-class="app-settings-accent-option"></div></fieldset>
            <div class="app-settings-preview" aria-label="Live appearance preview"><div><strong>Your workspace</strong><p class="app-settings-help">A live preview of your current colors and spacing.</p></div><span class="app-settings-preview-chip">In progress</span><button type="button" class="button button-primary" id="app-settings-preview-button">Try this button</button></div>
            <div class="app-settings-fields">
                <div class="field"><label for="app-density">Density</label><select id="app-density" data-app-setting="density" aria-describedby="app-density-help"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select><p id="app-density-help" class="app-settings-help">Adjust card spacing without shrinking touch targets.</p></div>
                <div class="field"><label for="app-motion">Motion</label><select id="app-motion" data-app-setting="motion" aria-describedby="app-motion-help"><option value="system">Follow device setting</option><option value="reduce">Reduce motion</option></select><p id="app-motion-help" class="app-settings-help">Reduce animations here, or follow your device accessibility preference.</p></div>
            </div>
        </section>
        <section class="app-settings-panel" id="app-settings-preferences" role="tabpanel" aria-labelledby="app-settings-tab-preferences" hidden>
            <h2>Preferences</h2><p class="app-settings-help">Saved for your account in this browser. Shared links can override the default view.</p>
            <div class="app-settings-checkbox"><input id="app-show-pet" type="checkbox" data-app-setting="showPet" aria-describedby="app-show-pet-help"><div><label for="app-show-pet">Show pet</label><p id="app-show-pet-help" class="app-settings-help">Show your companion, pet navigation, and XP celebrations. Turning this off does not affect earned XP.</p></div></div>
            <div class="app-settings-checkbox"><input id="app-reduce-pet-motion" type="checkbox" data-app-setting="reducePetMotion" aria-describedby="app-reduce-pet-motion-help"><div><label for="app-reduce-pet-motion">Reduce pet animations</label><p id="app-reduce-pet-motion-help" class="app-settings-help">Keep your pet still and show rewards as text. Device reduced-motion settings always take priority.</p></div></div>
            <div class="app-settings-fields">
                <div class="field"><label for="app-default-view">Default Tasks view</label><select id="app-default-view" data-app-setting="defaultView" aria-describedby="app-default-view-help"><option value="board">Board</option><option value="list">List</option></select><p id="app-default-view-help" class="app-settings-help">Choose how Tasks opens when a link does not specify a view.</p></div>
                <div class="field"><label for="app-default-sort">Default sort</label><select id="app-default-sort" data-app-setting="defaultSort" aria-describedby="app-default-sort-help"><option value="priority">Priority first</option><option value="deadline">Deadline first</option></select><p id="app-default-sort-help" class="app-settings-help">Sorting is always performed by the server.</p></div>
                <div class="field"><label for="app-week-start">Week starts on</label><select id="app-week-start" data-app-setting="weekStart" aria-describedby="app-week-start-help"><option value="monday">Monday</option><option value="sunday">Sunday</option></select><p id="app-week-start-help" class="app-settings-help">Used by the Calendar month grid and agenda.</p></div>
                <div class="app-settings-checkbox"><input id="app-show-completed" type="checkbox" data-app-setting="showCompleted" aria-describedby="app-show-completed-help"><div><label for="app-show-completed">Show completed tasks on the board</label><p id="app-show-completed-help" class="app-settings-help">Hide the Completed column to focus on open work. An explicit Completed filter still shows it.</p></div></div>
            </div>
        </section>
        <section class="app-settings-panel" id="app-settings-account" role="tabpanel" aria-labelledby="app-settings-tab-account" hidden>
            <h2>Account</h2><p class="app-settings-help">Your profile is saved securely to your account, not just this browser.</p>
            <form id="app-profile-form" class="app-settings-form" action="{{ route('settings.profile') }}" method="POST" novalidate>
                @csrf @method('PATCH')
                <div class="field"><label for="app-profile-name">Display name</label><input id="app-profile-name" name="name" value="{{ auth()->user()->name }}" required maxlength="255" autocomplete="name" aria-describedby="app-profile-name-help"><p id="app-profile-name-help" class="app-settings-help">Required. Up to 255 characters. Capitalization in the sidebar is display-only.</p></div>
                <div class="field"><label for="app-profile-email">Email</label><input id="app-profile-email" type="email" value="{{ auth()->user()->email }}" readonly autocomplete="email" aria-describedby="app-profile-email-help"><p id="app-profile-email-help" class="app-settings-help">Email is read-only.</p></div>
                <p class="app-field-error" data-app-form-error role="alert" hidden></p><button type="submit" class="button button-primary">Save profile</button>
            </form>
            <form id="app-password-form" class="app-settings-form app-settings-divider" action="{{ route('settings.password') }}" method="POST" novalidate>
                @csrf @method('PUT')
                <h3>Change password</h3>
                <div class="field"><label for="app-current-password">Current password</label><input id="app-current-password" type="password" name="current_password" required autocomplete="current-password" aria-describedby="app-current-password-help"><p id="app-current-password-help" class="app-settings-help">Verify your identity before changing your password.</p></div>
                <div class="field"><label for="app-new-password">New password</label><input id="app-new-password" type="password" name="password" required minlength="8" autocomplete="new-password" aria-describedby="app-new-password-help"><p id="app-new-password-help" class="app-settings-help">At least 8 characters. Use a unique password. {{ config('hashing.driver', 'bcrypt') === 'bcrypt' ? 'This server supports up to 72 bytes (some characters use multiple bytes).' : '' }}</p></div>
                <div class="field"><label for="app-password-confirmation">Confirm new password</label><input id="app-password-confirmation" type="password" name="password_confirmation" required autocomplete="new-password" aria-describedby="app-password-confirmation-help"><p id="app-password-confirmation-help" class="app-settings-help">Enter your new password again.</p></div>
                <p class="app-field-error" data-app-form-error role="alert" hidden></p><button type="submit" class="button button-primary">Change password</button>
            </form>
        </section>
        <section class="app-settings-panel" id="app-settings-data" role="tabpanel" aria-labelledby="app-settings-tab-data" hidden>
            <h2>Your data</h2><p class="app-settings-help">Exports contain only your tasks. A fresh copy is fetched before each download.</p>
            <h3>Export my tasks</h3><p class="app-settings-help" id="app-export-help">JSON preserves task fields. CSV opens in spreadsheets and protects cells against formula injection.</p>
            <div class="app-settings-actions"><button id="app-export-json" type="button" class="button button-secondary" aria-describedby="app-export-help" data-app-export="json">Download JSON</button><button id="app-export-csv" type="button" class="button button-secondary" aria-describedby="app-export-help" data-app-export="csv">Download CSV</button></div>
            <div class="app-settings-divider"><h3>Delete completed tasks</h3><p id="app-completed-summary" class="app-settings-help">Loading your completed task count…</p><p class="app-settings-help" id="app-delete-completed-help">Only completed tasks are deleted. Open tasks are kept. This cannot be undone; export a backup first.</p><button id="app-delete-completed-open" type="button" class="button button-secondary app-settings-danger" aria-describedby="app-delete-completed-help" disabled>Delete all completed tasks</button></div>
            <section id="app-delete-completed-confirm" class="app-settings-confirm" role="group" aria-labelledby="app-delete-completed-title" hidden><h3 id="app-delete-completed-title">Delete completed tasks?</h3><p>This permanently deletes completed tasks from your account. It cannot be undone.</p><div class="app-settings-actions"><button id="app-cancel-delete-completed" type="button" class="button button-secondary">Keep tasks</button><button id="app-confirm-delete-completed" type="button" class="button button-primary app-settings-danger">Yes, delete completed tasks</button></div></section>
            <p id="app-data-status" class="app-settings-help" role="status" aria-live="polite"></p>
        </section>
        <p id="app-settings-status" class="app-settings-help" role="status" aria-live="polite"></p>
    </div>
</div>
@endsection
