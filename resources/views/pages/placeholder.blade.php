@extends('layouts.app')
@section('title', $pageTitle.' | Simple Task Tracker')
@section('page', $pageKey)
@section('heading', $pageTitle)
@section('subtitle', 'Your workspace, one place for everything.')
@section('content')

@if ($pageKey === 'settings')
<section class="app-dashboard-card app-calendar-setting" aria-labelledby="app-calendar-setting-heading">
    <h2 id="app-calendar-setting-heading">Calendar preferences</h2>
    <p id="app-week-start-hint">Choose the first day of the week. This preference is saved in this browser.</p>
    <label class="label" for="app-week-start">Week starts on</label>
    <select id="app-week-start" class="input" aria-describedby="app-week-start-hint"><option value="monday">Monday</option><option value="sunday">Sunday</option></select>
    <p id="app-settings-status" role="status" aria-live="polite"></p>
</section>
@else
<section class="panel app-placeholder" aria-label="{{ $pageTitle }}">
    <p>This section is reserved for the next implementation phase. Your tasks are available on My tasks.</p>
    <a class="button button-secondary" href="{{ route('tasks') }}">Open My tasks</a>
</section>
@endif
@endsection
