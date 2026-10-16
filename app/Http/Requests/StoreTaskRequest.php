<?php

namespace App\Http\Requests;

class StoreTaskRequest extends JsonFormRequest
{
    public function rules(): array
    {
        return $this->taskRules();
    }

    protected function taskRules(bool $partial = false): array
    {
        return [
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'priority' => [$partial ? 'sometimes' : 'required', 'in:low,medium,high'],
            'stage' => ['sometimes', 'required', 'in:todo,in_progress,review'],
            'due_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:today'],
        ];
    }
}
