<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class EmailVerificationController extends Controller
{
    public function notice(Request $request): View|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('tasks');
        }

        return view('auth.verify-email');
    }

    public function verify(Request $request): View|RedirectResponse
    {
        $user = $request->user();
        $hash = (string) $request->route('hash');

        if ((string) $request->route('id') !== (string) $user->getKey()
            || ! $request->hasValidSignature()
            || ! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return view('auth.verify-invalid');
        }

        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->route('tasks')->with('status', 'Email confirmed. Welcome to Task Tracker.');
    }

    public function send(Request $request): RedirectResponse
    {
        if (! $request->user()->hasVerifiedEmail()) {
            $request->user()->notify(new QueuedVerifyEmail());
        }

        return back()->with('status', 'A new link is on its way.');
    }

    public function status(Request $request): JsonResponse
    {
        return response()->json(['verified' => $request->user()->hasVerifiedEmail()]);
    }

    public function restart(Request $request): RedirectResponse
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('register');
    }
}
