<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subtask_collaborators', function (Blueprint $table) {
            $table->id('subtask_collaborator_id');
            $table->unsignedBigInteger('subtask_id');
            $table->unsignedBigInteger('user_id');

            // Foreign keys
            $table->foreign('subtask_id')
                ->references('subtask_id')->on('subtasks')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('user_id')->on('users')
                ->onDelete('cascade');

            // Unique constraint to prevent duplicate assignments
            $table->unique(['subtask_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subtask_collaborators');
    }
};
