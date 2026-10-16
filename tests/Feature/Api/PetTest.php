<?php

namespace Tests\Feature\Api;

use App\Models\Pet;
use App\Models\Task;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PetTest extends TestCase
{
    use LazilyRefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-15 12:00:00', 'Asia/Manila'));
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    private function adopt(): Pet
    {
        $this->postJson('/api/pet', ['species' => 'bunny', 'name' => 'Bun'])->assertCreated();

        return $this->user->pet()->firstOrFail();
    }

    private function task(array $attributes = []): Task
    {
        return Task::factory()->for($this->user)->create($attributes + ['priority' => 'low', 'status' => 'pending', 'due_date' => null]);
    }

    private function complete(Task $task)
    {
        return $this->patchJson('/api/tasks/'.$task->id.'/complete');
    }

    public function test_pet_endpoints_require_authentication(): void
    {
        $this->app['auth']->logout();
        $this->getJson('/api/pet')->assertUnauthorized();
        $this->postJson('/api/pet', ['species' => 'cat', 'name' => 'Mochi'])->assertUnauthorized();
        $this->patchJson('/api/pet', ['name' => 'New'])->assertUnauthorized();
    }

    public function test_get_returns_null_then_adoption_returns_initial_derived_fields(): void
    {
        $this->getJson('/api/pet')->assertOk()->assertExactJson(['pet' => null]);
        $this->postJson('/api/pet', ['species' => 'cat', 'name' => 'Mochi'])->assertCreated()
            ->assertJsonPath('pet.user_id', $this->user->id)->assertJsonPath('pet.name', 'Mochi')
            ->assertJsonPath('pet.level', 1)->assertJsonPath('pet.stage', 'Baby')->assertJsonPath('pet.xp', 0)
            ->assertJsonPath('pet.xp_into_level', 0)->assertJsonPath('pet.xp_for_next', 20)
            ->assertJsonPath('pet.progress_pct', 0)->assertJsonPath('pet.streak_days', 0)
            ->assertJsonPath('pet.longest_streak', 0)->assertJsonPath('pet.completed_count', 0);
        $this->getJson('/api/pet')->assertOk()->assertJsonPath('pet.species', 'cat');
    }

    public function test_adoption_and_patch_validate_species_and_name_in_existing_format(): void
    {
        foreach ([['species' => 'wolf', 'name' => 'Bun'], ['species' => 'cat', 'name' => ''],
            ['species' => 'cat', 'name' => '   '], ['species' => 'cat', 'name' => "\u{00a0}"],
            ['species' => 'cat', 'name' => str_repeat('x', 21)], ['species' => ['cat'], 'name' => 'Bun'],
            ['species' => 'cat', 'name' => ['Bun']], []] as $invalid) {
            $this->postJson('/api/pet', $invalid)->assertBadRequest()->assertJsonStructure(['message', 'errors']);
        }
        $this->assertDatabaseCount('pets', 0);
        $this->patchJson('/api/pet', ['name' => 'Bun'])->assertBadRequest()->assertInvalid(['pet']);
        $this->adopt();
        foreach ([['species' => 'wolf'], ['name' => ''], ['name' => str_repeat('x', 21)], ['species' => null]] as $invalid) {
            $this->patchJson('/api/pet', $invalid)->assertBadRequest()->assertJsonStructure(['message', 'errors']);
        }
        $this->postJson('/api/pet', ['species' => 'dog', 'name' => 'Second'])->assertBadRequest()->assertInvalid(['pet']);
        $this->assertDatabaseCount('pets', 1);
    }

    public function test_rename_and_species_switch_keep_xp_and_ignore_unwritable_fields(): void
    {
        $pet = $this->adopt();
        $pet->forceFill(['xp' => 75])->save();
        $this->patchJson('/api/pet', ['name' => str_repeat('é', 20), 'xp' => 99999, 'user_id' => 999])
            ->assertOk()->assertJsonPath('pet.xp', 75)->assertJsonPath('pet.name', str_repeat('é', 20));
        foreach (config('pets.species') as $species) {
            $this->patchJson('/api/pet', ['species' => $species])->assertOk()
                ->assertJsonPath('pet.species', $species)->assertJsonPath('pet.xp', 75)
                ->assertJsonPath('pet.user_id', $this->user->id);
        }
        $this->patchJson('/api/pet', [])->assertOk()->assertJsonPath('pet.xp', 75);
    }

    public function test_another_users_pet_and_tasks_are_never_visible_or_modifiable(): void
    {
        $pet = $this->adopt();
        $task = $this->task();
        $other = User::factory()->create();
        $this->actingAs($other)->getJson('/api/pet?user_id='.$this->user->id)->assertExactJson(['pet' => null]);
        $this->patchJson('/api/pet', ['name' => 'Stolen', 'user_id' => $this->user->id])->assertBadRequest();
        $this->complete($task)->assertNotFound();
        $this->postJson('/api/pet', ['species' => 'dragon', 'name' => 'Other', 'user_id' => $this->user->id])
            ->assertCreated()->assertJsonPath('pet.user_id', $other->id)->assertJsonPath('pet.completed_count', 0);
        $this->assertSame('Bun', $pet->fresh()->name);
        $this->assertSame(0, $pet->fresh()->xp);
    }

    public function test_priority_rewards_and_level_up_metadata_preserve_task_fields(): void
    {
        $pet = $this->adopt();
        foreach (['low' => 10, 'medium' => 20, 'high' => 30] as $priority => $xp) {
            $task = $this->task(['priority' => $priority, 'description' => 'Keep this description', 'stage' => 'review']);
            $response = $this->complete($task)->assertOk()->assertJsonPath('pet.xp_gained', $xp)
                ->assertJsonPath('id', $task->id)->assertJsonPath('user_id', $this->user->id)
                ->assertJsonPath('title', $task->title)->assertJsonPath('description', 'Keep this description')
                ->assertJsonPath('stage', 'review')->assertJsonPath('priority', $priority)
                ->assertJsonPath('status', 'completed')->assertJsonPath('due_date', null)
                ->assertJsonStructure(['created_at', 'updated_at', 'completed_at', 'xp_awarded_at', 'pet' => ['xp_gained', 'level', 'leveled_up', 'new_stage', 'streak_days']]);
            $this->assertNotNull($response->json('completed_at'));
            $this->assertNotNull($task->fresh()->xp_awarded_at);
        }
        $this->assertSame(60, $pet->fresh()->xp);
        $response->assertJsonPath('pet.level', 3)->assertJsonPath('pet.leveled_up', true)->assertJsonPath('pet.new_stage', 'Young');
        $this->getJson('/api/pet')->assertJsonPath('pet.completed_count', 3)->assertJsonPath('pet.xp_into_level', 0);
    }

    public function test_on_time_bonus_applies_today_and_future_but_not_overdue_or_no_deadline(): void
    {
        $this->adopt();
        foreach ([['2026-10-15', 15], ['2026-10-16', 15], ['2026-10-14', 10], [null, 10]] as [$date, $xp]) {
            $this->complete($this->task(['due_date' => $date]))->assertOk()->assertJsonPath('pet.xp_gained', $xp);
        }
    }

    public function test_repeat_completion_and_reopen_cannot_award_twice_or_advance_streak(): void
    {
        $pet = $this->adopt();
        $task = $this->task();
        $this->complete($task)->assertJsonPath('pet.xp_gained', 10);
        $marker = $task->fresh()->xp_awarded_at->toDateTimeString();
        $this->complete($task)->assertOk()->assertJsonPath('pet.xp_gained', 0)->assertJsonPath('pet.leveled_up', false);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-16 12:00:00', 'Asia/Manila'));
        $this->patchJson('/api/tasks/'.$task->id.'/reopen')->assertOk();
        $this->complete($task)->assertOk()->assertJsonPath('pet.xp_gained', 0)->assertJsonPath('pet.streak_days', 1);
        $this->assertSame(10, $pet->fresh()->xp);
        $this->assertSame($marker, $task->fresh()->xp_awarded_at->toDateTimeString());
        $this->assertSame('2026-10-15', $pet->fresh()->last_streak_date->toDateString());
    }

    public function test_deleting_completed_tasks_never_removes_pet_xp(): void
    {
        $pet = $this->adopt();
        $task = $this->task();
        $this->complete($task)->assertOk();
        $this->deleteJson('/api/tasks/'.$task->id)->assertOk();
        $this->assertSame(10, $pet->fresh()->xp);
        $this->complete($this->task())->assertOk();
        $this->deleteJson('/api/tasks/completed')->assertOk();
        $this->getJson('/api/pet')->assertJsonPath('pet.xp', 20)->assertJsonPath('pet.completed_count', 0);
    }

    public function test_daily_cap_clips_rewards_consumes_zero_awards_and_resets_on_next_local_day(): void
    {
        $pet = $this->adopt();
        foreach ([35, 35, 30] as $xp) {
            $this->complete($this->task(['priority' => 'high', 'due_date' => '2026-10-15']))->assertJsonPath('pet.xp_gained', $xp);
        }
        $zero = $this->task();
        $this->complete($zero)->assertJsonPath('pet.xp_gained', 0);
        $this->assertNotNull($zero->fresh()->xp_awarded_at);
        $this->assertSame(100, $pet->fresh()->xp);
        $this->assertSame(100, $pet->fresh()->xp_today);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-15 16:01:00', 'UTC'));
        $this->complete($this->task(['priority' => 'high', 'due_date' => '2026-10-16']))
            ->assertJsonPath('pet.xp_gained', 35)->assertJsonPath('pet.streak_days', 2);
        $this->assertSame(35, $pet->fresh()->xp_today);
        $this->assertSame('2026-10-16', $pet->fresh()->xp_today_date->toDateString());
        $this->patchJson('/api/tasks/'.$zero->id.'/reopen')->assertOk();
        $this->complete($zero)->assertJsonPath('pet.xp_gained', 0);
        $this->assertSame(135, $pet->fresh()->xp);
    }

    public function test_without_a_pet_completion_has_no_reward_or_marker_and_adoption_is_not_retroactive(): void
    {
        $task = $this->task(['priority' => 'high']);
        $this->complete($task)->assertOk()->assertJsonMissingPath('pet');
        $this->assertNull($task->fresh()->xp_awarded_at);
        $pet = $this->adopt();
        $this->assertSame(0, $pet->xp);
        $this->getJson('/api/pet')->assertJsonPath('pet.xp', 0)->assertJsonPath('pet.completed_count', 1);
        $this->complete($task)->assertOk()->assertJsonPath('pet.xp_gained', 0);
        $this->assertNull($task->fresh()->xp_awarded_at);
        $this->complete($this->task())->assertJsonPath('pet.xp_gained', 10);
    }

    public function test_streak_consecutive_days_same_day_missed_day_and_read_only_expiry(): void
    {
        $pet = $this->adopt();
        $this->complete($this->task())->assertJsonPath('pet.streak_days', 1);
        $this->complete($this->task())->assertJsonPath('pet.streak_days', 1);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-16 12:00:00', 'Asia/Manila'));
        $this->getJson('/api/pet')->assertJsonPath('pet.streak_days', 1);
        $this->complete($this->task())->assertJsonPath('pet.streak_days', 2);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-18 12:00:00', 'Asia/Manila'));
        $this->getJson('/api/pet')->assertJsonPath('pet.streak_days', 0)->assertJsonPath('pet.longest_streak', 2);
        $this->assertSame(2, $pet->fresh()->streak_days, 'GET must not mutate stored streak history.');
        $this->complete($this->task())->assertJsonPath('pet.streak_days', 1);
        $this->assertSame(2, $pet->fresh()->longest_streak);
    }

    public function test_streak_counts_an_eligible_zero_xp_completion_at_the_cap(): void
    {
        config(['pets.daily_cap' => 0]);
        $pet = $this->adopt();
        $this->complete($this->task())->assertJsonPath('pet.xp_gained', 0)->assertJsonPath('pet.streak_days', 1);
        $this->assertSame(0, $pet->fresh()->xp);
        $this->assertSame(1, $pet->fresh()->longest_streak);
    }

    public function test_reward_configuration_is_used_without_hardcoded_priority_bonus_or_cap(): void
    {
        config(['pets.priority_xp.high' => 7, 'pets.on_time_bonus' => 2, 'pets.daily_cap' => 12]);
        $pet = $this->adopt();
        $this->complete($this->task(['priority' => 'high', 'due_date' => '2026-10-15']))
            ->assertJsonPath('pet.xp_gained', 9);
        $this->complete($this->task(['priority' => 'high', 'due_date' => '2026-10-15']))
            ->assertJsonPath('pet.xp_gained', 3);
        $this->assertSame(12, $pet->fresh()->xp);
    }

    public function test_clients_cannot_clear_the_reward_marker_to_farm_xp(): void
    {
        $pet = $this->adopt();
        $task = $this->task();
        $this->complete($task)->assertOk();
        $this->patchJson('/api/tasks/'.$task->id.'/reopen')->assertOk();
        $this->patchJson('/api/tasks/'.$task->id, ['title' => 'Still editable', 'xp_awarded_at' => null])->assertOk();
        $this->assertNotNull($task->fresh()->xp_awarded_at);
        $this->complete($task)->assertJsonPath('pet.xp_gained', 0);
        $this->assertSame(10, $pet->fresh()->xp);
    }

    public function test_rewards_and_completion_roll_back_together_if_reward_persistence_fails(): void
    {
        $pet = $this->adopt();
        $task = $this->task();
        $this->withoutExceptionHandling();
        Pet::saving(function (): void {
            throw new \RuntimeException('Simulated reward failure');
        });
        try {
            $this->complete($task);
            $this->fail('Expected a reward failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Simulated reward failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.saving: '.Pet::class);
        }
        $this->assertSame('pending', $task->fresh()->status);
        $this->assertNull($task->fresh()->completed_at);
        $this->assertNull($task->fresh()->xp_awarded_at);
        $this->assertSame(0, $pet->fresh()->xp);
    }

    public function test_pet_is_deleted_when_its_owner_is_deleted(): void
    {
        $pet = $this->adopt();
        $this->user->delete();
        $this->assertDatabaseMissing('pets', ['id' => $pet->id]);
    }
}
