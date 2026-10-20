@extends('layouts.app')
@section('title', 'Notifications | Simple Task Tracker')
@section('page', 'notifications')
@section('heading', 'Notifications')
@section('subtitle', 'Your deadlines and small wins, in one place.')
@section('content')
<section class="app-notifications-page" aria-labelledby="app-notifications-heading">
    <section class="app-invitation-section" aria-labelledby="app-invitations-heading"><div class="app-notifications-toolbar"><div><h2 id="app-invitations-heading">Task invitations</h2><p class="app-dashboard-hint">Collaborate on tasks shared with you.</p></div></div><div id="app-invitations" class="app-invitation-list" aria-live="polite"></div></section>
    <div class="app-notifications-toolbar">
        <div><h2 id="app-notifications-heading">Your task updates</h2><p id="app-notification-summary" class="app-dashboard-hint" aria-live="polite">Loading your notifications…</p></div>
        <button type="button" class="button button-secondary" data-app-mark-all disabled>Mark all as read</button>
    </div>
    <p class="app-notifications-note">These reminders are derived from your tasks, not pushed messages.</p>
    <p class="app-notification-storage-note" data-app-notification-storage role="status" hidden>Read status is temporary in this tab because browser storage is unavailable.</p>
    <div class="app-status-control app-notification-tabs" role="tablist" aria-label="Notification filter">
        <button id="app-notification-tab-all" type="button" role="tab" aria-selected="true" aria-controls="app-notification-feed" tabindex="0" data-app-notification-filter="all">All <span data-app-notification-total>0</span></button>
        <button id="app-notification-tab-unread" type="button" role="tab" aria-selected="false" aria-controls="app-notification-feed" tabindex="-1" data-app-notification-filter="unread">Unread <span data-app-notification-unread>0</span></button>
    </div>
    <div id="app-notification-error" class="app-task-error" role="alert" hidden></div>
    <div id="app-notification-feed" class="app-notification-feed" role="tabpanel" aria-labelledby="app-notification-tab-all" tabindex="0" aria-busy="true"><div class="app-task-skeleton" aria-hidden="true"></div><div class="app-task-skeleton" aria-hidden="true"></div><div class="app-task-skeleton" aria-hidden="true"></div></div>
</section>
@endsection
