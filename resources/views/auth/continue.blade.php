@extends('layouts.auth')

@section('title', 'Continue | Task Tracker')

@section('content')
    <section class="continue-card" aria-labelledby="continue-heading">
        <p class="auth-label">You are signed in</p>
        <h1 id="continue-heading">Ready to manage your <em>tasks?</em></h1>
        <p>Press Continue when you are ready to open your workspace.</p>

        <form method="POST" action="{{ route('continue.store') }}">
            @csrf
            <button class="auth-button" type="submit">Continue</button>
        </form>
    </section>
@endsection
