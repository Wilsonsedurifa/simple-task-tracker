<?php

namespace App\Http\Requests;

class UpdateTaskRequest extends StoreTaskRequest
{
    public function authorize(): bool
    {
        abort_unless($this->route('task')->user_id === $this->user()->id, 404);

        return true;
    }

    public function rules(): array
    {
        $rules = $this->taskRules(true);
        // An omitted past deadline must not prevent editing another field.
        if (! $this->has('due_date')) {
            unset($rules['due_date']);
        }

        return $rules;
    }
}
