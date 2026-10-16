<?php

namespace Tests\Unit;

use App\Services\PetService;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class PetServiceTest extends TestCase
{
    public function test_every_level_boundary_and_progress_comes_from_configuration(): void
    {
        $settings = require __DIR__.'/../../config/pets.php';
        $service = new PetService($settings);
        foreach ($settings['levels'] as $index => $level) {
            $result = $service->progress($level['xp']);
            $this->assertSame($index + 1, $result['level']);
            $this->assertSame($level['stage'], $result['stage']);
            $this->assertSame(0, $result['xp_into_level']);
            if ($index > 0) {
                $this->assertSame($index, $service->progress($level['xp'] - 1)['level']);
            }
        }
        $this->assertEquals(50, $service->progress(40)['progress_pct']);
        $this->assertSame(40, $service->progress(40)['xp_for_next']);
        $this->assertSame(7, $service->progress(9999)['level']);
        $this->assertNull($service->progress(9999)['xp_for_next']);
        $this->assertSame(100, $service->progress(9999)['progress_pct']);
        $settings['levels'] = [['xp' => 0, 'stage' => 'One'], ['xp' => 5, 'stage' => 'Two']];
        $this->assertSame('Two', (new PetService($settings))->progress(5)['stage']);
    }

    public function test_calendar_streak_calculation_is_independently_unit_testable(): void
    {
        $service = new PetService(require __DIR__.'/../../config/pets.php');
        $today = CarbonImmutable::parse('2026-10-15', 'Asia/Manila');
        $this->assertSame(['streak_days' => 1, 'longest_streak' => 1], $service->streak(null, 0, 0, $today));
        $this->assertSame(['streak_days' => 4, 'longest_streak' => 4], $service->streak('2026-10-14', 3, 3, $today));
        $this->assertSame(['streak_days' => 3, 'longest_streak' => 8], $service->streak('2026-10-15', 3, 8, $today));
        $this->assertSame(['streak_days' => 1, 'longest_streak' => 8], $service->streak('2026-10-12', 3, 8, $today));
    }
}
