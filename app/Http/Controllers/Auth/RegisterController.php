<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class RegisterController extends Controller
{
    public function create(): View { return view('auth.register'); }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password'])]);
        Auth::login($user);
        $request->session()->regenerate();
        $user->notify(new QueuedVerifyEmail());

        return redirect()->route('verification.notice');
    }
}
