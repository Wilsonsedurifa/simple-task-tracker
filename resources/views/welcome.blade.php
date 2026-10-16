<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="csrf-token" content="{{ csrf_token() }}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#09172f"><link rel="icon" href="data:,">
    <title>Simple Task Tracker</title>
    @include('layouts.partials.theme-boot')
    @vite(['resources/css/tasks.css', 'resources/js/tasks.js'])
</head>
<body class="app-public app-welcome">
    <a class="db-skip" href="#main">Skip to content</a>
    <main id="main" class="app-welcome-content" tabindex="-1">
        <span class="app-welcome-logo" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="6"><rect x="10" y="9" width="44" height="46" rx="12"/><path d="m20 32 9 9 17-19"/></svg></span>
        <h1>Simple <span>Task Tracker</span></h1><p>Organize your tasks,<br>get more done.</p>
        <div class="app-welcome-actions"><a href="{{ route('register') }}" class="button button-primary">Get Started <span aria-hidden="true">→</span></a><p>Already have an account? <a href="{{ route('login') }}">Login</a></p></div>
    </main><div class="app-welcome-waves" aria-hidden="true"></div>
    @include('layouts.partials.offline')
</body></html>
