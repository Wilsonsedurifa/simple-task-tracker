@extends('layouts.app')
@section('title', 'Calendar | Simple Task Tracker')
@section('page', 'calendar')
@section('heading', 'Calendar')
@section('subtitle', 'Make space for your deadlines, one day at a time.')
@section('content')
<section id="app-calendar" class="app-calendar" aria-busy="true">
    <div class="app-calendar-toolbar">
        <div><h2 id="app-calendar-month" aria-live="polite">Your month</h2><p id="app-calendar-summary" class="app-dashboard-hint">Loading your deadlines…</p></div>
        <div class="app-calendar-navigation" role="group" aria-label="Calendar month">
            <button id="app-calendar-prev" type="button" class="app-task-action" aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>
            <button id="app-calendar-today" type="button" class="button button-secondary">Today</button>
            <button id="app-calendar-next" type="button" class="app-task-action" aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>
        </div>
    </div>
    <div id="app-calendar-error" class="app-task-error" role="alert" hidden></div>
    <div id="app-calendar-empty" class="app-calendar-empty" role="status" hidden><strong>Walang deadline ngayong buwan</strong><p>Choose a date to add a task, or check your unscheduled list.</p></div>
    <div class="app-calendar-layout">
        <div class="app-calendar-main">
            <div id="app-calendar-loading" class="app-calendar-loading" role="status"><span class="app-sr-only">Loading calendar</span>@for ($index = 0; $index < 7; $index++)<div class="app-task-skeleton" aria-hidden="true"></div>@endfor</div>
            <div id="app-calendar-desktop" hidden>
                <p id="app-calendar-instructions" class="app-dashboard-hint">Arrow keys move between dates. Enter opens a day. Click an empty date to add a task. Past dates are view-only.</p>
                <div id="app-calendar-grid" class="app-calendar-grid" role="grid" aria-labelledby="app-calendar-month" aria-describedby="app-calendar-instructions" aria-colcount="7" aria-rowcount="7"></div>
            </div>
            <section id="app-calendar-agenda" class="app-calendar-agenda" aria-labelledby="app-agenda-heading" hidden>
                <div class="app-agenda-week-header"><h3 id="app-agenda-heading">Your week</h3><div class="app-calendar-navigation"><button id="app-agenda-prev" type="button" class="app-task-action" aria-label="Previous week"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button><button id="app-agenda-next" type="button" class="app-task-action" aria-label="Next week"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button></div></div>
                <div id="app-calendar-week" class="app-week-strip" role="group" aria-label="Select a day"></div>
                <button id="app-calendar-expand" type="button" class="app-mobile-only app-calendar-expand" aria-expanded="false" aria-controls="app-calendar-mobile-month">Show month <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
                <div id="app-calendar-mobile-month" class="app-mobile-calendar-month" role="group" aria-label="Select a date in this month" hidden></div>
                <div class="app-agenda-day-header"><div><h3 id="app-agenda-date"></h3><p id="app-agenda-count" class="app-dashboard-hint"></p></div><button id="app-agenda-add" type="button" class="button button-primary">Add task for this day</button></div>
                <p id="app-agenda-past" class="app-dashboard-hint" hidden>Past dates are view-only. Choose today or a future date to add a task.</p>
                <div id="app-agenda-tasks" class="app-task-list"></div>
            </section>
        </div>
        <aside class="app-calendar-sidebar"><details id="app-calendar-unscheduled" class="app-dashboard-card app-calendar-unscheduled" open><summary>Unscheduled <span id="app-unscheduled-count" class="app-column-count">—</span></summary><p class="app-dashboard-hint">Tasks without a due date. Open one to add a deadline.</p><div id="app-unscheduled-list" class="app-task-list"></div></details></aside>
    </div>
    <p id="app-calendar-announcement" class="app-sr-only" aria-live="polite" aria-atomic="true"></p>
</section>
<div id="app-calendar-day" class="app-calendar-day-popover" popover="auto" role="dialog" aria-labelledby="app-day-heading" tabindex="-1">
    <header class="app-day-header"><div><h2 id="app-day-heading"></h2><p id="app-day-count" class="app-dashboard-hint"></p></div><button id="app-day-close" type="button" class="app-task-action" aria-label="Close day"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button></header>
    <div id="app-day-tasks" class="app-task-list app-day-tasks"></div>
    <p id="app-day-past" class="app-dashboard-hint" hidden>Past dates are view-only. New tasks need today or a future date.</p><button id="app-day-add" type="button" class="button button-primary">Add task on this day</button>
</div>
@endsection
