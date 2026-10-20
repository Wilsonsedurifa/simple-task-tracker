<?php

namespace Tests\Feature\Pages;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContinueUsernameTest extends TestCase
{
    use RefreshDatabase;

    public function test_continue_saves_username_and_preserves_intended_destination(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->withSession(['url.intended' => '/tasks'])
            ->post('/continue', ['username' => 'My_Username'])->assertRedirect('/tasks');
        $this->assertSame('my_username', $user->fresh()->username);
    }

    public function test_duplicate_username_keeps_the_user_on_setup(): void
    {
        User::factory()->create(['username' => 'taken']);
        $user = User::factory()->create();
        $this->actingAs($user)->from('/continue')->post('/continue', ['username' => 'taken'])
            ->assertRedirect('/continue')->assertSessionHasErrors('username');
    }
}
