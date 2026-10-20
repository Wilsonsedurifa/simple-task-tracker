<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationUsernameTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_saves_the_chosen_searchable_username(): void
    {
        $this->post('/register', ['name' => 'Wilson', 'username' => 'Wilson_22', 'email' => 'wilson@example.com', 'password' => 'password123'])
            ->assertRedirect('/continue');
        $this->assertDatabaseHas('users', ['username' => 'wilson_22', 'email' => 'wilson@example.com']);
    }

    public function test_registration_requires_a_unique_valid_username(): void
    {
        User::factory()->create(['username' => 'taken']);
        foreach (['', 'taken', 'invalid name'] as $username) {
            $this->post('/register', ['name' => 'New user', 'username' => $username, 'email' => 'new@example.com', 'password' => 'password123'])
                ->assertSessionHasErrors('username');
        }
    }
}
