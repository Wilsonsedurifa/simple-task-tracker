@extends('layouts.auth')

@section('title', 'Continue | Task Tracker')

@section('content')
    <section class="continue-card username-setup" aria-labelledby="continue-heading">
        <span class="setup-icon" aria-hidden="true">@</span>
        <p class="auth-label">You are signed in</p>
        <h1 id="continue-heading">Choose your <em>username.</em></h1>
        <p>This is how others can find you and invite you to collaborate on tasks.</p>

        <form method="POST" action="{{ route('continue.store') }}">
            @csrf
            <label class="continue-username-label" for="continue-username">Username</label>
            <div class="setup-input-wrap"><span aria-hidden="true">@</span><input class="continue-username-input" id="continue-username" name="username" type="text" value="{{ old('username', auth()->user()->username) }}" autocomplete="username" minlength="3" maxlength="30" pattern="[A-Za-z0-9_]+" aria-describedby="continue-username-help" required autofocus></div>
            <p id="continue-username-help" class="continue-username-help">Use 3–30 letters, numbers, or underscores. People can search for you using @username.</p>
            @error('username') <p class="field-error" role="alert">{{ $message }}</p> @enderror
            <button class="auth-button" type="submit">Continue</button>
        </form>
    </section>
@endsection
