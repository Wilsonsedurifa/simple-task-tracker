<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PeopleSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_returns_public_identity_without_email(): void
    {
        $user = User::factory()->create();
        $person = User::factory()->create(['username' => 'wilson']);
        $this->actingAs($user)->getJson('/api/people?q=@wil')->assertOk()
            ->assertExactJson([['id' => $person->id, 'name' => $person->name, 'username' => 'wilson']]);
        $this->getJson('/api/people?q='.urlencode($person->email))->assertOk()->assertJsonCount(1);
        $this->getJson('/api/people?q='.urlencode(explode('@', $person->email)[0].'@'))->assertOk()->assertJsonCount(0);
    }

    public function test_username_is_unique_and_can_be_changed(): void
    {
        $user = User::factory()->create();
        User::factory()->create(['username' => 'taken']);
        $this->actingAs($user)->patchJson('/settings/profile', ['name' => $user->name, 'username' => 'taken'])->assertBadRequest();
        $this->patchJson('/settings/profile', ['name' => $user->name, 'username' => 'My_Name'])->assertOk();
        $this->assertSame('my_name', $user->fresh()->username);
    }
}
