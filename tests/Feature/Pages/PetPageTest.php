<?php

namespace Tests\Feature\Pages;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class PetPageTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_pet_page_requires_login_and_uses_the_shared_shell(): void
    {
        $this->get('/pet')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get('/pet')->assertOk()
            ->assertSee('data-page="pet"', false)->assertSee('data-app-pet-widget', false)
            ->assertSee('id="app-pet-roadmap"', false)->assertSee('id="app-pet-badges"', false)
            ->assertSee('id="app-pet-edit-form"', false)->assertSee('id="app-pet-adoption"', false)
            ->assertSee('data-app-pet-nav', false)->assertSee('XP and progress are kept');
    }
}
