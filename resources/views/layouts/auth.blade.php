<!doctype html><html lang="en" data-theme="light"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="csrf-token" content="{{ csrf_token() }}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f8fafc"><link rel="icon" href="data:,">
    <title>@yield('title', 'Simple Task Tracker')</title>
    @include('layouts.partials.theme-boot')
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/tasks.css', 'resources/js/tasks.js'])
</head><body class="app-public app-public-auth">
    <a class="db-skip" href="#main">Skip to content</a>
    <header class="auth-nav"><a href="{{ route('landing') }}" aria-label="Simple Task Tracker welcome"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>Simple Task Tracker</a></header>
    <main class="auth-page" id="main" tabindex="-1">@yield('content')</main>
    @include('layouts.partials.offline')
</body></html>
