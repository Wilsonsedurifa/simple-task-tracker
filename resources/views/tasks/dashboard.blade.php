@extends('layouts.app')
@section('title', 'Dashboard | Simple Task Tracker')
@section('page', 'dashboard')
@section('heading', 'Your day, at a glance.')
@section('heading-id', 'db-greeting')
@section('subtitle', 'A little clarity for the day ahead.')
@section('page-actions')<span id="db-date" class="db-date-pill"></span>@endsection
@section('content')
<div id="db-summary-error" class="app-task-error" role="alert" hidden></div>
<section class="app-task-stats app-dashboard-stats" aria-label="Task summary" aria-live="polite">
    @php
        $metrics = [
            ['key'=>'pending','label'=>'Open','path'=>'M5 4h14v17H5z M9 9h6 M9 13h6 M9 17h4','params'=>['status'=>'pending']],
            ['key'=>'today','label'=>'Due today','path'=>'M8 2v5 M16 2v5 M3 10h18 M5 5h14v16H5z','params'=>['status'=>'pending','due'=>'today']],
            ['key'=>'overdue','label'=>'Overdue','path'=>'M12 8v5 M12 17h.01 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18','params'=>['status'=>'pending','due'=>'overdue']],
            ['key'=>'completed','label'=>'Completed','path'=>'m5 12 4 4L19 6','params'=>['status'=>'completed']],
        ];
    @endphp
    @foreach ($metrics as $metric)
    <a class="app-task-stat app-dashboard-stat" data-app-metric="{{ $metric['key'] }}" href="{{ route('tasks', $metric['params']) }}">
        <span class="app-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="{{ $metric['path'] }}"/></svg></span>
        <span><span class="app-stat-label">{{ $metric['label'] }}</span><strong id="db-summary-{{ $metric['key'] }}">0</strong></span>
    </a>
    @endforeach
</section>
<div class="app-dashboard-grid">
    @include('tasks.partials.mobile-home')
    <div class="app-dashboard-main">
        <section class="app-dashboard-card app-quick-card" aria-labelledby="app-quick-heading">
            <div class="app-dashboard-heading"><h2 id="app-quick-heading">Quick add</h2><span class="app-dashboard-hint">One small next step.</span></div>
            <form id="app-quick-form" class="app-quick-form" novalidate>
                <div class="app-quick-title"><label class="label" for="app-quick-title">Title</label><input id="app-quick-title" name="title" class="input" required maxlength="255" autocomplete="off" placeholder="What needs your attention?"></div>
                <div><label class="label" for="app-quick-priority">Priority</label><select id="app-quick-priority" name="priority" class="input"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
                <div><label class="label" for="app-quick-due">Due date (optional)</label><input id="app-quick-due" name="due_date" type="date" class="input"></div>
                <div id="app-quick-details" class="app-quick-title" hidden><label class="label" for="app-quick-description">Description</label><textarea id="app-quick-description" name="description" class="input" rows="3" maxlength="1000" aria-describedby="app-quick-count"></textarea><span id="app-quick-count" class="field-hint">0/1000</span></div>
                <div id="app-quick-error" class="app-quick-title" role="alert" hidden></div>
                <div class="app-quick-actions"><button type="button" id="app-quick-toggle" class="app-clear-filters" aria-expanded="false" aria-controls="app-quick-details">Add details</button><button type="submit" id="app-quick-submit" class="button button-primary">Add task</button></div>
            </form>
        </section>
        <div class="app-dashboard-summary">
            <section class="app-dashboard-card app-progress-card" aria-labelledby="app-progress-heading">
                <div class="app-dashboard-heading"><h2 id="app-progress-heading">Your progress</h2><strong id="db-summary-percent">0%</strong></div>
                <div id="db-summary-progress" class="app-dashboard-progress" role="progressbar" aria-label="Task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
                <p id="db-summary-label"><span id="app-dashboard-done">0</span> of <span id="db-summary-total">0</span> completed</p>
                <p id="app-dashboard-first-run" hidden>Add a task to get started</p>
                <a class="app-dashboard-link" href="{{ route('tasks') }}">View all tasks <span aria-hidden="true">→</span></a>
            </section>
            @include('tasks.partials.pet-widget', ['appPetCompact' => true])
            <section class="app-dashboard-card app-weekly-card" aria-labelledby="app-chart-heading">
                <div class="app-dashboard-heading"><h2 id="app-chart-heading">Last 7 days</h2><span class="app-dashboard-hint">Completed</span></div>
                <div id="db-summary-chart" class="app-seven-chart" role="img" aria-label="Daily task completions"></div>
                <p id="db-chart-total" class="app-chart-caption">0 completed in the last 7 days</p>
                <table class="app-sr-only"><caption>Tasks completed in the last 7 days</caption><thead><tr><th scope="col">Date</th><th scope="col">Completed</th></tr></thead><tbody id="app-chart-table"></tbody></table>
            </section>
        </div>
        <section class="app-dashboard-card" aria-labelledby="app-inprogress-heading">
            <div class="app-dashboard-heading"><h2 id="app-inprogress-heading">In progress <span id="app-inprogress-count" class="app-column-count">0</span></h2><a class="app-dashboard-link" href="{{ route('tasks', ['view'=>'board']) }}">View board <span aria-hidden="true">→</span></a></div>
            <div id="app-inprogress-cards" class="app-inprogress-cards" aria-busy="true"><div class="app-task-skeleton"></div><div class="app-task-skeleton"></div></div>
        </section>
    </div>
    <aside class="app-dashboard-side app-dashboard-card" aria-label="Task activity">
        <div class="app-dashboard-heading"><h2>Keep things moving</h2></div>
        <div class="app-side-tabs" role="tablist" aria-label="Task activity">
            @foreach (['deadlines'=>'Deadlines','active'=>'Active','done'=>'Done'] as $key=>$label)
            <button id="app-tab-{{ $key }}" type="button" role="tab" aria-selected="{{ $key === 'deadlines' ? 'true' : 'false' }}" aria-controls="app-panel-{{ $key }}" tabindex="{{ $key === 'deadlines' ? '0' : '-1' }}" data-app-tab="{{ $key }}">{{ $label }} <span id="app-count-{{ $key }}">0</span></button>
            @endforeach
        </div>
        <section id="app-panel-deadlines" role="tabpanel" aria-labelledby="app-tab-deadlines" tabindex="0">
            <div id="app-week-strip" class="app-week-strip" role="group" aria-label="Filter deadlines by day"></div>
            <div id="app-week-actions" class="app-week-actions"></div>
            <div id="app-deadline-list" class="app-panel-list" aria-live="polite"></div>
            <a id="app-no-deadline" class="app-dashboard-link" href="{{ route('tasks', ['status'=>'pending','due'=>'none']) }}" hidden></a>
        </section>
        <section id="app-panel-active" role="tabpanel" aria-labelledby="app-tab-active" tabindex="0" hidden><div id="app-active-list" class="app-panel-list" aria-live="polite"></div></section>
        <section id="app-panel-done" role="tabpanel" aria-labelledby="app-tab-done" tabindex="0" hidden><p class="app-dashboard-hint">Eight latest completions, in your task order.</p><div id="app-done-list" class="app-panel-list" aria-live="polite"></div></section>
    </aside>
</div>
@endsection
