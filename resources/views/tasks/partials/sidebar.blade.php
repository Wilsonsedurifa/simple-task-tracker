<aside class="sidebar app-sidebar" id="sidebar" aria-label="Workspace navigation">
    <div class="sidebar-header app-sidebar-header">
        <a class="brand app-brand" href="{{ route('dashboard') }}" aria-label="Simple Task Tracker home" title="Simple Task Tracker">
            <span class="brand-logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12 4 4 8-9"/></svg></span>
            <span class="brand-text app-brand-text"><span class="brand-title">Simple Task Tracker</span><span class="brand-badge">Your personal workspace</span></span>
        </a>
    </div>
    <nav class="sidebar-nav app-sidebar-nav" aria-label="Main">
        <span class="nav-group-label app-menu-label">Menu</span>
        @php
        $appLinks = [
            'dashboard'=>['Dashboard','M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z'],
            'tasks'=>['Tasks','M8 3h8v4H8z M8 5H5v16h14V5h-3 M8 12h8 M8 16h5'],
            'calendar'=>['Calendar','M8 2v5 M16 2v5 M3 10h18 M5 5h14v16H5z M9 14h2 M13 14h2'],
            'pet'=>['Pet','M8 10 5 3 3 12v5a9 5 0 0 0 18 0v-5L19 3l-3 7 M8 15h.01 M16 15h.01 M10 19h4'],
            'notifications'=>['Notifications','M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10 21h4'],
            'settings'=>['Settings','M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0']
        ];
        @endphp
        @foreach($appLinks as $appRoute=>[$appLabel,$appPath])
        <a href="{{ route($appRoute) }}" class="nav-item app-nav-item {{ request()->routeIs($appRoute) ? 'is-active' : '' }}" title="{{ $appLabel }}" @if($appRoute==='pet') data-app-pet-nav @endif @if($appRoute==='notifications') data-app-notifications @endif @if(request()->routeIs($appRoute)) aria-current="page" @endif>
            <svg class="nav-icon app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ $appPath }}"/></svg>
            <span class="nav-label app-nav-label">{{ $appLabel }}</span>
            @if($appRoute==='tasks')<span id="sidebar-task-count" class="nav-badge app-task-count" hidden>0</span>@endif
            @if($appRoute==='notifications')<span class="app-unread-dot app-notification-count" data-app-unread hidden aria-hidden="true"></span>@endif
        </a>
        @endforeach
    </nav>
    <div class="sidebar-footer app-sidebar-footer">
        @php
            $appNameParts=preg_split('/\s+/u',trim(auth()->user()->name),-1,PREG_SPLIT_NO_EMPTY);
            $appInitials=mb_strtoupper(mb_substr($appNameParts[0] ?? '',0,1).(count($appNameParts)>1?mb_substr(end($appNameParts),0,1):''));
        @endphp
        <div class="app-user-card">
            <span class="user-avatar app-user-avatar" aria-hidden="true">{{ $appInitials }}</span>
            <span class="user-info app-user-info"><span class="user-name">{{ auth()->user()->name }}</span><span class="user-email" title="{{ auth()->user()->email }}">{{ auth()->user()->email }}</span></span>
            <span class="app-account-actions">
                <button id="theme-toggle" type="button" class="app-shell-button" data-app-appearance aria-label="Appearance" title="Appearance" aria-haspopup="dialog" aria-controls="app-appearance"><svg class="app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16 M12 4a8 8 0 0 1 0 16" fill="currentColor"/></svg></button>
                <form id="logout-form" method="POST" action="{{ route('logout') }}">@csrf<button type="submit" class="app-shell-button" aria-label="Log out" title="Log out"><svg class="app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4H5v16h4 M14 8l4 4-4 4 M8 12h10"/></svg></button></form>
            </span>
        </div>
    </div>
</aside>
