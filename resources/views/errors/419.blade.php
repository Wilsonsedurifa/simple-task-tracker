@extends('layouts.error')
@section('title', 'Please reload')
@section('content')
<h1>Let's refresh.</h1><p>Your session token has expired. Reload the page before trying again. Changes already saved are safe.</p>
@php
    $returnTo = request()->query('return_to', '/dashboard');
    $returnTo = is_string($returnTo) && str_starts_with($returnTo, '/') && !str_starts_with($returnTo, '//') && !str_contains($returnTo, '\\') ? $returnTo : '/dashboard';
@endphp
<a class="button button-primary" href="{{ $returnTo }}">Reload page</a>
@endsection
