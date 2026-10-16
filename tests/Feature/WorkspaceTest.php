<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class WorkspaceTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_workspace_pages_require_login(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/tasks')->assertRedirect('/login');
    }

    public function test_both_pages_render_working_shared_controls(): void
    {
        $this->actingAs(User::factory()->create(['name' => '<script>unsafe</script>']));

        foreach (['/dashboard', '/tasks'] as $url) {
            $this->get($url)->assertOk()
                ->assertSee('&lt;script&gt;unsafe&lt;/script&gt;', false);
        }
    }

    public function test_dashboard_has_only_summary_and_tasks_keeps_its_own_workspace(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/dashboard')->assertOk()->assertSee('Your day, at a glance.')
            ->assertSee('id="db-summary-chart"', false)->assertSee('id="task-form"', false)
            ->assertDontSee('id="task-board-container"', false);
        $this->get('/tasks')->assertOk()->assertSee('id="task-board-container"', false)
            ->assertSee('id="task-form"', false)->assertSee('id="task-search"', false);
    }

    public function test_overdue_task_can_be_edited_without_resending_the_deadline(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['due_date' => now()->subDays(3)->format('Y-m-d')]);

        $this->actingAs($user)->patchJson('/api/tasks/'.$task->id, ['title' => 'Updated title'])
            ->assertOk()->assertJsonPath('title', 'Updated title');

        $this->assertSame(now()->subDays(3)->format('Y-m-d'), $task->fresh()->due_date->format('Y-m-d'));
    }

    public function test_deadline_and_description_are_persisted_and_can_be_cleared(): void
    {
        $this->actingAs(User::factory()->create());
        $response = $this->postJson('/api/tasks', [
            'title' => 'Plan the week', 'description' => 'Keep it manageable.',
            'priority' => 'medium', 'due_date' => now()->addDay()->format('Y-m-d'),
        ])->assertCreated();

        $id = $response->json('id');
        $this->getJson('/api/tasks?sort=deadline')->assertOk()->assertJsonPath('0.id', $id);
        $this->patchJson('/api/tasks/'.$id, ['due_date' => null, 'description' => null])->assertOk();
        $this->assertDatabaseHas('tasks', ['id' => $id, 'due_date' => null, 'description' => null]);
    }

    public function test_tasks_page_has_shared_board_list_filters_and_accessible_drawer(): void
    {
        $this->actingAs(User::factory()->create());
        $response = $this->get('/tasks?view=list&status=pending&priority=high&q=plan');
        $response->assertOk()->assertSee('<h1 id="app-page-heading">Tasks</h1>', false)
            ->assertSee('data-app-stat="overdue"', false)
            ->assertSee('id="priority-filter"', false)->assertSee('id="sort-filter"', false)
            ->assertSee('id="app-filter-chips"', false)->assertSee('id="task-list"', false)
            ->assertSee('id="app-task-dialog" class="modal app-task-drawer"', false)
            ->assertSee('id="app-drawer-delete"', false)
            ->assertSee('maxlength="1000"', false)->assertDontSee('Attachments');
        foreach (['todo', 'inprogress', 'review', 'completed'] as $column) {
            $response->assertSee('data-column="'.$column.'"', false);
        }
    }

    public function test_dashboard_has_quick_add_accessible_tabs_and_chart_table(): void
    {
        $this->actingAs(User::factory()->create());
        $response = $this->get('/dashboard')->assertOk()
            ->assertSee('id="app-quick-form"', false)
            ->assertSee('id="app-quick-details"', false)
            ->assertSee('id="app-chart-table"', false)
            ->assertSee('id="app-inprogress-cards"', false)
            ->assertSee('role="progressbar"', false)
            ->assertSee('aria-controls="app-quick-details"', false);
        foreach (['deadlines', 'active', 'done'] as $tab) {
            $response->assertSee('id="app-tab-'.$tab.'"', false)
                ->assertSee('id="app-panel-'.$tab.'"', false);
        }
        foreach (['pending', 'today', 'overdue', 'completed'] as $metric) {
            $response->assertSee('data-app-metric="'.$metric.'"', false);
        }
    }

    public function test_calendar_and_week_start_setting_use_existing_authenticated_shell(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/calendar?month=2028-02')->assertOk()
            ->assertSee('id="app-calendar"', false)->assertSee('role="grid"', false)
            ->assertSee('id="app-calendar-agenda"', false)->assertSee('popover="auto"', false)
            ->assertSee('id="app-calendar-unscheduled"', false)
            ->assertSee('Walang deadline ngayong buwan')->assertSee('id="app-task-dialog"', false)
            ->assertDontSee('reserved for the next implementation phase');
        $this->get('/settings')->assertOk()->assertSee('id="app-week-start"', false)
            ->assertSee('value="monday"', false)->assertSee('value="sunday"', false);
    }

    public function test_notifications_page_uses_derived_feed_and_per_user_shell_identity(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/notifications')->assertOk()
            ->assertSee('data-app-user-id="'.$user->id.'"', false)
            ->assertSee('id="app-notification-feed"', false)
            ->assertSee('data-app-mark-all', false)
            ->assertSee('data-app-notification-filter="unread"', false)
            ->assertSee('id="app-notification-bell"', false)
            ->assertSee('aria-controls="app-notification-dropdown"', false)
            ->assertSee('id="app-notification-dropdown"', false)
            ->assertSee('not pushed messages')
            ->assertSee('id="app-task-dialog"', false)
            ->assertDontSee('reserved for the next implementation phase');
    }
}
