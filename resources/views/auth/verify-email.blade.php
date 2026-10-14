@extends('layouts.auth')
@section('title', 'Check your email | Task Tracker')
@section('content')
<section class="verify-card" data-verification-status-url="{{ route('verification.status') }}" data-tasks-url="{{ route('tasks') }}"><p class="auth-label">One last step</p><h1>Check your <em>inbox.</em></h1><p>We sent a confirmation link to</p><p class="verify-email">{{ auth()->user()->email }}</p>
@if (session('status'))<p class="verify-status" role="status">{{ session('status') }}</p>@endif
<ol class="verify-steps"><li><b>01</b><span>Open the email we just sent.</span></li><li><b>02</b><span>Press &ldquo;Confirm my email&rdquo;.</span></li><li><b>03</b><span>You land right back in your list.</span></li></ol>
<div class="verify-actions"><form method="POST" action="{{ route('verification.send') }}" data-resend-form>@csrf<button class="auth-button" type="submit" data-resend-button>Resend email</button></form></div><p class="verify-note">Can't find it? Check your spam folder.</p><form class="restart-form" method="POST" action="{{ route('verification.restart') }}">@csrf<button type="submit">Wrong email? Start over</button></form></section>
@endsection
