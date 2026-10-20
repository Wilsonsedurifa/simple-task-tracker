<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireUsername
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && blank($request->user()->username)
            && ! $request->routeIs('continue', 'continue.store', 'logout', 'session.expired')) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Choose a username before opening your workspace.', 'redirect' => route('continue')], 403);
            }

            return redirect()->route('continue');
        }

        return $next($request);
    }
}
