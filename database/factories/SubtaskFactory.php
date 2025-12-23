<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubtaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'task_id' => Task::inRandomOrder()->first()->task_id ?? Task::factory(),
            'title' => $this->faker->sentence(4),
            'status' => $this->faker->randomElement(['pending', 'in progress', 'done']),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
        ];
    }
}
