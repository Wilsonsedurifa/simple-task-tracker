@extends('layouts.error')
@section('title', 'Page not found')
@section('content')
<h1>404</h1><h2>This page is not here.</h2><p>The link may have changed. Your workspace is still waiting for you.</p>
<a class="button button-primary" href="{{ auth()->check() ? route('dashboard') : route('login') }}">Back to {{ auth()->check() ? 'dashboard' : 'login' }}</a>
@endsection
