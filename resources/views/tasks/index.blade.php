@extends('layouts.app')
@section('title', 'Tasks | Simple Task Tracker')
@section('page', 'tasks')
@section('heading', 'Tasks')
@section('subtitle', 'Loading your tasks…')
@section('content')
<section class="app-task-stats" aria-label="Task statistics" aria-live="polite">
    @foreach (['total' => ['Total', 'M4 5h16v15H4z M8 2v6 M16 2v6 M4 10h16'], 'completed' => ['Completed', 'm5 12 4 4L19 6'], 'pending' => ['In progress', 'M12 3a9 9 0 1 0 9 9 M12 7v5l3 2'], 'overdue' => ['Overdue', 'M12 8v5 M12 17h.01 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18']] as $key => [$label, $path])
    <button type="button" class="app-task-stat" data-app-stat="{{ $key }}" aria-pressed="false">
        <span class="app-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="{{ $path }}"/></svg></span>
        <span><span class="app-stat-label">{{ $label }}</span><strong id="stat-{{ $key }}">0</strong></span>
    </button>
    @endforeach
</section>
<section class="app-tasks-workspace" aria-labelledby="tasks-heading">
    <h2 id="tasks-heading" class="app-sr-only">Task board</h2>
    <div class="app-task-toolbar">
        <div class="app-status-control" role="group" aria-label="Status">
            <button type="button" data-filter="" aria-pressed="true">All <span id="count-all">0</span></button>
            <button type="button" data-filter="pending" aria-pressed="false">Pending <span id="count-pending">0</span></button>
            <button type="button" class="app-mobile-only" data-filter="in_progress" aria-pressed="false">In Progress <span id="count-in-progress">0</span></button>
            <button type="button" data-filter="completed" aria-pressed="false">Completed <span id="count-completed">0</span></button>
        </div>
        <label class="app-toolbar-field" for="priority-filter">Priority<select id="priority-filter" class="input"><option value="">Any priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
        <label class="app-toolbar-field app-mobile-only" for="due-filter">Due date<select id="due-filter" class="input"><option value="">Any</option><option value="today">Today</option><option value="overdue">Overdue</option><option value="week">This week</option><option value="none">No deadline</option></select></label>
        <label class="app-toolbar-field" for="sort-filter">Sort by<select id="sort-filter" class="input"><option value="priority">Default (priority)</option><option value="deadline">Deadline first</option></select></label>
    </div>
    <div id="app-filter-chips" class="app-filter-chips" aria-label="Active filters" hidden></div>
    <p id="app-task-announcement" class="app-sr-only" aria-live="polite" aria-atomic="true"></p>
    <div id="list-error" class="app-task-error" role="alert" hidden></div>
    <div id="app-task-empty" class="app-task-empty" hidden></div>
    <div id="task-list-view" hidden><div id="task-list" class="app-task-list" aria-busy="true"></div></div>
    <div id="task-board-container" class="app-task-board" tabindex="0" aria-label="Task board. Scroll horizontally to see more columns." aria-busy="true">
        @foreach (['todo' => 'To do', 'inprogress' => 'In progress', 'review' => 'Review', 'completed' => 'Completed'] as $key => $label)
        <section class="app-board-column" data-column="{{ $key }}" aria-label="{{ $label }}">
            <header class="app-column-header"><h3><span class="app-stage-dot app-stage-{{ $key }}" aria-hidden="true"></span>{{ $label }}</h3><span id="count-kanban-{{ $key }}" class="app-column-count">0</span></header>
            <button type="button" class="app-column-add" data-add-column="{{ $key }}" aria-label="Add task to {{ $label }}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14 M5 12h14"/></svg>Add task</button>
            <div id="cards-kanban-{{ $key }}" class="app-column-cards"></div>
        </section>
        @endforeach
    </div>
</section>
@endsection
