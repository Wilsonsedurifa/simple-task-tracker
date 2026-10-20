<?php

namespace App\Http\Requests;

class StoreTaskInvitationRequest extends JsonFormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required_without:user_id', 'email:rfc', 'max:255'],
            'user_id' => ['required_without:email', 'integer', 'exists:users,id'],
            'role' => ['required', 'in:editor,viewer'],
        ];
    }
}
