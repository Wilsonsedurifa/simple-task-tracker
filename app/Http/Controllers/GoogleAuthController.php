<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirectToLogin(Request $request): RedirectResponse
    {
        return $this->redirect($request, 'login');
    }

    public function redirectToRegister(Request $request): RedirectResponse
    {
        return $this->redirect($request, 'register');
    }

    public function callback(Request $request, \App\Services\GoogleLoginService $service): RedirectResponse
    {
        // pull() makes the intent valid for one callback only. A missing or invalid
        // value deliberately becomes "login", which can never create an account.
        $intent = $this->pullIntent($request);

        if ($request->filled('error')) {
            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Hindi natuloy ang Google sign-in. Subukan ulit.']);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException) {
            Log::warning('Google OAuth callback had an invalid state.', ['ip' => $request->ip()]);

            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Nag-expire ang Google sign-in session. Subukan ulit.']);
        } catch (Throwable $exception) {
            Log::error('Google OAuth callback failed.', [
                'exception' => $exception::class,
                'ip' => $request->ip(),
            ]);

            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Hindi makumpleto ang Google sign-in ngayon. Subukan ulit.']);
        }

        $googleId = trim((string) $googleUser->getId());
        $email = strtolower(trim((string) $googleUser->getEmail()));
        $rawUser = $googleUser->getRaw();
        $emailVerified = filter_var($rawUser['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($googleId === '' || $email === '' || ! $emailVerified) {
            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Kailangan ng verified email address mula sa Google.']);
        }

        try {
            return $service->authenticate($request, $intent, $googleId, $email, trim((string) ($googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User')));
        } catch (Throwable $exception) {
            Log::error('Google account processing failed.', [
                'exception' => $exception::class,
                'ip' => $request->ip(),
            ]);

            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Hindi makumpleto ang Google sign-in ngayon. Subukan ulit.']);
        }
    }

    private function redirect(Request $request, string $intent): RedirectResponse
    {
        $request->session()->put('google_auth_intent', $intent);

        try {
            return Socialite::driver('google')->redirect();
        } catch (Throwable $exception) {
            $request->session()->forget('google_auth_intent');
            Log::error('Google OAuth redirect failed.', ['exception' => $exception::class, 'ip' => $request->ip()]);

            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Hindi masimulan ang Google sign-in ngayon. Subukan ulit.']);
        }
    }

    private function pullIntent(Request $request): string
    {
        return $request->session()->pull('google_auth_intent') === 'register'
            ? 'register'
            : 'login';
    }

    private function backToIntent(string $intent): RedirectResponse
    {
        return redirect()->route($intent === 'register' ? 'register' : 'login');
    }

}
