<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
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

    public function callback(Request $request): RedirectResponse
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
            return $this->completeAuthentication($request, $intent, $googleId, $email, trim((string) ($googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User')));
        } catch (Throwable $exception) {
            Log::error('Google account processing failed.', [
                'exception' => $exception::class,
                'ip' => $request->ip(),
            ]);

            return $this->backToIntent($intent)
                ->withErrors(['email' => 'Hindi makumpleto ang Google sign-in ngayon. Subukan ulit.']);
        }
    }

    private function completeAuthentication(Request $request, string $intent, string $googleId, string $email, string $name): RedirectResponse
    {
        $existingUser = $this->findExistingUser($googleId, $email);

        if ($intent === 'login') {
            if (! $existingUser) {
                return $this->backToIntent('login')
                    ->withErrors(['email' => 'No account is linked to this Google account. Please sign up first.'])
                    ->with('google_register_link', true)
                    ->withInput(['email' => $email]);
            }

            // A verified Google email may safely link an already-existing local account.
            $user = $this->linkGoogleAccountIfNeeded($existingUser, $googleId, $email);

            return $this->login($request, $user);
        }

        // Register must never sign in or relink an existing account.
        if ($existingUser) {
            return $this->existingAccountResponse($email);
        }

        try {
            $user = $this->createFromGoogle($intent, [
                'google_id' => $googleId,
                'email' => $email,
                'name' => $name,
            ]);
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() !== '23000') {
                throw $exception;
            }

            // A second callback can race this one. Treat it as an existing account
            // rather than logging a user in from the register path.
            return $this->existingAccountResponse($email);
        }

        if (! $user) {
            return $this->existingAccountResponse($email);
        }

        return $this->login($request, $user);
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

    private function findExistingUser(string $googleId, string $email): ?User
    {
        return DB::transaction(fn (): ?User => User::query()
            ->where('google_id', $googleId)
            ->lockForUpdate()
            ->first()
            ?? User::query()
                ->where('email', $email)
                ->lockForUpdate()
                ->first());
    }

    private function linkGoogleAccountIfNeeded(User $user, string $googleId, string $email): User
    {
        return DB::transaction(function () use ($user, $googleId, $email): User {
            $lockedUser = User::query()
                ->whereKey($user->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedUser->google_id !== $googleId) {
                $lockedUser->forceFill([
                    'email' => strtolower(trim($email)),
                    'google_id' => $googleId,
                ])->save();
            }

            return $lockedUser;
        });
    }

    /**
     * The explicit guard is intentional: this is the only code path that creates
     * a user from Google, and login intent can never reach it.
     *
     * @param array{google_id: string, email: string, name: string} $attributes
     */
    private function createFromGoogle(string $intent, array $attributes): ?User
    {
        if ($intent !== 'register') {
            throw new \LogicException('Google account creation requires register intent.');
        }

        return DB::transaction(function () use ($attributes): ?User {
            $existingUser = User::query()
                ->where('google_id', $attributes['google_id'])
                ->lockForUpdate()
                ->first()
                ?? User::query()
                    ->where('email', $attributes['email'])
                    ->lockForUpdate()
                    ->first();

            if ($existingUser) {
                return null;
            }

            $user = new User();
            $user->forceFill([
                'name' => $attributes['name'] !== '' ? $attributes['name'] : 'Google User',
                'email' => strtolower(trim($attributes['email'])),
                'google_id' => $attributes['google_id'],
                'email_verified_at' => now(),
                // Google-only users have no password. A random, non-disclosed value
                // keeps the existing non-null database column unchanged.
                'password' => Str::random(64),
            ])->save();

            return $user;
        });
    }

    private function existingAccountResponse(string $email): RedirectResponse
    {
        return redirect()->route('login')
            ->with('status', 'May account ka na. Mag-login na lang.')
            ->withInput(['email' => strtolower(trim($email))]);
    }

    private function backToIntent(string $intent): RedirectResponse
    {
        return redirect()->route($intent === 'register' ? 'register' : 'login');
    }

    private function login(Request $request, User $user): RedirectResponse
    {
        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('continue');
    }
}
