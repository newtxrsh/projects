<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id('activity_id');
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('subtask_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('event_type', 100);
            $table->text('description');
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('task_id')
                ->references('task_id')->on('tasks')
                ->onDelete('cascade');

            $table->foreign('subtask_id')
                ->references('subtask_id')->on('subtasks')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('user_id')->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};

