@php
    $appProfileParts = preg_split('/\s+/u', trim(auth()->user()->name), -1, PREG_SPLIT_NO_EMPTY);
    $appProfileInitials = mb_strtoupper(mb_substr($appProfileParts[0] ?? '', 0, 1).(count($appProfileParts)>1 ? mb_substr(end($appProfileParts),0,1) : ''));
@endphp
<section id="app-mobile-profile" class="app-mobile-profile" aria-label="Your profile" hidden>
    <div class="app-profile-identity"><span class="app-profile-avatar" aria-hidden="true">{{ $appProfileInitials }}</span><div><h2 data-app-profile-name>{{ auth()->user()->name }}</h2><p title="{{ auth()->user()->email }}">{{ auth()->user()->email }}</p></div><a href="{{ route('settings') }}#appearance" class="app-mobile-icon-button" aria-label="Open Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg></a></div>
    <nav class="app-profile-links" aria-label="Profile shortcuts">
        @foreach (['tasks'=>'My Tasks','calendar'=>'Calendar','notifications'=>'Notifications','settings'=>'Settings','pet'=>'My pet'] as $appProfileRoute=>$appProfileLabel)
        @if(Route::has($appProfileRoute))
        <a href="{{ route($appProfileRoute) }}{{ $appProfileRoute==='settings' ? '#appearance' : '' }}" @if($appProfileRoute==='notifications') data-app-notifications @endif @if($appProfileRoute==='pet') data-app-pet-nav @endif><svg class="app-profile-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="{{ ['tasks'=>'M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1','calendar'=>'M8 2v5M16 2v5M3 10h18M5 5h14v16H5z','notifications'=>'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4','settings'=>'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 9v6M9 12h6','pet'=>'M7 10 5 3 3 12v5a9 5 0 0 0 18 0v-5L19 3l-2 7'][ $appProfileRoute ] }}"/></svg><span>{{ $appProfileLabel }}</span>@if($appProfileRoute==='notifications')<span class="app-notification-count" data-app-unread hidden aria-hidden="true"></span>@endif<svg class="app-profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></a>
        @endif
        @endforeach
    </nav>
    <section class="app-profile-stats-card" aria-labelledby="app-profile-stats-heading"><h2 id="app-profile-stats-heading">Quick Stats</h2><div id="app-profile-stats" class="app-profile-stats" aria-live="polite"></div></section>
    <div class="app-profile-links"><button type="button" data-app-appearance aria-haspopup="dialog" aria-controls="app-appearance">Appearance<svg class="app-profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button><button type="button" data-app-open-logout>Log out<svg class="app-profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 4H5v16h4M14 8l4 4-4 4M8 12h10"/></svg></button></div>
</section>
