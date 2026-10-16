<?php

namespace App\Http\Requests;

class UpdateProfileRequest extends JsonFormRequest
{
    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255']];
    }
}
