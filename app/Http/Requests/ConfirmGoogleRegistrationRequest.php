<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmGoogleRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['username' => strtolower(trim((string) $this->input('username')))]);
    }

    public function rules(): array
    {
        return ['username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_]+$/', 'unique:users,username']];
    }
}
