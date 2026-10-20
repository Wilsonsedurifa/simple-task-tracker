<?php

namespace Tests\Feature\Pages;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsernameGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_account_without_username_cannot_open_workspace_or_api(): void
    {
        $user = User::factory()->create(['username' => null]);
        $this->actingAs($user);
        foreach (['/dashboard', '/tasks', '/calendar', '/settings', '/notifications', '/pet'] as $path) {
            $this->get($path)->assertRedirect('/continue');
        }
        $this->getJson('/api/tasks')->assertForbidden();
        $this->get('/continue')->assertOk();
        $this->post('/continue', ['username' => 'chosen_name'])->assertRedirect('/dashboard');
        $this->get('/dashboard')->assertOk();
        $this->getJson('/api/tasks')->assertOk();
    }

    public function test_user_creation_does_not_generate_a_username(): void
    {
        $user = User::factory()->create(['username' => null]);
        $this->assertNull($user->fresh()->username);
    }
}
