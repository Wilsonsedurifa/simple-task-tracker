<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateProfileRequest extends JsonFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'deadline_emails' => ['sometimes', 'required', 'boolean'],
            'timezone' => ['sometimes', 'required', 'timezone'],
            'username' => ['sometimes', 'required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_]+$/', Rule::unique('users')->ignore($this->user()->id)],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('username')) {
            $this->merge(['username' => strtolower(trim((string) $this->input('username')))]);
        }
    }
}
