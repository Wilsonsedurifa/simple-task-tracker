@extends('layouts.app')
@section('title', 'Dashboard | Simple Task Tracker')
@section('page', 'dashboard')
@section('heading', 'Your day, at a glance.')
@section('heading-id', 'db-greeting')
@section('subtitle', 'A little clarity for the day ahead.')
@section('page-actions')<span id="db-date" class="db-date-pill"></span>@endsection
@section('content')
<div id="db-summary-error" class="app-task-error" role="alert" hidden></div>
@include('tasks.dashboard.stats')
<div class="app-dashboard-grid">
    @include('tasks.partials.mobile-home')
    <div class="app-dashboard-main">
@include('tasks.dashboard.quick-add')
@include('tasks.dashboard.summary')
        <section class="app-dashboard-card" aria-labelledby="app-inprogress-heading">
            <div class="app-dashboard-heading"><h2 id="app-inprogress-heading">In progress <span id="app-inprogress-count" class="app-column-count">0</span></h2><a class="app-dashboard-link" href="{{ route('tasks', ['view'=>'board']) }}">View board <span aria-hidden="true">→</span></a></div>
            <div id="app-inprogress-cards" class="app-inprogress-cards" aria-busy="true"><div class="app-task-skeleton"></div><div class="app-task-skeleton"></div></div>
        </section>
    </div>
@include('tasks.dashboard.side-panel')
</div>
@endsection
