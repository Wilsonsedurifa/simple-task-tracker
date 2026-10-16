<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PetController extends Controller
{
    public function show(Request $request, PetService $service): JsonResponse
    {
        $pet = $request->user()->pet()->first();

        return response()->json(['pet' => $pet ? $service->describe($pet) : null]);
    }

    public function store(Request $request, PetService $service): JsonResponse
    {
        return $this->save($request, $service, false);
    }

    public function update(Request $request, PetService $service): JsonResponse
    {
        return $this->save($request, $service, true);
    }

    private function save(Request $request, PetService $service, bool $editing): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'species' => [$editing ? 'sometimes' : 'required', 'required', 'string', Rule::in(config('pets.species'))],
            'name' => [$editing ? 'sometimes' : 'required', 'required', 'string', 'max:20', function (string $attribute, mixed $value, \Closure $fail): void {
                if (is_string($value) && preg_match('/^\s*$/u', $value)) {
                    $fail('The name field is required.');
                }
            }],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'The given data was invalid.', 'errors' => $validator->errors()], 400);
        }

        return DB::transaction(function () use ($request, $service, $editing, $validator): JsonResponse {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $pet = $user->pet()->lockForUpdate()->first();
            if ((! $editing && $pet !== null) || ($editing && $pet === null)) {
                $message = $editing ? 'Adopt a pet first.' : 'You have already adopted a pet.';

                return response()->json(['message' => $message, 'errors' => ['pet' => [$message]]], 400);
            }
            if ($editing) {
                $pet->update($validator->validated());
            } else {
                $pet = $user->pet()->create($validator->validated())->refresh();
            }

            return response()->json(['pet' => $service->describe($pet)], $editing ? 200 : 201);
        }, 3);
    }
}
