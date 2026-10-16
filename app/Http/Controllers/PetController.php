<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\SavePetRequest;

class PetController extends Controller
{
    public function show(Request $request, PetService $service): JsonResponse
    {
        $pet = $request->user()->pet()->first();

        return response()->json(['pet' => $pet ? $service->describe($pet) : null]);
    }

    public function store(SavePetRequest $request, PetService $service): JsonResponse
    {
        return $this->save($request, $service, false);
    }

    public function update(SavePetRequest $request, PetService $service): JsonResponse
    {
        return $this->save($request, $service, true);
    }

    private function save(SavePetRequest $request, PetService $service, bool $editing): JsonResponse
    {
        return DB::transaction(function () use ($request, $service, $editing): JsonResponse {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $pet = $user->pet()->lockForUpdate()->first();
            if ((! $editing && $pet !== null) || ($editing && $pet === null)) {
                $message = $editing ? 'Adopt a pet first.' : 'You have already adopted a pet.';

                return response()->json(['message' => $message, 'errors' => ['pet' => [$message]]], 400);
            }
            if ($editing) {
                $pet->update($request->validated());
            } else {
                $pet = $user->pet()->create($request->validated())->refresh();
            }

            return response()->json(['pet' => $service->describe($pet)], $editing ? 200 : 201);
        }, 3);
    }
}
