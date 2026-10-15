<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthIntentTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_login_with_no_account_does_not_create_a_user(): void
    {
        $this->fakeGoogleUser('google-new', 'new@example.com');

        $this->withSession(['google_auth_intent' => 'login'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('users', 0);
        $this->assertGuest();
    }

    public function test_login_with_an_existing_google_id_logs_the_user_in(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'google_id' => 'google-member',
        ]);
        $this->fakeGoogleUser('google-member', 'member@example.com');

        $this->withSession(['google_auth_intent' => 'login'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('continue'));

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_login_links_a_verified_google_email_to_an_existing_local_account(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'google_id' => null,
        ]);
        $this->fakeGoogleUser('google-member', 'MEMBER@EXAMPLE.COM');

        $this->withSession(['google_auth_intent' => 'login'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('continue'));

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'google_id' => 'google-member']);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_register_with_a_new_google_email_creates_and_logs_in_the_user(): void
    {
        $this->fakeGoogleUser('google-new', 'NEW@EXAMPLE.COM');

        $this->withSession(['google_auth_intent' => 'register'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('continue'));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'new@example.com',
            'google_id' => 'google-new',
        ]);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_register_with_an_existing_account_does_not_log_in_or_create_a_duplicate(): void
    {
        User::factory()->create(['email' => 'member@example.com']);
        $this->fakeGoogleUser('google-member', 'member@example.com');

        $this->withSession(['google_auth_intent' => 'register'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status', 'May account ka na. Mag-login na lang.');

        $this->assertGuest();
        $this->assertDatabaseCount('users', 1);
    }

    public function test_missing_intent_defaults_to_login_and_never_creates_a_user(): void
    {
        $this->fakeGoogleUser('google-new', 'new@example.com');

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_unverified_google_email_is_rejected_for_login_and_register(): void
    {
        $this->fakeGoogleUser('google-login', 'login@example.com', false);
        $this->withSession(['google_auth_intent' => 'login'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->fakeGoogleUser('google-register', 'register@example.com', false);
        $this->withSession(['google_auth_intent' => 'register'])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('register'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    private function fakeGoogleUser(string $id, string $email, bool $verified = true): void
    {
        $googleUser = SocialiteUser::fake([
            'id' => $id,
            'email' => $email,
            'name' => 'Google User',
            'email_verified' => $verified,
        ]);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);
    }
}
