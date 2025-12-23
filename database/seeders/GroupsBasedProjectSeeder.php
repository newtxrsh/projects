<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskCollaborator;

class GroupsBasedProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first user
        $user = User::first();
        if (!$user) {
            echo "No user found. Please create a user first.\n";
            return;
        }

        // Create a sample task
        $task = Task::create([
            'user_id' => $user->user_id,
            'title' => 'Groups-Based Project Task',
            'description' => 'This is a sample task using the groups table for collaborators.',
            'category' => 'SCHOOL',
            'status' => 'pending',
        ]);

        // Add the creator to task_collaborators table
        TaskCollaborator::firstOrCreate([
            'user_id' => $user->user_id,
            'task_id' => $task->task_id
        ]);

        // Create some sample collaborators (users)
        $collaborator1 = User::create([
            'fname' => 'Collaborator One',
            'email' => 'collaborator1@example.com',
            'password' => bcrypt('password'),
            'is_verified' => true,
        ]);

        $collaborator2 = User::create([
            'fname' => 'Collaborator Two',
            'email' => 'collaborator2@example.com',
            'password' => bcrypt('password'),
            'is_verified' => true,
        ]);

        // Add collaborators to the task using task_collaborators table
        TaskCollaborator::create([
            'user_id' => $collaborator1->user_id,
            'task_id' => $task->task_id
        ]);

        TaskCollaborator::create([
            'user_id' => $collaborator2->user_id,
            'task_id' => $task->task_id
        ]);

        echo "Created task with collaborators: " . $task->title . "\n";
        echo "Added collaborators: " . $collaborator1->email . ", " . $collaborator2->email . "\n";
    }
}
