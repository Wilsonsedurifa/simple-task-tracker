<?php

namespace Tests\Feature\Pages;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class MobileAccountTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_profile_reuses_settings_and_shared_controls_without_new_routes(): void
    {
        $html = $this->actingAs(User::factory()->create())->get('/settings')->assertOk()
            ->assertSee('id="app-mobile-profile"', false)->assertSee('#profile', false)
            ->assertSee('Quick Stats')->assertSee('data-app-open-logout', false)->getContent();
        preg_match_all('/\bid="([^"]+)"/', $html, $matches);
        $this->assertSame($matches[1], array_values(array_unique($matches[1])));
        foreach (['app-appearance', 'logout-modal', 'app-profile-form'] as $id) $this->assertSame(1, substr_count($html, 'id="'.$id.'"'));
    }
}
