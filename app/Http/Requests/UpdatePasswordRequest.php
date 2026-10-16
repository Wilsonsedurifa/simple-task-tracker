<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Hash;

class UpdatePasswordRequest extends JsonFormRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['bail', 'required', 'string', 'min:8', 'confirmed', function (string $attribute, mixed $value, \Closure $fail): void {
                // Bcrypt otherwise truncates long passwords or throws on NUL bytes.
                if (str_contains($value, "\0")) {
                    $fail('The password must not contain null characters.');
                } elseif (Hash::getDefaultDriver() === 'bcrypt' && strlen($value) > 72) {
                    $fail('The password must not exceed 72 bytes with this server’s password hashing method.');
                }
            }],
        ];
    }
}
