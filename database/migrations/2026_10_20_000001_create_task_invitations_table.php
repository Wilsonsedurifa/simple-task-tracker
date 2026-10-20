<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_invitations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inviter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('invitee_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('invitee_email');
            $table->enum('role', ['editor', 'viewer']);
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['invitee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_invitations');
    }
};
