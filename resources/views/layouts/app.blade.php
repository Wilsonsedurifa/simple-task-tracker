<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="app-timezone" content="{{ config('app.timezone', 'UTC') }}">
    <meta name="color-scheme" content="light dark">
    <link rel="icon" href="data:,">
    <meta name="theme-color" content="#f8fafc">
    <title>@yield('title', 'Simple Task Tracker')</title>
    <script>(()=>{const r=document.documentElement,d=matchMedia('(max-width:767px)').matches?'light':'system';let m=d,a;const sets={kawaii:['pink','lavender','mint','peach','babyblue'],racing:['red','amber','sky']},normal=['blue','emerald','violet','amber','sky'];try{m=localStorage.getItem('task-tracker-theme')||m;if(!['light','dark','system','kawaii','racing'].includes(m))m=d;a=localStorage.getItem('task-accent-'+m)}catch{}const allowed=sets[m]||normal;r.dataset.themeMode=m;r.dataset.theme=m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;r.dataset.accent=allowed.includes(a)?a:allowed[0]})()</script>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/tasks.css', 'resources/js/tasks.js'])
</head>
<body class="app-body app-workspace" data-page="@yield('page')" data-app-user-id="{{ auth()->id() }}" data-app-unread-count="0">
    <a class="db-skip" href="#main">Skip to content</a>
    <div class="app-shell">
        @include('tasks.partials.sidebar')
        <div class="main-wrapper">
            @include('tasks.partials.mobile-header')
            @include('tasks.partials.topbar')
            <main id="main" class="dashboard-content" tabindex="-1">
                <header class="app-page-title"><div><h1 id="@yield('heading-id','app-page-heading')">@yield('heading')</h1><p>@yield('subtitle')</p></div>@yield('page-actions')</header>
                @yield('content')
            </main>
        </div>
    </div>
    @include('tasks.partials.workspace-dialogs')
    <dialog id="logout-modal" class="modal" aria-labelledby="logout-title"><form method="POST" action="{{ route('logout') }}" class="modal-body">@csrf<div class="db-dialog-icon" aria-hidden="true">&#8599;</div><h2 id="logout-title" class="modal-title">Taking a break?</h2><p class="modal-text">Your tasks are saved. You can pick up where you left off when you return.</p><div class="modal-actions"><button id="cancel-logout" type="button" class="button button-secondary">Stay here</button><button type="submit" class="button button-danger">Log out</button></div></form></dialog>
    @include('tasks.partials.appearance')
    @include('tasks.partials.mobile-navigation')
    @include('tasks.partials.notification-dropdown')
    <div id="toasts" class="toasts" aria-live="polite"></div>
    @include('tasks.partials.pet-adoption')
    @include('layouts.partials.offline', ['appHasToasts' => true])
</body>
</html>
