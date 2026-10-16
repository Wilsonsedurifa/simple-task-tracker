<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class MobileHomeTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_home_reuses_shared_controls_without_duplicate_ids(): void
    {
        $html = $this->actingAs(User::factory()->create())->get('/dashboard')
            ->assertOk()->assertSee('app-mobile-home')->assertSee("Today's Tasks", false)
            ->assertSee('filters=priority', false)->assertSee('Walang due ngayon')->getContent();

        foreach (['task-search', 'create-modal', 'app-more-button', 'app-pet-heading', 'db-summary-error'] as $id) {
            $this->assertSame(1, substr_count($html, 'id="'.$id.'"'));
        }
        preg_match_all('/\bid="([^"]+)"/', $html, $matches);
        $this->assertSame($matches[1], array_values(array_unique($matches[1])));
    }
}
