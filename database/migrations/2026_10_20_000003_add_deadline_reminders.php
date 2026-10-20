<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('deadline_emails')->default(true);
            $table->string('timezone')->default('Asia/Manila');
        });
        Schema::create('deadline_reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->date('due_date');
            $table->string('kind', 16);
            $table->timestamp('sent_at');
            $table->unique(['user_id', 'task_id', 'due_date', 'kind'], 'deadline_reminder_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deadline_reminders');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['deadline_emails', 'timezone']));
    }
};
