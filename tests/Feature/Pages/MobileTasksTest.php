<?php

namespace Tests\Feature\Pages;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class MobileTasksTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_phone_task_controls_reuse_the_shared_forms_and_drawer(): void
    {
        $html = $this->actingAs(User::factory()->create())->get('/tasks')->assertOk()
            ->assertSee('id="due-filter"', false)->assertSee('data-filter="in_progress"', false)
            ->assertSee('id="app-clear-create-due"', false)->getContent();
        foreach (['task-form', 'edit-task-form', 'app-task-dialog', 'title', 'description'] as $id) {
            $this->assertSame(1, substr_count($html, 'id="'.$id.'"'));
        }
        preg_match_all('/\bid="([^"]+)"/', $html, $matches);
        $this->assertSame($matches[1], array_values(array_unique($matches[1])));
    }
}
