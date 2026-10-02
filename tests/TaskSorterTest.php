<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\TestCase;
use TaskTracker\TaskSorter;

class TaskSorterTest extends TestCase
{
    private TaskSorter $sorter;

    protected function setUp(): void
    {
        $this->sorter = new TaskSorter();
    }

    public function test_sorts_tasks_by_priority(): void
    {
        $tasks = [
            ['id' => 1, 'priority' => 'low', 'created_at' => '2026-01-01 10:00:00'],
            ['id' => 2, 'priority' => 'high', 'created_at' => '2026-01-01 10:00:00'],
            ['id' => 3, 'priority' => 'medium', 'created_at' => '2026-01-01 10:00:00'],
        ];

        $sorted = $this->sorter->sortTasks($tasks);

        $this->assertSame([2, 3, 1], array_column($sorted, 'id'));
    }

    public function test_sorts_oldest_task_first_when_priorities_match(): void
    {
        $tasks = [
            ['id' => 1, 'priority' => 'high', 'created_at' => '2026-03-01 10:00:00'],
            ['id' => 2, 'priority' => 'high', 'created_at' => '2026-01-01 10:00:00'],
            ['id' => 3, 'priority' => 'high', 'created_at' => '2026-02-01 10:00:00'],
        ];

        $sorted = $this->sorter->sortTasks($tasks);

        $this->assertSame([2, 3, 1], array_column($sorted, 'id'));
    }

    public function test_gives_priority_precedence_over_creation_date(): void
    {
        $tasks = [
            ['id' => 1, 'priority' => 'low', 'created_at' => '2026-01-01 10:00:00'],
            ['id' => 2, 'priority' => 'high', 'created_at' => '2026-12-01 10:00:00'],
        ];

        $sorted = $this->sorter->sortTasks($tasks);

        $this->assertSame([2, 1], array_column($sorted, 'id'));
    }
}
