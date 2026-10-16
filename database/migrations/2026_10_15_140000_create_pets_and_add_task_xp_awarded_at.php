<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('species');
            $table->string('name', 20);
            $table->unsignedInteger('xp')->default(0);
            $table->unsignedInteger('streak_days')->default(0);
            $table->unsignedInteger('longest_streak')->default(0);
            $table->date('last_streak_date')->nullable();
            $table->unsignedInteger('xp_today')->default(0);
            $table->date('xp_today_date')->nullable();
            $table->timestamps();
        });
        Schema::table('tasks', function (Blueprint $table): void {
            $table->timestamp('xp_awarded_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropColumn('xp_awarded_at');
        });
        Schema::dropIfExists('pets');
    }
};
