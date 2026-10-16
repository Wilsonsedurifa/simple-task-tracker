<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class PageFlowTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guests_are_redirected_from_every_protected_page(): void
    {
        foreach (['continue', 'dashboard', 'tasks', 'calendar', 'notifications', 'settings'] as $page) {
            $this->get('/'.$page)->assertRedirect(route('login'));
        }
    }

    public function test_root_redirects_based_on_session(): void
    {
        $this->get('/')->assertOk()->assertSee('Finish your tasks.')->assertSee('Get started')
            ->assertSee('href="'.route('register').'"', false)->assertSee('href="'.route('login').'"', false);
        $this->actingAs(User::factory()->create())->get('/')->assertRedirect('/dashboard');
    }

    public function test_intended_url_survives_login_and_continue(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $this->get('/calendar?view=week')->assertRedirect('/login');
        $this->post('/login', ['email' => $user->email, 'password' => 'password123'])->assertRedirect('/continue');
        $this->get('/continue')->assertOk();
        $this->post('/continue')->assertRedirect('/calendar?view=week');
        $this->assertFalse(session()->has('url.intended'));
    }

    public function test_session_expiry_return_path_survives_new_login(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $this->get('/login?return_to='.urlencode('/tasks?q=hello&task=12'))->assertOk();
        $this->post('/login', ['email' => $user->email, 'password' => 'password123'])->assertRedirect('/continue');
        $this->post('/continue')->assertRedirect('/tasks?q=hello&task=12');
    }

    public function test_external_return_path_is_not_accepted(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $this->get('/login?return_to='.urlencode('//example.com/phish'))->assertOk();
        $this->post('/login', ['email' => $user->email, 'password' => 'password123'])->assertRedirect('/continue');
        $this->post('/continue')->assertRedirect('/dashboard');
    }

    public function test_intended_page_survives_registration_and_continue(): void
    {
        $this->get('/notifications')->assertRedirect('/login');
        $this->post('/register', [
            'name' => 'New Member', 'email' => 'intended-new@example.test', 'password' => 'password123',
        ])->assertRedirect('/continue');
        $this->post('/continue')->assertRedirect('/notifications');
    }

    public function test_all_workspace_pages_load_shared_global_controls(): void
    {
        $this->actingAs(User::factory()->create());
        foreach (['dashboard', 'tasks', 'calendar', 'notifications', 'settings'] as $page) {
            $this->get('/'.$page)->assertOk()->assertSee('id="task-search"', false)
                ->assertSee('id="open-create-modal-btn"', false)->assertSee('id="app-task-dialog"', false);
        }
    }

    public function test_unknown_urls_render_themed_404_and_api_stays_json(): void
    {
        $this->get('/unknown')->assertNotFound()->assertSee('This page is not here.');
        $this->actingAs(User::factory()->create())->get('/unknown')->assertNotFound()->assertSee('Back to dashboard');
        $this->getJson('/api/unknown')->assertNotFound()->assertJsonStructure(['message']);
    }

    public function test_expired_token_page_has_safe_reload_link(): void
    {
        $this->get('/session-expired?return_to='.urlencode('/tasks?q=hi'))
            ->assertStatus(419)->assertSee('Reload page')->assertSee('href="/tasks?q=hi"', false);
        $this->get('/session-expired?return_to='.urlencode('//example.com'))
            ->assertStatus(419)->assertSee('href="/dashboard"', false);
    }
}
