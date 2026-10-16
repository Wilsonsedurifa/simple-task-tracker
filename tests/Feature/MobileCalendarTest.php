<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class MobileCalendarTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_calendar_reuses_shared_agenda_and_adds_accessible_month_expansion(): void
    {
        $html = $this->actingAs(User::factory()->create())->get('/calendar')->assertOk()
            ->assertSee('aria-controls="app-calendar-mobile-month"', false)
            ->assertSee('Add task for this day')->getContent();
        foreach (['app-calendar-week', 'app-calendar-grid', 'app-agenda-tasks', 'app-calendar-unscheduled', 'create-modal'] as $id) {
            $this->assertSame(1, substr_count($html, 'id="'.$id.'"'));
        }
        preg_match_all('/\bid="([^"]+)"/', $html, $matches);
        $this->assertSame($matches[1], array_values(array_unique($matches[1])));
    }
}
