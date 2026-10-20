<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContinueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return ['username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_]+$/', Rule::unique('users')->ignore($this->user()->id)]];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['username' => strtolower(trim((string) $this->input('username', $this->user()?->username)))]);
    }
}
