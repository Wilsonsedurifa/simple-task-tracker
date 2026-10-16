@php
    $appMobileNameParts = preg_split('/\s+/u', trim(auth()->user()->name), -1, PREG_SPLIT_NO_EMPTY);
    $appMobileInitials = mb_strtoupper(mb_substr($appMobileNameParts[0] ?? '', 0, 1).(count($appMobileNameParts) > 1 ? mb_substr(end($appMobileNameParts), 0, 1) : ''));
@endphp
<header class="app-mobile-header" data-app-mobile-header data-app-mobile-name="{{ $appMobileNameParts[0] ?? '' }}">
    <div class="app-mobile-heading-row">
        <button id="app-more-button" type="button" class="app-mobile-icon-button" aria-label="More navigation" aria-haspopup="dialog" aria-controls="app-more" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span class="app-notification-count app-mobile-menu-count" data-app-unread hidden aria-hidden="true"></span></button>
        <div class="app-mobile-heading-copy">@if(request()->routeIs('dashboard'))<p id="app-mobile-greeting">Hello,</p><h1 id="app-mobile-title">{{ $appMobileNameParts[0] ?? '' }}</h1>@else<h1 id="app-mobile-title">{{ ['settings'=>'Profile','pet'=>'My pet','tasks'=>'Tasks','calendar'=>'Calendar','notifications'=>'Notifications'][request()->route()->getName()] ?? trim($__env->yieldContent('heading')) }}</h1>@endif</div>
        <a href="{{ route('settings') }}#profile" class="app-mobile-avatar" aria-label="Your profile">{{ $appMobileInitials }}</a>
    </div><div class="app-mobile-control-slot" data-app-mobile-controls></div>
</header>
