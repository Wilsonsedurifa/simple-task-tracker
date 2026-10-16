<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoogleLoginService
{
    public function __construct(private GoogleAccountService $accounts) {}

    public function authenticate(Request $request, string $intent, string $googleId, string $email, string $name): RedirectResponse
    {
        $existingUser = $this->accounts->findExistingUser($googleId, $email);

        if ($intent === 'login') {
            if (! $existingUser) {
                return redirect()->route('login')
                    ->withErrors(['email' => 'No account is linked to this Google account. Please sign up first.'])
                    ->with('google_register_link', true)
                    ->withInput(['email' => $email]);
            }

            // A verified Google email may safely link an already-existing local account.
            $user = $this->accounts->linkGoogleAccountIfNeeded($existingUser, $googleId, $email);

            return $this->login($request, $user);
        }

        // Register must never sign in or relink an existing account.
        if ($existingUser) {
            return $this->existingAccountResponse($email);
        }

        try {
            $user = $this->accounts->createFromGoogle($intent, [
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


    private function existingAccountResponse(string $email): RedirectResponse
    {
        return redirect()->route('login')
            ->with('status', 'May account ka na. Mag-login na lang.')
            ->withInput(['email' => strtolower(trim($email))]);
    }


    private function login(Request $request, User $user): RedirectResponse
    {
        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('continue');
    }

}
