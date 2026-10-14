<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_registration_logs_the_user_in_and_queues_one_verification_email(): void
    {
        Notification::fake();

        $this->post(route('register.store'), [
            'name' => 'Wilson', 'email' => 'wilson@example.com', 'password' => 'password123',
        ])->assertRedirect(route('verification.notice'));

        $user = User::where('email', 'wilson@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        Notification::assertSentTo($user, QueuedVerifyEmail::class, 1);
    }

    public function test_an_unverified_user_is_sent_to_the_verification_notice_from_tasks(): void
    {
        $this->actingAs(User::factory()->unverified()->create())
            ->get(route('tasks'))
            ->assertRedirect(route('verification.notice'));
    }

    public function test_a_signed_link_verifies_the_email_and_returns_to_tasks(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(10), [
            'id' => $user->id, 'hash' => sha1($user->email),
        ]);

        $this->actingAs($user)->get($url)
            ->assertRedirect(route('tasks'))
            ->assertSessionHas('status', 'Email confirmed. Welcome to Task Tracker.');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_an_expired_link_is_a_friendly_page(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->subMinute(), [
            'id' => $user->id, 'hash' => sha1($user->email),
        ]);

        $this->actingAs($user)->get($url)
            ->assertOk()
            ->assertSee('no longer');
    }

    public function test_resend_is_throttled(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        foreach (range(1, 3) as $attempt) {
            $this->actingAs($user)->post(route('verification.send'))->assertRedirect();
        }

        $this->actingAs($user)->post(route('verification.send'))->assertStatus(429);
    }

    public function test_wrong_password_and_repeated_login_attempts_fail_safely(): void
    {
        $user = User::factory()->create(['email' => 'member@example.com', 'password' => 'password123']);

        foreach (range(1, 5) as $attempt) {
            $this->from(route('login'))->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
                ->assertRedirect(route('login'));
        }

        $this->from(route('login'))->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
