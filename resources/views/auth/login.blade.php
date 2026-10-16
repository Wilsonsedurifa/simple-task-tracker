@extends('layouts.auth')

@section('title', 'Log in | Task Tracker')

@section('content')
    <section class="auth-intro">
        <p class="auth-label">Task Tracker</p>
        <h1><span>Welcome back.</span><em>Your list is waiting.</em></h1>
        <p>Get back to the next thing that needs your attention.</p>
        @include('auth.partials.sorting-mockup')
    </section>

    <section class="auth-card" aria-labelledby="login-heading">
        <p class="auth-label">Log in</p>
        <h1 id="login-heading">Pick up where you left off.</h1>

        <form method="POST" action="{{ route('login.store') }}">
            @csrf
            <label for="email">Email<input id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="email" required autofocus></label>
            @error('email') <p class="field-error">{{ $message }}</p> @enderror

            <label for="password">Password</label>
            <div class="password-field">
                <input id="password" name="password" type="password" autocomplete="current-password" required>
                <button class="password-toggle" type="button" data-password-toggle="password" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
            @error('password') <p class="field-error">{{ $message }}</p> @enderror

            <label class="check" for="remember"><input id="remember" type="checkbox" name="remember"><span>Remember me</span></label>
            <button class="auth-button" type="submit">Log in</button>
        </form>

        <div class="divider" aria-hidden="true"><span>or</span></div>
        <a class="btn-google" href="{{ route('auth.google.login') }}">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.28c0-.78-.07-1.53-.2-2.25H12v4.26h5.23a4.47 4.47 0 0 1-1.94 2.93v2.77h3.57c2.09-1.92 3.29-4.75 3.29-7.71Z"/><path fill="#34A853" d="M12 21.78c2.62 0 4.82-.87 6.43-2.35l-3.57-2.77c-.87.58-1.98.92-3.12.92-2.4 0-4.44-1.62-5.17-3.8H2.9v2.85A9.72 9.72 0 0 0 12 21.78Z"/><path fill="#FBBC05" d="M6.83 13.78A5.86 5.86 0 0 1 6.5 12c0-.62.12-1.22.33-1.78V7.37H2.9A9.74 9.74 0 0 0 2 12c0 1.57.38 3.06.9 4.63l3.93-2.85Z"/><path fill="#EA4335" d="M12 6.42c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.81 3.46 14.62 2.22 12 2.22A9.72 9.72 0 0 0 2.9 7.37l3.93 2.85c.73-2.18 2.77-3.8 5.17-3.8Z"/></svg>
            <span>Continue with Google</span>
        </a>
        <p class="auth-switch">No account yet? <a href="{{ route('register') }}">Create one</a></p>
    </section>
@endsection
