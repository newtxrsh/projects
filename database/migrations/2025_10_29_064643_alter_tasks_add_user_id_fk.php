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
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('task_id');
                $table->index('user_id');
            }
        });

        // Add foreign key separately to avoid issues if column pre-existed without FK
        Schema::table('tasks', function (Blueprint $table) {
            // Guard in case FK already exists
            try {
                $table->foreign('user_id')
                    ->references('user_id')
                    ->on('users')
                    ->nullOnDelete();
            } catch (\Throwable $e) {
                // ignore
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'user_id')) {
                // Drop FK then column if present
                try { $table->dropForeign(['user_id']); } catch (\Throwable $e) {}
                try { $table->dropIndex(['user_id']); } catch (\Throwable $e) {}
                $table->dropColumn('user_id');
            }
        });
        Schema::enableForeignKeyConstraints();
    }
};
