<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmGoogleRegistrationRequest;
use App\Services\GoogleLoginService;
use Illuminate\Http\Request;

class GoogleRegistrationController extends Controller
{
    public function create(Request $request)
    {
        $identity = $request->session()->get('google_registration');
        if (! $identity || $identity['expires_at'] <= now()->timestamp) {
            return redirect()->route('register')->withErrors(['email' => 'Please select your Google account again.']);
        }

        return view('auth.google-confirm', ['identity' => $identity]);
    }

    public function store(ConfirmGoogleRegistrationRequest $request, GoogleLoginService $service)
    {
        return $service->confirm($request, $request->validated('username'));
    }
}
