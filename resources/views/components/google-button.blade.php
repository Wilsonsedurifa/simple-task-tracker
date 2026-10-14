@props(['intent' => 'login', 'label' => 'Sign in with Google'])

<a class="button button-secondary button-block google-auth-button" href="{{ route($intent === 'register' ? 'auth.google.register' : 'auth.google.login') }}" aria-label="{{ $label }}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.4h3.2c1.9-1.8 3-4.3 3-7.1Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2H3.1v2.5A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.7V7.6H3.1a10 10 0 0 0 0 8.9l3.3-2.7Z"/><path fill="#EA4335" d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.6l3.3 2.5C7.2 7.8 9.4 6 12 6Z"/></svg>
    <span>{{ $label }}</span>
</a>
