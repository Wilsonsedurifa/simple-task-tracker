<?php

namespace App\Http\Requests;

class ReopenTaskRequest extends JsonFormRequest
{
    public function authorize(): bool
    {
        abort_unless($this->route('task')->user_id === $this->user()->id, 404);

        return true;
    }

    public function rules(): array
    {
        return ['stage' => ['sometimes', 'required', 'in:todo,in_progress,review']];
    }
}
