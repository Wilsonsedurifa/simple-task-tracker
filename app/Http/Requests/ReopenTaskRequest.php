<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Gate;

class ReopenTaskRequest extends JsonFormRequest
{
    public function authorize(): bool
    {
        Gate::authorize('update', $this->route('task'));

        return true;
    }

    public function rules(): array
    {
        return ['stage' => ['sometimes', 'required', 'in:todo,in_progress,review']];
    }
}
