<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), ['name' => ['required', 'string', 'max:255']]);
        if ($validator->fails()) {
            return response()->json(['message' => 'The given data was invalid.', 'errors' => $validator->errors()], 400);
        }
        $user = $request->user();
        $user->update($validator->validated());

        return response()->json(['message' => 'Profile updated.', 'user' => $user->only(['id', 'name', 'email'])]);
    }

    public function password(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['bail', 'required', 'string', 'min:8', 'confirmed', function (string $attribute, mixed $value, \Closure $fail): void {
                // Bcrypt otherwise truncates long passwords or throws on NUL bytes.
                if (str_contains($value, "\0")) {
                    $fail('The password must not contain null characters.');
                } elseif (Hash::getDefaultDriver() === 'bcrypt' && strlen($value) > 72) {
                    $fail('The password must not exceed 72 bytes with this server’s password hashing method.');
                }
            }],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'The given data was invalid.', 'errors' => $validator->errors()], 400);
        }
        $request->user()->forceFill([
            'password' => Hash::make($validator->validated()['password']),
            'remember_token' => Str::random(60),
        ])->save();
        $request->session()->regenerate();

        return response()->json(['message' => 'Password changed.']);
    }
}
