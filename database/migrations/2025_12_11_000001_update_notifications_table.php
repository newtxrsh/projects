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
        // Add missing columns to the existing notifications table
        Schema::table('notifications', function (Blueprint $table) {
            // Add updated_at if it doesn't exist
            if (!Schema::hasColumn('notifications', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
            
            // Add triggered_by_user_id if it doesn't exist
            if (!Schema::hasColumn('notifications', 'triggered_by_user_id')) {
                $table->unsignedBigInteger('triggered_by_user_id')->nullable()->after('task_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
            if (Schema::hasColumn('notifications', 'triggered_by_user_id')) {
                $table->dropColumn('triggered_by_user_id');
            }
        });
    }
};
