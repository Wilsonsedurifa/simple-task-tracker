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
        @include('tasks.settings.appearance')
        @include('tasks.settings.preferences')
        @include('tasks.settings.account')
        @include('tasks.settings.data')
        <p id="app-settings-status" class="app-settings-help" role="status" aria-live="polite"></p>
    </div>
</div>
@endsection
