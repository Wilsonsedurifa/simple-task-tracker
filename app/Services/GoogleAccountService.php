<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GoogleAccountService
{
    public function findExistingUser(string $googleId, string $email): ?User
    {
        return DB::transaction(fn (): ?User => User::query()
            ->where('google_id', $googleId)
            ->lockForUpdate()
            ->first()
            ?? User::query()
                ->where('email', $email)
                ->lockForUpdate()
                ->first());
    }


    public function linkGoogleAccountIfNeeded(User $user, string $googleId, string $email): User
    {
        return DB::transaction(function () use ($user, $googleId, $email): User {
            $lockedUser = User::query()
                ->whereKey($user->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedUser->google_id !== $googleId) {
                $lockedUser->forceFill([
                    'email' => strtolower(trim($email)),
                    'google_id' => $googleId,
                ])->save();
            }

            return $lockedUser;
        });
    }


    public function createFromGoogle(string $intent, array $attributes): ?User
    {
        if ($intent !== 'register') {
            throw new \LogicException('Google account creation requires register intent.');
        }

        return DB::transaction(function () use ($attributes): ?User {
            $existingUser = User::query()
                ->where('google_id', $attributes['google_id'])
                ->lockForUpdate()
                ->first()
                ?? User::query()
                    ->where('email', $attributes['email'])
                    ->lockForUpdate()
                    ->first();

            if ($existingUser) {
                return null;
            }

            $user = new User();
            $user->forceFill([
                'name' => $attributes['name'] !== '' ? $attributes['name'] : 'Google User',
                'email' => strtolower(trim($attributes['email'])),
                'google_id' => $attributes['google_id'],
                'email_verified_at' => now(),
                // Google-only users have no password. A random, non-disclosed value
                // keeps the existing non-null database column unchanged.
                'password' => Str::random(64),
            ])->save();

            return $user;
        });
    }

}
