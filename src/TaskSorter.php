<?php

declare(strict_types=1);

namespace TaskTracker;

class TaskSorter
{
    private const PRIORITY_WEIGHTS = [
        'high' => 3,
        'medium' => 2,
        'low' => 1,
    ];

    /**
     * Sort tasks by priority (high > medium > low),
     * then by created_at (oldest first).
     */
    public function sortTasks(array $tasks): array
    {
        usort($tasks, function (array $a, array $b): int {
            $priorityA = self::PRIORITY_WEIGHTS[$a['priority']] ?? 0;
            $priorityB = self::PRIORITY_WEIGHTS[$b['priority']] ?? 0;

            if ($priorityA !== $priorityB) {
                return $priorityB <=> $priorityA;
            }

            return $this->toTimestamp($a['created_at'])
                <=> $this->toTimestamp($b['created_at']);
        });

        return $tasks;
    }

    private function toTimestamp(int|string $value): int
    {
        return is_int($value) ? $value : (int) strtotime($value);
    }
}