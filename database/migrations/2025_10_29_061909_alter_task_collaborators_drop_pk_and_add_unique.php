<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('task_collaborators', function (Blueprint $table) {
            // Drop the auto-incrementing PK column if it exists
            if (Schema::hasColumn('task_collaborators', 'task_collaborator_id')) {
                $table->dropColumn('task_collaborator_id');
            }

            // Ensure columns exist for FKs (if the table was renamed only)
            if (!Schema::hasColumn('task_collaborators', 'user_id')) {
                $table->unsignedBigInteger('user_id');
            }
            if (!Schema::hasColumn('task_collaborators', 'task_id')) {
                $table->unsignedBigInteger('task_id');
            }
        });

        // Add indexes and unique constraint
        Schema::table('task_collaborators', function (Blueprint $table) {
            // Optional: you may want to add foreign keys depending on your setup
            // $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            // $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');

            $table->index('user_id');
            $table->index('task_id');
            $table->unique(['user_id', 'task_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_collaborators', function (Blueprint $table) {
            // Remove unique and indexes
            $table->dropUnique(['user_id', 'task_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['task_id']);

            // Re-create the old primary key column
            $table->bigIncrements('task_collaborator_id');
        });
    }
};
