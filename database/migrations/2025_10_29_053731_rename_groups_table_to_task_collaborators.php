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
        Schema::rename('groups', 'task_collaborators');
        
        // Update the primary key name
        Schema::table('task_collaborators', function (Blueprint $table) {
            $table->renameColumn('group_id', 'task_collaborator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_collaborators', function (Blueprint $table) {
            $table->renameColumn('task_collaborator_id', 'group_id');
        });
        
        Schema::rename('task_collaborators', 'groups');
    }
};
