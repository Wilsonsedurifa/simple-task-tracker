<?php

namespace Tests\Feature\Pages;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_is_redirected_to_login_from_every_protected_html_page(): void
    {
        $this->get(route('tasks'))->assertRedirect(route('login'));
        $this->post(route('logout'))->assertRedirect(route('login'));
    }

    public function test_landing_page_links_are_valid_and_guests_do_not_reach_an_account(): void
    {
        $this->get(route('welcome'))
            ->assertOk()
            ->assertSee('href="'.route('login').'"', false)
            ->assertSee('href="'.route('register').'"', false)
            ->assertSee('href="#features"', false)
            ->assertSee('href="#how"', false)
            ->assertSee('href="#pet"', false)
            ->assertSee('href="#faq"', false)
            ->assertDontSee('href="'.route('tasks').'"', false);

        $this->get(route('tasks'))->assertRedirect(route('login'));
        $this->get(route('login'))->assertOk();
        $this->get(route('register'))->assertOk();
    }

    public function test_user_can_log_in_and_log_out(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'password' => 'password123',
        ]);

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertRedirect(route('login'));
        $this->assertGuest();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertRedirect(route('continue'));
        $this->assertAuthenticatedAs($user);

        $this->get(route('continue'))->assertOk();
        $this->post(route('continue.store'))->assertRedirect(route('dashboard'));

        $this->post(route('logout'))->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_registration_opens_the_task_list_without_email_confirmation(): void
    {
        $this->post(route('register.store'), [
            'name' => 'New Member',
            'email' => 'new@example.com',
            'password' => 'password123',
        ])->assertRedirect(route('continue'));

        $this->assertAuthenticated();
    }
}
