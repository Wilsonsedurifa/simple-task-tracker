<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class SavePetRequest extends JsonFormRequest
{
    public function rules(): array
    {
        $editing = $this->isMethod('PATCH');
        return [
            'species' => [$editing ? 'sometimes' : 'required', 'required', 'string', Rule::in(config('pets.species'))],
            'name' => [$editing ? 'sometimes' : 'required', 'required', 'string', 'max:20', function (string $attribute, mixed $value, \Closure $fail): void {
                if (is_string($value) && preg_match('/^\s*$/u', $value)) {
                    $fail('The name field is required.');
                }
            }],
        ];
    }
}
