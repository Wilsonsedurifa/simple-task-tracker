<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_marketing_page_has_real_auth_links_and_separate_assets(): void
    {
        $html = $this->get('/')->assertOk()->assertViewIs('landing')
            ->assertSee('Get started')->assertSee('href="'.url('/register').'"', false)
            ->assertSee('href="'.url('/login').'"', false)->assertSee('Finish your tasks.')
            ->assertSee('id="lp-progress"', false)->getContent();
        $this->assertSame(1, substr_count($html, '<h1>'));
        $this->assertSame(5, substr_count($html, '<details'));
        $this->assertStringNotContainsString('<style', $html);
        $this->assertStringNotContainsString(' style=', $html);
        $this->assertStringNotContainsString('/api/tasks', $html);
        $this->assertStringNotContainsString('assets/tasks-', $html);
    }

    public function test_authenticated_root_still_redirects_to_dashboard(): void
    {
        $this->actingAs(User::factory()->create())->get('/')->assertRedirect('/dashboard');
    }
}
