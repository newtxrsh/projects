<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskCollaborator;
use Carbon\Carbon;

class SampleTasksSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first user or create one if none exists
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'fname' => 'John',
                'email' => 'user@gmail.com',
                'password' => bcrypt('password'),
                'is_verified' => true,
            ]);
        }

        // Create sample tasks matching the image
        $sampleTasks = [
            // To Do tasks
            [
                'user_id' => $user->user_id,
                'title' => 'ITE18 WEB-APP FRONEND',
                'description' => 'Design a suitable frontend for users to interact with.',
                'category' => 'SCHOOL',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(7),
            ],
            [
                'user_id' => $user->user_id,
                'title' => 'CODM RANKED GAME',
                'description' => 'Play ranked with friends in preparation for the upcoming SANGKA tournament.',
                'category' => 'PERSONAL',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(3),
            ],
            [
                'user_id' => $user->user_id,
                'title' => 'LARAVEL API DOCUMENTATION',
                'description' => 'Write comprehensive API documentation for the Laravel backend.',
                'category' => 'SCHOOL',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(10),
            ],
            
            // Ongoing tasks
            [
                'user_id' => $user->user_id,
                'title' => 'ITE18 WEB-APP API ROUTES',
                'description' => 'Make API routes for endpoints that respond to specific HTTP requests from users.',
                'category' => 'SCHOOL',
                'status' => 'ongoing',
                'due_date' => Carbon::now()->addDays(5),
            ],
            
            // Completed tasks
            [
                'user_id' => $user->user_id,
                'title' => 'IT110 MIDTERM PROJECT',
                'description' => 'Design, build, and present a functional web application that interacts with a public API.',
                'category' => 'SCHOOL',
                'status' => 'completed',
                'due_date' => Carbon::now()->subDays(5),
            ],
            
            // Additional sample tasks for variety
            [
                'user_id' => $user->user_id,
                'title' => 'WEEKLY TEAM MEETING',
                'description' => 'Prepare presentation for weekly team standup meeting.',
                'category' => 'WORK',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(2),
            ],
            [
                'user_id' => $user->user_id,
                'title' => 'GROCERY SHOPPING',
                'description' => 'Buy groceries for the week including vegetables and protein.',
                'category' => 'PERSONAL',
                'status' => 'ongoing',
                'due_date' => Carbon::now()->addDays(1),
            ],
            [
                'user_id' => $user->user_id,
                'title' => 'RESUME UPDATE',
                'description' => 'Update resume with latest projects and skills.',
                'category' => 'WORK',
                'status' => 'completed',
                'due_date' => Carbon::now()->subDays(2),
            ],
        ];

        foreach ($sampleTasks as $taskData) {
            $task = Task::create($taskData);
            
            // Add the creator to task_collaborators table
            TaskCollaborator::firstOrCreate([
                'user_id' => $task->user_id,
                'task_id' => $task->task_id
            ]);
        }
    }
}
