@extends('layouts.auth')
@section('title', 'That link has expired | Task Tracker')
@section('content')
<section class="verify-card"><p class="auth-label">Email confirmation</p><h1>That link is no longer <em>valid.</em></h1><p>It may have expired, already been used, or been copied incompletely. We can send a fresh link.</p><form class="verify-actions" method="POST" action="{{ route('verification.send') }}">@csrf<button class="auth-button" type="submit">Send me a new link</button></form></section>
@endsection
