@extends('layouts.app')
@section('title', 'Pet | Simple Task Tracker')
@section('page', 'pet')
@section('heading', 'A little companion, a little progress.')
@section('subtitle', 'Small steps together. Your pet never gets sick, and always welcomes you back.')
@section('content')
<p id="app-pet-hidden-note" class="app-dashboard-card" hidden>Your pet is hidden. You can show your companion again in <a href="{{ route('settings') }}#preferences">Settings</a>.</p>
<div class="app-pet-page-layout">
    @include('tasks.partials.pet-widget', ['appPetCompact' => false])
    <div class="app-pet-page-details" id="app-pet-details" hidden>
        <section class="app-dashboard-card"><h2>Your journey together</h2><dl id="app-pet-stats" class="app-pet-stats"></dl><p id="app-pet-unlock" class="app-pet-speech"></p></section>
        <section class="app-dashboard-card"><h2>Make it personal</h2><p class="app-settings-help">Rename or change species whenever you like. Your XP and progress are kept.</p><form id="app-pet-edit-form" class="app-settings-form" novalidate><div class="field"><label for="app-pet-edit-name">Pet name</label><input id="app-pet-edit-name" class="input" name="name" required maxlength="20" aria-describedby="app-pet-edit-help"><p id="app-pet-edit-help" class="app-settings-help">Required, up to 20 characters.</p></div><div class="field"><label for="app-pet-edit-species">Species</label><select id="app-pet-edit-species" class="input" name="species">@foreach(config('pets.species') as $appSpecies)<option value="{{ $appSpecies }}">{{ ucfirst($appSpecies) }}</option>@endforeach</select></div><p data-app-pet-form-error class="app-field-error" role="alert" hidden></p><button type="submit" class="button button-primary">Save pet</button></form></section>
    </div>
</div>
<section id="app-pet-roadmap-section" class="app-dashboard-card app-pet-roadmap-section" hidden><h2>Seven stages, your own pace</h2><ol id="app-pet-roadmap" class="app-pet-roadmap"></ol></section>
<section id="app-pet-badges-section" class="app-dashboard-card app-pet-roadmap-section" hidden><h2>Little milestones</h2><p class="app-settings-help">Milestones reflect your current tasks and your pet’s recorded progress.</p><div id="app-pet-badges" class="app-pet-badges"></div></section>
@endsection
