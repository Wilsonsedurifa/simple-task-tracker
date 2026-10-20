<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Gate;

class UpdateTaskRequest extends StoreTaskRequest
{
    public function authorize(): bool
    {
        Gate::authorize('update', $this->route('task'));

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
