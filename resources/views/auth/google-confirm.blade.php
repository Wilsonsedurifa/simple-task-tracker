@extends('layouts.auth')
@section('title', 'Confirm your account | Simple Task Tracker')
@section('content')
<section class="continue-card username-setup" aria-labelledby="setup-heading">
    <span class="setup-icon" aria-hidden="true">✦</span>
    <p class="auth-label">Welcome to Simple Task Tracker</p>
    <h1 id="setup-heading">What should we call you?</h1>
    <p>A little introduction before we begin. Choose a username so others can find you.</p>
    <div class="setup-identity"><strong>{{ $identity['name'] }}</strong><span>{{ $identity['email'] }}</span></div>
    <form method="POST" action="{{ route('auth.google.confirm.store') }}">
        @csrf
        <label class="continue-username-label" for="username">Your username</label>
        <div class="setup-input-wrap"><span aria-hidden="true">@</span><input class="continue-username-input" id="username" name="username" value="{{ old('username') }}" placeholder="your_username" minlength="3" maxlength="30" autocomplete="username" required autofocus aria-describedby="setup-help"></div>
        <p id="setup-help" class="continue-username-help">3–30 letters, numbers, or underscores. You can change this later.</p>
        @error('username') <p class="field-error" role="alert">{{ $message }}</p> @enderror
        <p class="setup-consent">By continuing, you’ll create an account using the Google account above.</p>
        <button class="auth-button" type="submit">Create my account</button>
        <a class="setup-cancel" href="{{ route('auth.google.register') }}">Use another Google account</a>
    </form>
</section>
@endsection
