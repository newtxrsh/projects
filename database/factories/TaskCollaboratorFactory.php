<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskCollaboratorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()->user_id ?? User::factory(),
            'task_id' => Task::inRandomOrder()->first()->task_id ?? Task::factory(),
        ];
    }
}
