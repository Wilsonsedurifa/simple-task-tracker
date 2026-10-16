<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class MobileFoundationTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_welcome_and_auth_use_the_shared_entry_points(): void
    {
        $this->get('/')->assertOk()->assertSee('Get started')->assertSee('Finish your tasks.')
            ->assertSee('class="lp"', false)->assertSee('id="main"', false);
        foreach (['login', 'register'] as $page) {
            $this->get('/'.$page)->assertOk()->assertSee('app-public-auth')->assertSee('tasks-', false)
                ->assertSee('id="main"', false)->assertSee('id="toasts"', false);
        }
    }

    public function test_workspace_has_one_shared_search_and_the_five_phone_tabs(): void
    {
        $this->actingAs(User::factory()->create());
        foreach (['dashboard', 'tasks', 'calendar', 'notifications', 'settings', 'pet'] as $page) {
            $response = $this->get('/'.$page)->assertOk()->assertSee('data-app-mobile-header', false)
                ->assertSee('id="app-mobile-add"', false)->assertSee('id="app-more-button"', false)
                ->assertSee('class="app-bottom-nav" aria-label="Main"', false);
            $this->assertSame(1, substr_count($response->getContent(), 'id="task-search"'));
            $this->assertSame(1, substr_count($response->getContent(), 'id="create-modal"'));
        }
    }
}
