<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdatePasswordRequest;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    public function profile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json(['message' => 'Profile updated.', 'user' => $user->only(['id', 'name', 'email'])]);
    }

    public function password(UpdatePasswordRequest $request): JsonResponse
    {
        $request->user()->forceFill([
            'password' => Hash::make($request->validated()['password']),
            'remember_token' => Str::random(60),
        ])->save();
        $request->session()->regenerate();

        return response()->json(['message' => 'Password changed.']);
    }
}
