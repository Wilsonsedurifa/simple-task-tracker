<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_settings_endpoints_require_authentication(): void
    {
        $this->get('/settings')->assertRedirect('/login');
        $this->patchJson('/settings/profile')->assertUnauthorized();
        $this->putJson('/settings/password')->assertUnauthorized();
        $this->deleteJson('/api/tasks/completed')->assertUnauthorized();
    }

    public function test_profile_updates_only_the_authenticated_users_name(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($user)->patchJson('/settings/profile', [
            'name' => 'Updated Name', 'email' => 'ignored@example.com', 'id' => $other->id,
        ])->assertOk()->assertJsonPath('user.name', 'Updated Name')->assertJsonMissingPath('user.password');
        $this->assertSame('Updated Name', $user->fresh()->name);
        $this->assertSame($user->email, $user->fresh()->email);
        $this->assertSame($other->name, $other->fresh()->name);
    }

    public function test_display_name_is_required_and_limited_to_255_characters(): void
    {
        $this->actingAs(User::factory()->create());
        foreach (['', str_repeat('a', 256)] as $name) {
            $this->patchJson('/settings/profile', ['name' => $name])->assertBadRequest()
                ->assertJsonStructure(['message', 'errors' => ['name']]);
        }
        $this->patchJson('/settings/profile', ['name' => str_repeat('a', 255)])->assertOk();
    }

    public function test_password_requires_correct_current_password_length_and_confirmation(): void
    {
        $user = User::factory()->create(['password' => Hash::make('Original-password-123')]);
        $this->actingAs($user);
        $this->putJson('/settings/password', ['current_password' => 'wrong', 'password' => 'New-password-123', 'password_confirmation' => 'New-password-123'])
            ->assertBadRequest()->assertInvalid(['current_password']);
        $this->putJson('/settings/password', ['current_password' => 'Original-password-123', 'password' => 'short', 'password_confirmation' => 'short'])
            ->assertBadRequest()->assertInvalid(['password']);
        $this->putJson('/settings/password', ['current_password' => 'Original-password-123', 'password' => 'New-password-123', 'password_confirmation' => 'different'])
            ->assertBadRequest()->assertInvalid(['password']);
        $this->assertTrue(Hash::check('Original-password-123', $user->fresh()->password));
    }

    public function test_password_is_hashed_and_the_session_remains_authenticated(): void
    {
        $user = User::factory()->create(['password' => Hash::make('Original-password-123')]);
        $token = $user->remember_token;
        $this->actingAs($user)->putJson('/settings/password', [
            'current_password' => 'Original-password-123', 'password' => 'New-password-123', 'password_confirmation' => 'New-password-123',
        ])->assertOk()->assertJsonPath('message', 'Password changed.');
        $this->assertTrue(Hash::check('New-password-123', $user->fresh()->password));
        $this->assertFalse(Hash::check('Original-password-123', $user->fresh()->password));
        $this->assertNotSame($token, $user->fresh()->remember_token);
        $this->assertAuthenticatedAs($user);
        $this->get('/settings')->assertOk();
    }

    public function test_password_hashing_edge_cases_return_field_errors_not_server_errors(): void
    {
        config(['hashing.driver' => 'bcrypt']);
        $user = User::factory()->create(['password' => Hash::make('Original-password-123')]);
        $this->actingAs($user);
        foreach ([str_repeat('a', 73), str_repeat('é', 37), "Valid-password\0suffix"] as $password) {
            $this->putJson('/settings/password', [
                'current_password' => 'Original-password-123', 'password' => $password, 'password_confirmation' => $password,
            ])->assertBadRequest()->assertInvalid(['password']);
        }
        $this->assertTrue(Hash::check('Original-password-123', $user->fresh()->password));
    }

    public function test_bulk_delete_removes_only_the_owners_completed_tasks(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Task::factory()->for($user)->count(2)->create(['status' => 'completed']);
        $pending = Task::factory()->for($user)->create(['status' => 'pending']);
        $foreign = Task::factory()->for($other)->create(['status' => 'completed']);
        $this->actingAs($user)->deleteJson('/api/tasks/completed')->assertOk()->assertJsonPath('deleted_count', 2);
        $this->assertDatabaseCount('tasks', 2);
        $this->assertDatabaseHas('tasks', ['id' => $pending->id]);
        $this->assertDatabaseHas('tasks', ['id' => $foreign->id]);
        $this->deleteJson('/api/tasks/completed')->assertOk()->assertJsonPath('deleted_count', 0);
    }
}
