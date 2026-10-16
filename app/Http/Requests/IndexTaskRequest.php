<?php

namespace App\Http\Requests;

class IndexTaskRequest extends JsonFormRequest
{
    public function validationData(): array
    {
        return $this->query();
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'in:pending,completed'],
            'sort' => ['nullable', 'in:priority,deadline'],
        ];
    }
}
