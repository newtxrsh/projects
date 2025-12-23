<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\Subtask;
use App\Models\Attachment;
use App\Models\TaskCollaborator;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create 5 users first
        $users = User::factory(5)->create();

        // Create 5 tasks for random users
        $tasks = Task::factory(5)->create([
            'user_id' => $users->random()->user_id,
        ]);

        // Create 5 subtasks, each belonging to random tasks
        Subtask::factory(5)->create([
            'task_id' => $tasks->random()->task_id,
        ]);

        // Create 5 attachments for random tasks
        Attachment::factory(5)->create([
            'task_id' => $tasks->random()->task_id,
        ]);

        // Create 5 collaborator entries linking random users and tasks
        TaskCollaborator::factory(5)->create([
            'user_id' => $users->random()->user_id,
            'task_id' => $tasks->random()->task_id,
        ]);
    }
}
