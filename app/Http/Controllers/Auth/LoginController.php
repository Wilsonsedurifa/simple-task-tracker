<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\View\View;

class LoginController extends Controller
{
    public function create(): View { return view('auth.login'); }

    public function store(LoginRequest $request): RedirectResponse
    {
        $key = 'login:'.strtolower($request->string('email')->toString()).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return redirect()->route('login')->withErrors(['email' => 'Please wait '.RateLimiter::availableIn($key).' seconds before trying again.'])->onlyInput('email');
        }
        if (! Auth::attempt($request->safe()->only(['email', 'password']), $request->boolean('remember'))) {
            RateLimiter::hit($key, 60);
            return redirect()->route('login')->withErrors(['email' => 'These credentials do not match our records.'])->onlyInput('email');
        }
        RateLimiter::clear($key);
        $request->session()->regenerate();
        return redirect()->route('continue');
    }
}
