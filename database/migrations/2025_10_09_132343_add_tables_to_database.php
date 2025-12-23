<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ======================
        // USERS TABLE
        // ======================
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('fname', 100);
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->timestamps();
        });

        // ======================
        // TASK TABLE
        // ======================
        Schema::create('tasks', function (Blueprint $table) {
            $table->id('task_id');
            $table->unsignedBigInteger('user_id');
            $table->string('status', 50)->nullable();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Foreign key
            $table->foreign('user_id')
                ->references('user_id')->on('users')
                ->onDelete('cascade');
        });

        // ======================
        // SUBTASK TABLE
        // ======================
        Schema::create('subtasks', function (Blueprint $table) {
            $table->id('subtask_id');
            $table->unsignedBigInteger('task_id');
            $table->string('title', 150);
            $table->string('status', 50)->nullable();
            $table->date('due_date')->nullable();

            // Foreign key
            $table->foreign('task_id')
                ->references('task_id')->on('tasks')
                ->onDelete('cascade');
        });

        // ======================
        // GROUP TABLE
        // ======================
        Schema::create('groups', function (Blueprint $table) {
            $table->id('group_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('task_id');

            // Foreign keys
            $table->foreign('user_id')
                ->references('user_id')->on('users')
                ->onDelete('cascade');

            $table->foreign('task_id')
                ->references('task_id')->on('tasks')
                ->onDelete('cascade');
        });

        // ======================
        // ATTACHMENTS TABLE
        // ======================
        Schema::create('attachments', function (Blueprint $table) {
            $table->id('attachment_id');
            $table->unsignedBigInteger('task_id');
            $table->string('file_path', 255);

            // Foreign key
            $table->foreign('task_id')
                ->references('task_id')->on('tasks')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('subtasks');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('users');
    }
};