<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeopleSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $values = $request->validate(['q' => ['required', 'string', 'min:2', 'max:255']]);
        $query = strtolower(ltrim(trim($values['q']), '@'));
        $users = User::query()->whereKeyNot($request->user()->id)
            ->where(function ($builder) use ($query): void {
                if (str_contains($query, '@')) {
                    $builder->where('email', $query);
                } else {
                    $builder->where('username', 'like', str_replace(['%', '_'], ['\\%', '\\_'], $query).'%');
                }
            })->orderBy('username')->limit(6)->get(['id', 'name', 'username']);

        return response()->json($users);
    }
}
